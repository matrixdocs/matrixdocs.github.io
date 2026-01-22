---
sidebar_position: 5
title: Building Bots
description: Create your own Matrix bots
---

# Building Matrix Bots

Learn to create custom Matrix bots for your specific needs.

## Choose Your SDK

| SDK | Language | Difficulty | Best For |
|-----|----------|------------|----------|
| matrix-nio | Python | Easy | Quick bots, async |
| matrix-bot-sdk | TypeScript | Easy | Node.js projects |
| mautrix-python | Python | Easy | Bridge-style bots |
| matrix-rust-sdk | Rust | Medium | Performance |
| matrix-js-sdk | JavaScript | Medium | Web integration |

## Python Bot with matrix-nio

### Setup

```bash
pip install matrix-nio
```

### Basic Bot

```python title="bot.py"
import asyncio
from nio import AsyncClient, MatrixRoom, RoomMessageText

async def message_callback(room: MatrixRoom, event: RoomMessageText):
    if event.sender == client.user_id:
        return  # Ignore our own messages

    if event.body.startswith("!echo "):
        response = event.body[6:]
        await client.room_send(
            room_id=room.room_id,
            message_type="m.room.message",
            content={"msgtype": "m.text", "body": response}
        )

async def main():
    global client
    client = AsyncClient("https://matrix.example.com", "@bot:example.com")

    await client.login("your-password")
    client.add_event_callback(message_callback, RoomMessageText)

    await client.sync_forever(timeout=30000)

asyncio.run(main())
```

### E2EE Support

```python
from nio import AsyncClient, MatrixRoom, RoomMessageText
from nio.store import SqliteStore

async def main():
    config = AsyncClientConfig(store_sync_tokens=True)
    client = AsyncClient(
        "https://matrix.example.com",
        "@bot:example.com",
        store_path="./store",
        config=config
    )

    # Import E2EE keys if needed
    client.load_store()

    await client.login("password")

    # Trust all devices (for simplicity)
    client.trust_devices()

    await client.sync_forever()
```

## TypeScript Bot with matrix-bot-sdk

### Setup

```bash
npm init -y
npm install matrix-bot-sdk
```

### Basic Bot

```typescript title="bot.ts"
import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin
} from "matrix-bot-sdk";

const homeserverUrl = "https://matrix.example.com";
const accessToken = "your-access-token";

const storage = new SimpleFsStorageProvider("bot.json");
const client = new MatrixClient(homeserverUrl, accessToken, storage);

AutojoinRoomsMixin.setupOnClient(client);

client.on("room.message", async (roomId, event) => {
    if (event.sender === await client.getUserId()) return;
    if (event.content?.msgtype !== "m.text") return;

    const body = event.content.body;
    if (body.startsWith("!hello")) {
        await client.sendMessage(roomId, {
            msgtype: "m.text",
            body: "Hello, World!"
        });
    }
});

client.start().then(() => console.log("Bot started!"));
```

## Command Framework

### Python Example

```python
from nio import AsyncClient, RoomMessageText

COMMANDS = {}

def command(name):
    def decorator(func):
        COMMANDS[name] = func
        return func
    return decorator

@command("ping")
async def cmd_ping(client, room, event, args):
    await client.room_send(
        room.room_id,
        "m.room.message",
        {"msgtype": "m.text", "body": "Pong!"}
    )

@command("help")
async def cmd_help(client, room, event, args):
    cmds = ", ".join(COMMANDS.keys())
    await client.room_send(
        room.room_id,
        "m.room.message",
        {"msgtype": "m.text", "body": f"Commands: {cmds}"}
    )

async def handle_message(room, event):
    if not event.body.startswith("!"):
        return

    parts = event.body[1:].split()
    cmd_name = parts[0].lower()
    args = parts[1:]

    if cmd_name in COMMANDS:
        await COMMANDS[cmd_name](client, room, event, args)
```

## Handling Different Event Types

### Reactions

```python
from nio import ReactionEvent

async def reaction_callback(room, event: ReactionEvent):
    print(f"{event.sender} reacted with {event.key}")
    # event.reacts_to contains the event_id being reacted to

client.add_event_callback(reaction_callback, ReactionEvent)
```

### Room Events

```python
from nio import RoomMemberEvent

async def member_callback(room, event: RoomMemberEvent):
    if event.membership == "join":
        await client.room_send(
            room.room_id,
            "m.room.message",
            {"msgtype": "m.text", "body": f"Welcome, {event.display_name}!"}
        )

client.add_event_callback(member_callback, RoomMemberEvent)
```

## Best Practices

### 1. Handle Errors Gracefully

```python
async def safe_send(client, room_id, content):
    try:
        await client.room_send(room_id, "m.room.message", content)
    except Exception as e:
        print(f"Failed to send message: {e}")
```

### 2. Rate Limiting

```python
from asyncio import Semaphore

rate_limit = Semaphore(5)  # 5 concurrent requests

async def send_with_rate_limit(client, room_id, content):
    async with rate_limit:
        await client.room_send(room_id, "m.room.message", content)
```

### 3. Persistent Storage

```python
import json

def save_data(data, filename="data.json"):
    with open(filename, "w") as f:
        json.dump(data, f)

def load_data(filename="data.json"):
    try:
        with open(filename) as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
```

### 4. Configuration

```python
import os
from dataclasses import dataclass

@dataclass
class Config:
    homeserver: str = os.getenv("MATRIX_HOMESERVER", "https://matrix.org")
    user_id: str = os.getenv("MATRIX_USER_ID", "@bot:matrix.org")
    password: str = os.getenv("MATRIX_PASSWORD", "")

config = Config()
```

## Deployment

### Docker

```dockerfile title="Dockerfile"
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "bot.py"]
```

### systemd

```ini title="/etc/systemd/system/matrixbot.service"
[Unit]
Description=Matrix Bot
After=network.target

[Service]
User=matrixbot
WorkingDirectory=/opt/matrixbot
ExecStart=/opt/matrixbot/venv/bin/python bot.py
Restart=always

[Install]
WantedBy=multi-user.target
```

## Resources

- [matrix-nio docs](https://matrix-nio.readthedocs.io/)
- [matrix-bot-sdk docs](https://turt2live.github.io/matrix-bot-sdk/)
- [Matrix Client-Server API](https://spec.matrix.org/latest/client-server-api/)

---

*Next: [SDKs Overview](/sdks/overview) →*
