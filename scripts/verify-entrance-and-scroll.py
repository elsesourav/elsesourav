import asyncio
import json
import urllib.request
import websockets
import subprocess
import time
import base64
import os

def wait_for_chrome(port, timeout=10):
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

async def run_verification():
    port = 9230
    chrome_proc = subprocess.Popen([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless=new",
        f"--remote-debugging-port={port}",
        "--disable-gpu",
        "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    try:
        ws_url = wait_for_chrome(port)
        print("Connected to Chrome via CDP!")

        async with websockets.connect(ws_url, max_size=30*1024*1024) as ws:
            msg_id = 1
            async def send(method, params=None):
                nonlocal msg_id
                cid = msg_id
                msg_id += 1
                payload = {"id": cid, "method": method}
                if params: payload["params"] = params
                await ws.send(json.dumps(payload))
                while True:
                    resp = json.loads(await ws.recv())
                    if resp.get("id") == cid: return resp.get("result", {})

            await send("Page.enable")
            await send("Runtime.enable")
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 1280, "height": 950, "deviceScaleFactor": 1, "mobile": False, "fitWindow": False
            })

            print("1. Navigating to http://localhost:3001/about...")
            await send("Page.navigate", {"url": "http://localhost:3001/about"})

            # Wait for heading and canvas
            for _ in range(30):
                res = await send("Runtime.evaluate", {
                    "expression": "document.querySelector('#creator-bio-heading') !== null && document.querySelector('canvas') !== null"
                })
                if res.get("result", {}).get("value") is True:
                    print("Page hydrated and loaded!")
                    break
                await asyncio.sleep(0.5)

            # Wait 3 seconds for WASM entrance to finish and form completely
            print("Waiting for entrance animation to form completely...")
            await asyncio.sleep(3.0)
            
            snap = await send("Page.captureScreenshot", {"format": "png"})
            with open("/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/entrance_fully_formed.png", "wb") as f:
                f.write(base64.b64decode(snap["data"]))
            print("✓ Saved entrance_fully_formed.png")

            # 2. Test re-entrance triggered by clicking About page link
            print("\n2. Simulating click on About page navigation (re-trigger entrance)...")
            await send("Runtime.evaluate", {
                "expression": "window.dispatchEvent(new CustomEvent('elsesourav:about-activate'));"
            })
            
            # Snap 0.4s into entrance: particles flying in from outside display and growing in size
            await asyncio.sleep(0.4)
            snap_mid = await send("Page.captureScreenshot", {"format": "png"})
            with open("/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/re_entrance_flying_in.png", "wb") as f:
                f.write(base64.b64decode(snap_mid["data"]))
            print("✓ Saved re_entrance_flying_in.png (particles assembling from outside)")

            # Wait 2.0s for convergence
            await asyncio.sleep(2.0)
            snap_done = await send("Page.captureScreenshot", {"format": "png"})
            with open("/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/re_entrance_complete.png", "wb") as f:
                f.write(base64.b64decode(snap_done["data"]))
            print("✓ Saved re_entrance_complete.png")

            # 3. Test Scroll Optimization: scroll down by 380px so portion of image is scrolled off
            print("\n3. Testing Scroll Optimization: scrolling down 380px...")
            await send("Runtime.evaluate", {
                "expression": "window.scrollTo({ top: 380, behavior: 'instant' });"
            })
            await asyncio.sleep(1.0)
            
            snap_scroll = await send("Page.captureScreenshot", {"format": "png"})
            with open("/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/scroll_paused_state.png", "wb") as f:
                f.write(base64.b64decode(snap_scroll["data"]))
            print("✓ Saved scroll_paused_state.png (animation paused)")

            print("\nVerification complete!")
    finally:
        chrome_proc.terminate()

if __name__ == "__main__":
    asyncio.run(run_verification())
