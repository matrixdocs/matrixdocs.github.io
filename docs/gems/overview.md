---
sidebar_position: 1
title: Hidden Gems Overview
description: Lesser-known Matrix features, admin tools and automation, checked against current releases
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, Element Web 1.12.32"
---

# Hidden Gems

This section covers tools and features that many Matrix users never come across: admin CLIs, bots, keyboard shortcuts, smaller clients and server tuning. Commands were checked against each tool's source or README as of 2026-10. Archived or dormant projects are labelled as such.

## Where to start

| Goal | Page |
|------|------|
| Shortcuts, formatting, slash commands | [Power User Tips](./power-user-tips) |
| Admin CLIs, moderation bots, CLI clients | [Power Tools](./power-tools) |
| Webhooks, CI notifications, reminders | [Automation](./automation) |
| Clients beyond Element | [Lesser-Known Clients](./lesser-known-clients) |
| Widgets, calls, image packs, room versions | [Advanced Features](./advanced-features) |
| Running a homeserver | [Self-Hosting Tips](./self-hosting-tips) |

---

## Tools at a glance

### For server admins

| Tool | What it does | Status (2026-10) |
|------|--------------|------------------|
| [synadm](https://codeberg.org/synadm/synadm) | Command-line client for the Synapse admin API | v0.49.2; developed on Codeberg (the old GitHub repo is archived) |
| [synapse-admin](https://github.com/Awesome-Technologies/synapse-admin) | Web admin UI for Synapse | Maintained |
| [Ketesa](https://github.com/etkecc/ketesa) | etke.cc's fork of synapse-admin (formerly `etkecc/synapse-admin`) | Maintained |
| [Draupnir](https://github.com/the-draupnir-project/Draupnir) | Moderation bot built on policy lists | v3.2.0 (2026-10-14) |
| [Meowlnir](https://github.com/maunium/meowlnir) | Moderation bot written in Go, aimed at Synapse | Maintained |

### For automation

| Tool | What it does |
|------|--------------|
| [Maubot](https://github.com/maubot/maubot) | Plugin-based bot system with a web management UI |
| [Hookshot](https://github.com/matrix-org/matrix-hookshot) | GitHub, GitLab, Jira, RSS/Atom, generic webhooks, OpenProject, Figma |
| [matrix-commander](https://github.com/8go/matrix-commander) | Send and receive Matrix messages from shell scripts |
| [gomuks](https://github.com/gomuks/gomuks) | Client with a Go backend; the web frontend is the main one, the terminal frontend is experimental |

---

## Element Web shortcuts worth knowing

Checked against Element Web v1.12.32 (`KeyboardShortcuts.ts`):

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Jump to room search |
| `↑` in an empty composer | Edit your previous message |
| `Ctrl/Cmd + Shift + U` | Upload a file |
| `Ctrl/Cmd + /` | Open the keyboard shortcuts list |

### Slash commands

```
/me <message>          Send an emote ("* Alice waves")
/topic <topic>         Set the room topic
/invite <user-id>      Invite a user
/op <user-id> 50       Set a user's power level (50 if omitted)
/devtools              Open developer tools for the current room
/shrug <message>       Prefix the message with ¯\_(ツ)_/¯
```

Type `/help` in Element Web to list every command your version supports.

---

## Recent features

### Threads and polls
Threads are standard in Element Web, Element X and FluffyChat (since v2.3.0). Most major clients support polls.

### Element X and next-generation auth
Element X uses simplified sliding sync, which is built into Synapse and on by default, so no proxy is needed. Element recommends pairing Element X with [Matrix Authentication Service](https://github.com/element-hq/matrix-authentication-service) (MAS), the OIDC-based "next-gen auth" that matrix.org moved to in 2025. See [Self-Hosting Tips](./self-hosting-tips).

### Room version 12
Room version 12 is the spec's recommended default (spec v1.19) and Synapse's default since 1.162. Room creators now have unlimited power. See [Advanced Features](./advanced-features#room-versions).

### Image packs
Custom emoji and sticker packs entered the spec in v1.19 (`m.room.image_pack`). See [Advanced Features](./advanced-features#custom-emoji-and-stickers).

### Sticky events (experimental)
[MSC4354](https://github.com/matrix-org/matrix-spec-proposals/pull/4354) proposes a new kind of event for temporary per-user data, such as call membership or live location. These events are not room state: servers keep delivering them to room members until a timeout, without adding them to the room's state. MSC4354 is an open proposal and is not in spec v1.19. Synapse supports it only behind `experimental_features.msc4354_enabled`, which is off by default.

### Excluding unverified devices (still opt-in)
Element Web can stop sharing keys with, and decrypting messages from, devices their owners have not verified. As of v1.12.32 this is still a Labs feature ("Exclude insecure devices when sending/receiving messages") and is off by default.

---

## Labs features in Element Web

These appear under **Settings → Labs** only if the deployment sets `show_labs_settings` in `config.json` or you have turned on developer mode. As of v1.12.32:

| Feature | What it does |
|---------|--------------|
| Video rooms | Rooms with an always-on video call |
| Rich text editor | WYSIWYG composer |
| Render LaTeX maths in messages | Renders maths written in LaTeX |
| Scroll to date | Adds `/jumptodate` and date headers |
| Exclude insecure devices | See above |

Threads and pinned messages are no longer Labs features.

---

## Client highlights

- **SchildiChat**: the original Element-based apps are no longer maintained. Development moved to [SchildiChat Next](https://github.com/SchildiChat/schildichat-android-next) (Android, based on Element X) and [SchildiChat Revenge](https://github.com/SchildiChat/schildi-revenge) (desktop and Android, beta).
- **FluffyChat**: voice messages, location sharing, polls and threads; releases roughly monthly.
- **Cinny**: a web and desktop client with a simple interface and native custom emoji packs.
- **gomuks**: the web frontend is ready for daily use; `archivemuks` exports room history.

"Mark as unread" is in the spec (v1.12) and in Element Web, so it is no longer unique to SchildiChat.

---

## Quick automation ideas

Send an alert from a script. Put the room ID in single quotes so the shell leaves the `!` alone:

```bash
matrix-commander -m "Server alert" -r '!alerts:example.org'
```

Subscribe a room to an RSS feed with Hookshot:

```
!hookshot feed https://blog.example.com/rss
```

Connect a GitHub repository with Hookshot (the full URL is required):

```
!hookshot github repo https://github.com/owner/repo
```

Set a reminder with the [maubot reminder plugin](https://github.com/maubot/reminder):

```
!remind tomorrow at 9:00 standup meeting
```

More in [Automation](./automation).
