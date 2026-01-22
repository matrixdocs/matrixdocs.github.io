---
sidebar_position: 2
title: Core Concepts
description: Understand the fundamental concepts of the Matrix protocol
---

# Core Concepts

Understanding these concepts will help you navigate the Matrix ecosystem like a power user.

## The Matrix Network

Matrix is a **federated network** of homeservers. Think of it like email:
- Your email address is tied to a provider (Gmail, Outlook, etc.)
- But you can email anyone on any provider
- Matrix works the same way for messaging

```
┌─────────────────┐         ┌─────────────────┐
│  matrix.org     │◄───────►│  example.com    │
│  homeserver     │  federate│  homeserver     │
│                 │         │                 │
│  @alice:matrix.org        │  @bob:example.com
└─────────────────┘         └─────────────────┘
```

## Matrix IDs

Your Matrix ID (MXID) uniquely identifies you across the network:

```
@username:homeserver.org
│    │          │
│    │          └── The server where your account lives
│    └── Your chosen username
└── @ symbol indicates this is a user
```

Other ID types:
- `!roomid:server.org` - Room ID (internal identifier)
- `#alias:server.org` - Room alias (human-readable)
- `+community:server.org` - Legacy community (deprecated)

## Rooms

Rooms are the core unit of communication in Matrix.

### Room Properties

| Property | Description |
|----------|-------------|
| **Room ID** | Unique identifier like `!abcd1234:server.org` |
| **Aliases** | Human-readable names like `#matrix:matrix.org` |
| **State** | Room settings (name, topic, permissions, etc.) |
| **Timeline** | The ordered list of events (messages) |

### Room Types

- **Direct Messages (DMs)** - 1:1 conversations
- **Private Rooms** - Invite-only group chats
- **Public Rooms** - Anyone can join, often listed in room directories
- **Spaces** - Hierarchical organization of rooms (like Discord servers)

## Events

Everything in Matrix is an **event**. Events are JSON objects that represent actions:

```json
{
  "type": "m.room.message",
  "sender": "@alice:matrix.org",
  "content": {
    "msgtype": "m.text",
    "body": "Hello, Matrix!"
  },
  "origin_server_ts": 1234567890123,
  "event_id": "$eventid:matrix.org"
}
```

### Event Types

| Type | Description |
|------|-------------|
| `m.room.message` | Text, images, files, etc. |
| `m.room.member` | Join, leave, invite, ban |
| `m.room.name` | Room name changes |
| `m.room.topic` | Room topic changes |
| `m.room.power_levels` | Permission changes |
| `m.room.encryption` | E2EE settings |

## Federation

Federation is how homeservers communicate:

1. **Alice** on `matrix.org` sends a message to a room
2. The room has members from `example.com`
3. `matrix.org` sends the event to `example.com`
4. **Bob** on `example.com` receives the message

:::tip Power User Insight
When you join a room, your homeserver creates a local copy of the room state. This means:
- Messages are stored on all participating homeservers
- If one server goes down, the room continues to work
- Leaving a room removes your homeserver's copy (eventually)
:::

## End-to-End Encryption (E2EE)

Matrix supports optional E2EE using:

- **Olm** - For 1:1 device encryption
- **Megolm** - For efficient group encryption

### How It Works

1. Each device has a unique **device key**
2. Messages are encrypted for each recipient device
3. Keys are verified via **cross-signing**
4. **Key backup** protects against device loss

### Verification

Users can verify each other to ensure they're talking to the right person:

1. **Emoji verification** - Compare emojis on both devices
2. **QR code scan** - Scan a code on the other device
3. **Cross-signing** - Your verified devices vouch for each other

## Power Levels

Rooms have a permission system based on "power levels" (0-100 by default):

| Level | Typical Role | Capabilities |
|-------|-------------|--------------|
| 0 | Default | Send messages |
| 50 | Moderator | Kick users, delete messages |
| 100 | Admin | Full control, change room settings |

:::info
Power levels are completely customizable. A room can use any numbers and define custom thresholds for each action.
:::

## Spaces

Spaces are Matrix's answer to Discord servers or Slack workspaces:

- **Hierarchical** - Spaces can contain rooms and other spaces
- **Flexible** - A room can belong to multiple spaces
- **Access Control** - Inherit membership from parent spaces

```
Space: "My Community"
├── #general
├── #random
├── Space: "Development"
│   ├── #frontend
│   └── #backend
└── Space: "Social"
    ├── #gaming
    └── #music
```

## Next Steps

- [Quick Start](/getting-started/quick-start) - Get your first Matrix account
- [Clients](/clients/overview) - Choose your Matrix client
- [Specification](/specification/overview) - Deep dive into the protocol

---

*Next: [Quick Start](/getting-started/quick-start) →*
