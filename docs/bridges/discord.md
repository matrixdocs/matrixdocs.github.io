---
sidebar_position: 2
title: Discord Bridge
description: Bridge Matrix to Discord with mautrix-discord
---

# Discord Bridge

Connect Discord servers and DMs to Matrix using mautrix-discord.

## Features

- **Double puppeting** - Your Matrix messages appear from you on Discord
- **Full Discord support** - Servers, channels, threads, DMs, groups
- **Media bridging** - Images, videos, files, embeds
- **Reactions** - Emoji reactions sync both ways
- **Replies & threads** - Maintain conversation context
- **Guild bridging** - Bridge entire Discord servers

## Quick Start (Docker)

```yaml title="docker-compose.yml"
version: '3'
services:
  mautrix-discord:
    image: dock.mau.dev/mautrix/discord:latest
    restart: unless-stopped
    volumes:
      - ./discord-data:/data
```

```bash
# Start to generate config
docker compose up -d
docker compose stop

# Edit config
nano discord-data/config.yaml

# Generate registration
docker compose run --rm mautrix-discord

# Add registration to homeserver, restart homeserver, then:
docker compose up -d
```

## Configuration

### Essential Config

```yaml title="config.yaml"
homeserver:
  address: https://matrix.example.com
  domain: example.com

appservice:
  address: http://localhost:29334
  hostname: 0.0.0.0
  port: 29334
  database:
    type: postgres
    uri: postgres://user:pass@localhost/discord?sslmode=disable

bridge:
  username_template: "discord_{{.}}"
  displayname_template: "{{.Username}}#{{.Discriminator}}"

  # Portal settings
  portal_message_buffer: 128
  delivery_receipts: true

  # Double puppeting
  double_puppet_server_map:
    example.com: https://matrix.example.com
  login_shared_secret_map:
    example.com: "your-shared-secret"

  # Encryption
  encryption:
    allow: true
    default: true
    require: false

  # Permissions
  permissions:
    "*": relay
    "example.com": user
    "@admin:example.com": admin
```

### Permission Levels

| Level | Capabilities |
|-------|-------------|
| `relay` | Use relay mode only |
| `user` | Login, create portals, bridge DMs |
| `admin` | Manage bridge, see all portals |

## Logging In

### Via Bot

1. Start a DM with `@discordbot:example.com`
2. Send `!discord login`
3. Click the link to authorize
4. Or use token: `!discord login-token YOUR_TOKEN`

### Getting a Token (Advanced)

1. Open Discord in browser
2. Press F12 → Network tab
3. Filter for "api"
4. Find request with `authorization` header
5. Copy the token value

:::warning
Using a user token violates Discord ToS. Consider using a bot account for server bridging.
:::

## Bridging Discord Servers

### As User

```
!discord guilds         - List your Discord servers
!discord bridge <id>    - Bridge a server
```

### As Bot

1. Create a Discord bot at discord.com/developers
2. Add bot to server with required permissions:
   - Read Messages, Send Messages
   - Read Message History
   - Manage Webhooks (for puppeting)
3. Configure bot token in bridge config

```yaml
bridge:
  bot_token: "your-bot-token"
```

## Room Management

### Portal Rooms

Each Discord channel becomes a Matrix room:
```
#discord_123456789:example.com  →  #general on Server
```

### Plumbing Existing Rooms

Connect an existing Matrix room to Discord:
```
!discord bridge <channel-id>
```

### Unbridging

```
!discord unbridge
```

## Commands Reference

### User Commands

| Command | Description |
|---------|-------------|
| `!discord help` | Show help |
| `!discord login` | Start OAuth login |
| `!discord logout` | Disconnect account |
| `!discord ping` | Test connection |
| `!discord guilds` | List Discord servers |
| `!discord bridge <id>` | Bridge a channel |
| `!discord unbridge` | Unbridge current room |

### Admin Commands

| Command | Description |
|---------|-------------|
| `!discord set-relay` | Enable relay mode |
| `!discord list-users` | List bridged users |
| `!discord clear-db` | Clear bridge database |

## Troubleshooting

### "Invalid token"

- Token may have expired
- Re-login with `!discord login`
- Check for 2FA requirements

### Messages not bridging

1. Check bridge logs: `docker logs mautrix-discord`
2. Verify permissions on Discord side
3. Test with `!discord ping`

### Reactions not syncing

- Ensure bot has "Add Reactions" permission
- Check if reaction is a custom emoji (may not bridge)

### Media not working

- Check max upload size in homeserver
- Verify bridge has write access to media directory
- Large files may timeout

## Advanced Configuration

### Relay Mode

For servers where you can't add users:

```yaml
bridge:
  relay:
    enabled: true
    message_formats:
      m.text: "**{{ .Sender.Displayname }}**: {{ .Message }}"
```

### Webhook Avatars

Display Matrix user avatars on Discord:

```yaml
bridge:
  use_webhook_avatars: true
```

### Custom Bot

Use your own Discord bot:

```yaml
bridge:
  bot_token: "your-bot-token"
  use_bot: true
```

## Resources

- [mautrix-discord GitHub](https://github.com/mautrix/discord)
- [Documentation](https://docs.mau.fi/bridges/discord/)
- [Matrix room](https://matrix.to/#/#discord:maunium.net)

---

*Next: [Telegram Bridge](/bridges/telegram) →*
