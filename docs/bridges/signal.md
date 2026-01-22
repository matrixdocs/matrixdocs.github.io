---
sidebar_position: 6
title: Signal Bridge
description: Bridge Matrix to Signal messenger
---

# Signal Bridge

Connect Signal to Matrix using mautrix-signal.

## Features

- **Full puppeting** - Appear as yourself on Signal
- **Individual chats** - Bridge 1:1 conversations
- **Group chats** - Bridge Signal groups
- **Media** - Images, voice messages, files
- **Reactions** - Emoji reactions
- **Receipts** - Read receipts and typing

## Docker Setup

```yaml title="docker-compose.yml"
version: '3'
services:
  mautrix-signal:
    image: dock.mau.dev/mautrix/signal:latest
    restart: unless-stopped
    volumes:
      - ./signal-data:/data

  signald:
    image: signald/signald:latest
    restart: unless-stopped
    volumes:
      - ./signald-data:/signald
```

:::info
mautrix-signal requires either signald or the built-in signal library. Recent versions include native Signal support.
:::

## Configuration

```yaml title="config.yaml"
homeserver:
  address: https://matrix.example.com
  domain: example.com

appservice:
  address: http://localhost:29328
  hostname: 0.0.0.0
  port: 29328
  database:
    type: postgres
    uri: postgres://user:pass@localhost/signal?sslmode=disable

signal:
  socket_path: /signald/signald.sock
  # Or for native:
  # use_native: true

bridge:
  username_template: "signal_{{.}}"

  encryption:
    allow: true
    default: true

  permissions:
    "*": relay
    "example.com": user
    "@admin:example.com": admin
```

## Linking Your Account

1. DM `@signalbot:example.com`
2. Send `!signal link`
3. Scan QR code with Signal app:
   - Signal → Settings → Linked Devices → Link New Device

```
You: !signal link
Bot: [QR Code Image]
Bot: Open Signal, go to Settings > Linked Devices, and scan this code.
```

:::warning
Signal only allows one primary device. The bridge links as a secondary device.
:::

## Commands

| Command | Description |
|---------|-------------|
| `!signal help` | Show help |
| `!signal link` | Link Signal account |
| `!signal unlink` | Unlink account |
| `!signal ping` | Test connection |
| `!signal sync` | Sync contacts/groups |

## Bridging Groups

Groups are automatically bridged when you receive messages. To manually sync:

```
!signal sync groups
```

## Privacy Considerations

### End-to-End Encryption

- Signal uses E2EE for all messages
- Bridge decrypts to relay to Matrix
- Matrix room can have its own E2EE
- **Bridge sees plaintext** to convert

### Data Storage

- Signal messages stored on Matrix homeserver
- Contact info synced to bridge database
- Consider privacy implications

## Troubleshooting

### QR Code Not Working

- Ensure Signal app is updated
- Try regenerating: `!signal link`
- Check signald logs

### Messages Not Syncing

- Verify link status: `!signal ping`
- Re-link if needed
- Check for Signal service issues

### Rate Limiting

Signal has rate limits for new accounts. Use an established account.

## Resources

- [mautrix-signal GitHub](https://github.com/mautrix/signal)
- [Documentation](https://docs.mau.fi/bridges/signal/)

---

*Next: [WhatsApp Bridge](./whatsapp) →*
