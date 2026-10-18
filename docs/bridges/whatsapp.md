---
sidebar_position: 7
title: WhatsApp Bridge
description: Bridge Matrix to WhatsApp with mautrix-whatsapp
last_update:
  date: 2026-10-18
verified_with: "mautrix-whatsapp v26.10 (v0.2610.0), mautrix-go v0.32.0, docs.mau.fi"
---

# WhatsApp Bridge

[mautrix-whatsapp](https://github.com/mautrix/whatsapp) is a puppeting bridge between Matrix and WhatsApp, built on bridgev2. It connects as a WhatsApp Web linked device using [whatsmeow](https://github.com/tulir/whatsmeow), an **unofficial, reverse-engineered** implementation of the multi-device web API. As of 2026-10-18 the latest release is **v26.10 (git tag `v0.2610.0`, 2026-10-16)**.

:::warning
WhatsApp is known to ban accounts that look suspicious. The bridge alone shouldn't cause bans, but bans are more likely when combined with emulators, VoIP numbers, new accounts or messaging non-contacts ([docs](https://docs.mau.fi/bridges/go/whatsapp/authentication.html)). The bridge decrypts all messages, so the bridge operator and your homeserver can read your chats. Logs contain phone numbers; strip them before sharing.
:::

Full documentation: [docs.mau.fi/bridges/go/whatsapp](https://docs.mau.fi/bridges/go/whatsapp/).

## Requirements

- WhatsApp on a phone (a physical or virtual phone works).
- The phone must come online at least every two weeks, or WhatsApp disconnects linked devices. The bridge warns you after 12 days without data from the phone.
- WhatsApp allows up to four linked devices; the bridge uses one.

## Setup

Follow the generic [Go bridge setup](https://docs.mau.fi/bridges/go/setup.html) or [Docker setup](https://docs.mau.fi/bridges/general/docker-setup.html), using `dock.mau.dev/mautrix/whatsapp:v26.10`. The default appservice port is 29318.

## Configuration

The bridge uses the shared bridgev2 layout (see the [overview](./overview#the-bridgev2-config-layout)). Set `homeserver`, `appservice.address`, `database` and `bridge.permissions` as described there. History settings must be in place **before** you log in:

```yaml title="config.yaml"
# backfill: keys from mautrix/go v0.32.0 bridgev2/matrix/mxmain/example-config.yaml
backfill:
  enabled: true
  max_initial_messages: 50          # messages per chat
# network: keys from mautrix/whatsapp v0.2610.0 pkg/connector/example-config.yaml
network:
  history_sync:
    max_initial_conversations: -1   # -1 = bridge every chat in the history sync
    request_full_sync: false        # true asks the phone for ~1 year instead of ~3 months
  enable_status_broadcast: true     # bridge WhatsApp status updates into a room
```

With `request_full_sync: true` you can also set `network.history_sync.full_sync_config.days_limit`. Expired media can be re-requested from the phone by reacting with ♻️.

## Logging in

Open a DM with `@whatsappbot:example.com`. Details: [authentication](https://docs.mau.fi/bridges/go/whatsapp/authentication.html).

- **QR code:** send `login qr`. In WhatsApp, open **Settings → Linked devices** and scan the code.
- **Pairing code:** send `login phone`, send your number in international format when asked, then in WhatsApp choose "Link with a phone number instead" and enter the 8-character code.
- **Passkey:** WhatsApp may ask some users for extra passkey verification. Follow the bot's instructions (they use browser devtools) or use [mautrix-manager](https://github.com/mautrix/manager).

The bridge starts creating portals about a minute after login. To log out, send `logout`.

## Commands

The shared bridgev2 commands work (see the [overview](./overview#commands-bridgev2)): `start-chat`, `create-group`, `bridge`, `set-relay`, `list-logins` and so on. WhatsApp-specific commands, from `pkg/connector/commands.go` at v0.2610.0:

| Command | Purpose |
|---------|---------|
| `sync <group/groups/contacts>` | Sync data from WhatsApp |
| `invite-link [--reset]` | Get (or reset) the invite link for the current group |
| `resolve-link <link>` | Resolve a group invite, contact or business message link |
| `join <invite link>` | Join a group by invite link |
| `accept` | Accept a group invite (reply to the invite message) |

To add a WhatsApp user to a bridged group, invite their ghost user in Matrix, or share the group's invite link.

## Troubleshooting

- **QR code expired:** the bot reports it; send `login qr` again.
- **Logged out unexpectedly:** the phone was probably offline for too long, or you removed the linked device. Log in again.
- **Missing old messages:** history sync only happens at login. Set the backfill options first, then log out and in again.

## EU third-party chats

Under the EU Digital Markets Act, WhatsApp opened "third-party chats" in Europe in Nov 2025, starting with BirdyChat and Haiket and without group chats ([Meta, 2025-11](https://about.fb.com/news/2025/11/messaging-interoperability-whatsapp-enables-third-party-chats-for-users-in-europe/)). This is a separate, official interop programme; mautrix-whatsapp does not use it.

## Resources

- [mautrix-whatsapp on GitHub](https://github.com/mautrix/whatsapp) and its [CHANGELOG](https://github.com/mautrix/whatsapp/blob/main/CHANGELOG.md)
- [docs.mau.fi/bridges/go/whatsapp](https://docs.mau.fi/bridges/go/whatsapp/)
- Support room: [#whatsapp:maunium.net](https://matrix.to/#/#whatsapp:maunium.net)
