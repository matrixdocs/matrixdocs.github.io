---
sidebar_position: 4
title: Hookshot
description: Bridge GitHub, GitLab, Jira, OpenProject, Figma, RSS feeds and webhooks into Matrix rooms
last_update:
  date: 2026-10-18
verified_with: "matrix-hookshot 7.5.0 (config.sample.yml, registration.sample.yml, docs/ and src/Connections at the 7.5.0 tag)"
---

# Hookshot

[matrix-hookshot](https://github.com/matrix-org/matrix-hookshot) is a Matrix.org appservice that connects rooms to development tools and the web. As of 2026-10 the current release is **7.5.0** (2026-09-22). It runs on Node.js 24, supports encrypted rooms (stable since 2025) and works in room version 12.

The official docs are at [matrix-org.github.io/matrix-hookshot](https://matrix-org.github.io/matrix-hookshot/latest/). This page summarises them; check there for options not shown.

## What it connects

| Service | Notifications | Commands in the room |
|---------|---------------|----------------------|
| GitHub | Issues, PRs, releases, workflow runs, discussions | Create, assign and close issues; run workflows |
| GitLab | Issues, merge requests, pushes, tag pushes, releases, wiki | Create and close issues |
| Jira | Issue events | Create issues |
| OpenProject | Work package events | Create, close, set priority, assign |
| Figma | File activity | – |
| ChallengeHound | Challenge activity | – |
| RSS/Atom feeds | New items | – |
| Inbound webhooks | Any HTTP POST, optionally transformed by JavaScript | – |
| Outbound webhooks | Room events sent to an HTTP URL | – |

## Installation

Hookshot is an appservice, so a homeserver admin has to register it. The Docker image is `ghcr.io/matrix-org/matrix-hookshot`. The old `halfshot/matrix-hookshot` image on Docker Hub is no longer maintained.

```yaml title="docker-compose.yml"
services:
  hookshot:
    image: ghcr.io/matrix-org/matrix-hookshot:7.5.0
    restart: unless-stopped
    volumes:
      - ./hookshot:/data   # config.yml, registration.yml, passkey.pem
    ports:
      - "127.0.0.1:9000:9000"   # webhooks: put your reverse proxy in front
      - "127.0.0.1:9002:9002"   # widgets (optional)
    # 9993 (appservice) and 9001 (metrics) are reached by Synapse and
    # Prometheus over the internal Docker network only.
```

:::warning Keep the appservice port private
The appservice listener (`bridge.port`, 9993 by default) receives events from your homeserver, authenticated by `hs_token`. The Hookshot docs say it should **not** be reachable from the internet and must not share a port with the other listeners. Expose only the webhook (and widget) listener, through a TLS reverse proxy. The `as_token` and `hs_token` let anyone holding them act as the bridge: keep `registration.yml` private.
:::

## Configuration

Copy [`config.sample.yml`](https://github.com/matrix-org/matrix-hookshot/blob/7.5.0/config.sample.yml) to `config.yml`. A minimal Docker config, based on the 7.5.0 sample:

```yaml title="config.yml"
bridge:
  domain: example.org            # your homeserver's server name
  url: http://synapse:8008       # internal client-server API URL
  mediaUrl: https://matrix.example.org
  port: 9993                     # appservice listener, homeserver only
  bindAddress: 0.0.0.0           # Docker; use 127.0.0.1 outside containers

passFile: /data/passkey.pem      # openssl genpkey -out passkey.pem -outform PEM -algorithm RSA -pkeyopt rsa_keygen_bits:4096

listeners:
  - port: 9000
    bindAddress: 0.0.0.0
    resources:
      - webhooks
  - port: 9001
    bindAddress: 127.0.0.1
    resources:
      - metrics
  - port: 9002
    bindAddress: 0.0.0.0
    resources:
      - widgets

permissions:
  - actor: example.org            # everyone on your server
    services:
      - service: "*"
        level: manageConnections
  - actor: "@you:example.org"     # one bridge admin
    services:
      - service: "*"
        level: admin

generic:
  enabled: true
  urlPrefix: https://hooks.example.org/webhook/
  allowJsTransformationFunctions: false
  enableHttpGet: false

feeds:
  enabled: true
  pollIntervalSeconds: 600
```

Validate it without starting the bridge:

```bash
docker run --rm -v "$PWD/hookshot/config.yml:/config.yml" \
  ghcr.io/matrix-org/matrix-hookshot:7.5.0 node config/Config.js /config.yml
```

**Permissions.** Without a `permissions` block, every user on the bridge's own homeserver has full access. Levels are additive: `commands`, `login`, `notifications`, `manageConnections`, `admin`. Actors can be a user ID, a server name, a room ID or `"*"` (quote user IDs, room IDs and `*`). See [Permissions](https://matrix-org.github.io/matrix-hookshot/latest/setup.html#permissions).

### Registration

Copy [`registration.sample.yml`](https://github.com/matrix-org/matrix-hookshot/blob/7.5.0/registration.sample.yml) to `registration.yml`. Replace `as_token` and `hs_token` with long random strings, change `foobar` in the namespaces to your server name, and set `url` to where the homeserver reaches Hookshot (`http://hookshot:9993` in Docker). Then add the file to Synapse's `app_service_config_files` and restart Synapse.

```yaml title="registration.yml (excerpt)"
id: matrix-hookshot
as_token: GENERATE_A_LONG_RANDOM_STRING
hs_token: GENERATE_ANOTHER_LONG_RANDOM_STRING
sender_localpart: hookshot
url: "http://hookshot:9993"
rate_limited: false
receive_ephemeral: true
namespaces:
  rooms: []
  users:
    - regex: "@_github_.*:example\\.org"
      exclusive: true
    - regex: "@_webhooks_.*:example\\.org"
      exclusive: true
  aliases:
    - regex: "#github_.+:example\\.org"
      exclusive: true
```

### Encryption

Set `encryption.storagePath` (and a `cache.redisUri`, which encryption requires) to let Hookshot work in encrypted rooms. See [Encryption](https://matrix-org.github.io/matrix-hookshot/latest/advanced/encryption.html).

## Connecting a room

Invite the bot (for example `@hookshot:example.org`) to the room and give it power level 50 so it can write connection state. Then run a setup command:

| Command | Effect |
|---------|--------|
| `!hookshot help` | List available commands |
| `!hookshot github repo <url>` | Connect a GitHub repository (you must be logged in to GitHub) |
| `!hookshot gitlab project <url>` | Connect a GitLab project |
| `!hookshot jira project <url>` | Connect a Jira project |
| `!hookshot jira list project` / `jira remove project <url>` | List or remove Jira connections |
| `!hookshot webhook <name> [liveDuration]` | Create an inbound webhook; the bot replies with its URL |
| `!hookshot webhook list` / `webhook remove <name>` | List or remove webhooks |
| `!hookshot outbound-hook <name> <url>` | Create an outbound webhook (needs `generic.outbound: true`) |
| `!hookshot feed <url> [label] [template]` | Subscribe to an RSS/Atom feed |
| `!hookshot feed list` / `feed remove <url>` | List or remove feeds |
| `!hookshot figma file <url>` | Connect a Figma file |
| `!hookshot openproject add <url>` / `openproject remove <url>` | Connect or remove an OpenProject project |
| `!hookshot challenghound add <url>` | Connect a ChallengeHound challenge (the command is spelled this way in 7.5.0) |
| `!hookshot setup-widget` | Open the setup widget |

## GitHub

1. Create a [GitHub App](https://github.com/settings/apps/new). Set the **Webhook URL** to your public Hookshot address at `/github/webhook` (the old `/` path is deprecated) and set a webhook secret.
2. Grant the permissions listed in [Setting up GitHub](https://matrix-org.github.io/matrix-hookshot/latest/setup/github.html): Actions, Contents (read); Discussions, Issues, Projects, Pull requests (read & write); Metadata; Organisation Team Discussions (read & write).
3. Configure Hookshot. The `oauth` section lets users link their GitHub account (by saying `github login` to the bot in a direct chat), which repository bridging and issue commands need:

```yaml title="config.yml (GitHub section)"
github:
  auth:
    id: 123456                         # App ID
    privateKeyFile: /data/github-key.pem
  webhook:
    secret: THE_WEBHOOK_SECRET
  oauth:
    client_id: Iv1.xxxxxxxx
    client_secret: xxxxxxxx
    redirect_uri: https://hooks.example.org/oauth/
```

### Commands in a connected repository room

The default prefix is `!gh` (configurable per room with `commandPrefix`). Hookshot 7.5.0 implements:

| Command | Effect |
|---------|--------|
| `!gh create <title> [description] [labels]` | Create an issue; labels are comma-separated |
| `!gh assign [number] [users...]` | Assign an issue (defaults: latest issue, yourself) |
| `!gh close <number> [comment]` | Close an issue |
| `!gh workflow run <name> [args] [ref]` | Run an Actions workflow; args as `"key=value,key2='value 2'"` |

Which events are posted is set by `enableHooks` in the connection's room state, for example `issue`, `pull_request`, `release` or `workflow.run`. The [GitHub repository docs](https://matrix-org.github.io/matrix-hookshot/latest/usage/room_configuration/github_repo.html) list every event type and default.

## Inbound webhooks

`!hookshot webhook alerts` creates a webhook and replies with its URL under your `urlPrefix`. POST JSON with a `text` (and optionally `html`) field to post a message:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"text": "Deploy finished"}' \
  https://hooks.example.org/webhook/<hook-id>
```

To reshape arbitrary payloads, admins can enable `allowJsTransformationFunctions` and set a transformation function in the connection's state. Transformation functions run code supplied by room admins, so only enable them where you trust those admins. See [Webhooks](https://matrix-org.github.io/matrix-hookshot/latest/setup/webhooks.html).

## Notifications from CI

To post from GitHub Actions or other CI, the simplest route is an inbound Hookshot webhook: store its URL as a CI secret and `curl` it, as above. No Matrix token is needed.

If you post through the client-server API instead, use a dedicated bot account, not a token copied from your own Element session. On servers using Matrix Authentication Service, use a personal access token for that account. See [Getting a bot account](./building-bots#getting-a-bot-account).

## Troubleshooting

- **Bot doesn't join:** check that Synapse loaded `registration.yml` and can reach `bridge.port`, and that the inviter has at least the `login` permission level.
- **No GitHub events:** check the GitHub App's webhook delivery log, the `/github/webhook` path and the secret.
- **Config errors:** run the `node config/Config.js` validator shown above.

## Resources

- [Hookshot documentation](https://matrix-org.github.io/matrix-hookshot/latest/)
- [GitHub: matrix-org/matrix-hookshot](https://github.com/matrix-org/matrix-hookshot)
- [Helm chart](https://github.com/matrix-org/matrix-hookshot/tree/main/helm/hookshot)
- [#hookshot:half-shot.uk](https://matrix.to/#/#hookshot:half-shot.uk)
