---
sidebar_position: 6
title: Signal Bridge
description: Bridge Matrix to Signal with mautrix-signal
last_update:
  date: 2026-10-18
verified_with: "mautrix-signal v26.10 (v0.2610.0), mautrix-go v0.32.0, docs.mau.fi"
---

# Signal Bridge

[mautrix-signal](https://github.com/mautrix/signal) is a puppeting bridge between Matrix and Signal, written in Go on bridgev2 and using libsignal directly. As of 2026-10-18 the latest release is **v26.10 (git tag `v0.2610.0`, 2026-10-16)**.

:::danger signald is not used any more
mautrix-signal stopped using **signald** in v0.5.0 (2024-02-16), and signald itself no longer works with Signal's production servers. Do not deploy a signald container or set `socket_path`; any guide that does is out of date.
:::

:::warning
The bridge is a linked device on your Signal account. It decrypts every message to pass it to Matrix, so the bridge operator and your homeserver can read your Signal chats, and contact names and numbers are stored in the bridge database. Signal's end-to-end encryption ends at the bridge.
:::

Full documentation: [docs.mau.fi/bridges/go/signal](https://docs.mau.fi/bridges/go/signal/).

## Setup

Follow the generic [Go bridge setup](https://docs.mau.fi/bridges/go/setup.html) or [Docker setup](https://docs.mau.fi/bridges/general/docker-setup.html), using `dock.mau.dev/mautrix/signal:v26.10`. The default appservice port is 29328. The Docker image includes `ffmpeg`, which is used for voice messages and GIFs. If you build from source you also need libsignal-ffi, which the setup page explains.

## Configuration

The bridge uses the shared bridgev2 layout (see the [overview](./overview#the-bridgev2-config-layout)). Set `homeserver`, `appservice.address`, `database` and `bridge.permissions` as described there. The Signal-specific `network:` section works with its defaults. To get message history, turn on backfill **before** you log in:

```yaml title="config.yaml"
# backfill: keys from mautrix/go v0.32.0 bridgev2/matrix/mxmain/example-config.yaml
backfill:
  enabled: true
  max_initial_messages: 50
# network: keys from mautrix/signal v0.2610.0 pkg/connector/example-config.yaml
network:
  # Name shown in Signal's linked devices list
  device_name: mautrix-signal
```

`network.use_contact_avatars` and the `{{.ContactName}}` / `{{.Nickname}}` display name variables use your phone's contacts. The example config marks them as unsafe on multi-user instances.

## Logging in

1. Open a DM with `@signalbot:example.com`.
2. In the Signal app, go to **Settings → Linked Devices** and add a new device.
3. Send `login` to the bot and scan the QR code it sends.
4. If backfill is enabled, Signal asks whether to transfer message history. Choose either option.

If you transferred history, recent chats are created and backfilled. Otherwise chats appear as new messages arrive. To unlink, send `logout <login ID>` (get the ID from `list-logins`), or remove the device in Signal.

The bridge can only be a **linked** (secondary) device. Registering a new primary Signal account through the bridge is no longer supported; use an official app, or [signal-cli](https://docs.mau.fi/bridges/go/signal/authentication.html) as described in the docs.

## Commands

mautrix-signal uses the shared bridgev2 commands (see the [overview](./overview#commands-bridgev2)), such as `login`, `logout`, `start-chat`, `create-group`, `bridge` and `set-relay`. The only Signal-specific command is `discard-sender-key`. There is no `ping`, `link` or `sync` command. Run `help` for the full list.

## Troubleshooting

- **QR code expired:** send `login` again and scan within the time limit.
- **Messages stop arriving:** check whether the bridge still appears under Linked Devices in Signal. If it was removed, log in again.
- **No history after login:** history transfer only happens if `backfill.enabled` was true when you logged in.

## Resources

- [mautrix-signal on GitHub](https://github.com/mautrix/signal) and its [CHANGELOG](https://github.com/mautrix/signal/blob/main/CHANGELOG.md)
- [docs.mau.fi/bridges/go/signal](https://docs.mau.fi/bridges/go/signal/)
- Support room: [#signal:maunium.net](https://matrix.to/#/#signal:maunium.net)
