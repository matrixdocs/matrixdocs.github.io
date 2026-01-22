---
sidebar_position: 3
title: Telegram Bridge
description: Bridge Matrix to Telegram with mautrix-telegram
---

# Telegram Bridge

Connect Telegram chats, groups, and channels to Matrix.

## Features

- **Full puppeting** - Appear as yourself on Telegram
- **Groups & supergroups** - Bridge any Telegram group
- **Channels** - Bridge Telegram channels
- **Bots** - Use Telegram bots from Matrix
- **Stickers** - Convert and send stickers
- **Reactions** - Emoji reactions both ways
- **Location sharing** - Send and receive locations

## Docker Setup

```yaml title="docker-compose.yml"
version: '3'
services:
  mautrix-telegram:
    image: dock.mau.dev/mautrix/telegram:latest
    restart: unless-stopped
    volumes:
      - ./telegram-data:/data
```

## Configuration

### Get Telegram API Credentials

1. Go to [my.telegram.org](https://my.telegram.org)
2. Log in with your phone number
3. Click "API development tools"
4. Create a new application
5. Note your `api_id` and `api_hash`

### Essential Config

```yaml title="config.yaml"
homeserver:
  address: https://matrix.example.com
  domain: example.com

appservice:
  address: http://localhost:29317
  hostname: 0.0.0.0
  port: 29317
  database:
    type: postgres
    uri: postgres://user:pass@localhost/telegram?sslmode=disable

telegram:
  api_id: YOUR_API_ID
  api_hash: YOUR_API_HASH

bridge:
  username_template: "telegram_{{.}}"

  # Double puppeting
  double_puppet_server_map:
    example.com: https://matrix.example.com
  login_shared_secret_map:
    example.com: "your-shared-secret"

  # Encryption
  encryption:
    allow: true
    default: true

  # Permissions
  permissions:
    "*": relaybot
    "example.com": user
    "@admin:example.com": admin
```

## Logging In

1. DM `@telegrambot:example.com`
2. Send `!tg login`
3. Enter your phone number
4. Enter the code Telegram sends
5. Enter 2FA password if enabled

```
You: !tg login
Bot: Please enter your phone number...
You: +1234567890
Bot: Please enter the code...
You: 12345
Bot: Successfully logged in!
```

## Bridging Chats

### Bridge a Group

```
!tg bridge            - Bridge current Telegram group
!tg create <name>     - Create new bridged group
```

### Using Relay Bot

For groups you can't personally bridge:

1. Create a Telegram bot via [@BotFather](https://t.me/BotFather)
2. Add bot token to config:
   ```yaml
   telegram:
     bot_token: "your-bot-token"
   ```
3. Add bot to Telegram group
4. Users send via relay

## Commands Reference

### User Commands

| Command | Description |
|---------|-------------|
| `!tg help` | Show help |
| `!tg login` | Start login |
| `!tg logout` | Disconnect |
| `!tg ping` | Test connection |
| `!tg bridge` | Bridge current group |
| `!tg unbridge` | Unbridge room |
| `!tg sync` | Sync contacts |

### Chat Commands

| Command | Description |
|---------|-------------|
| `!tg create <name>` | Create bridged group |
| `!tg invite <user>` | Invite Telegram user |
| `!tg kick <user>` | Kick user |

### Admin Commands

| Command | Description |
|---------|-------------|
| `!tg filter` | Manage spam filters |
| `!tg set-relay` | Configure relay |

## Stickers

Telegram stickers can be bridged:

```yaml
bridge:
  sticker:
    webp_to_png: true      # Convert to PNG
    add_to_room: false     # Auto-add sticker packs
```

### Sending Stickers

1. Bridge sticker pack: `!tg sticker add <pack-link>`
2. Use sticker picker in Element
3. Or send sticker file directly

## Advanced Features

### Channel Bridging

Bridge public Telegram channels:

```
!tg bridge @channelname
```

Channel posts appear as messages from the channel.

### Supergroup Migration

When Telegram upgrades a group to supergroup:
1. Bridge auto-migrates
2. Room continues with new ID
3. Check logs for issues

### Public Portals

Make bridged rooms public:

```yaml
bridge:
  public_portals: true
```

### Bot Forwarding

Forward Telegram bot messages to Matrix:

```yaml
bridge:
  forward_telegram_bot_messages: true
```

## Relay Mode

For groups where users can't log in individually:

```yaml
bridge:
  relay_mode:
    enabled: true
    message_formats:
      m.text: "[{displayname}] {message}"
```

All Matrix users appear through the relay bot.

## Troubleshooting

### "FLOOD_WAIT_X"

Telegram rate limiting. Wait X seconds and retry.

### "SESSION_REVOKED"

Session expired. Re-login with `!tg login`.

### Messages delayed

- Check Telegram service status
- Verify bridge connectivity
- Review rate limits

### Media not sending

```yaml
# Increase limits
telegram:
  max_download_size: 52428800  # 50MB
  max_upload_size: 52428800
```

### Stickers not working

- Ensure webp conversion is enabled
- Check for missing dependencies (libwebp)
- Verify sticker pack is accessible

## Resources

- [mautrix-telegram GitHub](https://github.com/mautrix/telegram)
- [Documentation](https://docs.mau.fi/bridges/telegram/)
- [Matrix room](https://matrix.to/#/#telegram:maunium.net)

---

*Next: [Slack Bridge](./slack) →*
