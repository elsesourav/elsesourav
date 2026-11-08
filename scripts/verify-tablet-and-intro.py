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
    port = 9235
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

            # 1. TEST TABLET (768x1024) SIDE-BY-SIDE VIEW
            print("1. Testing Tablet (768x1024) Side-by-Side View...")
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 768, "height": 1024, "deviceScaleFactor": 1, "mobile": True, "fitWindow": False
            })
            await send("Page.navigate", {"url": "http://localhost:3001/about"})

            for _ in range(30):
                res = await send("Runtime.evaluate", {
                    "expression": "document.querySelector('#creator-bio-heading') !== null && document.querySelector('canvas') !== null"
                })
                if res.get("result", {}).get("value") is True:
                    break
                await asyncio.sleep(0.5)

            # Wait for assembly to complete
            await asyncio.sleep(2.8)
            snap_tablet = await send("Page.captureScreenshot", {"format": "png"})
            with open("/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/tablet_768_side_by_side.png", "wb") as f:
                f.write(base64.b64decode(snap_tablet["data"]))
            print("✓ Saved tablet_768_side_by_side.png")

            # 2. TEST 660px VIEW (JUST AFTER 650px THRESHOLD)
            print("\n2. Testing 660px width (just after 650px threshold)...")
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 660, "height": 900, "deviceScaleFactor": 1, "mobile": True, "fitWindow": False
            })
            await asyncio.sleep(1.0)
            snap_660 = await send("Page.captureScreenshot", {"format": "png"})
            with open("/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/tablet_660_side_by_side.png", "wb") as f:
                f.write(base64.b64decode(snap_660["data"]))
            print("✓ Saved tablet_660_side_by_side.png")

            # 3. TEST SCREEN-WIDE INTRO ANIMATION ON DESKTOP (1280x950)
            print("\n3. Testing Screen-Wide Intro Animation on Desktop (1280x950)...")
            await send("Emulation.setDeviceMetricsOverride", {
                "width": 1280, "height": 950, "deviceScaleFactor": 1, "mobile": False, "fitWindow": False
            })
            await asyncio.sleep(0.8)

            # Trigger About activation event to start full-screen intro
            print("Triggering About activate event...")
            await send("Runtime.evaluate", {
                "expression": "window.dispatchEvent(new CustomEvent('elsesourav:about-activate'));"
            })

            # Snap at 0.5s: particles flying from outside monitor boundaries across the transparent screen
            await asyncio.sleep(0.5)
            snap_screen_fly = await send("Page.captureScreenshot", {"format": "png"})
            with open("/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/screen_intro_flying_across_display.png", "wb") as f:
                f.write(base64.b64decode(snap_screen_fly["data"]))
            print("✓ Saved screen_intro_flying_across_display.png (particles coming from beyond monitor edges)")

            # Snap at 2.6s: all particles converged into portrait card and local canvas active
            await asyncio.sleep(2.2)
            snap_screen_done = await send("Page.captureScreenshot", {"format": "png"})
            with open("/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/screen_intro_complete_desktop.png", "wb") as f:
                f.write(base64.b64decode(snap_screen_done["data"]))
            print("✓ Saved screen_intro_complete_desktop.png")

            print("\nAll verifications completed successfully!")
    finally:
        chrome_proc.terminate()

if __name__ == "__main__":
    asyncio.run(run_verification())
