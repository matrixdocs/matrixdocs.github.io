---
sidebar_position: 1
title: Power User Tips
description: Become a Matrix power user with these essential tips
---

# Power User Tips

Level up your Matrix skills with these power user techniques.

## Message Mastery

### Markdown Formatting

```markdown
**bold** or __bold__
*italic* or _italic_
~~strikethrough~~
`inline code`
```code block```
> quote
[link](https://url)
```

### Advanced Markdown

```markdown
# Heading 1
## Heading 2
### Heading 3

- Bullet list
- Another item
  - Nested item

1. Numbered list
2. Second item

| Header | Header |
|--------|--------|
| Cell   | Cell   |

---
Horizontal rule
```

### HTML Formatting

Some clients support inline HTML:
```html
<sub>subscript</sub>
<sup>superscript</sup>
<details>
<summary>Click to expand</summary>
Hidden content here
</details>
```

### LaTeX Math (Element)

```latex
$$E = mc^2$$
$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$
```

### Quick Emotes

| Type | Shows |
|------|-------|
| `/shrug` | ¯\\\_(ツ)\_/¯ |
| `/tableflip` | (╯°□°)╯︵ ┻━┻ |
| `/unflip` | ┬─┬ノ( º _ ºノ) |
| `/lenny` | ( ͡° ͜ʖ ͡°) |
| `/me action` | *YourName action* |

---

## Navigation Shortcuts

### Element Web Essentials

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | **Quick room switcher** (most useful!) |
| `Ctrl/Cmd + Shift + U` | Upload file |
| `Ctrl/Cmd + /` | Show all shortcuts |
| `Shift + Page Up` | Jump to last unread |
| `↑` (in empty composer) | Edit last message |
| `Esc` | Close dialogs/panels |

### Fuzzy Search Prefixes

In the quick room switcher (`Ctrl+K`):
```
@user     → Search people
#room     → Search public rooms
typing    → Fuzzy match room names
```

### Room Navigation

- **Click room name** → Room settings
- **Click member count** → Member list
- **Right-click room** → Quick actions menu

### Message Actions

- **Hover message** → Reaction bar appears
- **Three dots (⋯)** → Full action menu
- **Reply arrow** → Thread reply
- **Right-click** → Context menu

---

## Room Power Moves

### Quick Room Commands

```
/invite @user:server.com    # Invite user
/kick @user reason          # Kick with reason
/ban @user spam             # Ban with reason
/unban @user:server.com     # Unban user

/topic New room topic       # Change topic
/roomname New Name          # Change room name
/nick My Nickname           # Change your display name (room-specific)
/myroomavatar mxc://...     # Room-specific avatar
```

### Power Levels Explained

| Level | Default Role | Abilities |
|-------|--------------|-----------|
| 0 | Default | Send messages |
| 50 | Moderator | Kick, ban, redact others' messages |
| 100 | Admin | Everything, including changing power levels |

**Custom power levels via room settings:**
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

**Quick power level commands:**
```
/op @user:server 75    # Give power level 75
/deop @user:server     # Remove elevated power
```

### Room-Specific Profiles

Different identity per room:
```
/nick "Work Me"
/myroomavatar mxc://server/media-id
```

---

## Spaces Organization

### Space Hierarchy

```
🏢 My Company
├── 📢 Announcements (suggested)
├── 💬 General
├── 🛠️ Engineering
│   ├── Frontend
│   ├── Backend
│   └── DevOps
└── 🎉 Social
    ├── Random
    └── Games
```

### Space Tips

- **Suggested rooms** - Admin-marked as important
- **Nested spaces** - Spaces can contain spaces
- **Multi-homing** - Rooms can exist in multiple spaces
- **Personal spaces** - Organize rooms just for yourself
- **Space-level moderation** - Ban lists apply to all child rooms

### Quick Space Actions

- **Drag rooms** between spaces
- **Right-click space** → Add existing room
- **Space settings** → Manage rooms list
- **Leave space** doesn't leave rooms

---

## Encryption Best Practices

### Key Backup

**Always set up secure backup:**
1. Settings → Security → Secure Backup
2. Choose Security Key (recommended)
3. **Save the key offline** (password manager, paper)

### Device Verification

**Verify new devices immediately:**
1. Start verification from either device
2. Compare emoji or scan QR
3. Mark as verified

**Why it matters:**
- Unverified devices show ⚠️
- Some rooms reject unverified devices
- April 2026: Element requires verified devices for E2EE

### Cross-Signing

Enable cross-signing to:
- Automatically trust your own devices
- Show green shields to others
- Simplify verification

### Session Management

Regular session hygiene:
1. **Settings → Security → Sessions**
2. Review all devices
3. Remove old/unknown sessions
4. Verify new sessions immediately

---

## Search & Discovery

### Search Operators

```
from:@username:server    # From specific user
in:!roomid:server        # In specific room
"exact phrase"           # Exact match
before:2025-01-01        # Before date
after:2024-06-01         # After date
```

### Room Directory Tricks

```
#:matrix.org          → All public rooms
#gaming:*             → Gaming rooms across servers
```

### Room Discovery

- **Explore** (compass icon) → Public rooms
- **Server dropdown** → Browse other servers
- **Space directory** → Rooms in a space
- **[matrixrooms.info](https://matrixrooms.info)** → External directory

---

## Notifications Tuning

### Per-Room Settings

| Setting | Effect |
|---------|--------|
| All messages | Everything notifies |
| Mentions & Keywords | Only @mentions and keywords |
| Mute | No notifications, no badge |

### Global Keywords

Settings → Notifications → Keywords:
```
your-name
your-project
urgent
```

### Read State Management

- **Mark all read**: Right-click room → Mark as read
- **Mark unread**: Right-click → Mark as unread (SchildiChat, FluffyChat)
- **Favorite rooms**: Star important rooms for quick access

---

## Performance Optimization

### When Element Gets Slow

1. **Settings → Help & About → Clear cache**
2. Leave inactive rooms
3. Disable URL previews in busy rooms
4. Leave large public rooms (10k+ members)

### Room List Management

- **Favorite** important rooms
- **Low priority** for noisy rooms
- **Leave** rooms you don't use

### Use Element X

Element X uses Sliding Sync for:
- Instant startup
- Fast room switching
- Lower bandwidth

---

## Developer Tools

### Access Developer Tools

In Element: Settings → Help → Developer Tools

Or use `/devtools` command.

### Explore Room State

```
/devtools
├── Explore Room State
├── Send Custom Event
├── View Source (for events)
└── Explore Account Data
```

### Get Your Access Token

```
Settings → Help & About → Access Token (click to reveal)
```

### Quick API Calls

```bash
# Get your profile
curl -H "Authorization: Bearer $TOKEN" \
  "https://matrix.server/_matrix/client/v3/profile/@you:server"

# Send a message
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"msgtype":"m.text","body":"Hello from API!"}' \
  "https://matrix.server/_matrix/client/v3/rooms/!room:server/send/m.room.message/$(date +%s)"
```

---

## Multi-Account Usage

### When to Use Multiple Accounts

| Account | Purpose |
|---------|---------|
| Personal | Friends, hobbies |
| Work | Company Matrix |
| Anonymous | Sensitive topics |
| Bot/Test | Development |

### Account Switching

- **Element**: Profile menu → Add account
- **SchildiChat**: Built-in multi-account
- **FluffyChat**: Native multi-account

---

## Privacy Tricks

### Read Receipts

Disable in Settings → Preferences:
- Others won't see when you read
- You won't see when others read

### Typing Indicators

Disable to not show "typing..."

### Presence

If supported by homeserver:
- Appear offline while online
- Hide "last seen" time

---

## Hidden Features

### URL Schemes

```
matrix:r/room:server           # Open room
matrix:u/user:server           # Open user profile
matrix:roomid/!roomid:server   # Open by room ID
```

### Direct Message Links

Create a DM link: `https://matrix.to/#/@user:server.com`

### Room Links with Event

Link to specific message: `https://matrix.to/#/!roomid:server/$eventid`

---

## Community Secrets

### Useful Public Rooms

```
#matrix:matrix.org          - Official Matrix chat
#matrix-dev:matrix.org      - Developer discussions
#synapse:matrix.org         - Synapse homeserver
#element-web:matrix.org     - Element Web chat
#twim:matrix.org            - This Week In Matrix
```

### Finding Niche Communities

1. Browse [matrixrooms.info](https://matrixrooms.info)
2. Ask in #matrix:matrix.org
3. Explore Space directories

---

## Quick Reference Card

```
┌────────────────────────────────────────────────┐
│              MATRIX POWER USER                 │
├────────────────────────────────────────────────┤
│ Ctrl+K          → Quick room switch           │
│ ↑ (empty input) → Edit last message           │
│ /topic Text     → Change topic                │
│ /invite @user   → Invite user                 │
│ /op @user 50    → Set power level             │
│ /me action      → Emote                       │
│ **bold**        → Bold text                   │
│ `code`          → Inline code                 │
├────────────────────────────────────────────────┤
│ 🔐 Always set up key backup                   │
│ ✅ Verify new devices immediately             │
│ 📱 Use Element X on mobile for speed          │
└────────────────────────────────────────────────┘
```

---

*Next: [Power Tools](./power-tools) →*
