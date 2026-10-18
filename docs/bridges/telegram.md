---
sidebar_position: 3
title: Telegram Bridge
description: Bridge Matrix to Telegram with mautrix-telegram
last_update:
  date: 2026-10-18
verified_with: "mautrix-telegram v26.10 (v0.2610.0), mautrix-go v0.32.0, docs.mau.fi"
---

# Telegram Bridge

[mautrix-telegram](https://github.com/mautrix/telegram) is a hybrid puppeting/relay bridge between Matrix and Telegram. As of 2026-10-18 the latest release is **v26.10 (git tag `v0.2610.0`, 2026-10-16)**.

The bridge was **rewritten in Go on bridgev2 in v26.04 (2026-04-16)**. Guides written for the old Python bridge (`relaybot` sections, `telegram.bot_token`, `!tg ping`, `{userid}` templates, the `puppeting`/`full` permission levels) no longer apply.

:::warning
A Telegram login gives the bridge full access to your account. Telegram is known to ban suspicious accounts, and a brand-new account using a third-party client counts as suspicious; an established account is fine ([docs](https://docs.mau.fi/bridges/go/telegram/authentication.html)). Telegram chats are not end-to-end encrypted, and the bridge operator can read everything bridged.
:::

Full documentation: [docs.mau.fi/bridges/go/telegram](https://docs.mau.fi/bridges/go/telegram/).

## Upgrading from the Python bridge

- v26.04 to v26.09 migrate a Python v0.15.3+ install in place: database and most config are converted, but logging config and legacy permission levels are not. Back up first and check the config afterwards.
- **v26.10 removed the legacy migration.** To upgrade from Python, run a release between v26.04 and v26.09 first.
- The old relaybot is not migrated. Use [relay mode](#relay-mode) instead.
- On multi-user bridges, normal (non-super) groups are no longer shared portals; each Matrix user gets their own room. Upgrade a group to a supergroup (`!tg upgrade`) if you want one shared room.
- Run `!tg set-management-room` after upgrading to use commands without a prefix in your DM with the bot.

Source: [v0.2604.0 release notes](https://github.com/mautrix/telegram/releases/tag/v0.2604.0), [v0.2610.0 release notes](https://github.com/mautrix/telegram/releases/tag/v0.2610.0).

## Setup

Follow the generic [Go bridge setup](https://docs.mau.fi/bridges/go/setup.html) or [Docker setup](https://docs.mau.fi/bridges/general/docker-setup.html), using `dock.mau.dev/mautrix/telegram:v26.10`. The default appservice port is 29317.

You need your own Telegram API credentials: create an application at [my.telegram.org/apps](https://my.telegram.org/apps) to get an `api_id` and `api_hash`.

## Configuration

The bridge uses the shared bridgev2 layout (see the [overview](./overview#the-bridgev2-config-layout)). Telegram-specific settings go under `network:`. The keys you must change:

```yaml title="config.yaml"
# network: keys from mautrix/telegram v0.2610.0 pkg/connector/example-config.yaml
# other keys from mautrix/go v0.32.0 bridgev2/matrix/mxmain/example-config.yaml
homeserver:
  address: http://synapse:8008
  domain: example.com
appservice:
  address: http://mautrix-telegram:29317
database:
  type: postgres
  uri: postgres://mautrix:password@postgres/mautrix_telegram?sslmode=disable
bridge:
  permissions:
    "example.com": user        # relay | commands | user | admin
    "@you:example.com": admin
network:
  api_id: 12345
  api_hash: your-api-hash
```

Other `network:` options include `animated_sticker` (conversion target, default `gif`), `member_list`, `sync` (how many chats to create portals for), `bridge_communities` (bridge Telegram communities as spaces) and `always_tombstone_on_supergroup_migration`. For history, enable the top-level `backfill.enabled`.

## Logging in

Open a DM with `@telegrambot:example.com` and use one of these flows:

| Command | What happens |
|---------|--------------|
| `login phone` | Send your number in international format. Telegram sends a code **to another logged-in Telegram client**, never by SMS. You'll be asked for your 2FA password if you have one. |
| `login qr` | In the Telegram app go to Settings → Devices → Link Desktop Device and scan the QR code. |
| `login bot` | Log in with a BotFather token, for relaying or if you don't want to use your real account. Bots are more limited (chats only sync after a message arrives). |

You cannot register a new Telegram account through the bridge: Telegram stopped allowing registration from third-party clients on 2023-02-18. Sign up with an official app first.

## Bridging chats

After login the bridge creates portals for recent chats (controlled by `network.sync`). Telegram-specific commands, from `pkg/connector/commands.go` at v0.2610.0:

| Command | Purpose |
|---------|---------|
| `sync-chats` | Sync your chat list and create missing portals |
| `join <invite link>` | Join a group by invite link |
| `upgrade` | Upgrade a basic group to a supergroup |
| `emoji-pack` / `pack` | Transfer emoji and sticker packs between Matrix and Telegram (`upload`, `download`, `list`) |

The shared bridgev2 commands also work: `start-chat`, `create-group`, `bridge`, `unbridge`, `set-relay`, `list-logins`, `logout` and so on (see the [overview](./overview#commands-bridgev2)). Run `help` for the full list.

Telegram topic groups are bridged as Matrix spaces.

## Relay mode

To let Matrix users who haven't logged in talk in a Telegram group:

1. Set `bridge.relay.enabled: true` and give those users at least `relay` permission.
2. From a **dedicated Matrix account** (not your main one), run `login bot <token>` (or log in a normal Telegram account).
3. In the bridged room, run `!tg set-relay`.

To let others bridge chats through the relay without being bridge admins, add its login ID (from `list-logins`) to `bridge.relay.default_relays`. Basic groups can't be shared between several Matrix users, so upgrade them with `!tg upgrade` if you mix relayed and logged-in users. See [relay mode](https://docs.mau.fi/bridges/general/relay-mode.html).

## Troubleshooting

- **`FLOOD_WAIT_X`:** Telegram rate limiting. Wait X seconds; lower the `network.sync` limits if it happens at startup.
- **Session revoked:** you (or Telegram) ended the bridge's session. Log in again.
- **No login code arrives:** the code goes to your other Telegram apps, not SMS. Use `login qr` if you have no other client.
- **Animated stickers don't show:** install `ffmpeg` and LottieConverter, or change `network.animated_sticker.target`. The Docker image includes them.

## Public instances

If you don't want to host the bridge yourself, docs.mau.fi lists [Beeper](https://www.beeper.com/) (puppeting only), t2bot.io (relay only, legacy Python bridge) and tchncs.de (legacy Python bridge).

## Resources

- [mautrix-telegram on GitHub](https://github.com/mautrix/telegram)
- [docs.mau.fi/bridges/go/telegram](https://docs.mau.fi/bridges/go/telegram/)
- Support room: [#telegram:maunium.net](https://matrix.to/#/#telegram:maunium.net)
