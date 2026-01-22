---
sidebar_position: 2
title: Power User Tips
description: Productivity tips and tricks for Matrix power users
---

# Power User Tips

Level up your Matrix experience with these expert tips.

## Element Mastery

### Quick Room Navigation

**Fuzzy search rooms** with `Ctrl/Cmd + K`:
- Type partial room names
- Use `@` prefix to search people
- Use `#` prefix to search public rooms

### Message Editing Tricks

- `↑` in empty input → Edit last message
- `Ctrl/Cmd + ↑` → Quick edit
- Multi-line edits supported

### Hidden Formatting

```markdown
||spoiler text||     → Spoiler (some clients)
<sub>subscript</sub> → Small text (HTML)
<sup>superscript</sup>
<details>
<summary>Click me</summary>
Hidden content
</details>
```

### Read State Management

- **Mark all read**: Right-click room → Mark as read
- **Mark unread**: Right-click → Mark as unread
- **Favorite rooms**: Star important rooms for quick access

## Advanced Room Management

### Room Directory Tricks

Find hidden gems in the room directory:
```
#:matrix.org          → All public rooms
#*:matrix.org         → Wildcard search
#gaming:*             → Gaming rooms anywhere
```

### Power Level Hacks

Custom power levels for fine-grained control:

```json
{
  "users_default": 0,
  "events": {
    "m.room.name": 25,        // Trusted users can rename
    "m.room.message": 0,      // Everyone can message
    "m.room.redaction": 10    // Slightly trusted can redact
  },
  "users": {
    "@vip:example.com": 25
  }
}
```

### Room-Specific Profiles

Different display name per room:
```
/roomnick "Work Me"
/myroomavatar mxc://...
```

## Security Power Moves

### Verify Everyone at Once

In a room with many users:
1. **Room Members** → **View all**
2. Sort by verification status
3. Bulk verify trusted users

### Key Backup Management

```
Settings → Security → Secure Backup
├── View recovery key (save it!)
├── Reset backup (if compromised)
└── Cross-signing status
```

### Session Management

Regular session hygiene:
1. **Settings → Security → Sessions**
2. Review all devices
3. Remove old/unknown sessions
4. Verify new sessions immediately

## Notification Mastery

### Per-Room Settings

Each room can have custom notification settings:
- **All messages**
- **Mentions only**
- **Mute** (silent)

### Keyword Notifications

Get notified for specific words:
1. **Settings → Notifications → Keywords**
2. Add important terms
3. Works across all rooms

### Notification Schedule

Some clients support quiet hours - check settings.

## Performance Optimization

### Element Performance

When Element gets slow:
1. **Settings → Help & About → Clear cache**
2. Leave inactive rooms
3. Disable URL previews in busy rooms

### Room List Management

- **Favorite** important rooms
- **Low priority** for noisy rooms
- **Leave** rooms you don't use

## Developer Tools

### Access Developer Tools

In Element: `Settings → Help → Developer Tools`

Or use `/devtools` command.

### Explore Room State

View raw room state:
```
/devtools
├── Explore Room State
├── Send Custom Event
├── View Source (for events)
└── Explore Account Data
```

### Send Custom Events

For testing or special use cases:
```json
{
  "type": "custom.event.type",
  "content": {
    "anything": "you want"
  }
}
```

## API Access

### Get Your Access Token

```
Settings → Help & About → Access Token (click to reveal)
```

### Quick API Calls

```bash
# Get your profile
curl -H "Authorization: Bearer $TOKEN" \
  "https://matrix.example.com/_matrix/client/v3/profile/@you:example.com"

# Send a message
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"msgtype":"m.text","body":"Hello from API!"}' \
  "https://matrix.example.com/_matrix/client/v3/rooms/!room:example.com/send/m.room.message/$(date +%s)"
```

## Automation Ideas

### Webhook to Matrix

Use [matrix-hookshot](https://github.com/matrix-org/matrix-hookshot) or simple bots:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"Deploy completed!"}' \
  "https://matrix.example.com/_matrix/client/v3/rooms/!room/send/m.room.message?access_token=$TOKEN"
```

### Matrix in Scripts

```python
import requests

def send_matrix_message(room, message):
    requests.put(
        f"{HOMESERVER}/_matrix/client/v3/rooms/{room}/send/m.room.message/{txn_id}",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json={"msgtype": "m.text", "body": message}
    )
```

## Community Secrets

### Useful Public Rooms

```
#matrix:matrix.org          - Official Matrix chat
#matrix-dev:matrix.org      - Developer discussions
#synapse:matrix.org         - Synapse homeserver
#element-web:matrix.org     - Element Web chat
#twim:matrix.org           - This Week In Matrix
```

### Finding Niche Communities

1. Browse [matrixrooms.info](https://matrixrooms.info)
2. Search on [matrix-search.com](https://matrix-search.com)
3. Ask in #matrix:matrix.org

---

*Next: [Lesser-Known Clients](/gems/lesser-known-clients) →*
