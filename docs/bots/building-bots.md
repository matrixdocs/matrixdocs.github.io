---
sidebar_position: 5
title: Building Bots
description: Create your own Matrix bots
---

# Building Matrix Bots

Learn to create custom Matrix bots for your specific needs - from simple command bots to full bridge appservices.

## Choosing Your Approach

| Approach | Difficulty | Best For | E2EE |
|----------|------------|----------|------|
| **[Maubot Plugin](#maubot-plugins)** | Easy | Quick bots, no server needed | ✅ |
| **[SimpleMatrixBotLib](#simplematrixbotlib)** | Easy | 10-line bots, beginners | ✅ |
| **[NioBot](#niobot-framework)** | Easy | Discord.py-like syntax | ✅ |
| **[matrix-nio](#python-bot-with-matrix-nio)** | Medium | Full control, async Python | ✅ |
| **[matrix-bot-sdk](#typescript-bot-with-matrix-bot-sdk)** | Medium | TypeScript, Node.js | ✅ |
| **[Appservice](#building-an-appservice)** | Hard | Bridges, multi-user bots | ✅ |

## Quick Start: Which to Choose?

```
Want a bot running in minutes?
  └─► Maubot plugin (if you have Maubot)
  └─► SimpleMatrixBotLib (if coding from scratch)

Building something like a Discord bot?
  └─► NioBot (Python, discord.py-like)
  └─► matrix-bot-sdk (TypeScript)

Need full control or building a bridge?
  └─► matrix-nio (Python)
  └─► Appservice (multi-user, impersonation)
```

---

## Maubot Plugins

The easiest way to create a bot if you have [Maubot](./maubot) running.

### Minimal Plugin

```python title="helloworld.py"
from maubot import Plugin, MessageEvent
from maubot.handlers import command

class HelloWorldBot(Plugin):
    @command.new()
    async def hello(self, evt: MessageEvent) -> None:
        await evt.reply("Hello, World!")
```

```yaml title="maubot.yaml"
maubot: 0.1.0
id: com.example.helloworld
version: 1.0.0
license: MIT
modules:
  - helloworld
main_class: HelloWorldBot
```

### Build and Deploy

```bash
# Build plugin
zip -9r helloworld.mbp maubot.yaml helloworld.py

# Or with maubot CLI
mbc build --upload
```

### Plugin with Config

```python title="echobot.py"
from maubot import Plugin, MessageEvent
from maubot.handlers import command
from mautrix.util.config import BaseProxyConfig, ConfigUpdateHelper

class Config(BaseProxyConfig):
    def do_update(self, helper: ConfigUpdateHelper) -> None:
        helper.copy("prefix")
        helper.copy("response_format")

class EchoBot(Plugin):
    @classmethod
    def get_config_class(cls):
        return Config

    @command.new(name="echo")
    @command.argument("message", pass_raw=True)
    async def echo(self, evt: MessageEvent, message: str) -> None:
        prefix = self.config["prefix"]
        await evt.reply(f"{prefix} {message}")
```

**Learn more:** [Maubot Dev Docs](https://docs.mau.fi/maubot/dev/getting-started.html)

---

## SimpleMatrixBotLib

Get a bot running in **10 lines of code**. Great for beginners.

### Installation

```bash
pip install simplematrixbotlib

# With E2EE support
pip install simplematrixbotlib[e2ee]
```

### Basic Bot

```python title="bot.py"
import simplematrixbotlib as botlib

creds = botlib.Creds("https://matrix.org", "@bot:matrix.org", "password")
bot = botlib.Bot(creds)

@bot.listener.on_message_event
async def echo(room, message):
    match = botlib.MessageMatch(room, message, bot, "!echo")
    if match.is_not_from_this_bot() and match.prefix():
        await bot.api.send_text_message(room.room_id, match.args())

bot.run()
```

### Command Matching

```python
@bot.listener.on_message_event
async def commands(room, message):
    match = botlib.MessageMatch(room, message, bot)

    if match.is_not_from_this_bot():
        if match.command("!ping"):
            await bot.api.send_text_message(room.room_id, "Pong!")

        elif match.command("!hello"):
            name = match.args() or "World"
            await bot.api.send_text_message(room.room_id, f"Hello, {name}!")
```

### Config File

```toml title="config.toml"
[simplematrixbotlib.config]
join_on_invite = true
allowlist = ["@admin:matrix.org"]
```

```python
config = botlib.Config()
config.load_toml("config.toml")
bot = botlib.Bot(creds, config)
```

**Docs:** [simple-matrix-bot-lib.readthedocs.io](https://simple-matrix-bot-lib.readthedocs.io/)

---

## NioBot Framework

Discord.py-like syntax for Matrix bots. Full attachment and encryption support.

### Installation

```bash
pip install nio-bot

# With E2EE
pip install nio-bot[e2ee]
```

### Basic Bot

```python title="bot.py"
from niobot import NioBot, Context

bot = NioBot(
    homeserver="https://matrix.org",
    user_id="@bot:matrix.org",
    command_prefix="!",
    case_insensitive=True
)

@bot.command()
async def ping(ctx: Context):
    """Responds with Pong!"""
    await ctx.respond("Pong!")

@bot.command()
async def echo(ctx: Context, *, message: str):
    """Echoes your message back"""
    await ctx.respond(message)

bot.run(access_token="your-token")
```

### Attachments

```python
from niobot import NioBot, Context, ImageAttachment

@bot.command()
async def avatar(ctx: Context):
    """Sends an image"""
    attachment = await ImageAttachment.from_file("avatar.png")
    await ctx.respond("Here's an image:", file=attachment)
```

### Events

```python
@bot.on_event("member")
async def on_member_join(room, event):
    if event.membership == "join":
        await bot.send_message(room.room_id, f"Welcome, {event.display_name}!")
```

**GitHub:** [nexy7574/nio-bot](https://github.com/nexy7574/nio-bot)

---

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

---

## Building an Appservice

Appservices (Application Services) are powerful - they can impersonate users, receive all room events, and handle namespaces of users/rooms. Used for bridges and multi-user bots.

### When to Use Appservices

| Use Case | Regular Bot | Appservice |
|----------|-------------|------------|
| Simple commands | ✅ | Overkill |
| Welcome messages | ✅ | ✅ |
| Bridge to other platform | ❌ | ✅ |
| Impersonate users | ❌ | ✅ |
| Receive all events | ❌ | ✅ |
| Handle thousands of rooms | ❌ | ✅ |

### Registration File

Appservices need to be registered with the homeserver:

```yaml title="registration.yaml"
id: mybridge
url: http://localhost:9000
as_token: "generate-random-string-1"
hs_token: "generate-random-string-2"
sender_localpart: _mybridge_bot

namespaces:
  users:
    - exclusive: true
      regex: "@_mybridge_.*:example\\.com"
  aliases:
    - exclusive: true
      regex: "#_mybridge_.*:example\\.com"
  rooms: []

rate_limited: false
```

Add to Synapse:
```yaml title="homeserver.yaml"
app_service_config_files:
  - /path/to/registration.yaml
```

### TypeScript Appservice (matrix-bot-sdk)

```typescript title="appservice.ts"
import {
    Appservice,
    SimpleFsStorageProvider,
    IAppserviceRegistration
} from "matrix-bot-sdk";

const registration: IAppserviceRegistration = {
    id: "mybridge",
    hs_token: "hs-token",
    as_token: "as-token",
    sender_localpart: "_mybridge_bot",
    namespaces: {
        users: [{ exclusive: true, regex: "@_mybridge_.*:example.com" }],
        aliases: [],
        rooms: []
    },
    url: "http://localhost:9000",
    rate_limited: false
};

const storage = new SimpleFsStorageProvider("appservice.json");
const appservice = new Appservice({
    port: 9000,
    bindAddress: "0.0.0.0",
    homeserverName: "example.com",
    homeserverUrl: "https://matrix.example.com",
    registration,
    storage
});

// Handle messages
appservice.on("room.message", async (roomId, event) => {
    console.log(`Message in ${roomId}: ${event.content?.body}`);
});

// Create a ghost user
appservice.on("query.user", async (userId, createUser) => {
    // Called when someone tries to interact with a ghost user
    await createUser({ displayname: "Ghost User" });
});

// Impersonate a user
const intent = appservice.getIntentForUserId("@_mybridge_alice:example.com");
await intent.sendText(roomId, "Hello from Alice!");

appservice.begin().then(() => console.log("Appservice started"));
```

### Python Appservice (mautrix)

```python title="appservice.py"
from mautrix.appservice import AppService
from mautrix.types import RoomID, UserID

class MyBridge(AppService):
    async def handle_matrix_message(self, room_id: RoomID, sender: UserID, message: str):
        # Handle incoming Matrix messages
        print(f"{sender} in {room_id}: {message}")

    async def send_as_user(self, user_id: str, room_id: str, message: str):
        # Send message as a ghost user
        intent = self.az.intent.user(user_id)
        await intent.send_text(room_id, message)
```

### Appservice Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Homeserver                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Events for @_mybridge_*:server rooms/users      │   │
│  └─────────────────────────────────────────────────┘   │
│                         │ HTTP POST                     │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Your Appservice                     │   │
│  │  - Receives all relevant events                  │   │
│  │  - Can impersonate users in namespace            │   │
│  │  - Can create rooms with aliases in namespace    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Library:** [matrix-appservice-bridge](https://github.com/matrix-org/matrix-appservice-bridge)

---

## Getting a Bot Account

### Option 1: Register Normally

Create account like a regular user, then get access token:

**Element:** Settings → Help & About → Access Token

### Option 2: Admin API (Synapse)

```bash
# Create bot user
curl -X PUT "https://matrix.example.com/_synapse/admin/v2/users/@bot:example.com" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"password": "botpassword", "displayname": "My Bot"}'
```

### Option 3: Shared Registration Secret

```bash
# If registration is disabled but you have the secret
register_new_matrix_user -c /path/to/homeserver.yaml \
  -u bot -p password --no-admin https://matrix.example.com
```

---

## Bot Security Best Practices

### 1. Use Access Tokens, Not Passwords

```python
# Good - use access token
client = AsyncClient(homeserver, user_id)
client.access_token = os.getenv("MATRIX_TOKEN")

# Avoid - storing password
await client.login("password")  # Creates new device each time
```

### 2. Restrict Permissions

```python
# Only respond to allowed users
ALLOWED_USERS = ["@admin:example.com"]

async def message_callback(room, event):
    if event.sender not in ALLOWED_USERS:
        return
```

### 3. Validate Input

```python
import re

async def handle_command(room, event):
    # Sanitize user input
    args = event.body.split()[1:]
    if args and not re.match(r'^[\w\-]+$', args[0]):
        await client.room_send(room.room_id, "m.room.message",
            {"msgtype": "m.text", "body": "Invalid input"})
        return
```

### 4. Handle E2EE Properly

```python
# Verify the bot's session
# Users may need to verify the bot in their client

# For automated verification, consider:
from nio import ToDeviceEvent

async def handle_verification(event: ToDeviceEvent):
    # Auto-accept verification requests (use with caution)
    pass
```

---

## Testing Your Bot

### Local Testing

```bash
# Use a test homeserver
docker run -p 8008:8008 matrixdotorg/synapse:latest generate
docker run -p 8008:8008 -v $(pwd)/data:/data matrixdotorg/synapse:latest
```

### Maubot Testing Framework

```python
# maubot now includes a testing framework
from maubot.testing import TestBot

async def test_hello_command():
    bot = TestBot(HelloWorldBot)
    response = await bot.send("!hello")
    assert response == "Hello, World!"
```

---

## Resources

### Libraries
- [matrix-nio](https://matrix-nio.readthedocs.io/) - Python async client
- [NioBot](https://github.com/nexy7574/nio-bot) - Discord.py-like framework
- [SimpleMatrixBotLib](https://codeberg.org/imbev/simplematrixbotlib) - Beginner-friendly
- [matrix-bot-sdk](https://turt2live.github.io/matrix-bot-sdk/) - TypeScript SDK
- [matrix-appservice-bridge](https://github.com/matrix-org/matrix-appservice-bridge) - Bridge framework
- [Maubot](https://docs.mau.fi/maubot/) - Plugin-based bot system

### Templates
- [nio-template](https://github.com/anoadragon453/nio-template) - Production-ready Python bot template

### Community
- [#matrix-dev:matrix.org](https://matrix.to/#/#matrix-dev:matrix.org) - Developer chat
- [#matrix-bots:matrix.org](https://matrix.to/#/#matrix-bots:matrix.org) - Bot discussion

---

*Next: [SDKs Overview](../sdks/overview) →*
