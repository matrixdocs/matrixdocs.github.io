---
sidebar_position: 2
title: Element
description: Master the flagship Matrix client
---

# Element

Element is the flagship Matrix client, offering the most complete feature set and serving as the reference implementation for the protocol.

## Installation

### Web

Just visit [app.element.io](https://app.element.io) - no installation needed.

### Desktop

Download from [element.io/download](https://element.io/download):

```bash
# Linux (Flatpak)
flatpak install flathub im.riot.Riot

# Linux (Debian/Ubuntu)
sudo apt install element-desktop

# macOS (Homebrew)
brew install --cask element

# Windows (winget)
winget install Element.Element
```

### Mobile

- **Android**: [Google Play](https://play.google.com/store/apps/details?id=im.vector.app) | [F-Droid](https://f-droid.org/packages/im.vector.app/)
- **iOS**: [App Store](https://apps.apple.com/app/element-messenger/id1083446067)

## Essential Settings

### Enable Labs Features

Unlock experimental features for power users:

1. **Settings** → **Labs**
2. Enable features like:
   - Threads (if not default)
   - Voice broadcast
   - Rich text editor
   - Video rooms

:::warning
Labs features may be unstable. Enable at your own risk.
:::

### Customize Appearance

**Settings → Appearance**:

| Setting | Recommendation |
|---------|---------------|
| Theme | Match system / Dark |
| Message layout | Modern for features, IRC for density |
| Show avatars | Personal preference |
| Big emoji | Enable for fun |

### Optimize Performance

**Settings → Preferences**:

- **Enable hardware acceleration** - Better performance
- **Reduce animations** - Faster feel
- **Show read receipts** - Disable if slow

## Keyboard Shortcuts

Master these for efficiency:

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick room switcher |
| `Ctrl/Cmd + ↑/↓` | Navigate rooms |
| `Alt + ↑/↓` | Navigate unread rooms |
| `Ctrl/Cmd + ,` | Settings |

### Messaging

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `↑` | Edit last message |
| `Ctrl/Cmd + E` | Toggle emoji picker |
| `Tab` | Autocomplete @mention |

### Actions

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + U` | Upload file |
| `Ctrl/Cmd + /` | Show all shortcuts |
| `Escape` | Close dialog/exit edit |

## Advanced Features

### Threads

Organize conversations within rooms:

1. Hover over a message
2. Click the **Thread** icon
3. Start a threaded discussion

:::tip
Use threads in busy rooms to keep discussions focused without cluttering the main timeline.
:::

### Spaces

Create hierarchical community structures:

1. Click **+** next to Spaces
2. **Create a Space**
3. Add rooms and sub-spaces
4. Invite members

**Space Hierarchy Example:**
```
🏢 My Organization
├── 📋 General
├── 💻 Engineering
│   ├── #frontend
│   ├── #backend
│   └── #devops
└── 🎉 Social
    ├── #random
    └── #gaming
```

### Voice & Video

Start calls directly in rooms:

- **1:1 calls**: Click video/phone icon in DM
- **Group calls**: Start Jitsi widget or native call
- **Video rooms**: Persistent call rooms (Labs feature)

### Widgets

Add interactive elements to rooms:

1. Click **Room Info** (i) → **Add widgets**
2. Choose from:
   - **Jitsi** - Video conferencing
   - **Etherpad** - Collaborative notes
   - **YouTube** - Watch together
   - **Custom** - Any URL

### Message Formatting

Element supports rich text:

```markdown
**bold**           → bold
*italic*           → italic
~~strikethrough~~  → strikethrough
`code`             → inline code
> quote            → blockquote
```

Code blocks with syntax highlighting:
````
```javascript
const hello = "world";
```
````

## Security Best Practices

### Cross-Signing Setup

1. **Settings → Security & Privacy**
2. Complete **"Set up Secure Backup"**
3. Save your recovery key securely

### Device Verification

Verify all your devices:

1. Log in on new device
2. Verify from existing device (emoji/QR)
3. All verified devices are trusted

### Session Management

Regularly review active sessions:

1. **Settings → Security & Privacy**
2. **Where you're signed in**
3. Remove unrecognized devices

## Integrations

### Bots & Bridges

Integrate external services:

1. **Room Settings → Integrations**
2. Add bots like:
   - **Hookshot** - GitHub, GitLab, JIRA
   - **RSS Bot** - Feed notifications
   - **Reminder Bot** - Scheduled messages

### Custom Integrations Manager

For self-hosted setups:

```
Settings → General → Integration Manager
```

Change to your own Dimension or other integration manager.

## Troubleshooting

### Sync Issues

**"Unable to decrypt" errors:**
1. Check if key backup is set up
2. Request keys from other sessions
3. Verify your devices

**Slow sync:**
1. Leave unused rooms
2. Clear cache: Settings → Help → Clear cache
3. Try a different homeserver

### Performance Problems

**High memory usage:**
1. Close Element and restart
2. Disable some Labs features
3. Use Element Web instead of Desktop

**Slow room loading:**
1. Room may be very large
2. Consider using a native client
3. Report to Element team

### Login Issues

**Can't log in:**
1. Verify server URL
2. Check username format (@user:server)
3. Reset password if needed

---

*Next: [Alternative Clients](./alternatives) →*
