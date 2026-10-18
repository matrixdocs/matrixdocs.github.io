---
sidebar_position: 3
title: Server-Server API
description: How homeservers find each other, authenticate, exchange events and resolve state (spec v1.19)
last_update:
  date: 2026-10-18
verified_with: "spec v1.19"
---

# Server-Server API (federation)

The Server-Server (S-S) API is how homeservers exchange events. This page outlines the moving parts; the [spec](https://spec.matrix.org/v1.19/server-server-api/) is the reference.

## Server discovery

To reach `example.org`, a server follows the steps in [resolving server names](https://spec.matrix.org/v1.19/server-server-api/#resolving-server-names). In practice, either:

- serve `https://example.org/.well-known/matrix/server` with a delegation:

  ```json
  { "m.server": "matrix.example.org:443" }
  ```

- or publish an SRV record for `_matrix-fed._tcp.example.org`.

The older `_matrix._tcp` SRV service name is deprecated. If neither exists, servers connect to port 8448 on the server name.

## Authentication

Each server publishes its signing keys at `GET /_matrix/key/v2/server` ([retrieving server keys](https://spec.matrix.org/v1.19/server-server-api/#retrieving-server-keys)). Every federation request is signed and carries an `Authorization` header:

```http
Authorization: X-Matrix origin="origin.example",destination="destination.example",key="ed25519:key1",sig="ABCDEF..."
```

See [request authentication](https://spec.matrix.org/v1.19/server-server-api/#request-authentication). Federation also requires valid TLS certificates for the target name.

## Main endpoints

| Purpose | Endpoint |
|---------|----------|
| Push a transaction of PDUs and EDUs | `PUT /_matrix/federation/v1/send/{txnId}` |
| Fetch one event | `GET /_matrix/federation/v1/event/{eventId}` |
| Room state at an event | `GET /_matrix/federation/v1/state/{roomId}?event_id=...` |
| Start a join | `GET /_matrix/federation/v1/make_join/{roomId}/{userId}?ver=...` |
| Complete a join | `PUT /_matrix/federation/v2/send_join/{roomId}/{eventId}` |
| Download media | `GET /_matrix/federation/v1/media/download/{mediaId}` |
| Server software version | `GET /_matrix/federation/v1/version` |

Notes:

- A transaction body has `origin`, `origin_server_ts` and `pdus` (and optionally `edus`). See [transactions](https://spec.matrix.org/v1.19/server-server-api/#transactions).
- `make_join` takes the room versions the server supports as `ver` parameters.
- The v1 `send_join` and `send_leave` endpoints were removed in v1.18. Use v2.
- Federation media endpoints (v1.11) go with authenticated client media. See [content repository](https://spec.matrix.org/v1.19/server-server-api/#content-repository).

## PDUs and EDUs

- **PDUs** (persistent data units) are room events. They are signed, hashed, and reference earlier events through `prev_events` and `auth_events`, forming the room DAG. The exact format depends on the [room version](https://spec.matrix.org/v1.19/rooms/). See [PDUs](https://spec.matrix.org/v1.19/server-server-api/#pdus).
- **EDUs** (ephemeral data units) are things like typing notifications, receipts, presence and device-list updates. They are not stored in the room. Since v1.13, server ACLs apply to EDUs as well.

## Room state resolution

When servers see different branches of a room's history, **state resolution** decides the room's state. Room versions 2–11 use state resolution v2. It:

1. splits state into unconflicted and conflicted parts, and adds the *auth difference* (auth events not shared by every branch) to the conflicted set;
2. orders the conflicted *power events* (power levels, join rules, bans and kicks) by a reverse topological power ordering, and applies them with iterative auth checks;
3. orders the remaining conflicted events by their position relative to the resolved power-levels "mainline", and applies them the same way;
4. re-applies the unconflicted state on top.

Sender power level, `origin_server_ts` and event ID are only tie-breakers inside these orderings. The precise rules are in [room version 2: state resolution](https://spec.matrix.org/v1.19/rooms/v2/#state-resolution).

Room version 12 uses **state resolution v2.1** (MSC4297): iterative auth checks start from an empty state map, and a "conflicted state subgraph" is included in the full conflicted set. This fixes state resets (CVE-2025-49090). See [room version 12: state resolution](https://spec.matrix.org/v1.19/rooms/v12/#state-resolution).

## Policy servers

Since v1.18, a room can name a **policy server** in its state. Servers in the room ask it to sign each event; an event without a valid policy-server signature SHOULD be soft-failed (or the sending request refused). See [policy servers](https://spec.matrix.org/v1.19/server-server-api/#policy-servers). The Foundation's implementation is [policyserv](https://github.com/matrix-org/policyserv).

## Testing federation

The [Matrix Federation Tester](https://federationtester.matrix.org/) checks discovery, TLS and key fetching for a server name. Its JSON API is at `https://federationtester.matrix.org/api/report?server_name=example.org`.

## Resources

- [Server-Server API, v1.19](https://spec.matrix.org/v1.19/server-server-api/)
- [Room versions](https://spec.matrix.org/v1.19/rooms/)
