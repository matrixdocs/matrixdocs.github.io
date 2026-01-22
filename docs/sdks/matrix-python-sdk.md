---
sidebar_position: 4
title: Python SDKs
description: Python libraries for Matrix development
---

# Python SDKs for Matrix

Multiple Python libraries are available for Matrix development.

## SDK Options

| Library | Style | E2EE | Best For |
|---------|-------|------|----------|
| **matrix-nio** | Async | ✅ | Bots, async apps |
| **mautrix-python** | Async | ✅ | Bridges, advanced |
| **matrix-client** | Sync | ❌ | Simple scripts |

## matrix-nio

The most popular async Python SDK.

### Installation

```bash
pip install "matrix-nio[e2e]"
```

### Basic Usage

```python
import asyncio
from nio import AsyncClient, RoomMessageText

async def message_callback(room, event):
    print(f"{room.display_name}: {event.sender} - {event.body}")

async def main():
    client = AsyncClient("https://matrix.example.com", "@bot:example.com")

    await client.login("password")

    client.add_event_callback(message_callback, RoomMessageText)

    await client.sync_forever(timeout=30000)

asyncio.run(main())
```

### Send Message

```python
await client.room_send(
    room_id="!roomid:example.com",
    message_type="m.room.message",
    content={
        "msgtype": "m.text",
        "body": "Hello, Matrix!"
    }
)
```

### E2EE Support

```python
from nio import AsyncClient, AsyncClientConfig
from nio.store import SqliteStore

config = AsyncClientConfig(store_sync_tokens=True)
client = AsyncClient(
    "https://matrix.example.com",
    "@bot:example.com",
    store_path="./store",
    config=config
)

await client.login("password")

# Keys are automatically managed
```

### File Upload

```python
from nio import UploadResponse

with open("image.png", "rb") as f:
    response = await client.upload(f, content_type="image/png")

await client.room_send(
    room_id,
    "m.room.message",
    {
        "msgtype": "m.image",
        "body": "image.png",
        "url": response.content_uri
    }
)
```

## mautrix-python

Powers mautrix bridges, good for advanced use.

### Installation

```bash
pip install mautrix
```

### Basic Usage

```python
from mautrix.client import Client
from mautrix.types import EventType

client = Client(
    mxid="@bot:example.com",
    base_url="https://matrix.example.com"
)

@client.on(EventType.ROOM_MESSAGE)
async def handler(evt):
    print(evt.content.body)

await client.start(filter=None)
```

## Comparison

### matrix-nio

```python
# Simpler API
await client.room_send(room_id, "m.room.message", content)
```

### mautrix

```python
# More explicit
await client.send_message(room_id, content)
```

## Resources

- [matrix-nio Docs](https://matrix-nio.readthedocs.io/)
- [matrix-nio GitHub](https://github.com/poljar/matrix-nio)
- [mautrix GitHub](https://github.com/mautrix/python)
- [Examples](https://github.com/poljar/matrix-nio/tree/master/examples)

---

*Next: [Specification Overview](/specification/overview) →*
