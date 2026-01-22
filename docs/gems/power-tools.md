---
sidebar_position: 2
title: Power Tools
description: Essential tools that unlock Matrix superpowers
---

# Power Tools

These tools transform your Matrix experience from basic chat to a powerful communication platform.

## Admin & Server Tools

### synadm - CLI Admin Swiss Army Knife

**[synadm](https://codeberg.org/synadm/synadm)** is a command-line admin tool for Synapse that makes server administration effortless.

**Note:** synadm has migrated to Codeberg. GitHub repo will be archived.

**Installation:**
```bash
pipx install synadm

# First-time setup
synadm config
# Enter: homeserver URL, admin access token
```

**User Management:**
```bash
# List and search users
synadm user list                      # All users
synadm user list --name "john"        # Search by name
synadm user details @user:server      # Full user info

# Modify users
synadm user modify @user:server --admin       # Grant admin
synadm user modify @user:server --deactivate  # Deactivate
synadm user password @user:server             # Reset password

# Get access token to act as user (24h expiry)
synadm user login @user:server

# Shadow-ban (user won't know they're banned)
synadm user shadow-ban @spammer:server

# Redact all messages from a user (NEW 2025)
synadm user redact @spammer:server --rooms '!room1:server' '!room2:server'
```

**Room Management:**
```bash
# List rooms with filters
synadm room list                      # All rooms
synadm room list --empty              # Empty rooms only (NEW)
synadm room list --not-empty          # Non-empty rooms
synadm room list --name "general"     # Search by name

# Room details and members
synadm room details !roomid:server
synadm room members !roomid:server

# Cleanup
synadm room delete !roomid:server     # Delete room
synadm room purge-empty               # Purge all empty rooms
```

**Media Management:**
```bash
# List media
synadm media list @user:server        # User's uploads
synadm media list-remote              # Cached remote media

# Cleanup
synadm media purge-remote 30          # Purge remote media >30 days
synadm media delete mxc://server/id   # Delete specific media

# Quarantine (NEW)
synadm media quarantine -U mxc://server/media-id
synadm media unquarantine -U mxc://server/media-id
```

**Server Info:**
```bash
synadm version                        # Synapse version
synadm server-notice send @user:server "Important message"
```

**Why It's Powerful:** Direct API access without web interfaces. Script server maintenance, automate cleanups, manage users in bulk. Works over SSH, perfect for headless servers.

**Support:** [#synadm:peek-a-boo.at](https://matrix.to/#/#synadm:peek-a-boo.at)

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

**[Maubot](https://mau.bot)** lets you run multiple bot functions from a single instance. No coding required for most plugins.

**Requirements:** Linux, Python 3.10+, a Matrix account for the bot

**Must-Have Plugins:**

| Plugin | Function | Power Level |
|--------|----------|-------------|
| **[reminder](https://github.com/maubot/reminder)** | Reminders, recurring events, agendas | ⭐⭐⭐ |
| **[github](https://github.com/maubot/github)** | GitHub webhooks + commands | ⭐⭐⭐ |
| **[rss](https://github.com/maubot/rss)** | RSS/Atom feed subscriptions | ⭐⭐⭐ |
| **[ntfy](https://github.com/maubot/ntfy)** | Push notifications via ntfy | ⭐⭐⭐ |
| **[translate](https://github.com/maubot/translate)** | Google/DeepL translation | ⭐⭐ |
| **[supportportal](https://github.com/coffeebank/coffee-maubot)** | Support ticket system | ⭐⭐⭐ |
| **[gladia](https://github.com/maubot/gladia)** | Voice message transcription | ⭐⭐ |
| **[dice](https://github.com/maubot/dice)** | Dice roller + calculator | ⭐⭐ |
| **[media](https://github.com/maubot/media)** | Giphy/Tenor GIF search | ⭐⭐ |
| **[reactbot](https://github.com/maubot/reactbot)** | Auto-reactions & responses | ⭐⭐ |
| **[sed](https://github.com/maubot/sed)** | s/typo/fix/ corrections | ⭐ |

**AI/LLM Plugins:**
```
# LLM plugin capabilities:
- OpenAI (GPT-4, GPT-4o)
- Anthropic (Claude)
- Text-to-speech
- Speech-to-text (Whisper)
- Image generation (DALL-E)
```

**Example commands:**
```
!ai summarize the last 50 messages
!ai explain this error: [paste]
!ai translate to Spanish: Hello world
```

**Admin Plugins:**

| Plugin | Purpose |
|--------|---------|
| **space-admin** | Manage Spaces, bulk user operations |
| **registration-tokens** | Create/manage Synapse registration tokens |
| **thread-redact** | Auto-delete thread replies |
| **welcome** | Welcome messages for new room members |

**Social Media:**
- Reddit/Instagram/YouTube link previews
- Twitch live notifications
- Fediverse feed forwarding
- Spotify link conversion

**Full Plugin List:** [plugins.mau.bot](https://plugins.mau.bot/)

**Setup Guide:** [coffeebank.github.io/coffee-maubot](https://coffeebank.github.io/coffee-maubot/start/)

### Hookshot - Developer Integrations

**[Hookshot](https://github.com/matrix-org/matrix-hookshot)** connects Matrix to development tools.

**Supported Services:**
- GitHub (issues, PRs, commits, actions, workflows)
- GitLab (issues, MRs, pipelines)
- JIRA (issues, transitions)
- RSS/Atom feeds
- Generic webhooks
- **NEW:** OpenProject support

**GitHub Commands (prefix: `!gh`):**
```bash
# Issue management
!gh create "Bug: Login fails"           # Create issue
!gh close 123                            # Close issue
!gh assign 123 @developer               # Assign issue

# Workflows
!gh workflow run deploy.yml             # Trigger workflow
!gh workflow run build.yml --input env=prod

# PRs and commits
!gh prs                                 # List open PRs
!gh pr 456                              # View PR details
!gh commits                             # Recent commits
```

**GitLab Commands (prefix: `!gitlab`):**
```bash
!gitlab issue new "Fix database"        # Create issue
!gitlab issue close 42                  # Close issue
!gitlab mrs list                        # List merge requests
!gitlab pipeline status                 # Check CI status
```

**RSS Feeds:**
```
!hookshot feed https://blog.example.com/rss
```

**Webhook Templates:**
Write custom JavaScript templates for rich message formatting:
```javascript
({
  body: `**${data.event}**: ${data.message}`,
  msgtype: data.level === "error" ? "m.notice" : "m.text"
})
```

**2025 Updates:**
- E2E encryption stable in production
- Secure JIRA Cloud webhooks
- Node 24 support
- Matrix v12 room support
- Follows room upgrades automatically

📖 **[Full Hookshot Guide →](../bots/hookshot)**

---

## Git & CI/CD Integration

### GitHub Actions → Matrix

Send workflow notifications directly from GitHub Actions:

**Matrix Notify Action (Recommended):**
```yaml title=".github/workflows/ci.yml"
notify:
  if: always()
  runs-on: ubuntu-latest
  needs: [build, test, lint]
  steps:
    - uses: Cadair/matrix-notify-action@main
      with:
        matrix_token: ${{ secrets.MATRIX_TOKEN }}
        github_token: ${{ secrets.GITHUB_TOKEN }}
        homeserver: 'https://matrix.org'
        roomid: '!roomId:matrix.org'
        summarise_success: true
```

**Features:**
- Overall workflow status with emoji
- Per-job status reactions
- Configurable job filtering
- Link to workflow run

**Simple Message Action:**
```yaml
- uses: s3krit/matrix-message-action@v1
  with:
    homeserver: matrix.org
    token: ${{ secrets.MATRIX_TOKEN }}
    channel: '!roomId:matrix.org'
    message: "Build ${{ job.status }} on ${{ github.ref_name }}"
```

### GitLab CI → Matrix

```yaml title=".gitlab-ci.yml"
notify_matrix:
  stage: .post
  script:
    - |
      curl -X POST "https://matrix.server/_matrix/client/r0/rooms/$ROOM/send/m.room.message" \
        -H "Authorization: Bearer $MATRIX_TOKEN" \
        -d "{\"msgtype\":\"m.text\",\"body\":\"Pipeline $CI_PIPELINE_STATUS for $CI_PROJECT_NAME\"}"
  when: always
```

### ChatOps Workflow

With Hookshot, manage your entire dev workflow from Matrix:

```
┌─────────────────────────────────────────────────────────┐
│ Developer workflow from Matrix                          │
├─────────────────────────────────────────────────────────┤
│ 1. !gh create "Bug: API timeout"  → Issue #123 created  │
│ 2. !gh assign 123 @alice          → Assigned            │
│ 3. (Alice pushes fix, opens PR)                         │
│ 4. [Hookshot]: PR #456 opened by alice                  │
│ 5. !gh approve 456                → PR approved         │
│ 6. [Hookshot]: PR #456 merged                           │
│ 7. !gh workflow run deploy.yml    → Deploy triggered    │
│ 8. [Hookshot]: Workflow succeeded ✅                     │
└─────────────────────────────────────────────────────────┘
```

### Room Strategy

```
#dev-commits:server    - Push notifications (high volume)
#dev-prs:server        - PR activity
#dev-issues:server     - Issue tracking
#ci-alerts:server      - Build failures only
#deployments:server    - Production deploys
```

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

**[matrix-commander](https://github.com/8go/matrix-commander)** is perfect for scripting and automation. E2EE is enabled by default and cannot be disabled.

**Latest:** v8.0.5 (2025-06-17)

**Basic Usage:**
```bash
# Send message
matrix-commander -m "Build complete!" -r '!roomid:server'

# Send to multiple rooms
matrix-commander -m "Alert!" -r '!room1:server' -r '!room2:server'

# Send file
matrix-commander --file ./report.pdf -r '!roomid:server'

# Send image with caption
matrix-commander --image ./screenshot.png -m "Bug reproduction"
```

**Scripting Integration:**
```bash
#!/bin/bash
# CI notification script

STATUS=$1
REPO=$2

if [ "$STATUS" = "success" ]; then
    MSG="✅ Build passed for $REPO"
else
    MSG="❌ Build FAILED for $REPO"
fi

matrix-commander -m "$MSG" -r '!builds:server'
```

**Monitoring & Listening:**
```bash
# Listen forever and pipe to script
matrix-commander --listen forever --room '!room:server' | ./process.sh

# Listen once (single message)
matrix-commander --listen once --room '!room:server'

# Tail mode (like tail -f)
matrix-commander --listen tail --room '!room:server'
```

**Admin Features:**
```bash
# Invite user to room
matrix-commander --room-invite '!room:server' --user '@user:server'

# Kick user
matrix-commander --room-kick '!room:server' --user '@user:server'

# Set room name
matrix-commander --room-set-name '!room:server' "New Room Name"

# Create room
matrix-commander --room-create --name "My Room" --alias "#myroom:server"
```

**Cron Examples:**
```bash
# /etc/cron.d/matrix-notifications

# Morning standup reminder
0 9 * * 1-5 user matrix-commander -m "☕ Standup in 15 minutes" -r '!team:server'

# Daily backup status
0 6 * * * user /scripts/backup.sh && matrix-commander -m "✅ Backup complete"

# Disk space alert
*/30 * * * * user [ $(df / --output=pcent | tail -1 | tr -d ' %') -gt 90 ] && \
    matrix-commander -m "⚠️ Disk usage over 90%!" -r '!alerts:server'
```

**TUI Mode:**
```bash
# Interactive terminal interface
matrix-commander-tui
```

**Rust Version:**
There's also [matrix-commander-rs](https://github.com/8go/matrix-commander-rs) for Rust enthusiasts (minimal features currently).

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
