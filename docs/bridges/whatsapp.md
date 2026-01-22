---
sidebar_position: 7
title: WhatsApp Bridge
description: Bridge Matrix to WhatsApp
---

# WhatsApp Bridge

Connect WhatsApp to Matrix using mautrix-whatsapp. Uses the official WhatsApp Web multi-device API.

## Features

- **Full puppeting** - Appear as yourself on WhatsApp
- **Chats** - Individual and group chats
- **Media** - Images, videos, documents, voice messages
- **Reactions** - Emoji reactions sync both ways
- **Status** - WhatsApp status/stories
- **History sync** - One-time backfill on login
- **HD media** - Dual uploads bridged as edits
- **Animated stickers** - LottieConverter support in Docker
- **Group creation** - Create WhatsApp groups from Matrix

### 2025 Updates

| Feature | Description |
|---------|-------------|
| **LID DM handling** | Better merging of phone number and LID DMs |
| **Animated stickers** | LottieConverter now in Docker images |
| **HD photo bridging** | Bridged as edits on Matrix |
| **Pin/keep messages** | Placeholder support |

### Requirements

- WhatsApp on a phone (physical or virtual)
- Phone must come online at least every **12 days**
- ffmpeg (for sending GIFs from Matrix)

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

### QR Code Login (Recommended)

1. DM `@whatsappbot:example.com`
2. Send `!wa login`
3. Open WhatsApp on phone:
   - **Android:** Menu (⋮) → Linked Devices → Link a Device
   - **iPhone:** Settings → Linked Devices → Link a Device
4. Point phone at QR code

```
You: !wa login
Bot: [QR Code Image]
Bot: Scan this QR code with WhatsApp
Bot: Successfully logged in as +1234567890
```

### Pairing Code Login

If QR scanning doesn't work:

1. Send `!wa login --pairing`
2. Bot provides a pairing code
3. In WhatsApp: Linked Devices → Link with phone number instead
4. Enter the code

### Important Limitations

:::warning Phone Must Stay Online
WhatsApp requires your phone to connect to the internet **at least every 12 days**. If offline longer, the bridge will be disconnected and you'll need to re-login.

The bridge will warn you if it hasn't seen your phone in over 12 days.
:::

:::info Device Limits
WhatsApp allows up to 4 linked devices. The bridge counts as one device.
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

WhatsApp performs a **one-time history transfer** when you link the bridge. Configure this **before** your first login.

```yaml
bridge:
  history_sync:
    # Enable backfill
    backfill: true

    # How many chats to backfill
    max_initial_conversations: 50

    # Messages per chat
    message_count: 100

    # Only recent messages (recommended)
    recent_only: true

    # Request full sync from phone
    request_full_sync: false
```

### How It Works

1. You scan QR code to link bridge
2. WhatsApp phone sends history to bridge
3. Bridge creates Matrix rooms and imports messages
4. Messages appear with original timestamps

### Limitations

:::warning Backfill Only Works Once
Matrix cannot insert messages into existing room history. Backfill only works in **new empty rooms**.

If you re-login after already having rooms, missed messages won't appear in correct chronological order.
:::

### Full Sync Options

Request more history from phone (uses more bandwidth):

```yaml
bridge:
  history_sync:
    request_full_sync: true
    full_sync_config:
      days_of_messages: 365
      size_mb: 500
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
