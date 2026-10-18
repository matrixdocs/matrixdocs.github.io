---
sidebar_position: 1
title: Matrix Specification Overview
description: How the Matrix spec is organised, the current version (v1.19), room versions and recent changes
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0"
---

# The Matrix specification

The Matrix specification defines the protocol. It is published at [spec.matrix.org](https://spec.matrix.org/) and maintained by the Matrix.org Foundation's Spec Core Team. This section summarises it and links to the exact sections; the spec itself is the reference.

## Current version

The current stable release is **v1.19 (2026-07-08)**. The spec has a release roughly every quarter. Each version's changes are in the [changelog](https://spec.matrix.org/v1.19/changelog/). Links in this section point at v1.19 so they stay stable; replace `v1.19` with `latest` to see the newest text.

## Structure

| API | Between | Spec |
|-----|---------|------|
| Client-Server | Clients and their homeserver | [client-server-api](https://spec.matrix.org/v1.19/client-server-api/) · [summary](./client-server) |
| Server-Server (federation) | Homeservers | [server-server-api](https://spec.matrix.org/v1.19/server-server-api/) · [summary](./server-server) |
| Application Service | Homeserver and bridges/bots | [application-service-api](https://spec.matrix.org/v1.19/application-service-api/) |
| Identity Service | Clients/servers and identity servers (3PID lookup) | [identity-service-api](https://spec.matrix.org/v1.19/identity-service-api/) |
| Push Gateway | Homeserver and push providers | [push-gateway-api](https://spec.matrix.org/v1.19/push-gateway-api/) |
| Room versions | Event format, auth rules, state resolution | [rooms](https://spec.matrix.org/v1.19/rooms/) · [summary](./rooms) |
| Appendices | Identifiers, signing, canonical JSON | [appendices](https://spec.matrix.org/v1.19/appendices/) |

## Room versions

Room versions fix the rules a room runs under: event format, authorisation rules and state resolution. A room keeps its version until it is upgraded. All versions 1–12 are stable. The spec says servers SHOULD use **version 12** as the default for new rooms, and Synapse has done so since 1.162 (2026-09-29).

| Version | What it adds |
|---------|--------------|
| 1–6 | State resolution v2 (2), hashed event IDs (3, 4), signing-key validity (5), auth rule changes (6) |
| 7 | Knocking |
| 8 | Restricted join rule (join via membership of another room) |
| 9 | Fixes redaction of some membership events |
| 10 | Integer-only power levels; `knock_restricted` join rule |
| 11 | Clarified redaction algorithm |
| 12 | Room IDs are the hash of the create event (no `:server`); room creators have unlimited power; state resolution v2.1 |

Source: [room versions](https://spec.matrix.org/v1.19/rooms/#feature-matrix). Room version 12 came out of "Project Hydra", which fixed two high-severity federation flaws (CVE-2025-49090 and CVE-2025-54315) disclosed in 2025-08. See [Rooms](./rooms#room-version-12) for what it changes for clients and bots.

## Recent changes (v1.11 to v1.19)

| Version | Date | Highlights |
|---------|------|-----------|
| v1.11 | 2024-06-20 | **Authenticated media** (MSC3916); access tokens in query strings deprecated |
| v1.12 | 2024-10-07 | Account locking; `via` replaces `server_name` on join/knock |
| v1.13 | 2024-12-19 | **Reply fallbacks removed**; account suspension (`M_USER_SUSPENDED`); room reporting; ephemeral events for appservices |
| v1.14 | 2025-03-27 | User reporting; `server_name` removed from join/knock |
| v1.15 | 2025-06-26 | **OAuth 2.0 API** (next-gen auth); room summary API; rich topics |
| v1.16 | 2025-09-17 | **Room version 12**; custom profile fields and time zone; `state_after` in `/sync` |
| v1.17 | 2025-12-18 | Legacy body-text mentions removed; appservice device management (MSC4190, MSC4326) |
| v1.18 | 2026-03-25 | **Policy servers**; invite blocking; admin suspend/lock endpoints; **cross-signing recommendation** (MSC4153); device authorization grant; `/v1/send_join` and `/v1/send_leave` removed |
| v1.19 | 2026-07-08 | Encrypted history sharing (MSC4268); image packs (custom emoji); mutual rooms |

Where to read more:

- Authenticated media: [content repository](https://spec.matrix.org/v1.19/client-server-api/#content-repository)
- OAuth 2.0 API: [client authentication](https://spec.matrix.org/v1.19/client-server-api/#client-authentication) and [OAuth 2.0 API](https://spec.matrix.org/v1.19/client-server-api/#oauth-20-api)
- Room version 12: [rooms/v12](https://spec.matrix.org/v1.19/rooms/v12/)
- Policy servers: [client-server](https://spec.matrix.org/v1.19/client-server-api/#policy-servers), [server-server](https://spec.matrix.org/v1.19/server-server-api/#policy-servers)
- MSC4153 cross-signing recommendation: [recommended client behaviour](https://spec.matrix.org/v1.19/client-server-api/#recommended-client-behaviour)

## Matrix Spec Changes (MSCs)

Changes to the spec start as **MSCs** (proposals) in [matrix-spec-proposals](https://github.com/matrix-org/matrix-spec-proposals). An MSC goes through review and a final comment period, then is merged into a spec release. The process is documented at [spec.matrix.org/proposals](https://spec.matrix.org/proposals/).

Some widely deployed features are **not in v1.19** yet:

| Feature | MSC | Status (2026-10) |
|---------|-----|------------------|
| Simplified Sliding Sync (used by Element X) | [MSC4186](https://github.com/matrix-org/matrix-spec-proposals/pull/4186) | Accepted 2026-06-29; awaiting spec text. Replaces the obsolete MSC3575. |
| MatrixRTC (Element Call) | [MSC4143](https://github.com/matrix-org/matrix-spec-proposals/pull/4143) and related | In final comment period since 2026-10-15. Replaces the obsolete MSC3401. |

:::info Coming next
Spec `main` already contains changes for the release after v1.19, including removal of query-string access tokens (MSC4127), clients following redirects on `/.well-known/matrix/client` (MSC4402) and an `m.policy` room type (MSC3784). Source: [matrix-spec repository](https://github.com/matrix-org/matrix-spec).
:::

## Resources

- [spec.matrix.org](https://spec.matrix.org/)
- [Spec changelog](https://spec.matrix.org/v1.19/changelog/)
- [MSC repository](https://github.com/matrix-org/matrix-spec-proposals)
- [#matrix-spec:matrix.org](https://matrix.to/#/#matrix-spec:matrix.org)
