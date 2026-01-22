---
sidebar_position: 2
title: Power Tools
description: Essential tools that unlock Matrix superpowers
---

# Power Tools

These tools transform your Matrix experience from basic chat to a powerful communication platform.

## Admin & Server Tools

### synadm - CLI Admin Swiss Army Knife

**[synadm](https://github.com/JOJ0/synadm)** is a command-line admin tool for Synapse that makes server administration effortless.

**Installation:**
```bash
pipx install synadm
```

**Power Features:**
```bash
# User management
synadm user list                    # List all users
synadm user details @user:server    # Get user info
synadm user modify @user:server --admin  # Grant admin

# Get access token to act as user (24h expiry)
synadm user login @user:server

# Shadow-ban problematic users (they won't know)
synadm user shadow-ban @spammer:server

# Room management
synadm room list                    # List all rooms
synadm room details !roomid:server  # Room info
synadm room delete !roomid:server   # Purge room

# Media management
synadm media list @user:server      # User's media
synadm media purge-remote 30        # Purge remote media older than 30 days
```

**Why It's Powerful:** Direct API access without web interfaces. Script server maintenance, automate cleanups, manage users in bulk.

### Synapse Admin UI

**[synapse-admin](https://github.com/Awesome-Technologies/synapse-admin)** provides a web-based admin interface.

**Features:**
- User management with search and bulk operations
- Room administration and purging
- Media management
- Registration token creation
- Server statistics

**Quick Deploy:**
```yaml
# docker-compose.yml
synapse-admin:
  image: ghcr.io/awesome-technologies/synapse-admin:latest
  ports:
    - "8080:80"
```

---

## Moderation Tools

### Draupnir - Next-Gen Moderation

**[Draupnir](https://github.com/the-draupnir-project/Draupnir)** is the modern successor to Mjolnir with significant improvements.

**Why Upgrade from Mjolnir:**
- **No commands needed** - Ban a user in any protected room, Draupnir prompts to add to policy list
- **Instant response** - No waiting for homeserver data before applying bans
- **Room state caching** - Fast startup even on slow connections
- **Active development** - v2.3.0 (May 2025) added major features

**New in v2.3.0:**
```
✓ Takedowns - Stronger than bans for illegal content
✓ Auto-suspension - Automatically suspend matching users
✓ Block invitations - Preemptively block bad actors
✓ synapse-http-antispam support
```

**Quick Setup:**
```bash
# Create control room (private, unencrypted)
# Invite @draupnir:yourserver.com
# Run initial setup
!draupnir list create my-coc code-of-conduct-ban-list
```

**Distributed Moderation:**
Subscribe to community-curated ban lists:
```
!draupnir watch #matrix-org-coc-bl:matrix.org
```

**Support:** [#draupnir:matrix.org](https://matrix.to/#/#draupnir:matrix.org)

---

## Automation & Bots

### Maubot - Plugin-Based Bot System

**[Maubot](https://mau.bot)** lets you run multiple bot functions from a single instance.

**Must-Have Plugins:**

| Plugin | Function | Power Level |
|--------|----------|-------------|
| **[reminder](https://github.com/maubot/reminder)** | Reminders, recurring events, agendas | ⭐⭐⭐ |
| **[github](https://github.com/maubot/github)** | GitHub webhooks + commands | ⭐⭐⭐ |
| **[rss](https://github.com/maubot/rss)** | RSS/Atom feed subscriptions | ⭐⭐⭐ |
| **[ntfy](https://github.com/maubot/ntfy)** | Push notifications via ntfy | ⭐⭐⭐ |
| **[translate](https://github.com/maubot/translate)** | Google Translate integration | ⭐⭐ |
| **[supportportal](https://github.com/coffeebank/coffee-maubot)** | Support ticket system | ⭐⭐⭐ |
| **[gladia](https://github.com/maubot/gladia)** | Voice message transcription | ⭐⭐ |

**AI Integration:**
```
# LLM plugin supports:
- OpenAI (GPT-4, etc.)
- Anthropic (Claude)
- Text-to-speech
- Speech-to-text
- Image generation
```

**Space Admin Plugin:**
Manage entire Matrix Spaces with user management, room creation tools, and bulk operations.

**Setup Guide:** [coffeebank.github.io/coffee-maubot](https://coffeebank.github.io/coffee-maubot/start/)

### Hookshot - Developer Integrations

**[Hookshot](https://github.com/matrix-org/matrix-hookshot)** connects Matrix to development tools.

**Supported Services:**
- GitHub (issues, PRs, commits, actions)
- GitLab (issues, MRs, pipelines)
- JIRA (issues, transitions)
- RSS/Atom feeds
- Generic webhooks
- **NEW:** OpenProject support

**RSS Feeds:**
```
!hookshot feed https://blog.example.com/rss
```

**GitHub Integration:**
```
!github create issue "Bug: Login fails" --repo owner/repo
!github assign #123 @developer
```

**Webhook Templates:**
Write custom JavaScript templates for rich message formatting.

**2025 Updates:**
- E2E encryption now stable in production
- Secure JIRA Cloud webhooks (breaking change)
- Node 24 support

---

## Terminal & CLI Tools

### gomuks - Terminal Matrix Client

**[gomuks](https://github.com/gomuks/gomuks)** is a powerful terminal Matrix client.

**Features:**
- Full E2EE support with verification
- Media upload and inline links
- Power level management (`/powerlevel`)
- Graphical file picker (requires zenity)
- Light and dark terminal themes

**New Architecture (2025):**
- Backend + separate frontends (terminal, web)
- WebSocket RPC API for custom clients
- **archivemuks** - Export room history to JSON

**Installation:**
```bash
# Go install
go install maunium.net/go/gomuks@latest

# Or download binary from releases
```

**Key Commands:**
```
/join #room:server     - Join room
/powerlevel @user 50   - Set power level
/upload                - Upload file (opens picker)
/copy                  - Copy message content
/toggle inlineurls     - Enable clickable links
```

### matrix-commander - Scripting CLI

**[matrix-commander](https://github.com/8go/matrix-commander)** is perfect for scripting and automation.

**Use Cases:**
```bash
# Send message from script
matrix-commander -m "Build complete!" -r '!roomid:server'

# Send file
matrix-commander --file ./report.pdf -r '!roomid:server'

# Monitor room (receive messages)
matrix-commander --listen forever --room '!roomid:server'

# Cron job notifications
0 9 * * * matrix-commander -m "Daily report ready"
```

---

## Client Power Features

### Element Web Shortcuts

Press `Ctrl/Cmd + /` to see all shortcuts. Key ones:

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Jump to room (quick switcher) |
| `Ctrl + Shift + U` | Upload file |
| `Shift + Page Up` | Jump to last unread |
| `Ctrl + D` | Mute mic (in call) |
| `Ctrl + E` | Mute camera (in call) |
| `↑` | Edit last message |

### Slash Commands

```
/me <action>          - Emote action
/shrug                - Append ¯\_(ツ)_/¯
/tableflip            - Append (╯°□°)╯︵ ┻━┻
/lenny                - Append ( ͡° ͜ʖ ͡°)

/invite @user:server  - Invite user
/kick @user           - Kick user
/ban @user            - Ban user
/op @user 50          - Set power level

/topic New topic      - Change room topic
/nick New Name        - Change display name
/myroomavatar url     - Set room-specific avatar

/markdown on|off      - Toggle markdown
/devtools             - Open developer tools
```

### SchildiChat Exclusive Features

**[SchildiChat](https://schildi.chat/)** adds features Element lacks:

- **Mark as unread** - MSC2867 support
- **Unread count for muted chats** - Different color display
- **URL previews in E2EE** - Optional setting
- **Open at first unread** - Jump to unread on room open
- **Swipe between spaces** - Gesture navigation
- **Don't auto-mark as read** - Privacy feature
- **Power level colors** - Visual user hierarchy

### FluffyChat Unique Features

**[FluffyChat](https://fluffychat.im/)** offers:

- **Voice messages** - Record and send audio
- **Location sharing** - Send your position
- **Material You design** - Modern Android styling
- **Custom emotes/stickers** - Full pack support
- **Polls and threads** - Full support since v2.3.0
- **Text reactions** - Long press → /react command

---

## Performance Power-Ups

### Sliding Sync

Enable for instant app launch and sync:

```yaml
# homeserver.yaml (Synapse 1.90+)
experimental_features:
  msc3575_enabled: true
```

**Benefits:**
- Instant login (no initial sync wait)
- Fast room switching
- Efficient on mobile data
- Required for Element X

### Local DNS Caching

Synapse makes many DNS queries. Speed up with local caching:

```bash
# Install dnsmasq
sudo apt install dnsmasq

# /etc/dnsmasq.conf
cache-size=10000
```

### PostgreSQL Tuning

```ini
# postgresql.conf for Matrix
shared_buffers = 256MB
effective_cache_size = 768MB
work_mem = 16MB
maintenance_work_mem = 128MB
random_page_cost = 1.1
effective_io_concurrency = 200
```

### Prometheus + Grafana Monitoring

```yaml
# homeserver.yaml
enable_metrics: true
```

Import the [Synapse Grafana dashboard](https://github.com/matrix-org/synapse/tree/develop/contrib/grafana) for real-time insights.

---

## Quick Reference

| Need | Tool |
|------|------|
| CLI server admin | synadm |
| Web server admin | synapse-admin |
| Moderation | Draupnir |
| Automation bots | Maubot |
| Developer webhooks | Hookshot |
| Terminal client | gomuks |
| Scripting | matrix-commander |
| Classic IM feel | SchildiChat |
| Mobile-friendly | FluffyChat |
| Next-gen mobile | Element X |

---

*Install these tools and unlock your Matrix superpowers!*
