import asyncio
import json
import urllib.request
import websockets
import subprocess
import time
import base64
import os

def wait_for_chrome(port, timeout=12):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/json") as resp:
                tabs = json.loads(resp.read().decode())
                page = next((t for t in tabs if t.get("type") == "page"), None)
                if page:
                    return page["webSocketDebuggerUrl"]
        except Exception:
            time.sleep(0.5)
    raise RuntimeError("Chrome failed to start in time")

async def run_test():
    port = 9260
    chrome_proc = subprocess.Popen([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless=new",
        f"--remote-debugging-port={port}",
        "--disable-gpu",
        "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    try:
        ws_url = wait_for_chrome(port)
        print("Connected to Chrome via CDP on port", port)

        async with websockets.connect(ws_url, max_size=30*1024*1024) as ws:
            pending = {}
            msg_id = 1

            async def send(method, params=None):
                nonlocal msg_id
                cid = msg_id
                msg_id += 1
                fut = asyncio.get_event_loop().create_future()
                pending[cid] = fut
                payload = {"id": cid, "method": method}
                if params: payload["params"] = params
                await ws.send(json.dumps(payload))
                return await fut

            async def listener():
                try:
                    while True:
                        raw = await ws.recv()
                        msg = json.loads(raw)
                        if "id" in msg and msg["id"] in pending:
                            pending[msg["id"]].set_result(msg.get("result", {}))
                            del pending[msg["id"]]
                except asyncio.CancelledError:
                    pass

            listen_task = asyncio.create_task(listener())

            await send("Page.enable")
            await send("Runtime.enable")

            # 1. TEST DESKTOP (1280x950) FULL-SCREEN INTRO CANVAS
            print("\n1. Navigating to http://localhost:3000/about on Desktop (1280x950)...")
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 1280, "height": 950, "deviceScaleFactor": 1, "mobile": False, "fitWindow": False
            })
            await send("Page.navigate", {"url": "http://localhost:3000/about"})

            # Wait until client hydration mounts the outer intro canvas
            print("Waiting for client hydration and outer canvas mount...")
            intro_info = {}
            for i in range(40):
                eval_intro = await send("Runtime.evaluate", {
                    "expression": """(() => {
                        const canvas = document.getElementById('screen-portrait-intro-canvas');
                        if (!canvas) return null;
                        return {
                            exists: true,
                            id: canvas.id,
                            width: canvas.width,
                            height: canvas.height,
                            innerWidth: window.innerWidth,
                            innerHeight: window.innerHeight,
                            styleWidth: canvas.style.width,
                            styleHeight: canvas.style.height,
                            position: canvas.style.position,
                            zIndex: canvas.style.zIndex,
                            pointerEvents: canvas.style.pointerEvents,
                            background: canvas.style.background,
                            parentElement: canvas.parentElement ? canvas.parentElement.tagName : null
                        };
                    })()""",
                    "returnByValue": True
                })
                val = eval_intro.get("result", {}).get("value")
                if val and val.get("exists"):
                    intro_info = val
                    print(f"Outer Intro Canvas mounted in {i * 0.15:.2f}s!")
                    break
                await asyncio.sleep(0.15)

            print("Outer Intro Canvas Info:", json.dumps(intro_info, indent=2))

            # Snap during flight
            snap_flight = await send("Page.captureScreenshot", {"format": "png"})
            with open("/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/verified_outer_canvas_flight.png", "wb") as f:
                f.write(base64.b64decode(snap_flight["data"]))
            print("✓ Saved verified_outer_canvas_flight.png")

            # 2. Wait for intro to complete (4.0s) and verify cleanup
            print("\n2. Waiting for intro completion (4.0s)...")
            await asyncio.sleep(4.0)

            eval_cleanup = await send("Runtime.evaluate", {
                "expression": """(() => {
                    const canvas = document.getElementById('screen-portrait-intro-canvas');
                    const allCanvases = Array.from(document.querySelectorAll('canvas'));
                    return {
                        outerCanvasStillInDOM: !!canvas,
                        totalCanvasesInDOM: allCanvases.length
                    };
                })()""",
                "returnByValue": True
            })
            cleanup_info = eval_cleanup.get("result", {}).get("value", {})
            print("Cleanup Analysis:", json.dumps(cleanup_info, indent=2))

            snap_assembled = await send("Page.captureScreenshot", {"format": "png"})
            with open("/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/verified_outer_canvas_assembled.png", "wb") as f:
                f.write(base64.b64decode(snap_assembled["data"]))
            print("✓ Saved verified_outer_canvas_assembled.png")

            # 3. TEST RE-ENTRANCE ON ABOUT ACTIVATE
            print("\n3. Testing re-entrance trigger on About activate event...")
            await send("Runtime.evaluate", {
                "expression": "window.dispatchEvent(new CustomEvent('elsesourav:about-activate'));"
            })
            await asyncio.sleep(0.4)

            eval_reenter = await send("Runtime.evaluate", {
                "expression": "document.getElementById('screen-portrait-intro-canvas') !== null"
            })
            print("Re-entrance outer canvas active:", eval_reenter.get("result", {}).get("value"))

            listen_task.cancel()

    finally:
        chrome_proc.terminate()
        chrome_proc.wait()

asyncio.run(run_test())
