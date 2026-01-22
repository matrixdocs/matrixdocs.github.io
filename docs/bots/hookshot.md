---
sidebar_position: 4
title: Hookshot
description: GitHub, GitLab, and webhook integration for Matrix
---

# Hookshot

Hookshot bridges Matrix to development tools: GitHub, GitLab, JIRA, webhooks, and more.

## Features

- **GitHub** - Issues, PRs, commits, releases
- **GitLab** - Issues, MRs, pipelines
- **JIRA** - Issues, projects
- **Generic Webhooks** - Any service
- **RSS/Atom** - Feed subscriptions
- **Figma** - Design updates

## Installation

### Docker

```yaml title="docker-compose.yml"
version: '3'
services:
  hookshot:
    image: halfshot/matrix-hookshot:latest
    restart: unless-stopped
    ports:
      - "9000:9000"   # Webhooks
      - "9001:9001"   # Metrics
      - "9002:9002"   # Widgets
    volumes:
      - ./hookshot-data:/data
```

## Configuration

```yaml title="config.yml"
bridge:
  domain: example.com
  url: https://matrix.example.com
  mediaUrl: https://matrix.example.com
  port: 9000
  bindAddress: 0.0.0.0

github:
  auth:
    id: YOUR_GITHUB_APP_ID
    privateKeyFile: /data/github-key.pem

gitlab:
  instances:
    gitlab.com:
      url: https://gitlab.com

jira:
  webhook:
    secret: your-webhook-secret

generic:
  enabled: true
  urlPrefix: https://hookshot.example.com/webhook

feeds:
  enabled: true
  pollIntervalSeconds: 300

passFile: /data/passkey.pem
```

### Generate Registration

```bash
docker run --rm -v $(pwd)/hookshot-data:/data \
  halfshot/matrix-hookshot:latest \
  node config/config.schema.json > registration.yml
```

## GitHub Setup

### 1. Create GitHub App

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Create new app with:
   - Webhook URL: `https://hookshot.example.com/github`
   - Permissions: Issues, PRs, Commits (read)
   - Subscribe to events: Issues, PRs, Pushes

### 2. Configure Hookshot

```yaml
github:
  auth:
    id: 12345
    privateKeyFile: /data/github-key.pem
  webhook:
    secret: your-webhook-secret
  defaultOptions:
    showIssueRoomLink: true
```

### 3. Connect Repository

In a Matrix room:
```
!hookshot github repo https://github.com/owner/repo
```

## GitLab Setup

```yaml
gitlab:
  instances:
    gitlab.com:
      url: https://gitlab.com
    self-hosted:
      url: https://gitlab.example.com
```

Connect in room:
```
!hookshot gitlab repo https://gitlab.com/owner/repo
```

## JIRA Setup

```yaml
jira:
  webhook:
    secret: your-jira-secret
  oauth:
    client_id: your-client-id
    client_secret: your-client-secret
```

Connect project:
```
!hookshot jira project PROJ
```

## Generic Webhooks

Receive webhooks from any service:

### Create Webhook

```
!hookshot webhook new MyService
```

Hookshot provides a URL like:
```
https://hookshot.example.com/webhook/abc123
```

### Message Templates

Customize how webhooks appear:

```
!hookshot webhook template MyService "New event: {{data.message}}"
```

## RSS Feeds

Subscribe to any RSS/Atom feed:

```
!hookshot feed add https://blog.example.com/feed.xml
```

Commands:
| Command | Description |
|---------|-------------|
| `!hookshot feed add <url>` | Subscribe to feed |
| `!hookshot feed remove <url>` | Unsubscribe |
| `!hookshot feed list` | List subscriptions |

## Commands Reference

### General

| Command | Description |
|---------|-------------|
| `!hookshot help` | Show help |
| `!hookshot setup` | Initial setup |

### GitHub

| Command | Description |
|---------|-------------|
| `!hookshot github repo <url>` | Connect repo |
| `!hookshot github issue <num>` | Show issue |
| `!hookshot github create issue` | Create issue |

### GitLab

| Command | Description |
|---------|-------------|
| `!hookshot gitlab repo <url>` | Connect repo |
| `!hookshot gitlab issue <num>` | Show issue |

## Widgets

Hookshot provides widgets for Element:

```yaml
widgets:
  enabled: true
  port: 9002
  addToRooms: true
```

Access configuration via Element's integrations panel.

## Troubleshooting

### Webhooks Not Arriving

1. Check webhook URL is accessible
2. Verify secrets match
3. Check GitHub/GitLab webhook logs
4. Review Hookshot logs

### Can't Connect Repo

- Verify GitHub App is installed on repo
- Check permissions
- Ensure bot is in room

## Resources

- [Hookshot GitHub](https://github.com/matrix-org/matrix-hookshot)
- [Documentation](https://matrix-org.github.io/matrix-hookshot/)
- [Matrix Room](https://matrix.to/#/#hookshot:half-shot.uk)

---

*Next: [Building Bots](./building-bots) →*
