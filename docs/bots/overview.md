---
sidebar_position: 1
title: Bots & Integrations Overview
description: Kinds of Matrix bots, the maintained frameworks, and what changed for bots by 2026
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, maubot 0.6.0, Draupnir 3.2.0, Mjolnir 2.0.1, Hookshot 7.5.0"
---

# Bots & Integrations

A Matrix bot is an ordinary user account driven by a program, or a user inside an [application service](./building-bots#application-services) (appservice). Bots moderate rooms, relay notifications, and connect Matrix to other tools.

## Kinds of bot

| Kind | How it connects | Examples |
|------|-----------------|----------|
| Client bot | Logs in as a normal user and syncs | maubot plugins, nio or matrix-bot-sdk scripts |
| Appservice bot | Registered with the homeserver; receives events pushed to it and can act as many users | Hookshot, bridges, Draupnir in appservice mode |
| Moderation bot | Usually a client bot with moderator rights in protected rooms, sometimes plus a Synapse module | Draupnir, Meowlnir, Mjolnir |

## Maintained tools (2026-10)

| Tool | What it does | Release |
|------|--------------|---------|
| [maubot](./maubot) | Python plugin host with a web UI. The usual choice for general-purpose bots. | 0.6.0 (2025-11-17) |
| [Draupnir](./mjolnir#draupnir) | Moderation bot: policy lists, protections, server ACLs | 3.2.0 (2026-10-14) |
| [Meowlnir](./mjolnir#meowlnir) | Moderation bot from the mautrix author, tuned for Synapse | 0.2609.0 (2026-09-16) |
| [Mjolnir](./mjolnir#mjolnir) | The original moderation bot, still maintained by Matrix.org | 2.0.1 (2026-10-15) |
| [Hookshot](./hookshot) | GitHub, GitLab, Jira, OpenProject, Figma, RSS and webhooks | 7.5.0 (2026-09-22) |

Libraries for writing your own bot are compared in [SDKs](../sdks/overview) and [Building bots](./building-bots).

Retired: **Dimension** (integration manager, archived 2023-08), **go-neb** (archived 2023-06) and **NioBot** (archived; its author recommends maubot or mautrix-python). Don't start new deployments on them.

## Quick start

The shortest path to a working bot is a [maubot plugin](./maubot#writing-a-plugin). For a standalone script, see the [matrix-nio example](../sdks/matrix-python-sdk#a-minimal-bot). Both skip old messages on startup, so a restarted bot doesn't answer commands twice.

## What changed for bots by 2026

- **Encrypted rooms need cross-signing.** Since spec v1.18, clients SHOULD NOT send room keys to devices that aren't cross-signed and SHOULD NOT show their messages ([spec](https://spec.matrix.org/v1.19/client-server-api/#recommended-client-behaviour), MSC4153). Bots on libraries without cross-signing (matrix-nio, matrix-bot-sdk) will lose encrypted rooms as clients enforce this. See [E2EE and cross-signing](./building-bots#e2ee-and-cross-signing).
- **Tokens on MAS servers.** Servers using Matrix Authentication Service (matrix.org since 2025-04) issue short-lived, refreshing tokens to OAuth clients such as Element. Give a bot its own account and a personal access token instead of copying a token out of Element. See [Getting a bot account](./building-bots#getting-a-bot-account).
- **Room version 12.** Room creators have unlimited power. A bot at power level 100 cannot kick, ban or demote a creator ([room v12](https://spec.matrix.org/v1.19/rooms/v12/)).
- **Policy servers.** Spec v1.18 added policy servers, which check events for a room before they are accepted ([spec](https://spec.matrix.org/v1.19/client-server-api/#policy-servers)). They complement moderation bots. See [Moderation bots](./mjolnir#policy-servers).

## Hosted bots

| Service | What it offers |
|---------|----------------|
| [t2bot.io](https://t2bot.io/) | Free public bots and bridges run by a volunteer, including RSS (`@rss:t2bot.io`) and reminders (`@reminder:t2bot.io`). Check the site for current status. |
| [Asgard.Chat](https://asgard.chat/) | Hosted Meowlnir moderation |
| [Element Matrix services](https://element.io/matrix-services) and [etke.cc](https://etke.cc/) | Managed homeservers with integrations |

## Power levels for bots

| Bot | Needs |
|-----|-------|
| Posts messages or notices | The room's `events_default` (usually 0) |
| Edits room state (Hookshot connections) | `state_default` (usually 50) |
| Moderates | `ban`, `kick` and `redact` levels (usually 50), plus permission to send `m.room.server_acl` if it should apply server bans (100 in rooms Synapse creates) |

Give the lowest level that works. In room v12, no power level overrides a room creator.

:::warning
A moderation or appservice bot holds real power: it can ban, redact and, with Synapse admin rights, suspend or deactivate accounts. Keep its access token out of chat rooms and config repos, run it on a dedicated account, and restrict who can command it.
:::

---

*Continue: [Maubot](./maubot) | [Moderation bots](./mjolnir) | [Hookshot](./hookshot) | [Building bots](./building-bots)*
