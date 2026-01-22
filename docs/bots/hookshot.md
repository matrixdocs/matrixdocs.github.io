---
sidebar_position: 4
title: Hookshot
description: GitHub, GitLab, and webhook integration for Matrix
---

# Hookshot

Hookshot bridges Matrix to development tools: GitHub, GitLab, JIRA, webhooks, and more. It's the go-to solution for DevOps and development team chat integration.

## Why Hookshot?

- **Bidirectional** - Not just notifications, but commands back to Git
- **E2EE Support** - Works in encrypted rooms (stable since 2025)
- **Widget UI** - Configure without commands
- **Self-hostable** - Full control over your data
- **Active development** - Node 24 support, Matrix v12 rooms

## Features

| Integration | Receive Events | Send Commands |
|-------------|----------------|---------------|
| **GitHub** | Issues, PRs, commits, releases, workflows | Create issues, assign, close, run workflows |
| **GitLab** | Issues, MRs, pipelines | Create issues, manage MRs |
| **JIRA** | Issues, transitions | Create/update issues |
| **Generic Webhooks** | Any JSON payload | — |
| **RSS/Atom** | Feed updates | — |
| **Figma** | Comments, updates | — |
| **OpenProject** | Work packages | Create/manage items |

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

1. Go to **GitHub Settings → Developer settings → GitHub Apps**
2. Create new app with these settings:

**Basic:**
- App name: `Matrix Hookshot`
- Homepage URL: Your Matrix server URL
- Webhook URL: `https://hookshot.example.com/github`
- Webhook secret: Generate a strong secret

**Permissions (Repository):**
| Permission | Access |
|------------|--------|
| Actions | Read |
| Contents | Read |
| Discussions | Read & Write |
| Issues | Read & Write |
| Metadata | Read |
| Projects | Read & Write |
| Pull requests | Read & Write |

**Subscribe to events:**
- Issues, Issue comments
- Pull requests, PR reviews, PR comments
- Push, Releases
- Workflow runs
- Discussions

3. Download the private key after creation

### 2. Configure Hookshot

```yaml title="config.yml"
github:
  auth:
    id: 12345
    privateKeyFile: /data/github-key.pem
  webhook:
    secret: your-webhook-secret
  defaultOptions:
    showIssueRoomLink: true
  # Optional: GitHub Enterprise
  # enterpriseUrl: https://github.mycompany.com
```

### 3. Connect Repository

In a Matrix room:
```
!hookshot github repo https://github.com/owner/repo
```

### GitHub Commands Reference

The default command prefix is `!gh`. All commands work in rooms with a connected repository.

**Issue Management:**
```bash
# Create new issue
!gh create "Bug: Login button broken"
!gh create "Feature request" --label enhancement

# View issue details
!gh issue 123

# Close issue
!gh close 123

# Assign issue
!gh assign 123 @username
```

**Pull Request Commands:**
```bash
# List open PRs
!gh prs

# View PR details
!gh pr 456

# Approve PR (if you have permission)
!gh approve 456
```

**Workflow Commands:**
```bash
# Run a GitHub Actions workflow
!gh workflow run deploy.yml

# Run with inputs
!gh workflow run deploy.yml --input environment=production
```

**Repository Info:**
```bash
# Show connected repo info
!gh repo

# List recent commits
!gh commits
```

### Event Notifications

Configure which events to receive per-room:

| Event | Description |
|-------|-------------|
| `issue.created` | New issues |
| `issue.changed` | Issue updates |
| `issue.edited` | Issue edits |
| `issue.labeled` | Label changes |
| `pull_request.opened` | New PRs |
| `pull_request.reviewed` | PR reviews |
| `pull_request.merged` | PR merges |
| `pull_request.closed` | PR closures |
| `pull_request.ready_for_review` | Draft → Ready |
| `push` | New commits |
| `release` | New releases |
| `workflow.run.success` | CI passed |
| `workflow.run.failure` | CI failed |
| `workflow.run.cancelled` | CI cancelled |

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

## GitHub Actions Integration

Send workflow notifications directly to Matrix without Hookshot using GitHub Actions.

### Matrix Notify Action

The [matrix-notify-action](https://github.com/marketplace/actions/matrix-notify) sends workflow status with per-job reactions.

```yaml title=".github/workflows/ci.yml"
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint

  # This job runs last and reports all results
  notify:
    if: always()
    runs-on: ubuntu-latest
    needs: [build, test]
    steps:
      - uses: Cadair/matrix-notify-action@main
        with:
          matrix_token: ${{ secrets.MATRIX_TOKEN }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          homeserver: 'https://matrix.org'
          roomid: '!yourRoomId:matrix.org'
          # Optional: ignore certain jobs
          ignore_pattern: '.*notify.*'
          # Optional: summarize successes
          summarise_success: true
```

**What it sends:**
- Overall workflow status (✅/❌)
- Reactions for each job status
- Links to workflow run

### Simple Matrix Message Action

For simpler notifications:

```yaml title=".github/workflows/notify.yml"
- name: Notify Matrix
  uses: s3krit/matrix-message-action@v1
  with:
    homeserver: matrix.org
    token: ${{ secrets.MATRIX_TOKEN }}
    channel: '!roomId:matrix.org'
    message: |
      **Build ${{ github.run_number }}** on `${{ github.ref_name }}`
      Status: ${{ job.status }}
      [View Run](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})
```

### Get Your Matrix Token

1. Log into Element Web
2. Settings → Help & About → Access Token (click to reveal)
3. Add as `MATRIX_TOKEN` secret in GitHub repo settings

### Get Room ID

1. In Element, open room settings
2. Advanced → Internal room ID
3. Format: `!randomChars:server.org`

---

## CI/CD Best Practices

### Notification Strategy

| Event | Notify? | Why |
|-------|---------|-----|
| PR opened | ✅ | Team awareness |
| PR merged | ✅ | Deploy tracking |
| Main build failed | ✅ | Critical |
| Branch build failed | ⚠️ | Only author |
| Deployment | ✅ | Ops awareness |
| Security scan | ✅ | Always |

### Separate Rooms

```
#ci-builds:server      - All builds (high volume)
#ci-failures:server    - Failures only (alerts)
#deployments:server    - Production deploys
#security:server       - Security scan results
```

### Filtering Noise

**GitHub-side:**
- Use branch filters in workflow triggers
- Don't notify on every commit, only PRs/main

**Hookshot-side:**
- Configure event types per room
- Use webhook templates to filter

---

## Resources

- [Hookshot GitHub](https://github.com/matrix-org/matrix-hookshot)
- [Documentation](https://matrix-org.github.io/matrix-hookshot/)
- [Matrix Room](https://matrix.to/#/#hookshot:half-shot.uk)
- [matrix-notify-action](https://github.com/Cadair/matrix-notify-action)
- [matrix-message-action](https://github.com/s3krit/matrix-message-action)

---

*Next: [Building Bots](./building-bots) →*
