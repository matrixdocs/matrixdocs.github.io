---
sidebar_position: 4
title: Your First Room
description: Create and manage Matrix rooms
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, Element Web 1.12.32"
---

# Your First Room

Rooms are where conversations happen in Matrix. This page walks through creating and running one in Element Web. Other clients have similar options under different names.

## Creating a room

1. Click **+** next to the room list and choose **New room**.
2. Fill in the dialog:

| Option | Description |
|--------|-------------|
| **Name** | Display name for the room |
| **Topic** | Optional description shown in the room header |
| **Room visibility** | Invite only, Public, or members of the current space. **Ask to join** appears only if you turn it on in Settings → Labs |
| **Enable end-to-end encryption** | On by default for private rooms. It cannot be turned off later. |

3. Click **Create room**.

:::tip
Decide on encryption when you create the room. Turning it on later only protects new messages, and it can never be turned off. Element warns that many bridges and bots do not work in encrypted rooms.
:::

## Room settings

### General

**Room settings → General**:

- **Room name** and **topic**: can be changed at any time
- **Room addresses**: publish aliases like `#myroom:server.org`
- **Room avatar**: upload an image

### Security & Privacy

**Room settings → Security & Privacy**:

| Setting | Options |
|---------|---------|
| **Access** | Invite only, Space members, Anyone, and Ask to join (Labs) |
| **Encryption** | Turn on (permanent) |
| **Who can read history?** | See below |

Element's history options map to the spec's `m.room.history_visibility` values:

| Element label | Spec value | Who can read |
|---------------|-----------|--------------|
| Anyone (history is public) | `world_readable` | Anyone, even without joining |
| Members (full history) | `shared` | Members, including messages sent before they joined. This is the default. |
| Members since invited | `invited` | Members, from the moment they were invited |
| *(not offered by Element)* | `joined` | Members, from the moment they joined |

The setting applies to messages when they are sent. Changing it does not change who can read older messages.

### Roles & Permissions

**Room settings → Roles & Permissions**. Matrix uses numeric **power levels**:

```
Power level 100 - Admin (permissions, history visibility, encryption, server ACLs)
Power level 50  - Moderator (kick, ban, delete messages, name, topic, avatar)
Power level 0   - Default (send messages)
```

In [room version 12](https://spec.matrix.org/v1.19/rooms/v12/) rooms (the default for new rooms on Synapse 1.162 and later), the room's **creator** sits above all of these with an unlimited power level. Creators cannot be demoted, and they do not appear in the power-level list. If you want co-owners, they must be added as `additional_creators` when the room is created; otherwise make them admins (100).

You can change the level required for each action, such as changing the room name, kicking or banning, sending messages, or changing permissions.

## Room aliases

Aliases make rooms easy to find and share.

### Creating an alias

1. Go to **Room settings → General**.
2. Under the local addresses section, add an address.
3. Format: `#alias:yourserver.org`

### Multiple aliases

A room can have several aliases:
- `#project:matrix.org` (main alias)
- `#project-chat:matrix.org` (alternative)
- `#project:example.com` (on another server)

:::info
You can only create aliases on your own homeserver. Any published alias can be chosen as the room's main address.
:::

## Managing members

### Inviting users

1. **Direct invite**: enter their Matrix ID (`@user:server.org`)
2. **Share a link**: copy the room link (`https://matrix.to/#/...`)
3. **Public directory**: publish the room in your server's room directory

Invites stay valid until they are accepted, rejected or revoked.

### Required power levels

| Action | Default level |
|--------|---------------|
| **Invite** | 0 in private rooms, 50 in public rooms |
| **Kick** | 50 |
| **Ban** | 50 |
| **Change power levels** | 100 |

These are the values Synapse sets for new rooms. If a room's power-level event leaves a value out, the spec defaults apply (invite 0, kick and ban 50).

### Kick vs ban

- **Kick**: removes the user; they can rejoin
- **Ban**: removes the user and stops them rejoining

## Moderation

### Setting up

1. **Assign moderators**: give trusted users power level 50 or more.
2. **Adjust permissions**: decide what each level can do.
3. **For large public rooms**, consider a moderation bot such as [Draupnir](../bots/mjolnir), which can share ban lists between rooms.

Matrix has no per-room "slow mode". Message rate limits are set by each homeserver (in Synapse, `rc_message`).

### Slash commands in Element

```
/kick @user:server.org [reason]    - Remove from room
/ban @user:server.org [reason]     - Ban from room
/unban @user:server.org            - Remove ban
/op @user:server.org <level>       - Set power level
/deop @user:server.org             - Reset power level
```

### Server ACLs (advanced)

A server ACL (`m.room.server_acl`) blocks whole servers from taking part in a room. Element has no settings screen for this. You can:

- send the state event yourself with `/devtools` → **Send custom state event** → type `m.room.server_acl` (see the [example](../security/overview#server-acls)), or
- let a moderation bot such as Draupnir manage it.

:::warning
A server ACL affects every user on the blocked server, and a mistake can lock out your own server. Always keep your own server in `allow`.
:::

## Spaces

### Adding a room to a space

1. Open the space's menu.
2. Choose **Add existing room**.
3. Select your room.

### Space-based access

Set the room's access to **Space members** (the `restricted` join rule). Members of the chosen spaces can then join without an invite.

## Advanced features

### Widgets and integrations

Widgets embed web apps (for example Jitsi or a custom page) in a room. Element adds them through an **integration manager**, which is optional and configured by your client or homeserver admin. Many self-hosted setups have none. Bridges and bots, such as GitHub notifications or RSS feeds, are usually invited to the room directly; see [Bots](../bots/overview) and [Bridges](../bridges/overview).

### Room upgrades

Rooms sometimes need upgrading to a newer room version (Element: **Room settings → Advanced → Upgrade this room**):

1. A user with enough power sends the upgrade.
2. The server creates a new room and puts a "tombstone" in the old one pointing to it.
3. Members are **not** moved automatically. Clients show a link or banner, and each member joins the new room.
4. Settings such as the name, topic, avatar, join rules, history visibility, guest access, encryption, power levels and server ACLs are copied, local aliases move to the new room, and Synapse also copies bans. In room version 12, `additional_creators` are not copied automatically, and the user who upgrades becomes the new room's creator.

## Good practice

### Private groups

- Turn on encryption before the first message
- Use **Invite only** access
- Set history to **Members since invited**
- Verify the people you talk to

### Public communities

- Write a clear name, topic and rules
- Build a moderation team, and consider a moderation bot
- Keep public rooms unencrypted unless you have a reason; encryption gives little privacy when anyone can join

### Organizations

- Use spaces to organize rooms
- Use single sign-on through the Matrix Authentication Service (OAuth 2.0) if your homeserver supports it
- Set data retention policies on the server
- Plan for archiving rooms

## Troubleshooting

### "Unable to join room"

- Check whether you are banned, or whether the room is invite-only
- Check that the room still exists and the alias is correct
- If the room has a server ACL, your server may be blocked

### "Unable to decrypt"

- Enter your recovery key (Settings → **Encryption**) or verify this device from another one
- For messages sent before you joined, ask a member to invite you again: clients that support encrypted history sharing (spec v1.19; Element Web since 1.12.18) send the room's keys with the invite. This only covers messages sent while the history setting was **Members (full history)** or **Anyone**.

### "Changes not saving"

- Check your power level
- Check your connection
- Look for an error message

---

*Next: [Clients Overview](../clients/overview) →*
