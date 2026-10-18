---
sidebar_position: 2
title: Discord Bridge
description: Bridge Matrix to Discord with mautrix-discord
last_update:
  date: 2026-10-18
verified_with: "mautrix-discord v0.7.7 (example-config.yaml, commands.go), docs.mau.fi"
---

# Discord Bridge

[mautrix-discord](https://github.com/mautrix/discord) is a puppeting bridge between Matrix and Discord, written in Go. As of 2026-10-18 the latest release is **v0.7.7 (2026-08-16)**. Unlike the other mautrix bridges it still uses the **legacy** architecture, so its config keeps settings under `bridge:` rather than the bridgev2 layout described in the [overview](./overview).

:::info Coming next
A bridgev2 rewrite is in progress on the [`megadiscord` branch](https://github.com/mautrix/discord/tree/megadiscord) and has not been released. When it ships, config keys will move (e.g. `bridge.encryption` → top-level `encryption`) and commands will change to the bridgev2 set.
:::

:::warning
Logging in with a user account gives the bridge your Discord token, and the mautrix docs note that "Discord may ban users who are too suspicious". A bot login avoids this risk. The bridge `admin` permission level adds administration tools, so grant it narrowly.
:::

Full documentation: [docs.mau.fi/bridges/go/discord](https://docs.mau.fi/bridges/go/discord/).

## What it does

- DMs, group DMs and guild (server) channels, including threads
- Formatted text, media, replies, threads, deletions and reactions in both directions
- Discord custom emoji and embeds into Matrix (custom emoji from Matrix to Discord are not supported yet)
- Relaying for Matrix users who haven't logged in, through Discord webhooks
- Following room upgrades (tombstones), added in v0.7.6 (2026-02). New rooms are created as room version 11 (v0.7.5 hardcodes it to avoid v12).
- Backfill, disabled by default (the limits are 0)

See the [CHANGELOG](https://github.com/mautrix/discord/blob/main/CHANGELOG.md) for details.

## Setup with Docker

Follow [docs.mau.fi: Docker setup](https://docs.mau.fi/bridges/general/docker-setup.html). Pin the release tag; `:latest` follows the main branch.

```bash
mkdir mautrix-discord && cd mautrix-discord
# First run writes config.yaml and exits
docker run --rm -v "$(pwd)":/data:z dock.mau.dev/mautrix/discord:v0.7.7
# Edit config.yaml, then run again to write registration.yaml
docker run --rm -v "$(pwd)":/data:z dock.mau.dev/mautrix/discord:v0.7.7
```

Add `registration.yaml` to Synapse's `app_service_config_files` and restart Synapse. Then start the bridge on the same Docker network as Synapse (here `synapsenet`):

```bash
docker run -d --name mautrix-discord --restart unless-stopped --network synapsenet \
  -v "$(pwd)":/data:z dock.mau.dev/mautrix/discord:v0.7.7
```

Discord's config already listens on `0.0.0.0:29334`. Don't publish that port; only the homeserver needs to reach it.

## Configuration

Change at least these keys. Everything else can stay at its default to start with.

```yaml title="config.yaml"
# From mautrix/discord v0.7.7 example-config.yaml (legacy layout)
homeserver:
  address: http://synapse:8008
  domain: example.com
appservice:
  address: http://mautrix-discord:29334
  database:
    type: postgres
    uri: postgres://mautrix:password@postgres/mautrix_discord?sslmode=disable
bridge:
  permissions:
    "example.com": user          # relay | user | admin
    "@you:example.com": admin
  # Automatic double puppeting: as_token from a doublepuppet registration
  login_shared_secret_map:
    example.com: "as_token:<token>"
  encryption:
    allow: true
    default: false
    msc4190: false               # set true if your homeserver uses MAS
```

Useful optional keys (all under `bridge:`): `displayname_template` (default uses Discord's global name, not the removed `#1234` discriminator), `startup_private_channel_create_limit` (DM portals created at startup, default 5), `public_address` (needed for Matrix avatars on relay webhooks), `direct_media` and `backfill`. Double puppeting is explained in the [double puppeting guide](https://docs.mau.fi/bridges/general/double-puppeting.html).

## Logging in

Open a DM with `@discordbot:example.com`. Details: [authentication](https://docs.mau.fi/bridges/go/discord/authentication.html).

| Method | Command | Notes |
|--------|---------|-------|
| QR code | `login` (alias of `login-qr`) | Scan with the Discord mobile app. Fails if Discord asks for a CAPTCHA; use token login then. |
| User token | `login-token user <token>` | Copy the `Authorization` header from a browser session (use a private window). |
| Bot | `login-token bot <token>` | Create an application, enable the **Server Members** and **Message Content** privileged intents, and invite the bot with Send Messages, Create Public Threads, Send Messages in Threads, Read Message History and Add Reactions. Add Manage Webhooks for `set-relay --create`. |

## Bridging guilds and channels

Commands work in the management room without a prefix; elsewhere use `!discord`.

```
guilds status                                  # list guilds and their bridging state
guilds bridge <guild ID> [--entire]            # --entire creates portals for every channel
guilds bridging-mode <guild ID> <mode>         # nothing | if-portal-exists | create-on-message | everything
guilds unbridge <guild ID>                     # deletes the guild's portal rooms
bridge [--replace[=delete]] <channel ID>       # link the current Matrix room (needs room moderator)
unbridge
create-portal <channel ID>
```

## Relaying with webhooks

Matrix users who haven't logged in can be relayed through a Discord webhook, which shows their name and avatar per message. In a bridged room run `!discord set-relay --create [name]` (needs a login with Manage Webhooks) or `!discord set-relay --url <webhook URL>`. For Matrix avatars to appear, set `bridge.public_address` to a public HTTPS address that serves the bridge's `/mautrix-discord/avatar/` endpoint.

If you only want relaying, log in as a bot from a dedicated Matrix account, not your main one; otherwise your own messages go through the bot instead of the webhook ([relay docs](https://docs.mau.fi/bridges/go/discord/relay.html)).

`bridge.enable_webhook_avatars` is a different setting: it controls whether avatars of incoming Discord webhooks are bridged to Matrix.

## Other commands

| Command | Purpose |
|---------|---------|
| `logout` | Log out |
| `ping` | Check your connection to Discord |
| `reconnect` / `disconnect` | Reconnect or disconnect the Discord session |
| `unset-relay [--delete]` | Stop relaying in this room |
| `delete-portal` | Unbridge this room and kick all Matrix users (room moderator) |

Run `help` for the full list.

## Troubleshooting

- **QR login fails with a CAPTCHA error:** use `login-token user <token>`.
- **Messages from a guild don't appear:** check `guilds status` and the guild's bridging mode.
- **Matrix avatars missing on webhook messages:** set `public_address` and make sure Discord can reach it over HTTPS.

## Resources

- [mautrix-discord on GitHub](https://github.com/mautrix/discord)
- [docs.mau.fi/bridges/go/discord](https://docs.mau.fi/bridges/go/discord/)
- Support room: [#discord:maunium.net](https://matrix.to/#/#discord:maunium.net)
