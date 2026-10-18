---
sidebar_position: 4
title: Slack Bridge
description: Bridge Matrix to Slack workspaces with mautrix-slack
last_update:
  date: 2026-10-18
verified_with: "mautrix-slack v26.10 (v0.2610.0), mautrix-go v0.32.0, docs.mau.fi"
---

# Slack Bridge

[mautrix-slack](https://github.com/mautrix/slack) is a puppeting bridge between Matrix and Slack, built on bridgev2. As of 2026-10-18 the latest release is **v26.10 (git tag `v0.2610.0`, 2026-10-16)**.

:::note matrix-appservice-slack is gone
The older `matrix-appservice-slack` is archived, and the bridge matrix.org ran with it was shut down on 2026-01-14 ([announcement](https://matrix.org/blog/2025/11/removing-slack-bridge/)). Use mautrix-slack.
:::

:::warning
Token login gives the bridge your Slack session token and `d` cookie, which can act as you in the workspace. Your workspace's policies may not allow this; check with its admins. Keep the bridge database and logs private.
:::

Full documentation: [docs.mau.fi/bridges/go/slack](https://docs.mau.fi/bridges/go/slack/). Supported features are listed in the [ROADMAP](https://github.com/mautrix/slack/blob/main/ROADMAP.md).

## Setup

Follow the generic [Go bridge setup](https://docs.mau.fi/bridges/go/setup.html) or [Docker setup](https://docs.mau.fi/bridges/general/docker-setup.html), using `dock.mau.dev/mautrix/slack:v26.10`. The default appservice port is 29335.

## Configuration

The bridge uses the shared bridgev2 layout (see the [overview](./overview#the-bridgev2-config-layout)). Set `homeserver`, `appservice.address`, `database` and `bridge.permissions` as described there. Slack-specific options live under `network:` and work with their defaults; these are the ones people most often change:

```yaml title="config.yaml"
# network: keys from mautrix/slack v0.2610.0 pkg/connector/example-config.yaml
network:
  # Only bridge DMs and group DMs, not channels
  dm_only: false
  # Members synced per channel (doesn't affect group DMs)
  participant_sync_count: 5
  backfill:
    # Conversations fetched when syncing a workspace; -1 = all from client.boot
    conversation_count: -1
backfill:
  # Top-level bridgev2 setting (mautrix/go v0.32.0): turn on message history
  enabled: true
  max_initial_messages: 50
```

## Logging in

Open a DM with `@slackbot:example.com`. Details: [authentication](https://docs.mau.fi/bridges/go/slack/authentication.html). [mautrix-manager](https://github.com/mautrix/manager) can do token login for you without browser devtools.

### Token login (recommended)

1. Log in to the Slack web app in a browser.
2. In the devtools console, read the token (starts with `xoxc-`):
   `JSON.parse(localStorage.localConfig_v2).teams.YOUR_TEAM_ID.token`
3. Copy the cookie named `d` (starts with `xoxd-`).
4. Send `login token <token> <cookie>` to the bot.

After login, the bridge bridges recent chats automatically (depending on `conversation_count`).

### App login (for relaying)

1. Create a Slack app from the [app manifest in the repo](https://github.com/mautrix/slack/blob/main/app-manifest.yaml), create an app-level token (`xapp-`), and install the app in your workspace to get a bot token (`xoxb-`).
2. From a **dedicated Matrix account**, send `login app` and provide both tokens.
3. Enable `bridge.relay.enabled` and run `!slack set-relay` in the rooms where non-logged-in Matrix users should be relayed through the app.

Using a dedicated account matters: the user who ran `login app` is bridged with the app's profile instead of their own ([docs](https://docs.mau.fi/bridges/go/slack/authentication.html)).

### Email and password

The bot also offers `login email` (added in v26.08). It may require a CAPTCHA, which bot commands can't handle, so the changelog still recommends token login.

## Using the bridge

Channels you are in appear as portal rooms after login. Use the shared bridgev2 commands (see the [overview](./overview#commands-bridgev2)): `start-chat` to DM a Slack user, `search` to find users, `bridge <chat ID>` to link an existing Matrix room, and `logout`. Run `help` for the full list. Slack threads are bridged as Matrix threads, and Matrix replies become Slack thread replies.

## Troubleshooting

- **Token expired or invalid:** get a fresh token and `d` cookie and run `login token` again (or use mautrix-manager).
- **Missing channels:** only conversations returned by Slack are synced; raise `network.backfill.conversation_count` or check `dm_only`.
- **Rate limits:** Slack rate-limits API calls; large initial syncs take time. v26.10 retries failed requests automatically.

## Resources

- [mautrix-slack on GitHub](https://github.com/mautrix/slack)
- [docs.mau.fi/bridges/go/slack](https://docs.mau.fi/bridges/go/slack/)
- Support room: [#slack:maunium.net](https://matrix.to/#/#slack:maunium.net)
