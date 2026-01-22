---
sidebar_position: 1
title: Hidden Gems Overview
description: Discover lesser-known Matrix features and power user tips
---

# Hidden Gems

Welcome to the power user section. Here you'll find lesser-known features, advanced tricks, and the best-kept secrets of the Matrix ecosystem.

## What You'll Find Here

### Power User Tips

Keyboard shortcuts, advanced settings, and productivity hacks that most users don't know about.

### Lesser-Known Clients

Discover niche clients with unique features that might be perfect for your workflow.

### Advanced Features

Deep dives into features that go beyond the basics - custom widgets, integrations, and automation.

### Self-Hosting Tips

Optimization tricks, monitoring setups, and configuration gems for homeserver admins.

## Quick Gems

### Element Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Jump to room (fuzzy search) |
| `Ctrl/Cmd + Shift + U` | Upload file |
| `Ctrl/Cmd + Shift + E` | Toggle emoji picker |
| `Alt + ↑/↓` | Jump between unread rooms |
| `↑` (in empty input) | Edit last message |

### Secret Room Settings

Some powerful room settings are hidden in advanced options:

1. **Room Settings → Advanced**
2. **Show** → Internal room ID, state events
3. **Developer tools** → View/edit raw events

### Matrix URI Scheme

Deep link directly to rooms, users, and events:

```
matrix:r/room:example.com          # Room
matrix:u/user:example.com          # User
matrix:roomid/!abc:example.com/e/$event  # Specific event
```

### Command Line in Element

Type `/` to see available commands:

```
/me         - Send emote
/nick       - Change display name
/roomnick   - Room-specific nick
/myroomavatar - Room-specific avatar
/devtools   - Open developer tools
/query      - Start DM with user
/invite     - Invite user to room
/topic      - Set room topic
/roomname   - Set room name
```

### Labs Features to Enable

In Element, go to **Settings → Labs**:

| Feature | Description |
|---------|-------------|
| **Threads** | Organize conversations |
| **Video rooms** | Persistent video spaces |
| **Rich text editor** | Better formatting |
| **Voice broadcast** | One-to-many voice |
| **Pinned messages** | Pin important content |

## Hidden Features in Clients

### Cinny

- **Custom CSS**: Settings → Appearance → Custom CSS
- **Keyboard navigation**: Full vim-style navigation
- **Room search**: `Ctrl+K` with fuzzy matching

### FluffyChat

- **Stories**: Share ephemeral content
- **Multiple accounts**: Switch between accounts
- **Offline mode**: Read messages without internet

### Nheko

- **Image previews in terminal**: Works in Kitty/iTerm2
- **System tray**: Minimize to tray
- **Video calls**: Native WebRTC support

## Explore More

- [Power User Tips](./power-user-tips) - Productivity secrets
- [Lesser-Known Clients](./lesser-known-clients) - Hidden client gems
- [Advanced Features](./advanced-features) - Deep feature dives
- [Self-Hosting Tips](./self-hosting-tips) - Admin tricks

---

*"The best features are the ones you discover yourself."*
