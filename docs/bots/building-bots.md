---
sidebar_position: 5
title: Building Bots
description: Write your own Matrix bot or application service, with current libraries and the 2026 encryption rules
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, maubot 0.6.0, matrix-nio 0.26.0, matrix-bot-sdk 0.8.0"
---

# Building Matrix bots

## Choosing an approach

| Approach | Language | Good for | E2EE with cross-signing |
|----------|----------|----------|-------------------------|
| [maubot plugin](./maubot#writing-a-plugin) | Python | Most chat bots; you get a web UI, config and a database | Yes (verify with a recovery key) |
| [matrix-nio](../sdks/matrix-python-sdk#matrix-nio) script | Python | Small single-purpose bots | No |
| [matrix-bot-sdk](#typescript-with-matrix-bot-sdk) | TypeScript | Node.js bots | No |
| [matrix-rust-sdk](../sdks/matrix-rust-sdk#a-minimal-bot) | Rust | Long-running, performance-sensitive bots | Yes |
| [Application service](#application-services) | Any | Bridges and bots that act as many users | Depends on library |

[simplematrixbotlib](https://codeberg.org/imbev/simplematrixbotlib) (2.13.1, built on matrix-nio) is a further option for very small Python bots. Two older choices are retired: **NioBot** is archived and its author recommends maubot or mautrix-python, and the **nio-template** repository is archived.

## Getting a bot account

Give every bot its own account. Don't reuse your personal account or copy an access token out of Element: on servers using Matrix Authentication Service (MAS), Element's tokens are short-lived and refreshed, so a copied token stops working, and logging it out logs the bot out.

**On a Synapse server without MAS**, an admin can create the account with `register_new_matrix_user`. Read the password from a file so it doesn't land in shell history:

```bash
register_new_matrix_user -c /etc/matrix-synapse/homeserver.yaml \
  --user mybot --password-file /run/secrets/mybot-password --no-admin \
  http://localhost:8008
```

Then log the bot in once with the SDK and **save the access token and device ID**. Reuse them on every start (for example nio's `restore_login(user_id, device_id, access_token)`), so the bot keeps one device and its encryption keys.

**On a server using MAS** (matrix.org, Element Server Suite and others), Synapse's shared-secret registration API is disabled, so `register_new_matrix_user` doesn't work, and so are the password-reset, set-admin and login-as-user admin APIs. Create the account through MAS (its admin API, CLI or Element Admin) and give the bot a **personal access token** ("personal session"). See [MAS: personal sessions](https://element-hq.github.io/matrix-authentication-service/topics/authorization.html#personal-sessions-personal-access-tokens).

:::warning
A bot's access token is as powerful as its password. Keep it in a secret store or an environment variable, never in a repository or a chat room. If it leaks, log the session out from the server. Give the bot only the power levels it needs.
:::

## Bot basics

Whatever library you use:

- **Ignore your own messages**, or the bot can loop on its replies.
- **Skip history on startup.** The first sync returns recent messages; do one sync before registering handlers (nio, Rust), set `ignore_initial_sync` (mautrix), or compare event timestamps with the start time. Otherwise a restarted bot answers old commands again.
- **Send `m.notice`** for automated replies. Clients show notices differently, and the spec says notices must never be automatically responded to, which prevents bot loops.
- **Handle rate limits.** On `429` with `M_LIMIT_EXCEEDED`, wait for the time in the `Retry-After` header (spec v1.10 and later; the `retry_after_ms` body field is deprecated) and retry. See [rate limiting](https://spec.matrix.org/v1.19/client-server-api/#rate-limiting).
- **Check every response.** matrix-nio returns error objects instead of raising; matrix-js-sdk and matrix-bot-sdk throw.
- **Use mentions properly.** To ping a user, include them in `m.mentions` ([spec](https://spec.matrix.org/v1.19/client-server-api/#user-and-room-mentions)); body-text mentions were removed in v1.17.

## Python with maubot or matrix-nio

A maubot plugin is the shortest path: see [Writing a plugin](./maubot#writing-a-plugin). For a standalone script, start from the [matrix-nio example](../sdks/matrix-python-sdk#a-minimal-bot), which logs in, skips history, answers `!ping` and checks errors.

## TypeScript with matrix-bot-sdk

[matrix-bot-sdk](https://github.com/turt2live/matrix-bot-sdk) 0.8.0 requires Node.js 22 or later. Element maintains a fork, [`@vector-im/matrix-bot-sdk`](https://github.com/element-hq/matrix-bot-sdk) (0.10.1-element.0, Node.js 24 or later), which Hookshot, Draupnir and matrix-appservice-bridge use.

```bash
npm install matrix-bot-sdk
```

This sample was type-checked against matrix-bot-sdk 0.8.0:

```typescript
import { AutojoinRoomsMixin, MatrixClient, SimpleFsStorageProvider } from "matrix-bot-sdk";

const storage = new SimpleFsStorageProvider("bot.json"); // remembers the sync token
const client = new MatrixClient("https://matrix.example.org", process.env.ACCESS_TOKEN!, storage);
AutojoinRoomsMixin.setupOnClient(client);

client.on("room.message", async (roomId: string, event: any) => {
    if (event.sender === (await client.getUserId())) return;
    if (event.content?.body === "!ping") {
        await client.replyNotice(roomId, event, "pong");
    }
});

await client.start();
```

`AutojoinRoomsMixin` accepts every invite. For a bot with any power, check the inviter before joining.

## E2EE and cross-signing

Since spec v1.18 (MSC4153), clients SHOULD NOT send encrypted to-device messages, including room keys, to devices that are not cross-signed, and SHOULD NOT display messages sent from them ([spec v1.19, recommended client behaviour](https://spec.matrix.org/v1.19/client-server-api/#recommended-client-behaviour)). The Foundation [said in 2025-11](https://matrix.org/blog/2025/11/exclude-insecure-devices/) that Element would apply this by default from April 2026; as of 2026-10, Element's [device verification help page](https://docs.element.io/latest/element-support/device-verification/how-to-verify-devices/) says the rollout is postponed and will be announced a month ahead.

For bots this means:

| Library | Cross-signing | Outlook in encrypted rooms |
|---------|---------------|----------------------------|
| matrix-rust-sdk, matrix-js-sdk | Yes | Fine once the bot sets up cross-signing |
| maubot 0.6.0 | Yes, by verifying the bot with a recovery key | Fine once verified |
| matrix-nio 0.26.0 | No | Will lose access as clients enforce MSC4153 |
| matrix-bot-sdk 0.8.0 | No | Same |

Practical advice:

- If a bot doesn't need encrypted rooms, keep it to unencrypted ones.
- Persist the crypto store and reuse one device. A new device on every start loses keys and needs re-verifying.
- Never "trust all devices" to make warnings go away; it defeats the point of encryption.

## Application services

An application service (appservice) is registered with the homeserver through a YAML file. The homeserver pushes events to it over HTTP, and it can act as any user in its namespaces. Bridges and Hookshot work this way. See the [Application Service API](https://spec.matrix.org/v1.19/application-service-api/).

The registration fields below are from the spec v1.19 schema:

```yaml title="registration.yaml"
id: my-appservice                 # unique, never changes
url: http://127.0.0.1:9000        # where the homeserver reaches the appservice
as_token: GENERATE_A_LONG_RANDOM_STRING   # appservice -> homeserver
hs_token: GENERATE_ANOTHER_LONG_RANDOM_STRING  # homeserver -> appservice
sender_localpart: mybot
rate_limited: false
receive_ephemeral: true           # also receive typing, receipts, presence (v1.13+)
namespaces:
  users:
    - exclusive: true
      regex: "@mybot_.*:example\\.org"
  aliases: []
  rooms: []
```

Points to know:

- The homeserver sends only events the appservice is **interested in**: those involving users, aliases or rooms in its namespaces, not every event on the server.
- Escape dots in the regexes (`example\\.org`) so they don't match other servers.
- Bind the appservice listener to localhost or an internal network. Only the homeserver needs to reach it. Anyone with `hs_token` can push fake events; anyone with `as_token` can act as every user in the namespace.
- Spec v1.17 lets appservices create and manage devices for their users without the legacy login API (MSC4190) and act as a specific device (MSC4326). Bridges need these on servers using MAS. See [device management](https://spec.matrix.org/v1.19/application-service-api/#device-management).

Don't write the HTTP handling yourself. Use [matrix-appservice-bridge](https://github.com/matrix-org/matrix-appservice-bridge) (TypeScript), the `Appservice` class in matrix-bot-sdk, or [mautrix-go's bridgev2](https://github.com/mautrix/go/tree/main/bridgev2) framework.

## Testing

- **maubot plugins:** maubot 0.6.0 ships pytest fixtures in `maubot.testing` for testing command handlers without a server.
- **Against a real server:** run a throwaway Synapse locally. Generate a config first (the `generate` step needs these variables and a data volume):

```bash
docker run -it --rm -v "$PWD/synapse-data:/data" \
  -e SYNAPSE_SERVER_NAME=localhost -e SYNAPSE_REPORT_STATS=no \
  matrixdotorg/synapse:v1.163.0 generate
```

Then start it with the same volume, bound to localhost only:

```bash
docker run -d --name synapse -v "$PWD/synapse-data:/data" \
  -p 127.0.0.1:8008:8008 matrixdotorg/synapse:v1.163.0
```

Create accounts with `docker exec -it synapse register_new_matrix_user -c /data/homeserver.yaml http://localhost:8008` and point your bot at `http://localhost:8008`. Use a test server like this only on your own machine.

## Resources

- [maubot docs](https://docs.mau.fi/maubot/)
- [matrix-nio docs](https://matrix-nio.readthedocs.io/)
- [matrix-bot-sdk docs](https://turt2live.github.io/matrix-bot-sdk/)
- [Application Service API, spec v1.19](https://spec.matrix.org/v1.19/application-service-api/)
- [#matrix-dev:matrix.org](https://matrix.to/#/#matrix-dev:matrix.org)
