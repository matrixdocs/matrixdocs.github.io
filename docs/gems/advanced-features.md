---
sidebar_position: 4
title: Advanced Features
description: Deep dives into Matrix's advanced capabilities
---

# Advanced Features

Explore Matrix's powerful features that go beyond basic messaging.

## Widgets & Integration Managers

### What Are Widgets?

Widgets embed interactive content in rooms:
- Video conferencing (Jitsi, Element Call)
- Collaborative documents (Etherpad, HedgeDoc)
- Polls and surveys
- Custom web apps
- Dashboards and monitoring

### Dimension Integration Manager

**[Dimension](https://github.com/turt2live/matrix-dimension)** is a self-hosted integration manager providing:

- **Widget catalog** - Browse and add widgets easily
- **Bridge management** - Configure IRC, Telegram, Slack bridges
- **Bot directory** - Add bots to rooms
- **Sticker packs** - Manage custom stickers

**Installation:**
```yaml title="docker-compose.yml"
services:
  dimension:
    image: turt2live/matrix-dimension
    ports:
      - "8184:8184"
    volumes:
      - ./dimension-data:/data
    environment:
      - DIMENSION_DB_PATH=/data/dimension.db
```

**Configuration in Element:**
```json
{
  "integrations_ui_url": "https://dimension.yourserver.com/element",
  "integrations_rest_url": "https://dimension.yourserver.com/api/v1/scalar"
}
```

### Adding Widgets

In Element:
1. Room info (i) → Widgets
2. Add from list or custom URL

With Dimension:
1. Room settings → Integrations
2. Browse widget catalog
3. One-click add

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

### Widget API Capabilities

| Capability | Description |
|------------|-------------|
| `m.always_on_screen` | Keep widget visible during calls |
| `m.capability.screenshot` | Capture widget content |
| `org.matrix.msc2931.navigate` | Navigate to Matrix URIs |
| `org.matrix.msc2762.timeline` | Read room messages |
| `org.matrix.msc2762.send.event` | Send messages |

### Popular Widget Types

| Widget | Purpose | URL |
|--------|---------|-----|
| **Jitsi** | Video calls | Built into Element |
| **Element Call** | Native Matrix calls | call.element.io |
| **Etherpad** | Collaborative notes | Any Etherpad instance |
| **HedgeDoc** | Markdown docs | Self-hosted |
| **YouTube** | Video player | Custom widget |
| **Polls** | Native in clients | Built-in |

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

## Voice & Video Calls

### Element Call

**[Element Call](https://call.element.io)** is the native Matrix voice/video solution:

- **End-to-end encrypted** - True E2EE group calls
- **No Jitsi needed** - Pure Matrix protocol
- **SFU support** - Scales to large calls via LiveKit
- **Screen sharing** - Present to groups
- **Standalone or embedded** - Works as widget or app

**Standalone URL:** [call.element.io](https://call.element.io)

**Add to room:**
```
/addwidget https://call.element.io/room/#/your-room
```

**Self-hosted Element Call:**
```yaml title="docker-compose.yml"
services:
  element-call:
    image: vectorim/element-call
    ports:
      - "8080:80"
    environment:
      - VITE_DEFAULT_HOMESERVER=https://matrix.yourserver.com
```

### Voice Rooms

Voice rooms are persistent call rooms:

1. Enable in Labs (Element)
2. Create room with voice room type
3. Users can drop in/out anytime
4. Shows active participants

### Jitsi Integration

For group calls (alternative to Element Call):
1. Add Jitsi widget
2. Configure Jitsi server
3. Start meeting from widget

**Self-hosted Jitsi:**
```yaml title="docker-compose.yml"
services:
  jitsi-web:
    image: jitsi/web:latest
    environment:
      - ENABLE_AUTH=0
      - ENABLE_GUESTS=1
    ports:
      - "8443:443"

  jitsi-prosody:
    image: jitsi/prosody:latest

  jitsi-jicofo:
    image: jitsi/jicofo:latest

  jitsi-jvb:
    image: jitsi/jvb:latest
    ports:
      - "10000:10000/udp"
```

### Comparison: Element Call vs Jitsi

| Feature | Element Call | Jitsi |
|---------|--------------|-------|
| E2EE | ✅ Native | ❌ Not with E2EE rooms |
| Matrix native | ✅ | Widget only |
| Large calls | Via LiveKit SFU | Built-in |
| Self-hosting | Simple | Complex |
| Recommended | **Yes** | Legacy option |

## Custom Emojis & Stickers

### Stickerpicker

**[Stickerpicker](https://github.com/maunium/stickerpicker)** is the best way to manage custom stickers:

**Features:**
- Web interface for managing sticker packs
- Import from Telegram, Signal
- Multiple pack support
- Works with Element, SchildiChat, FluffyChat

**Setup:**
```bash
# Clone and configure
git clone https://github.com/maunium/stickerpicker.git
cd stickerpicker

# Edit config
cp config.example.json config.json
# Set your homeserver URL and credentials
```

**Import Telegram stickers:**
```bash
python3 sticker/import.py --telegram tg://addstickers?set=YourPackName
```

**Configure in Element:**
```json
{
  "setting_defaults": {
    "widgetOpenIDPermissions": {
      "allow": ["https://stickers.yourserver.com"]
    }
  },
  "integrations_widgets_urls": [
    "https://stickers.yourserver.com/web/"
  ]
}
```

### Room Emoji Packs

Add custom emojis to specific rooms:

```json
{
  "type": "im.ponies.room_emotes",
  "content": {
    "images": {
      "custom_laugh": {
        "url": "mxc://example.com/abc123"
      },
      "company_logo": {
        "url": "mxc://example.com/def456"
      }
    }
  }
}
```

### User Emoji Packs

Personal emojis available everywhere:

```json
{
  "type": "im.ponies.user_emotes",
  "content": {
    "images": {
      "myface": {
        "url": "mxc://example.com/xyz789"
      }
    }
  }
}
```

### Emoji Pack MSCs

| MSC | Feature |
|-----|---------|
| MSC2545 | Basic emoji packs |
| MSC3892 | Animated stickers |
| MSC3951 | Sticker events |

### Client Support

| Client | Custom Emojis | Stickers |
|--------|---------------|----------|
| Element | Via stickerpicker | ✅ |
| FluffyChat | ✅ Native | ✅ |
| Cinny | ✅ Native | ✅ |
| SchildiChat | Via stickerpicker | ✅ |
| Nheko | ✅ Native | ✅ |

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

## Room Versions & State Resolution

### Understanding Room Versions

Room versions define how events are processed and state is resolved:

| Version | Status | Features |
|---------|--------|----------|
| v1-v5 | Legacy | Avoid for new rooms |
| v6 | Stable | Fixed integer parsing |
| v9 | Stable | Restricted joins |
| v10 | Current | Stricter validation |
| v11 | Latest | Knock + restricted joins |

### Checking Room Version

In Element: Room Settings → Advanced → Room version

### Upgrading Rooms

```
/upgraderoom <version>
```

**Important:**
- Creates new room with same state
- Old room becomes tombstoned
- Users must re-join
- History preserved via links

### State Resolution v2

Matrix uses state resolution to handle conflicting events (e.g., network splits):

1. **Auth chain** - Events must be authorized
2. **Power level comparison** - Higher power wins ties
3. **Event ordering** - Lexicographic ordering for final ties

### Common Issues

**Split-brain scenarios:**
- Two admins demote each other simultaneously
- Resolution picks winner by event ordering
- Check room state if permissions seem wrong

### Room Discovery

**[MatrixRooms.info](https://matrixrooms.info)** - External room directory:
- Browse 50,000+ public rooms
- Filter by language, topic, size
- See member counts and activity
- Find communities without joining

**matrix.to links:**
```
https://matrix.to/#/#room:server.com
https://matrix.to/#/@user:server.com
https://matrix.to/#/!roomid:server/$eventid
```

---

*Next: [Self-Hosting Tips](./self-hosting-tips) →*
