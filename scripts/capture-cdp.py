import asyncio
import json
import urllib.request
import websockets
import subprocess
import time
import os

async def capture_all(ws_url):
    async with websockets.connect(ws_url, max_size=30*1024*1024) as ws:
        msg_id = 1
        
        async def send(method, params=None):
            nonlocal msg_id
            cur_id = msg_id
            msg_id += 1
            payload = {"id": cur_id, "method": method}
            if params:
                payload["params"] = params
            await ws.send(json.dumps(payload))
            while True:
                resp = json.loads(await ws.recv())
                if resp.get("id") == cur_id:
                    return resp.get("result", {})

        await send("Page.enable")
        await send("Runtime.enable")
        
        # Navigate to about page
        print("Navigating to /about...")
        await send("Page.navigate", {"url": "http://localhost:3001/about"})
        
        # Wait for #creator-bio-heading to appear (page fully rendered, skeleton gone)
        for _ in range(30):
            res = await send("Runtime.evaluate", {
                "expression": "document.querySelector('#creator-bio-heading') !== null && document.querySelector('canvas') !== null"
            })
            if res.get("result", {}).get("value") is True:
                print("Page content & canvas loaded!")
                break
            await asyncio.sleep(0.5)

        # Wait 2 seconds for WASM pixel engine and WebGL shaders to initialize and render frames
        await asyncio.sleep(2.5)

        targets = [
            ("mobile", 350, 750, "/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/about_mobile_350x750.png"),
            ("tablet", 768, 1024, "/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/about_tablet_768x1024.png"),
            ("desktop", 1280, 950, "/Users/sourav/.gemini/antigravity/brain/a2a0ee97-246e-4707-aa73-9956468f7c1e/about_desktop_1280x950.png"),
        ]

        for name, w, h, path in targets:
            print(f"Setting viewport to {name} ({w}x{h})...")
            await send("Emulation.setDeviceMetricsOverride", {
                "width": w,
                "height": h,
                "deviceScaleFactor": 1,
                "mobile": w < 768,
                "fitWindow": False
            })
            # Allow reflow and canvas render
            await asyncio.sleep(1.5)
            
            result = await send("Page.captureScreenshot", {
                "format": "png",
                "clip": {
                    "x": 0,
                    "y": 0,
                    "width": w,
                    "height": h,
                    "scale": 1
                }
            })
            
            import base64
            data = base64.b64decode(result["data"])
            with open(path, "wb") as f:
                f.write(data)
            print(f"✓ Saved {name}: {path}")

def main():
    chrome_proc = subprocess.Popen([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless=new",
        "--remote-debugging-port=9224",
        "--disable-gpu",
        "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    time.sleep(2)
    try:
        with urllib.request.urlopen("http://127.0.0.1:9224/json") as resp:
            tabs = json.loads(resp.read().decode())
        page_tab = next(t for t in tabs if t.get("type") == "page")
        ws_url = page_tab["webSocketDebuggerUrl"]
        
        asyncio.run(capture_all(ws_url))
    finally:
        chrome_proc.terminate()

if __name__ == "__main__":
    main()
