---
sidebar_position: 4
title: Advanced Features
description: Deep dives into Matrix's advanced capabilities
---

# Advanced Features

Explore Matrix's powerful features that go beyond basic messaging.

## Widgets

### What Are Widgets?

Widgets embed interactive content in rooms:
- Video conferencing (Jitsi)
- Collaborative documents (Etherpad)
- Polls and surveys
- Custom web apps

### Adding Widgets

In Element:
1. Room info (i) → Widgets
2. Add from list or custom URL

### Custom Widgets

Create your own:

```html title="widget.html"
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/matrix-widget-api@1.0.0/dist/api.js"></script>
</head>
<body>
  <h1>My Widget</h1>
  <script>
    const widgetApi = new mxwidgets.WidgetApi();
    widgetApi.requestCapabilities([
      mxwidgets.MatrixCapabilities.MSC2931Navigate
    ]);
    widgetApi.start();
  </script>
</body>
</html>
```

### Widget Ideas

- **Status dashboard** - Monitor services
- **Team voting** - Quick decisions
- **Shared timer** - Meetings/pomodoro
- **Document preview** - View attachments

## Spaces Deep Dive

### Nested Spaces

Create hierarchical structures:

```
🏢 Organization
├── 📋 General
├── 💻 Engineering
│   ├── #frontend
│   ├── #backend
│   └── 📁 Projects
│       ├── #project-a
│       └── #project-b
└── 🎉 Social
```

### Space-Based Access Control

Configure rooms to inherit access from space:

1. Create space
2. Add room to space
3. Set room join rules to "Space members"
4. Members of space can join room

### Suggested Rooms

Mark rooms as "suggested" in space:
```json
{
  "type": "m.space.child",
  "state_key": "!room:example.com",
  "content": {
    "via": ["example.com"],
    "suggested": true
  }
}
```

Suggested rooms appear prominently to new space members.

## Threads Advanced

### Thread Best Practices

- Start threads for tangential discussions
- Keep main timeline for announcements
- Use threads for Q&A

### Thread Notifications

Configure per-room:
- All thread messages
- Only mentions in threads
- Only root messages

## Voice Rooms

### Setting Up Voice Rooms

Voice rooms are persistent call rooms:

1. Enable in Labs
2. Create room with voice room type
3. Users can drop in/out

### Jitsi Integration

For group calls:
1. Add Jitsi widget
2. Configure Jitsi server
3. Start meeting from widget

Self-hosted Jitsi:
```yaml
# docker-compose.yml for Jitsi
services:
  jitsi:
    image: jitsi/web
    # ... configuration
```

## Custom Emojis

### Room Emoji Packs

Add custom emojis to rooms:

```json
{
  "type": "im.ponies.room_emotes",
  "content": {
    "images": {
      "myemoji": {
        "url": "mxc://example.com/abc123"
      }
    }
  }
}
```

### Sticker Packs

Create and share sticker packs:
1. Upload images to homeserver
2. Create sticker pack room
3. Share with others

## Push Rules

### Custom Notifications

Fine-tune notifications via push rules:

```json
{
  "actions": ["notify", {"set_tweak": "sound", "value": "default"}],
  "conditions": [
    {"kind": "event_match", "key": "content.body", "pattern": "*important*"}
  ],
  "rule_id": "important_word"
}
```

### Keyword Alerts

Get notified for specific words across all rooms.

## Matrix URIs

### Link Anywhere

Deep link to Matrix content:

```
matrix:r/room:example.com                    # Room by alias
matrix:roomid/!abc:example.com               # Room by ID
matrix:u/user:example.com                    # User profile
matrix:roomid/!abc:example.com/e/$event123   # Specific message
```

### Sharing Links

Share Matrix content:
- Right-click message → Share → Copy link
- Use matrix.to for universal links

## Admin API Tricks

### Synapse Admin API

Powerful server management (admin only):

```bash
# List all rooms
curl -H "Authorization: Bearer $TOKEN" \
  "https://matrix.example.com/_synapse/admin/v1/rooms"

# Quarantine media
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "https://matrix.example.com/_synapse/admin/v1/media/quarantine/!room:example.com"

# Deactivate user
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -d '{"erase": true}' \
  "https://matrix.example.com/_synapse/admin/v1/deactivate/@user:example.com"
```

### User Management

```bash
# Reset password
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -d '{"new_password": "newpass", "logout_devices": true}' \
  "https://matrix.example.com/_synapse/admin/v1/reset_password/@user:example.com"

# Make admin
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -d '{"admin": true}' \
  "https://matrix.example.com/_synapse/admin/v2/users/@user:example.com"
```

---

*Next: [Self-Hosting Tips](./self-hosting-tips) →*
