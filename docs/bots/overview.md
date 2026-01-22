---
sidebar_position: 1
title: Bots & Integrations Overview
description: Automate and extend Matrix with bots and integrations
---

# Bots & Integrations

Extend Matrix with bots for moderation, automation, notifications, and more.

## Types of Bots

### Simple Bots

Basic bots that respond to commands:
- Echo bots, reminder bots
- Info bots, help bots
- Simple automation

### Appservice Bots

More powerful bots using the Application Service API:
- Can create users/rooms
- Higher rate limits
- Background processing

### Moderation Bots

Keep communities safe:
- **Mjolnir** - Ban lists, spam protection
- **Draupnir** - Mjolnir fork with improvements

### Integration Bots

Connect external services:
- **Hookshot** - GitHub, GitLab, JIRA
- **Maubot** - Plugin-based bot system

## Popular Bot Frameworks

| Framework | Language | Complexity | Best For |
|-----------|----------|------------|----------|
| [Maubot](./maubot) | Python | Medium | Plugin ecosystem |
| [matrix-bot-sdk](https://github.com/turt2live/matrix-bot-sdk) | TypeScript | Low | Quick bots |
| [mautrix](https://github.com/mautrix/python) | Python | Low | Simple bots |
| [matrix-nio](https://github.com/matrix-nio/matrix-nio) | Python | Low | Async bots |
| [matrix-rust-sdk](https://github.com/matrix-org/matrix-rust-sdk) | Rust | Medium | Performance |

## Quick Start: Simple Bot

Using matrix-nio (Python):

```python
from nio import AsyncClient, RoomMessageText

async def message_callback(room, event):
    if event.body.startswith("!hello"):
        await client.room_send(
            room.room_id,
            "m.room.message",
            {"msgtype": "m.text", "body": "Hello, World!"}
        )

client = AsyncClient("https://matrix.example.com", "@bot:example.com")
await client.login("password")
client.add_event_callback(message_callback, RoomMessageText)
await client.sync_forever()
```

## Integration Services

### Hookshot

Connect Matrix to development tools:
- GitHub: Issues, PRs, commits
- GitLab: Issues, MRs, pipelines
- JIRA: Issues, projects
- Generic webhooks
- RSS feeds

### Dimension

Integration manager for Matrix:
- Widget management
- Sticker packs
- Bot configuration
- Bridge management

### NEB (Legacy)

Older integration bot:
- RSS feeds
- Service notifications
- Being replaced by Hookshot

## Hosted Bot Services

| Service | Bots Included | Notes |
|---------|--------------|-------|
| [t2bot.io](https://t2bot.io) | Many | Free, public |
| [Element EMS](https://element.io/ems) | Enterprise | Managed |
| [etke.cc](https://etke.cc) | Various | Managed hosting |

### t2bot.io Public Bots

Free bots anyone can use:
- `@echo:t2bot.io` - Echo bot
- `@rss:t2bot.io` - RSS feeds
- `@reminder:t2bot.io` - Reminders
- `@giphy:t2bot.io` - GIF search

Invite to any room to use.

## Bot Security

### Best Practices

1. **Minimal permissions** - Only request needed power levels
2. **Validate input** - Sanitize all user input
3. **Rate limiting** - Prevent abuse
4. **Audit logging** - Track bot actions
5. **Secure tokens** - Never expose access tokens

### Power Levels for Bots

| Purpose | Suggested Level |
|---------|-----------------|
| Read-only bot | 0 (default) |
| Posting bot | 0 (default) |
| Moderation bot | 50+ |
| Admin bot | 100 |

## Building vs Using

### Use Existing Bots When

- Standard functionality needed
- Quick deployment required
- Don't want to maintain code

### Build Custom Bots When

- Unique requirements
- Integration with internal systems
- Learning/experimentation

## Getting Started

1. **[Maubot](./maubot)** - Most versatile, plugin-based
2. **[Mjolnir](./mjolnir)** - Essential for moderation
3. **[Hookshot](./hookshot)** - GitHub/GitLab integration
4. **[Building Bots](./building-bots)** - Create your own

---

*Continue: [Maubot](./maubot) | [Mjolnir](./mjolnir) | [Hookshot](./hookshot)*
