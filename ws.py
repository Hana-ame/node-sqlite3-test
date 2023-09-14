import asyncio
import websockets
import http.client

async def connect_websocket():
    # Create a websocket connection via proxy
    async with websockets.connect('wss://demo.piesocket.com/v3/channel_123?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self', **proxy_options) as websocket:
        await websocket.send('Hello, server!')
        response = await websocket.recv()
        print(response)

asyncio.get_event_loop().run_until_complete(connect_websocket())