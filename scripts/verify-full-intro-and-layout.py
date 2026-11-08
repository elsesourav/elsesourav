import asyncio
import json
import urllib.request
import websockets
import subprocess
import time

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

async def run_test():
    port = 9252
    chrome_proc = subprocess.Popen([
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless=new",
        f"--remote-debugging-port={port}",
        "--disable-gpu",
        "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    try:
        ws_url = wait_for_chrome(port)

        async with websockets.connect(ws_url, max_size=30*1024*1024) as ws:
            exceptions = []
            console_msgs = []
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
                        elif msg.get("method") == "Runtime.exceptionThrown":
                            exceptions.append(msg["params"])
                        elif msg.get("method") == "Runtime.consoleAPICalled":
                            args = msg["params"].get("args", [])
                            val = [a.get("value") or a.get("description") for a in args]
                            console_msgs.append(val)
                except asyncio.CancelledError:
                    pass

            listen_task = asyncio.create_task(listener())

            await send("Page.enable")
            await send("Runtime.enable")
            await send("Log.enable")

            # Navigate
            await send("Page.navigate", {"url": "http://localhost:3000/about"})

            # Wait 3 seconds
            await asyncio.sleep(3.0)

            listen_task.cancel()

            print("Exceptions:", json.dumps(exceptions, indent=2))
            print("Console Messages:", json.dumps(console_msgs, indent=2))

    finally:
        chrome_proc.terminate()
        chrome_proc.wait()

asyncio.run(run_test())
