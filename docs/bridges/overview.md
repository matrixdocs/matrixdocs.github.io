---
sidebar_position: 1
title: Matrix Bridges Overview
description: Connect Matrix to other messaging platforms
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, mautrix-go v0.32.0, mautrix bridges v26.10, mautrix-discord v0.7.7, Heisenbridge v1.15.4"
---

# Matrix Bridges

A bridge is a program that connects Matrix rooms to another chat network, so messages flow both ways.

```mermaid
flowchart LR
    Matrix["Matrix<br/>Room"] <--> Bridge["Bridge"] <--> Discord["Discord<br/>Channel"]
```

Most bridges are [application services](https://spec.matrix.org/v1.19/application-service-api/). The homeserver registers them, pushes events to them over HTTP, and lets them control a namespace of "ghost" users such as `@telegram_12345:example.com`.

:::warning Bridges hold real power
A bridge's appservice token can act as any user in its namespace, and a puppeting bridge stores your login session for the remote network. The bridge, and whoever runs it, sees every bridged message in plaintext, even in encrypted rooms. Only use bridges run by someone you trust. Keep `as_token`, `hs_token` and double-puppet tokens secret, and limit who may log in with the `permissions` section of the bridge config.
:::

## Bridge types

### Puppeting

Each remote user appears in Matrix as a ghost user. Each Matrix user who logs in to the bridge sends messages through their own remote account.

```
Discord user Bob    →  [bridge]  →  @discord_123:example.com in Matrix
Matrix user Alice   →  [bridge]  →  Alice's own Discord account
```

Reactions, edits, replies, typing and read receipts usually work, depending on the network.

### Double puppeting

With double puppeting, messages you send from the native app (your phone, for example) appear in Matrix from your real Matrix account instead of a ghost. The bridge can also accept invites for you and sync mute, favourite and low-priority state. mautrix recommends it whenever possible ([docs](https://docs.mau.fi/bridges/general/double-puppeting.html)).

The supported automatic method is a second appservice registration with an empty `url`; the bridge uses its `as_token` to act as your users. The older "shared secret" methods were removed in the bridgev2 ("megabridge") rewrites. In a bridgev2 config it looks like this:

```yaml title="config.yaml (bridgev2 bridges)"
# Key names from mautrix/go v0.32.0 bridgev2/matrix/mxmain/example-config.yaml
double_puppet:
  # Only for OTHER servers; don't list the server the bridge is on.
  servers: {}
  secrets:
    example.com: "as_token:<as_token from your doublepuppet registration>"
```

Follow the [double puppeting guide](https://docs.mau.fi/bridges/general/double-puppeting.html) to create the registration. The legacy mautrix-discord bridge uses `bridge.login_shared_secret_map` with the same `as_token:` value.

### Relay mode

Users who haven't logged in to the bridge can still talk through a designated "relay" login; their messages appear on the remote side prefixed with their name. In bridgev2 bridges you set `bridge.relay.enabled: true`, log in with a dedicated Matrix account, and run `set-relay` in the room ([relay mode docs](https://docs.mau.fi/bridges/general/relay-mode.html)). Discord uses webhooks instead (see the [Discord page](./discord)).

### Portal and plumbed rooms

| Type | Description | Typical use |
|------|-------------|-------------|
| **Portal** | Room the bridge creates for each remote chat | Personal use, 1:1 mapping |
| **Plumbed** | Existing Matrix room linked to a remote chat | Communities |

## Which bridge to use (as of 2026-10-18)

Versions are the latest GitHub release. mautrix bridges have used calendar versions since Oct 2025: the display version is `vYY.MM` (e.g. v26.10) and the git tag is `v0.YYMM.patch` (e.g. `v0.2610.0`). They release monthly around the 16th, and only the latest release is supported ([release policy](https://docs.mau.fi/bridges/general/releases.html)).

| Network | Bridge | Latest release | Status |
|---------|--------|----------------|--------|
| WhatsApp | [mautrix-whatsapp](./whatsapp) | v26.10 (2026-10-16) | Active, bridgev2 |
| Signal | [mautrix-signal](./signal) | v26.10 | Active, bridgev2 |
| Telegram | [mautrix-telegram](./telegram) | v26.10 | Active; rewritten in Go (bridgev2) in v26.04 |
| Slack | [mautrix-slack](./slack) | v26.10 | Active, bridgev2 |
| Discord | [mautrix-discord](./discord) | v0.7.7 (2026-08-16) | Active, still the legacy architecture |
| Messenger / Instagram | [mautrix-meta](https://github.com/mautrix/meta) | v26.10 | Active; Instagram is a separate binary since Jul 2026 |
| Google Messages | [mautrix-gmessages](https://github.com/mautrix/gmessages) | v26.10 | Active |
| Google Voice | [mautrix-gvoice](https://github.com/mautrix/gvoice) | v26.05 | Active |
| X / Twitter | [mautrix-twitter](https://github.com/mautrix/twitter) | v26.09 | Active |
| LinkedIn | [mautrix-linkedin](https://github.com/mautrix/linkedin) | v26.09 | Active (replaced the archived beeper/linkedin) |
| Bluesky | [mautrix-bluesky](https://github.com/mautrix/bluesky) | v25.10 (2025-10-16) | DMs only; no release in a year |
| Zulip | [mautrix-zulip](https://github.com/mautrix/zulip) | v25.11 | Early; Matrix→Zulip is plain text only |
| IRC | [Heisenbridge](./irc) | v1.15.4 (2025-10-04) | Works; slow maintenance |
| IRC | [matrix-appservice-irc](https://github.com/matrix-org/matrix-appservice-irc) | 4.0.0 (2025-10-24) | Maintained; suited to large network-wide bridges |
| IRC | [mautrix-irc](https://github.com/mautrix/irc) | no release | Very early; its README says switching from Heisenbridge is not yet recommended |
| iMessage | [mautrix-imessage](https://github.com/mautrix/imessage) | no GitHub releases | Legacy; self-host only, needs a Mac, jailbroken iOS or Android SMS |
| Google Chat | [mautrix-googlechat](https://github.com/mautrix/googlechat) | v0.5.2 (2024-07-16) | Python, no release for two years; treat as unmaintained |
| GitHub, GitLab, JIRA, webhooks | [Hookshot](../bots/hookshot) | 7.5.0 (2026-09-22) | Maintained |

### Archived or dead (do not deploy)

| Project | Status |
|---------|--------|
| matrix-appservice-slack | Archived; the matrix.org instance was shut down 2026-01-14 ([announcement](https://matrix.org/blog/2025/11/removing-slack-bridge/)). Use mautrix-slack. |
| mautrix-facebook, mautrix-instagram (Python) | Archived in 2024; replaced by mautrix-meta. |
| beeper/linkedin (Python) | Archived; replaced by mautrix-linkedin. |
| signald | Does not work with current Signal servers; mautrix-signal dropped it in Feb 2024. |
| matrix-appservice-discord | No release since v4.0.0 (2023-09); effectively unmaintained. Use mautrix-discord. |

:::info Coming next
mautrix-discord is being ported to bridgev2 on the [`megadiscord` branch](https://github.com/mautrix/discord/tree/megadiscord); there is no release yet. When it ships, its config will move to the bridgev2 layout described below. A bridgev2 port of mautrix-googlechat is also pending ([mau.fi, Dec 2025](https://mau.fi/blog/2025-12-mautrix-release/)).
:::

## Hosted bridges

- **[Beeper](https://www.beeper.com/)** runs the mautrix bridges as a service; Automattic has owned it since 2024. [bridge-manager (`bbctl`)](https://github.com/beeper/bridge-manager) lets you self-host a bridge against a Beeper account.
- Some managed Matrix hosts offer bridges as an add-on; check with your provider.

If your account is on a homeserver you don't run (matrix.org, for example), you cannot register an appservice there. Use a hosted bridge or run your own homeserver.

## Self-hosting a mautrix bridge

The authoritative instructions are [docs.mau.fi: Go bridge setup](https://docs.mau.fi/bridges/go/setup.html) and [Docker setup](https://docs.mau.fi/bridges/general/docker-setup.html). In outline:

1. **Requirements:** a homeserver with appservice support, and PostgreSQL 16 or newer, with a separate database for each bridge (sharing the Postgres server is fine). Synapse is the best-supported homeserver; mautrix calls Dendrite "not a supported environment".
2. **Get the binary** from the bridge's GitHub releases (or build with `./build.sh`), or use the Docker image `dock.mau.dev/mautrix/<bridge>:<version>`. Pin a release tag: `:latest` follows the main branch, not the latest release.
3. **Generate a config:** `./mautrix-<bridge> -e` writes an example `config.yaml`. Discord is legacy and has no `-e`, so copy its `example-config.yaml` instead. The Docker image writes the config on first start.
4. **Edit the config** (see below).
5. **Generate the registration:** `./mautrix-<bridge> -g` writes `registration.yaml`. Don't hand-write it, and regenerate it if you change the appservice settings.
6. **Register it** with the homeserver. For Synapse, add the file to `app_service_config_files` in `homeserver.yaml` and restart Synapse ([guide](https://docs.mau.fi/bridges/general/registering-appservices.html)).
7. **Run the bridge.** Then open a DM with the bridge bot (e.g. `@whatsappbot:example.com`) and follow the bridge's authentication page.

```yaml title="docker-compose.yml"
services:
  mautrix-whatsapp:
    image: dock.mau.dev/mautrix/whatsapp:v26.10
    restart: unless-stopped
    volumes:
      - ./mautrix-whatsapp:/data
```

Inside Docker, `localhost` is the container itself. Point `homeserver.address` and `appservice.address` at container names on a shared network (e.g. `http://synapse:8008` and `http://mautrix-whatsapp:29318`).

### The bridgev2 config layout

Every mautrix bridge except Discord and iMessage now uses the bridgev2 layout. The shared sections come from mautrix-go, and network-specific settings live under `network:`. These are the keys most people change:

```yaml title="config.yaml (bridgev2)"
# Key names from mautrix/go v0.32.0 bridgev2/matrix/mxmain/example-config.yaml
# (used by the v26.10 bridges). Generate the full file with -e.
homeserver:
  address: http://synapse:8008      # how the bridge reaches the homeserver
  domain: example.com               # your server name
appservice:
  address: http://mautrix-whatsapp:29318   # how the homeserver reaches the bridge
database:
  type: postgres
  uri: postgres://mautrix:password@postgres/mautrix_whatsapp?sslmode=disable
bridge:
  permissions:
    "example.com": user             # relay | commands | user | admin
    "@you:example.com": admin
network:
  # bridge-specific options; see each bridge's pkg/connector/example-config.yaml
```

The top-level `double_puppet`, `encryption` and `backfill` sections are shared by all bridgev2 bridges too. The setup guide links pregenerated example configs for every release.

## Encryption (end-to-bridge)

Bridges can join encrypted Matrix rooms. Messages are then encrypted between your client and the bridge, but the bridge decrypts them to forward them. This does not give you end-to-end encryption across the bridge.

```yaml title="config.yaml (bridgev2; legacy bridges put this under bridge:)"
# Key names from mautrix/go v0.32.0 bridgev2/matrix/mxmain/example-config.yaml
encryption:
  allow: true      # join encrypted rooms
  default: true    # enable encryption in new portals; needed if your server forces encryption
  msc4190: true    # needed if your homeserver uses MAS (next-gen auth)
  self_sign: true  # cross-sign the bridge bot so strict clients accept it
```

- The Docker images and release binaries include encryption support.
- **MSC4190** (appservice device management without the legacy login API) is in spec v1.17. Since Synapse 1.141 it works without a registration opt-in flag.
- **`self_sign`** matters because clients are starting to exclude devices that are not cross-signed (MSC4153, recommended in spec v1.18).
- `encryption.appservice: true` (MSC3202 instead of `/sync`) is experimental. Leave it off unless the mautrix docs tell you otherwise.

Details: [end-to-bridge encryption](https://docs.mau.fi/bridges/general/end-to-bridge-encryption.html).

## Commands (bridgev2)

Talk to the bridge bot in a DM (the "management room", where no prefix is needed), or use the bridge's prefix elsewhere, e.g. `!wa`, `!signal`, `!tg` or `!slack`. Run `help` for the full list. Common commands, from `mautrix/go` v0.32.0 `bridgev2/commands/`:

| Command | Purpose |
|---------|---------|
| `login [flow]` | Log in to the remote network |
| `logout`, `list-logins`, `relogin` | Manage logins |
| `start-chat` / `pm` | Start a DM with a remote user |
| `create-group` / `create` | Create a remote group for this room |
| `bridge [login ID] <chat ID>`, `unbridge` | Link or unlink an existing Matrix room |
| `set-relay`, `unset-relay` | Use your login as the relay for this room |
| `sync-portal`, `delete-portal` | Resync or delete the current portal |
| `search`, `resolve-identifier` | Find remote users |

bridgev2 has no generic `ping` or `sync` command.

## Troubleshooting

- **The bot doesn't respond to invites.** The homeserver probably can't reach the bridge. Check `appservice.address` (and the `url` in `registration.yaml`), check that the registration is listed in `app_service_config_files`, restart the homeserver, and look for transaction errors in its log. See [troubleshooting](https://docs.mau.fi/bridges/general/troubleshooting.html).
- **"Bridge has not been configured to support encryption".** Set `encryption.allow: true`. If your homeserver forces encryption on new rooms, also set `encryption.default: true`.
- **Backfill.** Matrix can't insert messages into the past of an existing room, so initial history is added when a portal is created. Configure backfill before logging in. bridgev2 also has `backfill.max_catchup_messages` for messages missed while the bridge was down.
- **Typing and read receipts.** These need ephemeral events pushed to the appservice: `receive_ephemeral: true` in the registration (spec v1.13). mautrix writes it into the registration when `appservice.ephemeral_events: true`.

## Resources

- [docs.mau.fi bridges](https://docs.mau.fi/bridges/) and the [mautrix repositories](https://github.com/mautrix)
- [Matrix.org bridge listing](https://matrix.org/ecosystem/bridges/)
- Support rooms: [#maunium:maunium.net](https://matrix.to/#/#maunium:maunium.net), the per-bridge rooms (e.g. [#whatsapp:maunium.net](https://matrix.to/#/#whatsapp:maunium.net)), [#heisenbridge:vi.fi](https://matrix.to/#/#heisenbridge:vi.fi) and [#bridges:matrix.org](https://matrix.to/#/#bridges:matrix.org)
- [mautrix-manager](https://github.com/mautrix/manager), a desktop app that automates logins that need browser cookies or passkeys

### Interoperability under the EU DMA

The EU Digital Markets Act requires designated messengers to open up to third parties. WhatsApp launched third-party chats in the EU in Nov 2025, with BirdyChat and Haiket as the first partners and no group chats yet ([Meta, 2025-11](https://about.fb.com/news/2025/11/messaging-interoperability-whatsapp-enables-third-party-chats-for-users-in-europe/)). No Matrix-based WhatsApp interop has shipped; the bridges above use reverse-engineered client APIs. See also the IETF [MIMI working group](https://datatracker.ietf.org/wg/mimi/about/).

### Related

- [Matrix and Solid: a design sketch](./solid) (a proposal, not software)
