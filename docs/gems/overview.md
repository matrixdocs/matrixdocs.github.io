---
sidebar_position: 1
title: Hidden Gems Overview
description: Discover lesser-known Matrix features, power tools, and automation
---

# Hidden Gems

Welcome to the power user section. Transform from a casual Matrix user into a power user with these tools, tips, and techniques.

## What You'll Gain

After reading this section, you'll be able to:

- ⚡ Navigate Matrix at lightning speed with keyboard shortcuts
- 🤖 Automate workflows with bots and integrations
- 🛠️ Use admin tools to manage servers like a pro
- 🔐 Master encryption and security features
- 🎯 Discover clients with unique superpowers

## Quick Start Guide

| Your Goal | Start Here |
|-----------|------------|
| Navigate faster, format better | [Power User Tips](./power-user-tips) |
| Admin tools, CLI utilities | [Power Tools](./power-tools) |
| Bots, webhooks, CI/CD | [Automation](./automation) |
| Try unique clients | [Lesser-Known Clients](./lesser-known-clients) |
| Server optimization | [Self-Hosting Tips](./self-hosting-tips) |

---

## Power Tools Preview

### For Server Admins

| Tool | What It Does |
|------|--------------|
| **[synadm](https://github.com/JOJ0/synadm)** | CLI Swiss Army knife for Synapse |
| **[synapse-admin](https://github.com/Awesome-Technologies/synapse-admin)** | Web-based admin UI |
| **[Draupnir](https://github.com/the-draupnir-project/Draupnir)** | Next-gen moderation (Mjolnir successor) |

### For Automation

| Tool | What It Does |
|------|--------------|
| **[Maubot](https://mau.bot)** | Plugin-based bot system |
| **[Hookshot](https://github.com/matrix-org/matrix-hookshot)** | GitHub, GitLab, JIRA, RSS integration |
| **[matrix-commander](https://github.com/8go/matrix-commander)** | Scripting and CLI messaging |
| **[gomuks](https://github.com/gomuks/gomuks)** | Terminal client with web frontend |

---

## Essential Shortcuts

### Element Web (Must Know)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | **Quick room switch** |
| `↑` (empty input) | Edit last message |
| `Ctrl/Cmd + Shift + U` | Upload file |
| `Ctrl/Cmd + /` | Show all shortcuts |

### Slash Commands

```
/me action       - Emote
/topic text      - Set room topic
/invite @user    - Invite user
/op @user 50     - Set power level
/devtools        - Developer tools
/shrug           - ¯\_(ツ)_/¯
```

---

## 2025/2026 New Features

### Threads
Organize long conversations into threaded replies. Available in Element X, FluffyChat, Cinny.

### Polls
Create interactive polls in rooms. Native support in most clients.

### Sticky Events (MSC4354)
Temporary per-user state for live location, call status, and more.

### Element X
Next-gen mobile with Sliding Sync for instant startup and fast sync.

### Verification Required (April 2026)
Element will require verified devices for E2EE messages.

---

## Labs Features Worth Enabling

In **Element → Settings → Labs**:

| Feature | Why Enable |
|---------|------------|
| Threads | Organize discussions |
| Video rooms | Persistent video spaces |
| Rich text editor | Better formatting |
| Pinned messages | Highlight important content |

---

## Client Superpowers

### SchildiChat
- Mark as unread (other clients don't have this!)
- URL previews in encrypted rooms
- Don't auto-mark as read
- Swipe between spaces

### FluffyChat
- Voice messages
- Location sharing
- Material You design
- Polls and threads

### Cinny
- Custom CSS theming
- Vim-style navigation
- Beautiful Discord-like UI

### gomuks
- Terminal-based
- New web frontend
- Power level commands
- Archive room history to JSON

---

## Quick Automation Ideas

### Send Alerts from Scripts
```bash
matrix-commander -m "🚨 Server alert!" -r '!alerts:server'
```

### Subscribe to RSS Feeds
```
!hookshot feed https://blog.example.com/rss
```

### Get GitHub Notifications
```
!hookshot github repo owner/repo
```

### Schedule Reminders
```
!remind me tomorrow at 9am standup meeting
```

---

## Explore the Guides

1. **[Power User Tips](./power-user-tips)** - Keyboard shortcuts, formatting, navigation
2. **[Power Tools](./power-tools)** - synadm, Draupnir, Maubot, gomuks
3. **[Automation](./automation)** - Webhooks, CI/CD, scheduled messages
4. **[Lesser-Known Clients](./lesser-known-clients)** - Cinny, FluffyChat, Nheko, SchildiChat
5. **[Advanced Features](./advanced-features)** - Widgets, integrations, deep dives
6. **[Self-Hosting Tips](./self-hosting-tips)** - Performance, monitoring, optimization

---

*Install the tools. Learn the shortcuts. Automate the boring stuff. Become a Matrix power user.*
