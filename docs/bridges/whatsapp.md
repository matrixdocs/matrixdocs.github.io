---
sidebar_position: 7
title: WhatsApp Bridge
description: Bridge Matrix to WhatsApp
---

# WhatsApp Bridge

Connect WhatsApp to Matrix using mautrix-whatsapp.

## Features

- **Full puppeting** - Appear as yourself on WhatsApp
- **Chats** - Individual and group chats
- **Media** - Images, videos, documents, voice
- **Reactions** - Emoji reactions
- **Status** - WhatsApp status/stories
- **History sync** - Backfill message history

## Docker Setup

```yaml title="docker-compose.yml"
version: '3'
services:
  mautrix-whatsapp:
    image: dock.mau.dev/mautrix/whatsapp:latest
    restart: unless-stopped
    volumes:
      - ./whatsapp-data:/data
```

## Configuration

```yaml title="config.yaml"
homeserver:
  address: https://matrix.example.com
  domain: example.com

appservice:
  address: http://localhost:29318
  hostname: 0.0.0.0
  port: 29318
  database:
    type: postgres
    uri: postgres://user:pass@localhost/whatsapp?sslmode=disable

bridge:
  username_template: "whatsapp_{{.}}"

  history_sync:
    backfill: true
    max_initial_conversations: 50
    message_count: 100

  encryption:
    allow: true
    default: true

  permissions:
    "*": relay
    "example.com": user
    "@admin:example.com": admin
```

## Linking Your Account

1. DM `@whatsappbot:example.com`
2. Send `!wa login`
3. Scan QR code with WhatsApp:
   - WhatsApp → Menu → Linked Devices → Link a Device

```
You: !wa login
Bot: [QR Code]
Bot: Scan this QR code with WhatsApp
```

:::warning
WhatsApp limits linked devices. The bridge uses the multi-device feature.
:::

## Commands

| Command | Description |
|---------|-------------|
| `!wa help` | Show help |
| `!wa login` | Link WhatsApp |
| `!wa logout` | Unlink |
| `!wa ping` | Test connection |
| `!wa sync` | Sync contacts/groups |
| `!wa list` | List chats |

## History Sync

WhatsApp syncs history automatically on link:

```yaml
bridge:
  history_sync:
    backfill: true
    max_initial_conversations: 50
    message_count: 100
    recent_only: true
```

## Group Management

### Bridged Groups

Groups appear automatically. To create a new group:

```
!wa create "Group Name"
```

### Inviting Users

In a bridged group:
```
!wa invite +1234567890
```

## Status/Stories

View WhatsApp status updates:

```yaml
bridge:
  enable_status_broadcast: true
```

Status appears in a dedicated room.

## Troubleshooting

### QR Code Expired

WhatsApp QR codes expire quickly:
```
!wa login
```
Scan immediately.

### Logged Out

WhatsApp may disconnect linked devices:
- Re-login with `!wa login`
- Check WhatsApp app for notifications

### Media Not Sending

- Check file size limits
- Verify media permissions
- WhatsApp has format restrictions

### Rate Limiting

New accounts face restrictions:
- Use established WhatsApp account
- Avoid bulk messaging
- Wait if rate limited

## Privacy Notes

- WhatsApp has E2EE, but bridge decrypts
- Messages stored on Matrix server
- Meta can see metadata (who, when)
- Consider privacy implications

## Resources

- [mautrix-whatsapp GitHub](https://github.com/mautrix/whatsapp)
- [Documentation](https://docs.mau.fi/bridges/whatsapp/)

---

*Next: [Bots Overview](../bots/overview) →*
