---
sidebar_position: 1
title: Power User Tips
description: Formatting, shortcuts, slash commands, encryption hygiene and links in Matrix clients
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Element Web 1.12.32"
---

# Power User Tips

Practical tips for everyday Matrix use. Element-specific details were checked against Element Web v1.12.32; other clients differ.

## Formatting

### Markdown

Element Web parses Markdown with **CommonMark**, so only CommonMark syntax works:

```markdown
**bold** or __bold__
*italic* or _italic_
`inline code`
> quote
[link](https://example.org)
# Heading
- bullet list
1. numbered list
```

For a code block, put the triple backticks on their own lines:

````markdown
```
code block
```
````

CommonMark has no `~~strikethrough~~` and no tables, so Element Web sends those as plain text. Some other clients support them; behaviour is client-dependent.

### Inline HTML

Element Web's Markdown converter keeps only these HTML tags: `<sub>`, `<sup>`, `<del>`, `<s>`, `<u>` and `<br>`. Use `<del>` or `<s>` if you want strikethrough. Other tags, such as `<details>`, are not passed through.

To send raw HTML, use `/html <message>`. To send one message with no formatting, use `/plain <message>`.

### LaTeX maths

Element Web renders LaTeX only if you enable **Settings → Labs → Render LaTeX maths in messages** (where Labs is available).

### Text emoticons

| Command | Sends |
|---------|-------|
| `/shrug` | ¯\\\_(ツ)\_/¯ |
| `/tableflip` | (╯°□°）╯︵ ┻━┻ |
| `/unflip` | ┬──┬ ノ( ゜-゜ノ) |
| `/lenny` | ( ͡° ͜ʖ ͡°) |
| `/me waves` | *YourName waves* |

The emoticon commands put the emoticon **before** any text you add.

---

## Keyboard shortcuts (Element Web)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Jump to room search |
| `Ctrl/Cmd + Shift + U` | Upload a file |
| `Ctrl/Cmd + /` | Show all shortcuts |
| `Shift + Page Up` | Jump to oldest unread message |
| `↑` in an empty composer | Edit your previous message |
| `Alt + ↑ / ↓` | Previous / next room |
| `Alt + Shift + ↑ / ↓` | Previous / next unread room |
| `Esc` | Cancel reply or edit |

### Search dialog

`Ctrl/Cmd + K` opens a search dialog that matches your rooms and people. It has filter buttons for **People** and **Public rooms**. If you type a full alias such as `#room:example.org`, it offers to join that room.

### Message actions

- Hover a message to see the reaction, reply and thread buttons.
- **Reply** quotes the message in the main timeline. **Reply in thread** starts or continues a thread. They are separate actions.
- The **⋯** menu has the rest: edit, forward, pin, view source, and so on.

---

## Room commands

```
/invite @user:example.org [reason]
/remove @user:example.org [reason]     (alias /kick)
/ban @user:example.org [reason]
/unban @user:example.org

/topic New room topic
/roomname New name
/nick New Name                         Global display name (all rooms)
/myroomnick Work Me                    Display name in this room only
/myroomavatar [mxc://...]              Avatar in this room only
```

Don't wrap arguments in quotes: `/myroomnick "Work Me"` sets the name to `"Work Me"`, quotes included.

### Power levels

| Level | Usual role | Typical abilities |
|-------|------------|-------------------|
| 0 | Member | Send messages |
| 50 | Moderator | Kick, ban, redact others' messages |
| 100 | Admin | Change power levels and room settings |

In **room version 12** (the default for new rooms on current servers) the room **creators** have unlimited power and are not listed in the `users` map. A PL 100 admin cannot demote them. When you upgrade a room to v12, Element lets you name additional creators (`/upgraderoom 12 @other:example.org`).

You can adjust individual permissions in the room's settings, or edit the `m.room.power_levels` state event in `/devtools`. For example:

```json
{
  "users_default": 0,
  "events": {
    "m.room.name": 25,
    "m.room.message": 0,
    "m.room.redaction": 10
  },
  "users": {
    "@vip:example.org": 25
  }
}
```

That gives PL 25 the right to rename the room. (The JSON must be valid, so no comments.)

```
/op @user:example.org 75    Set power level 75 (default 50)
/deop @user:example.org     Reset to the room default
```

---

## Spaces

- **Suggested rooms** are highlighted to people who join the space.
- Spaces can contain other spaces.
- A room can belong to several spaces.
- Leaving a space does not leave its rooms (Element asks what to do).
- Spaces do **not** pass bans down to their rooms. For bans across many rooms, use a policy list with a moderation bot such as [Draupnir](./power-tools#draupnir).

---

## Encryption hygiene

### Recovery and key storage

In Element Web, go to **Settings → Encryption** and set up recovery. Save the recovery key somewhere offline, such as a password manager or on paper. Without it, a new device can only read old messages if another of your devices is online to verify it.

### Verify your devices

Verify each new login from an existing device (emoji comparison or QR code). Element marks unverified sessions with a warning.

Element Web also has a Labs option, **Exclude insecure devices when sending/receiving messages**. As of v1.12.32 it is off by default.

### Review sessions

**Settings → Devices** lists every logged-in session. Sign out the ones you don't recognise or no longer use.

---

## Finding rooms

- **Explore rooms** in Element lists public rooms on your server or another server you choose.
- A space's page lists its rooms.
- [matrixrooms.info](https://matrixrooms.info) is a search engine for public rooms across many servers.

Matrix search has no `from:` or `before:` operators. Element searches message text in the current room or across all rooms. Encrypted rooms can only be searched in Element Desktop, which keeps a local index.

---

## Notifications

| Room setting | Effect |
|--------------|--------|
| All messages | Notify for everything |
| Mentions and keywords | Only @mentions and your keywords |
| Mute | No notifications |

Keywords are set in **Settings → Notifications**.

- **Mark as read**: right-click (or long-press) the room.
- **Mark as unread**: available in Element Web, FluffyChat and others; it is in the spec since v1.12.
- **Favourites** and **Low Priority** sort your room list.

---

## When Element Web gets slow

1. **Settings → Help & About → Clear cache and reload**.
2. Leave large rooms you no longer read.
3. Turn off URL previews in busy rooms.

Element X (mobile) uses sliding sync and starts much faster than the classic mobile apps.

---

## Developer tools

Type `/devtools` in a room to open Element's developer tools. You can explore room state, account data and send custom events. To see an event's raw JSON, use **⋯ → View source** on a message.

### Access token

**Settings → Help & About → Access Token** reveals your token.

:::warning
An access token gives full access to your account. Don't paste it into untrusted tools or share it. Log the session out to revoke it.
:::

### API calls with curl

```bash
# Your profile
curl -H "Authorization: Bearer $TOKEN" \
  "https://matrix.example.org/_matrix/client/v3/profile/@you:example.org"

# Send a message (room ID URL-encoded: ! -> %21, : -> %3A)
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"msgtype":"m.text","body":"Hello from the API"}' \
  "https://matrix.example.org/_matrix/client/v3/rooms/%21abc%3Aexample.org/send/m.room.message/$(date +%s%N)"
```

The last path segment is a transaction ID. It must be unique per access token.

---

## Multiple accounts

| Client | Multi-account |
|--------|---------------|
| Element Web / Desktop | No. Use separate browser profiles, or a separate Desktop profile (`--profile`) |
| FluffyChat | Yes |
| SchildiChat Revenge | Yes |

---

## Privacy settings (Element Web)

In **Settings → Preferences**:

- **Send read receipts**: when off, Element sends private read receipts (`m.read.private`), so your server still knows what you have read but other users don't.
- **Show read receipts sent by other users**: a separate display setting.
- **Send typing notifications**: turn it off to hide "typing…".

Presence ("online", "last seen") depends on the server; some servers turn it off.

---

## Links

### matrix: URIs

The `matrix:` scheme drops the sigil (`#`, `!`, `@`, `$`):

```
matrix:r/room:example.org                               Room by alias
matrix:roomid/abc:example.org?via=example.org           Room by ID
matrix:roomid/abc:example.org/e/eventid?via=example.org Specific event
matrix:u/alice:example.org?action=chat                  Chat with a user
```

### matrix.to links

```
https://matrix.to/#/#room:example.org
https://matrix.to/#/@alice:example.org
https://matrix.to/#/!abc:example.org/$eventid?via=example.org
```

Always add `?via=` to links that use a room ID. It tells the client which server to join through. Room IDs in v12 rooms have no server part, so `via` is the only routing hint.

---

## Public rooms worth joining

```
#matrix:matrix.org          Matrix discussion
#matrix-dev:matrix.org      Client and server developers
#synapse:matrix.org         Synapse admins
#element-web:matrix.org     Element Web
#twim:matrix.org            This Week in Matrix
```
