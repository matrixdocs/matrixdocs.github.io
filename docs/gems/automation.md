---
sidebar_position: 3
title: Automation & Workflows
description: Automate everything with Matrix bots and integrations
---

# Automation & Workflows

Turn Matrix into the hub of your automated workflows.

## Notification Pipelines

### Server Alerts → Matrix

**With ntfy + Maubot:**
```bash
# Send from any script
curl -d "Server CPU at 95%!" ntfy.sh/your-alerts-topic
```

Maubot's ntfy plugin forwards to Matrix rooms automatically.

**With matrix-commander:**
```bash
#!/bin/bash
# /etc/cron.d/disk-check
*/5 * * * * root [ $(df / --output=pcent | tail -1 | tr -d ' %') -gt 90 ] && \
  matrix-commander -m "⚠️ Disk usage over 90%!" -r '!alerts:server'
```

### CI/CD → Matrix

**GitHub Actions:**
```yaml
- name: Notify Matrix
  uses: s3krit/matrix-message-action@v1
  with:
    homeserver: matrix.org
    token: ${{ secrets.MATRIX_TOKEN }}
    channel: '!roomid:server'
    message: "✅ Build ${{ github.run_number }} passed"
```

**GitLab CI:**
```yaml
notify:
  stage: deploy
  script:
    - |
      curl -X POST "https://matrix.server/_matrix/client/r0/rooms/!room:server/send/m.room.message" \
        -H "Authorization: Bearer $MATRIX_TOKEN" \
        -d '{"msgtype":"m.text","body":"Pipeline complete"}'
```

**With Hookshot:**
```
!hookshot github repo owner/repo
```
Then receive all push, PR, and issue events automatically.

### RSS/Atom Feeds

**Subscribe to any feed:**
```
!hookshot feed https://blog.example.com/feed.xml
```

**Use cases:**
- Blog updates → Team room
- Security advisories → Alert channel
- Release notes → Dev room
- News feeds → Topic rooms

---

## Chat Ops

### GitHub from Matrix

With Hookshot or Maubot GitHub plugin:

```
!github create issue "Bug: Login broken"
!github list issues --repo owner/repo
!github assign #123 @developer
!github close #123
```

### GitLab from Matrix

```
!gitlab create issue "Feature request"
!gitlab mr list
!gitlab pipeline status
```

### JIRA from Matrix

```
!jira create "Bug" "Login page crashes"
!jira assign PROJ-123 john
!jira transition PROJ-123 "In Progress"
```

---

## Scheduled Messages

### Reminders (Maubot)

```
!remind me in 30 minutes to check the build
!remind me tomorrow at 9am standup meeting
!remind @team in 2 hours review PR

# Recurring
!remind me every day at 9am daily standup
!remind me every monday at 10am weekly sync
```

### Cron-Based Automation

```bash
# /etc/cron.d/matrix-notifications

# Daily standup reminder
0 9 * * 1-5 user matrix-commander -m "🕐 Standup in 15 minutes" -r '!team:server'

# Weekly report
0 17 * * 5 user ./generate-report.sh | matrix-commander -r '!reports:server'

# System health
0 */6 * * * user ./health-check.sh
```

---

## Webhook Integrations

### Generic Webhooks with Hookshot

**Setup:**
```
!hookshot webhook mywebhook
```

**Send data:**
```bash
curl -X POST https://hookshot.server/webhook/abc123 \
  -H "Content-Type: application/json" \
  -d '{"text": "Deployment complete", "status": "success"}'
```

**Custom Templates (JavaScript):**
```javascript
// Transform incoming webhooks
({
  body: `**${data.event}**: ${data.message}`,
  msgtype: data.level === "error" ? "m.notice" : "m.text"
})
```

### Common Webhook Sources

| Service | Setup |
|---------|-------|
| Grafana | Webhook alerting → Hookshot URL |
| Uptime Kuma | Notification → Matrix |
| Home Assistant | Notify service → matrix-commander |
| Prometheus Alertmanager | Receiver → Hookshot |
| Healthchecks.io | Webhook → Matrix |

---

## AI-Powered Automation

### LLM Bot (Maubot)

```
!ai summarize the last 50 messages
!ai translate this to Spanish: Hello world
!ai explain this error: [paste error]
```

**Capabilities:**
- Text generation (GPT-4, Claude)
- Image generation (DALL-E)
- Voice transcription
- Text-to-speech

### Voice Message Transcription

With Gladia Maubot plugin:
- Automatically transcribes voice messages
- Free API tier available
- Multiple language support

---

## Support Workflows

### Ticket System (Maubot SupportPortal)

```
!ticket create general "Need help with login"
```

**Features:**
- Category-based tickets (general, purchase, technical)
- Auto-creates private room with user + support team
- Automatic ticket cleanup after 14 days
- Ticket history and tracking

### Welcome Messages

With Draupnir or custom bot:
```python
# On user join
@bot.on_event(RoomMemberEvent)
async def welcome(event):
    if event.membership == "join":
        await bot.send_message(
            event.room_id,
            f"Welcome {event.sender}! Read the rules at #rules:server"
        )
```

---

## LDAP/AD Sync

### Maubot LDAP Sync Plugin

Automatically sync users from directory services:

```yaml
# config.yaml
ldap:
  url: ldap://ad.company.com
  base_dn: OU=Users,DC=company,DC=com
  bind_dn: CN=sync,OU=Service,DC=company,DC=com

sync_rooms:
  - matrix_room: "!engineering:company.com"
    ldap_group: "CN=Engineering,OU=Groups,DC=company,DC=com"
```

**Capabilities:**
- Sync from Azure AD or LDAP
- Auto-add/remove users from rooms
- Group-based room membership
- Scheduled sync runs

---

## Workflow Examples

### DevOps Alert Pipeline

```
┌─────────────────┐
│ Prometheus      │
│ Alertmanager    │
└────────┬────────┘
         │ webhook
         ▼
┌─────────────────┐
│ Hookshot        │
│ (formatting)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ #alerts:server  │
│ (Matrix room)   │
└────────┬────────┘
         │ @oncall mention
         ▼
┌─────────────────┐
│ Element mobile  │
│ push notif      │
└─────────────────┘
```

### PR Review Workflow

```
┌─────────────────┐
│ GitHub PR       │
│ opened          │
└────────┬────────┘
         │ Hookshot
         ▼
┌─────────────────┐
│ #dev-prs:server │
│ notification    │
└────────┬────────┘
         │ !github assign
         ▼
┌─────────────────┐
│ Reviewer        │
│ assigned        │
└────────┬────────┘
         │ review complete
         ▼
┌─────────────────┐
│ !github merge   │
│ from Matrix     │
└─────────────────┘
```

---

## Quick Setup Checklist

1. **Install Maubot** - Central bot management
2. **Deploy Hookshot** - Developer integrations
3. **Set up matrix-commander** - Scripting
4. **Configure webhooks** - External services
5. **Create dedicated rooms** - #alerts, #deploys, #feeds
6. **Set up notifications** - Mobile push for critical rooms

---

*Automate the boring stuff. Let Matrix be your operations hub.*
