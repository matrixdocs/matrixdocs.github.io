---
sidebar_position: 2
title: Client-Server API
description: How clients talk to homeservers, summarised from spec v1.19 with links to each section
last_update:
  date: 2026-10-18
verified_with: "spec v1.19"
---

# Client-Server API

The Client-Server (C-S) API is the HTTP+JSON API clients use to talk to their homeserver. This page is a map of the main parts; the [spec](https://spec.matrix.org/v1.19/client-server-api/) is the reference.

## Base URL and versions

The client finds the homeserver's base URL through [server discovery](https://spec.matrix.org/v1.19/client-server-api/#server-discovery) (`/.well-known/matrix/client`). Endpoints live under `/_matrix/client/`, with a version per endpoint, not per API: most are `v3`, and newer ones are `v1`, for example:

- `/_matrix/client/v1/media/download/{serverName}/{mediaId}` and the other authenticated media endpoints (v1.11)
- `/_matrix/client/v1/auth_metadata` (OAuth 2.0, v1.15)
- `/_matrix/client/v1/room_summary/{roomIdOrAlias}` (v1.15)
- `/_matrix/client/v1/mutual_rooms` (v1.19)

`GET /_matrix/client/versions` lists the spec versions and unstable features a server supports.

## Authentication

Since v1.15 there are **two authentication APIs**, and a server offers one or the other ([client authentication](https://spec.matrix.org/v1.19/client-server-api/#client-authentication)):

| API | Discovery | Used by |
|-----|-----------|---------|
| [OAuth 2.0 API](https://spec.matrix.org/v1.19/client-server-api/#oauth-20-api) | `GET /_matrix/client/v1/auth_metadata` | Servers using Matrix Authentication Service, including matrix.org (since 2025-04) |
| [Legacy API](https://spec.matrix.org/v1.19/client-server-api/#legacy-api) | `GET /_matrix/client/v3/login` | Synapse and others without MAS |

See [authentication API discovery](https://spec.matrix.org/v1.19/client-server-api/#authentication-api-discovery) for how a client decides. The OAuth 2.0 API covers the authorisation code flow (browser login), dynamic client registration and, since v1.18, the device authorization grant for devices without a browser.

A legacy password login:

```http
POST /_matrix/client/v3/login
Content-Type: application/json

{
  "type": "m.login.password",
  "identifier": { "type": "m.id.user", "user": "alice" },
  "password": "...",
  "initial_device_display_name": "My client"
}
```

The response has `access_token`, `device_id` and `user_id`. Use `identifier`; the top-level `user` field is deprecated.

Send the token in a header on every request:

```http
Authorization: Bearer <access_token>
```

Access tokens in the query string (`?access_token=`) have been deprecated since v1.11.

## Sync

`GET /_matrix/client/v3/sync` returns everything new since the `since` token: joined, invited, knocked and left rooms (`rooms.join` and so on), `presence`, `account_data`, `to_device` messages, `device_lists` and one-time key counts for E2EE, and `next_batch` for the next call. Long-poll with `timeout`. Since v1.16, `use_state_after=true` returns `state_after` instead of `state`, which is easier to apply correctly. See [syncing](https://spec.matrix.org/v1.19/client-server-api/#syncing).

Simplified Sliding Sync (MSC4186), used by Element X, is accepted but not part of v1.19.

## Common endpoints

| Action | Endpoint |
|--------|----------|
| Create a room | `POST /_matrix/client/v3/createRoom` |
| Join by ID or alias | `POST /_matrix/client/v3/join/{roomIdOrAlias}` |
| Send a message event | `PUT /_matrix/client/v3/rooms/{roomId}/send/{eventType}/{txnId}` |
| Set state | `PUT /_matrix/client/v3/rooms/{roomId}/state/{eventType}/{stateKey}` |
| Read history | `GET /_matrix/client/v3/rooms/{roomId}/messages?dir=b` |
| Redact | `PUT /_matrix/client/v3/rooms/{roomId}/redact/{eventId}/{txnId}` |
| Upgrade a room | `POST /_matrix/client/v3/rooms/{roomId}/upgrade` |
| Get a profile | `GET /_matrix/client/v3/profile/{userId}` |
| Set a profile field | `PUT /_matrix/client/v3/profile/{userId}/{keyName}` |

Sending a message:

```http
PUT /_matrix/client/v3/rooms/!roomid/send/m.room.message/txn1
Authorization: Bearer <access_token>
Content-Type: application/json

{ "msgtype": "m.text", "body": "Hello" }
```

The `txnId` makes retries idempotent: reuse it when retrying the same request. Since v1.16, profiles hold custom fields, so `displayname`, `avatar_url` and `m.tz` are all set through `/profile/{userId}/{keyName}`.

## Authenticated media

Since v1.11, media is downloaded with an access token from:

- `GET /_matrix/client/v1/media/download/{serverName}/{mediaId}`
- `GET /_matrix/client/v1/media/thumbnail/{serverName}/{mediaId}`

The old unauthenticated `v3` download and thumbnail endpoints are deprecated, and servers may refuse to serve media uploaded after they switch ("freezing"); matrix.org did so in 2024-09. Uploads still go to `POST /_matrix/media/v3/upload`. See [content repository](https://spec.matrix.org/v1.19/client-server-api/#content-repository).

## Errors and rate limits

Errors are JSON with an `errcode` and `error`. Common codes: `M_FORBIDDEN`, `M_UNKNOWN_TOKEN`, `M_NOT_FOUND`, `M_LIMIT_EXCEEDED`. Newer ones include `M_USER_LOCKED` (account locking, v1.12), `M_USER_SUSPENDED` (v1.13) and `M_USER_LIMIT_EXCEEDED` (v1.18). See [standard error response](https://spec.matrix.org/v1.19/client-server-api/#standard-error-response).

When rate-limited, the server returns `429` with `M_LIMIT_EXCEEDED`. Wait for the time in the `Retry-After` header before retrying. The `retry_after_ms` body field is deprecated. See [rate limiting](https://spec.matrix.org/v1.19/client-server-api/#rate-limiting).

## Safety features

| Feature | Since | Spec |
|---------|-------|------|
| Report an event, room or user | event: long-standing; room: v1.13; user: v1.14 | [reporting content](https://spec.matrix.org/v1.19/client-server-api/#reporting-content) |
| Account locking and suspension | v1.12 / v1.13 | [account locking](https://spec.matrix.org/v1.19/client-server-api/#account-locking), [suspension](https://spec.matrix.org/v1.19/client-server-api/#account-suspension) |
| Admin suspend/lock endpoints | v1.18 | `PUT /_matrix/client/v1/admin/suspend/{userId}`, `PUT /_matrix/client/v1/admin/lock/{userId}` |
| Invite blocking | v1.18 | [invite permission](https://spec.matrix.org/v1.19/client-server-api/#invite-permission) |
| Policy servers | v1.18 | [policy servers](https://spec.matrix.org/v1.19/client-server-api/#policy-servers) |

## End-to-end encryption

The [E2EE module](https://spec.matrix.org/v1.19/client-server-api/#end-to-end-encryption) covers device keys, Olm/Megolm, cross-signing, secret storage and key backup. Since v1.18 the spec recommends that clients not send room keys to, or show messages from, devices that are not cross-signed (MSC4153, [recommended client behaviour](https://spec.matrix.org/v1.19/client-server-api/#recommended-client-behaviour)). v1.19 added encrypted history sharing for new members (MSC4268).

:::info Coming next
Accepted but not yet in the spec as of 2026-10: Simplified Sliding Sync (MSC4186) and its extensions, delayed events (MSC4140) and bundled URL previews (MSC4095). Spec `main` already removes query-string access tokens (MSC4127). Sources: [MSC repository](https://github.com/matrix-org/matrix-spec-proposals), [matrix-spec](https://github.com/matrix-org/matrix-spec).
:::

## Resources

- [Client-Server API, v1.19](https://spec.matrix.org/v1.19/client-server-api/)
- [SDKs](../sdks/overview) that implement it
