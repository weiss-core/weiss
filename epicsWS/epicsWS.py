import asyncio
import json
import websockets
from websockets.legacy.server import WebSocketServerProtocol
from typing import Dict, Set, Tuple
from pvaPyClient import PvaPyClient
from pvParser import parse_pv, PVData

# map PV -> set of websocket clients
subscriptions: Dict[str, Set[WebSocketServerProtocol]] = {}

# track if metadata has been sent per (ws, pv_name)
sent_metadata: Dict[Tuple[WebSocketServerProtocol, str], bool] = {}

client = None

async def send_update(pv_name: str, pv_obj):
  pv_data: PVData = parse_pv(pv_obj)

  # base message (dynamic fields only)
  base_message = {
    "type": "update",
    "pv": pv_name,
    "value": pv_data.value,
    "valueText": pv_data.valueText,
    "alarm": pv_data.alarm.__dict__ if pv_data.alarm else None,
    "timeStamp": pv_data.timeStamp.__dict__ if pv_data.timeStamp else None,
    "b64arr": pv_data.b64arr,
    "b64dtype": pv_data.b64dtype,
  }

  # send to all subscribed clients
  for ws in set(subscriptions.get(pv_name, set())):
    key = (ws, pv_name)
    message = dict(base_message)

    # include metadata only once per (ws, pv)
    if not sent_metadata.get(key):
      message.update({
        "display": pv_data.display.__dict__ if pv_data.display else None,
        "control": pv_data.control.__dict__ if pv_data.control else None,
        "valueAlarm": pv_data.valueAlarm.__dict__ if pv_data.valueAlarm else None,
      })
      sent_metadata[key] = True

    # strip None fields
    data = json.dumps({k: v for k, v in message.items() if v is not None})

    try:
      await ws.send(data)
    except Exception:
      print(f"Error sending update to {ws}")


async def handler(ws: WebSocketServerProtocol):
  global client
  global default_protocol
  client_id = f"{ws.remote_address[0]}:{ws.remote_address[1]}"
  print(f"New connection from {client_id}")
  loop = asyncio.get_running_loop()

  def message_callback(pv_name, pv_obj):
    asyncio.run_coroutine_threadsafe(send_update(pv_name, pv_obj), loop)

  if not client:
    client = PvaPyClient(message_callback)

  try:
    async for message in ws:
      msg = json.loads(message)
      msg_type = msg.get("type")

      if msg_type == "subscribe":
        pv_list = msg.get("pvs", [])
        for pv in pv_list:
          if pv not in subscriptions:
            subscriptions[pv] = set()
          subscriptions[pv].add(ws)
          client.subscribe(client_id, pv)

      elif msg_type == "unsubscribe":
        pv_list = msg.get("pvs", [])
        for pv in pv_list:
          if pv in subscriptions:
            subscriptions[pv].discard(ws)
            if not subscriptions[pv]:
              del subscriptions[pv]
            client.unsubscribe(client_id, pv)
          sent_metadata.pop((ws, pv), None)

      elif msg_type == "write":
        pv_name = msg.get("pv")
        value = msg.get("value")
        if pv_name and value is not None:
          client.write_to_pv(pv_name, value)

      else:
        await ws.send(json.dumps({"type": "error", "message": "Unknown message type"}))

  except Exception as e:
    print(f"error handling message from {client_id}: {e}")

  finally:
    # Cleanup: remove this ws from all subscriptions
    print(f"client disconnected: {client_id}")
    for pv, clients in list(subscriptions.items()):
      clients.discard(ws)
      if not clients:
        del subscriptions[pv]
      sent_metadata.pop((ws, pv), None)
    client.unsubscribe_all(client_id)


async def main():
  async with websockets.serve(handler, "0.0.0.0", 8080):
    print("WebSocket server running on ws://localhost:8080")
    await asyncio.Future()

if __name__ == "__main__":
  asyncio.run(main())
