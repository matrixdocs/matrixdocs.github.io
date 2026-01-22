---
sidebar_position: 4
title: Your First Room
description: Create and manage Matrix rooms like a pro
---

# Your First Room

Rooms are where conversations happen in Matrix. Let's create and configure one.

## Creating a Room

### In Element

1. Click the **+** button next to "Rooms"
2. Select **"New Room"**
3. Configure your room:

| Option | Description |
|--------|-------------|
| **Name** | Display name for the room |
| **Topic** | Brief description shown in room header |
| **Private** | Invite-only vs public visibility |
| **Encryption** | Enable end-to-end encryption |

4. Click **"Create Room"**

:::tip
Enable encryption during creation if you want E2EE. Enabling it later means old messages won't be encrypted.
:::

## Room Settings Deep Dive

### General Settings

Access via **Room Settings** (gear icon) → **General**:

- **Room Name**: Can be changed anytime
- **Room Topic**: Supports basic markdown
- **Room Address**: Create public aliases like `#myroom:server.org`
- **Room Avatar**: Upload a custom image

### Security & Privacy

**Room Settings → Security & Privacy**:

| Setting | Options |
|---------|---------|
| **Who can access** | Invite only, public, space members |
| **Encryption** | Enable/disable (can't disable once enabled) |
| **Who can read history** | Members only, since joined, anyone |

### Roles & Permissions

**Room Settings → Roles & Permissions**:

Matrix uses **power levels** (0-100) for permissions:

```
Power Level 100 - Admin (full control)
Power Level 50  - Moderator (kick, ban, delete messages)
Power Level 0   - Default (send messages)
```

Customize thresholds for specific actions:
- Change room name
- Kick/ban users
- Send messages
- Change permissions

## Room Aliases

Aliases make rooms easy to find and share.

### Creating an Alias

1. Go to **Room Settings → General**
2. Under "Local Addresses", add an alias
3. Format: `#alias:yourserver.org`

### Multiple Aliases

A room can have multiple aliases:
- `#project:matrix.org` (main alias)
- `#project-chat:matrix.org` (alternative)
- `#project:example.com` (on different server)

:::info
Only users on your homeserver can create aliases on that server. But you can set any alias as the "main" alias regardless of which server it's on.
:::

## Managing Members

### Inviting Users

**Methods to invite:**

1. **Direct Invite**: Enter their Matrix ID (`@user:server.org`)
2. **Share Link**: Copy room link or QR code
3. **Public Directory**: List room in public directory

### Member Management

| Action | Required Power Level |
|--------|---------------------|
| **Invite** | Usually 0 or 50 |
| **Kick** | Usually 50 |
| **Ban** | Usually 50 |
| **Promote/Demote** | 100 (or custom) |

### Banning vs Kicking

- **Kick**: Removes user, they can rejoin
- **Ban**: Removes user, prevents rejoin

## Room Moderation

### Setting Up Moderation

1. **Assign Moderators**: Promote trusted users to power level 50+
2. **Configure Permissions**: Adjust what each level can do
3. **Enable Slow Mode**: Limit message frequency (if supported by client)

### Moderation Actions

```
/kick @user:server.org [reason]    - Remove from room
/ban @user:server.org [reason]     - Ban from room
/unban @user:server.org            - Remove ban
/op @user:server.org [level]       - Set power level
/deop @user:server.org             - Reset to default
```

### Server ACLs (Advanced)

Block entire servers from joining:

1. Room Settings → Security
2. Add server to blocklist
3. Users from that server can't join

:::warning
Server ACLs are powerful but use them carefully. They affect all users from that server, not just problematic ones.
:::

## Spaces Integration

### Adding Room to a Space

1. Open the Space settings
2. Click **"Add existing room"**
3. Select your room
4. Room now appears in Space hierarchy

### Space-Based Access

Configure room access based on Space membership:
- "Space members" - Anyone in the parent Space can join
- Useful for community management

## Advanced Room Features

### Widgets

Add interactive widgets to rooms:
- **Jitsi**: Video conferencing
- **Etherpad**: Collaborative notes
- **Custom**: Any embeddable web app

### Integrations

Connect external services via bridges or bots:
- GitHub notifications
- RSS feeds
- Custom webhooks

### Room Upgrades

Sometimes rooms need to be upgraded (new room version):
1. Matrix introduces new room features
2. Admin initiates upgrade
3. Old room tombstoned, new room created
4. Members automatically moved

## Best Practices

### For Private Groups

- Enable encryption before first message
- Set history visibility to "Members only"
- Use invite-only access
- Verify member devices

### For Public Communities

- Create clear room name and topic
- Set up moderation team
- Consider slow mode for busy rooms
- Establish and pin community guidelines

### For Organizations

- Use Spaces to organize channels
- Set up SSO/OIDC if available
- Configure data retention policies
- Plan for room archival

## Troubleshooting

### "Unable to join room"

- Check if you're banned
- Verify room still exists
- Ensure invite hasn't expired

### "Unable to decrypt messages"

- Verify your session
- Check key backup
- Request key share from other members

### "Changes not saving"

- Check your power level
- Verify internet connection
- Look for error messages

---

*Next: [Clients Overview](/clients/overview) →*
