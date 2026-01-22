---
sidebar_position: 3
title: Mjolnir & Draupnir
description: Moderation bots for Matrix communities
---

# Mjolnir & Draupnir

Powerful moderation bots for Matrix. **Draupnir is the recommended choice** for new deployments as the actively maintained successor to Mjolnir.

## Draupnir vs Mjolnir

| Feature | Draupnir | Mjolnir |
|---------|----------|---------|
| Status | **Actively maintained** | Legacy (minimal updates) |
| Performance | Fast (room state caching) | Slower startup |
| UX | No commands needed for bans | Command-only |
| Features | Takedowns, auto-suspension | Basic moderation |
| Recommended | **Yes** | For existing deployments |

## Draupnir (Recommended)

**[Draupnir](https://github.com/the-draupnir-project/Draupnir)** is a drop-in replacement for Mjolnir with significant improvements.

### Why Draupnir?

- **No commands needed** - Ban in your client, Draupnir prompts to add to ban list
- **Instant response** - Doesn't wait for homeserver data
- **Room state caching** - Fast startup even with many rooms
- **Active development** - v2.3.0 (May 2025) with major features

### New in v2.3.0 (2025)

- **Takedowns** - Stronger than bans for illegal content
- **Auto-suspension** - Automatically suspend matching users
- **Block invitations** - Preemptively block invites from bad actors
- **synapse-http-antispam** - Modern Synapse integration

### Installation

**Docker (Recommended):**
```yaml title="docker-compose.yml"
services:
  draupnir:
    image: gnuxie/draupnir:latest
    restart: unless-stopped
    volumes:
      - ./draupnir-data:/data
```

**From Source:**
```bash
git clone https://github.com/the-draupnir-project/Draupnir.git
cd Draupnir
npm install
npm run build
```

### Quick Setup

1. **Create bot account**: `@draupnir:yourserver.com`
2. **Create control room** (private, unencrypted)
3. **Invite bot and give admin** (power level 100)
4. **Configure** `config/production.yaml`:

```yaml
homeserverUrl: "https://matrix.yourserver.com"
accessToken: "your-bot-access-token"
managementRoom: "!controlroomid:yourserver.com"
```

5. **Start Draupnir**: `docker compose up -d`

6. **Create your first ban list**:
```
!draupnir list create my-coc code-of-conduct-ban-list
```

### Key Commands

```
# Moderation
!draupnir ban @user:server reason
!draupnir unban @user:server
!draupnir kick @user:server reason
!draupnir redact @user:server [limit]

# Rooms
!draupnir rooms add #room:server
!draupnir rooms remove #room:server
!draupnir rooms

# Ban Lists
!draupnir list create <shortcode>
!draupnir watch <listroom>
!draupnir unwatch <listroom>

# Server ACLs
!draupnir ban server badserver.com
!draupnir unban server badserver.com

# Protections
!draupnir enable FirstMessageIsImage
!draupnir disable BasicFloodingProtection
!draupnir protections
```

### Distributed Moderation

Subscribe to community-curated ban lists:
```
!draupnir watch #matrix-org-coc-bl:matrix.org
```

**Popular lists:**
- `#matrix-org-coc-bl:matrix.org` - Matrix.org CoC violations
- `#community-moderation-effort-bl:neko.dev` - CME list

### Built-in Protections

| Protection | Description |
|------------|-------------|
| `FirstMessageIsImage` | Block image-only first messages |
| `BasicFloodingProtection` | Rate limit messages |
| `WordList` | Block messages with banned words |
| `MessageIsVoice` | Block voice messages |
| `JoinWaveShortCircuit` | Stop join floods |

**Enable protections:**
```
!draupnir enable FirstMessageIsImage
!draupnir config set BasicFloodingProtection.maxPerMinute 10
```

### Synapse Integration

For server-wide protection, use synapse-http-antispam (replaces legacy module):

```yaml
# homeserver.yaml
modules:
  - module: synapse_http_antispam.HTTPAntispam
    config:
      base_url: http://draupnir:8080
```

### Migration from Mjolnir

Migration is seamless:
1. Replace Docker image: `gnuxie/draupnir:latest`
2. Restart
3. That's it - configuration is compatible

---

## Mjolnir (Legacy)

If you have an existing Mjolnir deployment, it will continue to work, but consider migrating to Draupnir.

### Docker

```yaml title="docker-compose.yml"
services:
  mjolnir:
    image: matrixdotorg/mjolnir:latest
    restart: unless-stopped
    volumes:
      - ./mjolnir-data:/data
```

### Configuration

```yaml title="config/production.yaml"
homeserverUrl: "https://matrix.example.com"
accessToken: "your-bot-access-token"
managementRoom: "#mjolnir-management:example.com"

protectedRooms:
  - "#room1:example.com"
  - "#room2:example.com"

protections:
  - FirstMessageIsImage
  - BasicFloodingProtection

admins:
  - "@admin:example.com"
```

### Commands

Mjolnir uses `!mjolnir` prefix instead of `!draupnir`:
```
!mjolnir ban @user:server reason
!mjolnir watch #banlist:server
!mjolnir enable BasicFloodingProtection
```

---

## Best Practices

### Room Setup

1. **Control room**: Private, unencrypted, trusted admins only
2. **Bot power level**: Always 100 in protected rooms
3. **Separate ban lists**: By severity or category

### Security

- Keep control room invite-only
- Limit admin list
- Audit mod actions regularly
- Use strong access tokens

### Performance

- Start with Draupnir for better performance
- Use room state backing store
- Consider workers for large deployments

---

## Troubleshooting

### Bot Can't Ban

1. Check bot power level (needs 100)
2. Verify room is protected: `!draupnir rooms`
3. Check homeserver logs

### Protections Not Working

1. Check if enabled: `!draupnir protections`
2. Verify configuration
3. Test with manual trigger

### Ban List Not Syncing

1. Check bot has room access
2. Run `!draupnir status`
3. Verify list room permissions

---

## Resources

- **Draupnir**: [github.com/the-draupnir-project/Draupnir](https://github.com/the-draupnir-project/Draupnir)
- **Mjolnir**: [github.com/matrix-org/mjolnir](https://github.com/matrix-org/mjolnir)
- **Support**: [#draupnir:matrix.org](https://matrix.to/#/#draupnir:matrix.org)
- **Docs**: [Draupnir4All](https://docs.draupnir.midnightthoughts.space/)

---

*Next: [Hookshot](./hookshot) →*
