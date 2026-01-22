---
sidebar_position: 3
title: Mjolnir
description: Moderation bot for Matrix communities
---

# Mjolnir

Mjolnir is a powerful moderation bot for Matrix. Essential for managing communities and protecting against spam.

## Features

- **Ban lists** - Shared blocklists across rooms
- **Spam protection** - Automated detection and removal
- **Mass moderation** - Act across multiple rooms
- **Server ACLs** - Block entire servers
- **Audit logging** - Track all mod actions

## Installation

### Docker

```yaml title="docker-compose.yml"
version: '3'
services:
  mjolnir:
    image: matrixdotorg/mjolnir:latest
    restart: unless-stopped
    volumes:
      - ./mjolnir-data:/data
```

### npm

```bash
npm install -g mjolnir
mjolnir
```

## Setup

### 1. Create Bot Account

Create a Matrix account for Mjolnir:
```
@mjolnir:example.com
```

### 2. Configure

```yaml title="config/production.yaml"
homeserverUrl: "https://matrix.example.com"
accessToken: "your-bot-access-token"

managementRoom: "#mjolnir-management:example.com"

protectedRooms:
  - "#room1:example.com"
  - "#room2:example.com"

# Enable protections
protections:
  - FirstMessageIsImage
  - BasicFloodingProtection

# Admin users
admins:
  - "@admin:example.com"
```

### 3. Create Management Room

1. Create a new room
2. Invite the bot
3. Give bot admin (PL 100)
4. Set as management room in config

### 4. Start Mjolnir

```bash
docker compose up -d
# or
mjolnir --config config/production.yaml
```

## Commands

### User Moderation

| Command | Description |
|---------|-------------|
| `!mjolnir ban <user> [reason]` | Ban user from protected rooms |
| `!mjolnir unban <user>` | Unban user |
| `!mjolnir kick <user> [reason]` | Kick user |
| `!mjolnir redact <user> [limit]` | Remove user's messages |
| `!mjolnir mute <user>` | Mute user |
| `!mjolnir unmute <user>` | Unmute user |

### Room Management

| Command | Description |
|---------|-------------|
| `!mjolnir rooms add <room>` | Add protected room |
| `!mjolnir rooms remove <room>` | Remove protected room |
| `!mjolnir rooms` | List protected rooms |

### Ban Lists

| Command | Description |
|---------|-------------|
| `!mjolnir list create <shortcode>` | Create ban list |
| `!mjolnir watch <room>` | Subscribe to ban list |
| `!mjolnir unwatch <room>` | Unsubscribe |

### Server ACLs

| Command | Description |
|---------|-------------|
| `!mjolnir ban server <server>` | Block entire server |
| `!mjolnir unban server <server>` | Unblock server |

## Protections

### Built-in Protections

| Protection | Description |
|------------|-------------|
| `FirstMessageIsImage` | Block image-only first messages |
| `BasicFloodingProtection` | Rate limit messages |
| `WordList` | Block messages with banned words |
| `MessageIsVoice` | Block voice messages |
| `MessageIsMedia` | Block media messages |

### Enabling Protections

```
!mjolnir enable FirstMessageIsImage
!mjolnir enable BasicFloodingProtection
```

### Configuring

```
!mjolnir config set BasicFloodingProtection.maxPerMinute 10
```

## Ban Lists

### Using Community Lists

Subscribe to shared ban lists:

```
!mjolnir watch #matrix-org-coc-bl:matrix.org
```

Popular ban lists:
- `#matrix-org-coc-bl:matrix.org` - Matrix.org CoC violations
- `#community-moderation-effort-bl:neko.dev` - CME list

### Creating Your Own

```
!mjolnir list create mylist
# Creates #mylist-bl:example.com
```

Share with other servers for collaborative moderation.

## Advanced Usage

### Synapse Module

For server-wide protection, install the Synapse module:

```python
modules:
  - module: mjolnir.AntiSpam
    config:
      block_invites: true
      block_messages: true
      ban_lists:
        - "#mylist-bl:example.com"
```

This applies rules at the server level, before messages reach rooms.

### Multiple Instances

Run separate Mjolnir instances for different communities:
- Different protected room sets
- Different policies
- Different admin teams

## Draupnir

**Draupnir** is a maintained fork of Mjolnir with improvements:

```bash
npm install -g draupnir
```

Additional features:
- Better performance
- More protections
- Active development

Consider Draupnir for new deployments.

## Troubleshooting

### Bot Can't Ban Users

- Check bot power level (needs 100)
- Verify room is in protected list
- Check homeserver logs

### Protections Not Triggering

- Verify protection is enabled
- Check protection config
- Review detection criteria

### Ban List Not Syncing

- Ensure bot has room access
- Check `!mjolnir status`
- Verify list room permissions

## Resources

- [Mjolnir GitHub](https://github.com/matrix-org/mjolnir)
- [Draupnir GitHub](https://github.com/the-draupnir-project/Draupnir)
- [Documentation](https://github.com/matrix-org/mjolnir/blob/main/docs/)
- [Matrix Room](https://matrix.to/#/#mjolnir:matrix.org)

---

*Next: [Hookshot](/bots/hookshot) →*
