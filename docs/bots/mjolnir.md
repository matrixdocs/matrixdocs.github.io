---
sidebar_position: 3
title: Moderation Bots (Draupnir, Mjolnir, Meowlnir)
description: Draupnir, Mjolnir and Meowlnir moderation bots, policy lists and policy servers
last_update:
  date: 2026-10-18
verified_with: "Draupnir 3.2.0, Mjolnir 2.0.1, Meowlnir 0.2609.0, synapse-http-antispam 0.5.1, spec v1.19"
---

# Moderation bots

Matrix moderation bots watch a set of rooms, apply shared **policy lists** (ban lists published as Matrix rooms), and give moderators commands for bans, redactions and server ACLs. Three are maintained as of 2026-10:

| Bot | Language | Release | Notes |
|-----|----------|---------|-------|
| [Draupnir](#draupnir) | TypeScript | 3.2.0 (2026-10-14) | Most features; started as a Mjolnir fork. The default choice. |
| [Mjolnir](#mjolnir) | TypeScript | 2.0.1 (2026-10-15) | The original, still maintained by Matrix.org |
| [Meowlnir](#meowlnir) | Go | 0.2609.0 (2026-09-16) | Not a fork; tuned for Synapse; can also act as a policy server |

All three read the same policy event types (`m.policy.rule.user`, `m.policy.rule.room`, `m.policy.rule.server`), so policy lists are shared between them.

:::warning
A moderation bot can ban, kick and redact in every protected room. With Synapse admin rights it can also suspend, deactivate and take down rooms server-wide. Use a dedicated account, keep the management room small and trusted (anyone in it can command the bot), and keep the access token secret.
:::

## Permissions in protected rooms

The bot needs the room's `ban`, `kick` and `redact` power levels (50 by default) and, to apply server bans, permission to send `m.room.server_acl`. Synapse sets that to 100 in the rooms it creates, so a bot that should apply server ACLs usually needs power level 100. In room version 12, room creators have unlimited power: no bot can ban or demote a creator ([room v12](https://spec.matrix.org/v1.19/rooms/v12/)).

## Draupnir

Docs: [the-draupnir-project.github.io/draupnir-documentation](https://the-draupnir-project.github.io/draupnir-documentation/). Support: [#draupnir:matrix.org](https://matrix.to/#/#draupnir:matrix.org).

Draupnir 3.0.0 (2026-04-02) made breaking changes: the repository is now a monorepo, Node.js 24 is required, and the `--draupnir-config` argument is mandatory. Read the [release notes](https://github.com/the-draupnir-project/Draupnir/releases/tag/v3.0.0) before upgrading from 2.x.

### Setup outline

1. Create a Matrix account for the bot and get an access token.
2. Copy [`config/default.yaml`](https://github.com/the-draupnir-project/Draupnir/blob/v3.2.0/config/default.yaml) to your data directory and set at least `homeserverUrl`, `rawHomeserverUrl`, `accessToken` and `initialManager` (your own user ID). Draupnir creates a management room and invites you.
3. Run it. The Draupnir docs name GHCR (`ghcr.io/the-draupnir-project/draupnir:v3.2.0`) as the recommended registry and Docker Hub (`gnuxie/draupnir`) as the legacy mirror; both carry the same version tags. With the Docker Hub image:

```bash
docker run --rm -it --name=draupnir \
  -v /var/lib/draupnir:/data \
  gnuxie/draupnir:v3.2.0 \
  bot --draupnir-config /data/config/production.yaml
```

The first argument `bot` selects bot mode. Draupnir can also run as an appservice that provisions bots for several communities; see the appservice section of the [Draupnir docs](https://the-draupnir-project.github.io/draupnir-documentation/). For other install methods, see the [setup guide](https://the-draupnir-project.github.io/draupnir-documentation/bot/setup).

Leave the management room **unencrypted**; the Draupnir docs advise against encrypting it.

### Commands

Commands go in the management room, prefixed with `!draupnir`. These come from Draupnir 3.2.0's command table; run `!draupnir help` for the full list.

| Command | Purpose |
|---------|---------|
| `!draupnir list create <shortcode> <alias-localpart>` | Create a policy list room |
| `!draupnir watch <room>` / `unwatch <room>` | Subscribe to someone else's policy list |
| `!draupnir rooms add <room>` / `rooms remove <room>` | Protect or unprotect a room |
| `!draupnir ban <user-room-or-server> [list] [reason]` | Add a ban policy; a server name bans the whole server |
| `!draupnir unban <entity>` | Remove a ban policy |
| `!draupnir kick <user> [reason] --room <room>` | Kick a user (from all protected rooms if `--room` is omitted) |
| `!draupnir redact <user-or-event> [reason] --room <room> --limit <n>` | Redact messages; keywords are optional |
| `!draupnir takedown <entity> [list]` | Add a takedown policy (rooms, users, servers) |
| `!draupnir protections` / `protections enable <name>` / `protections disable <name>` | List and toggle protections |
| `!draupnir status` | Show status |

Server-admin commands such as `suspend`, `unrestrict` and `deactivate` need the bot account to be a Synapse admin.

### Server-wide protection with synapse-http-antispam

Draupnir can block invites and joins across a whole Synapse server through the [synapse-http-antispam](https://github.com/maunium/synapse-http-antispam) module (latest release 0.5.1, 2026-08-13). Install the `synapse-http-antispam` package into Synapse's Python environment as its README describes, then configure it in `homeserver.yaml`. This block follows the module's README and the [Draupnir guide](https://the-draupnir-project.github.io/draupnir-documentation/bot/synapse-http-antispam):

```yaml title="homeserver.yaml"
modules:
  - module: synapse_http_antispam.HTTPAntispam
    config:
      base_url: http://draupnir:8080/api/1/spam_check
      authorization: LONG_RANDOM_SECRET   # must match Draupnir's web.synapseHTTPAntispam.authorization
      do_ping: true
      enabled_callbacks:
        - user_may_invite
        - user_may_join_room
      fail_open:
        user_may_invite: true
        user_may_join_room: true
```

And in Draupnir's config:

```yaml title="Draupnir production.yaml (excerpt)"
web:
  enabled: true
  port: 8080
  address: 0.0.0.0   # reachable by Synapse only; don't publish this port
  synapseHTTPAntispam:
    enabled: true
    authorization: LONG_RANDOM_SECRET
```

Why each part matters:

- Without `enabled_callbacks`, the module calls Draupnir for **every** spam-check callback, and Draupnir implements only these two.
- The module **fails closed** by default: if Draupnir is down, invites and joins are rejected server-wide. `fail_open` keeps the server usable.
- `authorization` is sent as a bearer token so only Synapse can call the endpoint.

## Mjolnir

[Mjolnir](https://github.com/matrix-org/mjolnir) is the original Matrix.org moderation bot. It had releases through 2024–2026 and 2.0.0 shipped on 2026-10-15. Version 2 removed the multi-tenant "Mjolnir for all" appservice and batches admin redactions.

- Commands use the `!mjolnir` prefix. The README's quick start is `!mjolnir list create COC code-of-conduct-ban-list`, then `!mjolnir default COC`.
- Image: `matrixdotorg/mjolnir:v2.0.1`.
- Configuration: [`config/default.yaml`](https://github.com/matrix-org/mjolnir/blob/v2.0.1/config/default.yaml). Protections are enabled by command, not listed in config. Authority comes from membership of the management room; there is no `admins` list.
- [Setup docs](https://github.com/matrix-org/mjolnir/blob/v2.0.1/docs/setup.md) and [moderator's guide](https://github.com/matrix-org/mjolnir/blob/v2.0.1/docs/moderators.md).

Moving from Mjolnir to Draupnir is possible (Draupnir reads Mjolnir's policy lists), but the configs differ. Follow the Draupnir setup guide rather than reusing a Mjolnir config as is.

## Meowlnir

[Meowlnir](https://github.com/maunium/meowlnir) is a moderation bot written in Go by the mautrix author. It is optimised for Synapse and uses the same synapse-http-antispam module for server-wide invite blocking. It can also act as a policy server. A hosted version is offered at [Asgard.Chat](https://asgard.chat/).

Documentation: [docs.mau.fi/meowlnir](https://docs.mau.fi/meowlnir/) (setup, configuration, [invite blocking](https://docs.mau.fi/meowlnir/invite-blocking.html)).

## Policy servers

Spec v1.18 added **policy servers** (MSC4284). A room can name a policy server in its state, and homeservers ask it to sign events before accepting them, so spam can be refused before it reaches the room. See the spec: [client-server](https://spec.matrix.org/v1.19/client-server-api/#policy-servers) and [server-server](https://spec.matrix.org/v1.19/server-server-api/#policy-servers).

The Matrix.org Foundation's implementation is [policyserv](https://github.com/matrix-org/policyserv) (1.7.0, 2026-06-11). Policy servers work alongside moderation bots, not instead of them.

:::info Coming next
policyserv 1.8.0 is at release-candidate stage, and spec `main` adds an `m.policy` room type for policy-list rooms (MSC3784), expected in a release after v1.19. Sources: [policyserv releases](https://github.com/matrix-org/policyserv/releases), [matrix-spec](https://github.com/matrix-org/matrix-spec).
:::

## Resources

- [Draupnir documentation](https://the-draupnir-project.github.io/draupnir-documentation/)
- [Mjolnir on GitHub](https://github.com/matrix-org/mjolnir)
- [Meowlnir documentation](https://docs.mau.fi/meowlnir/)
- [Moderation in the spec: policy lists](https://spec.matrix.org/v1.19/client-server-api/#moderation-policy-lists)
