---
sidebar_position: 4
title: Slack Bridge
description: Bridge Matrix to Slack workspaces
---

# Slack Bridge

Connect Slack workspaces to Matrix using mautrix-slack.

## Features

- **Full puppeting** - Appear as yourself in Slack
- **Channels** - Bridge public and private channels
- **DMs** - Bridge direct messages
- **Threads** - Maintain thread context
- **Reactions** - Emoji reactions both ways
- **Files** - Share files across platforms
- **User presence** - See online status

## Docker Setup

```yaml title="docker-compose.yml"
version: '3'
services:
  mautrix-slack:
    image: dock.mau.dev/mautrix/slack:latest
    restart: unless-stopped
    volumes:
      - ./slack-data:/data
```

## Configuration

```yaml title="config.yaml"
homeserver:
  address: https://matrix.example.com
  domain: example.com

appservice:
  address: http://localhost:29335
  hostname: 0.0.0.0
  port: 29335
  database:
    type: postgres
    uri: postgres://user:pass@localhost/slack?sslmode=disable

bridge:
  username_template: "slack_{{.TeamID}}_{{.UserID}}"

  # Double puppeting
  double_puppet_server_map:
    example.com: https://matrix.example.com
  login_shared_secret_map:
    example.com: "your-shared-secret"

  # Encryption
  encryption:
    allow: true
    default: true

  permissions:
    "*": relay
    "example.com": user
    "@admin:example.com": admin
```

## Logging In

1. DM `@slackbot:example.com`
2. Send `!slack login`
3. Follow OAuth flow or use token

### Token Login

Get a user token (xoxc-):
1. Open Slack in browser
2. Open DevTools → Network
3. Look for requests with `token` parameter
4. Copy the `xoxc-` token

```
!slack login-token xoxc-your-token-here
```

:::warning
Token method requires additional cookies. See [docs](https://docs.mau.fi/bridges/slack/) for details.
:::

## Bridging Channels

### Auto-Bridge

Configure automatic bridging:

```yaml
bridge:
  backfill:
    enable: true
    messages: 100
```

### Manual Bridge

In the Slack channel on Matrix:
```
!slack bridge
```

## Commands

| Command | Description |
|---------|-------------|
| `!slack help` | Show help |
| `!slack login` | Start login |
| `!slack logout` | Disconnect |
| `!slack ping` | Test connection |
| `!slack sync` | Sync workspaces |

## Threads

Slack threads appear as Matrix threads when supported:

```yaml
bridge:
  threads:
    enabled: true
```

## Troubleshooting

### Rate Limiting

Slack has strict rate limits:
- Wait and retry
- Reduce sync frequency
- Use fewer concurrent bridges

### Token Expired

Re-login with `!slack login` or get a new token.

### Missing Channels

- Check workspace permissions
- Verify channel visibility
- Run `!slack sync`

## Resources

- [mautrix-slack GitHub](https://github.com/mautrix/slack)
- [Documentation](https://docs.mau.fi/bridges/slack/)

---

*Next: [IRC Bridge](./irc) →*
