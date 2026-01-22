---
sidebar_position: 1
title: Matrix Bridges Overview
description: Connect Matrix to other messaging platforms
---

# Matrix Bridges

Bridges let you connect Matrix to other messaging platforms, creating a unified communication experience.

## What is a Bridge?

A bridge is a program that connects Matrix rooms to external services:

```
┌─────────────┐         ┌──────────┐         ┌─────────────┐
│   Matrix    │◄───────►│  Bridge  │◄───────►│  Discord    │
│   Room      │         │          │         │  Channel    │
└─────────────┘         └──────────┘         └─────────────┘
```

Messages flow both ways - Matrix users see Discord messages and vice versa.

## Bridge Types

### Puppeting Bridges

**Best experience** - Each user appears as themselves on both sides.

```
Matrix User Alice  →  [Bridge]  →  Discord user "Alice (Matrix)"
Discord User Bob   →  [Bridge]  →  Matrix user @discord_bob:server
```

Features:
- Individual user accounts on each side
- Reactions, edits, replies work
- Typing indicators sync
- Read receipts sync

### Relay Bridges

**Simpler setup** - Messages relayed through a bot.

```
Matrix User Alice  →  [Bridge Bot]  →  "Alice: Hello!" in Discord
```

Features:
- Single bot posts all messages
- Easier to set up
- Less realistic user experience

### Portal vs Plumbed Rooms

| Type | Description | Use Case |
|------|-------------|----------|
| **Portal** | Auto-created room for each remote channel | Personal use, 1:1 mapping |
| **Plumbed** | Existing Matrix room connected to remote | Communities, custom setup |

## Popular Bridges

| Platform | Bridge | Puppeting | Status |
|----------|--------|-----------|--------|
| [Discord](./discord) | mautrix-discord | ✅ | Stable |
| [Telegram](./telegram) | mautrix-telegram | ✅ | Stable |
| [Slack](./slack) | mautrix-slack | ✅ | Stable |
| [IRC](./irc) | Heisenbridge | Partial | Stable |
| [Signal](./signal) | mautrix-signal | ✅ | Stable |
| [WhatsApp](./whatsapp) | mautrix-whatsapp | ✅ | Stable |
| iMessage | mautrix-imessage | ✅ | macOS only |
| Instagram | mautrix-instagram | ✅ | Stable |
| Facebook | mautrix-facebook | ✅ | Stable |
| Google Chat | mautrix-googlechat | ✅ | Stable |
| LinkedIn | linkedin-matrix | ✅ | Beta |
| Twitter | mautrix-twitter | ✅ | Stable |

## Hosted Bridge Services

Don't want to self-host? These services provide managed bridges:

| Service | Bridges | Pricing |
|---------|---------|---------|
| [Beeper](https://beeper.com) | All major | Subscription |
| [etke.cc](https://etke.cc) | Most | Per-bridge |
| [Element EMS](https://element.io/ems) | Enterprise | Contact |

## Self-Hosting Bridges

### Requirements

Most mautrix bridges need:
- Homeserver with appservice support (Synapse, Dendrite)
- Python 3.8+ or pre-built Docker images
- Registration file configured

### General Setup Pattern

```bash
# 1. Clone bridge repository
git clone https://github.com/mautrix/discord.git
cd discord

# 2. Create config
cp example-config.yaml config.yaml

# 3. Edit config (homeserver, appservice details)
nano config.yaml

# 4. Generate registration
python -m mautrix_discord -g

# 5. Add registration to homeserver config
# (homeserver.yaml for Synapse)

# 6. Restart homeserver

# 7. Start bridge
python -m mautrix_discord
```

### Docker Deployment

```yaml title="docker-compose.yml"
version: '3'
services:
  mautrix-discord:
    image: dock.mau.dev/mautrix/discord:latest
    restart: unless-stopped
    volumes:
      - ./discord-data:/data
    depends_on:
      - synapse
```

## Bridge Configuration

### Appservice Registration

Bridges register as "appservices" with your homeserver:

```yaml title="registration.yaml"
id: discord
url: http://localhost:29334
as_token: <generated>
hs_token: <generated>
sender_localpart: discordbot
rate_limited: false
namespaces:
  users:
    - exclusive: true
      regex: '@discord_.*:example\.com'
  aliases:
    - exclusive: true
      regex: '#discord_.*:example\.com'
```

Add to Synapse config:
```yaml title="homeserver.yaml"
app_service_config_files:
  - /data/discord-registration.yaml
```

## Encryption Support

Many bridges support end-to-end encryption:

| Bridge | E2EE Support |
|--------|-------------|
| mautrix-discord | ✅ |
| mautrix-telegram | ✅ |
| mautrix-signal | ✅ |
| mautrix-whatsapp | ✅ |
| Heisenbridge | ❌ |

:::warning
Bridged E2EE means messages are encrypted on the Matrix side, but the bridge must decrypt to send to the other platform. The remote platform sees messages in plaintext.
:::

## Bridge Management

### Common Commands

Most mautrix bridges respond to commands in DMs:

```
!help                    - Show all commands
!login                   - Start login process
!logout                  - Disconnect account
!sync                    - Sync contacts/groups
!ping                    - Test bridge connection
```

### Admin Commands

Bridge admins can use:
```
!admin list-users       - List bridged users
!admin set-relay        - Configure relay mode
!admin set-permissions  - Manage permissions
```

## Performance Considerations

### Resource Usage

| Bridge | RAM (idle) | Notes |
|--------|-----------|-------|
| mautrix-discord | 50-100 MB | Per account |
| mautrix-telegram | 50-100 MB | Per account |
| mautrix-whatsapp | 100-200 MB | Includes crypto |
| Heisenbridge | 30-50 MB | Very lightweight |

### Scaling

For many users:
- Run bridges on separate servers
- Use PostgreSQL instead of SQLite
- Consider multiple bridge instances

## Best Practices

### Security

1. **Use separate accounts** for bridging
2. **Enable E2EE** on Matrix side when possible
3. **Review permissions** bridges request
4. **Keep bridges updated** for security fixes

### Reliability

1. **Monitor bridge health** via metrics/logs
2. **Set up restart policies** (systemd, Docker)
3. **Back up bridge databases**
4. **Test failover** procedures

### User Experience

1. **Document for users** how bridges work
2. **Set expectations** about features/limitations
3. **Create support channels** for bridge issues

## Troubleshooting

### Bridge Not Starting

```bash
# Check logs
journalctl -u mautrix-discord -f

# Verify registration
cat registration.yaml

# Test homeserver connectivity
curl http://localhost:8008/_matrix/client/versions
```

### Messages Not Syncing

1. Check bridge logs for errors
2. Verify remote platform auth
3. Test with `!ping` command
4. Check rate limits

### Double Bridging

If messages appear twice:
- Check for multiple bridge instances
- Verify room isn't bridged twice
- Review bot permissions

## Next Steps

Choose a bridge to set up:
- [Discord Bridge](./discord)
- [Telegram Bridge](./telegram)
- [Slack Bridge](./slack)
- [IRC Bridge](./irc)
- [Signal Bridge](./signal)
- [WhatsApp Bridge](./whatsapp)
