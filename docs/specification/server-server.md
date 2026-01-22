---
sidebar_position: 3
title: Server-Server API
description: How homeservers federate with each other
---

# Server-Server API (Federation)

The Server-Server API defines how homeservers communicate with each other.

## Server Discovery

### Well-Known

Homeservers discover each other via `.well-known`:

```http
GET https://example.com/.well-known/matrix/server
```

Response:
```json
{
  "m.server": "matrix.example.com:443"
}
```

### SRV Records

Alternative discovery via DNS:
```
_matrix._tcp.example.com. 3600 IN SRV 10 0 443 matrix.example.com.
```

## Authentication

### Signing Keys

Servers authenticate using Ed25519 keys:

```http
GET /_matrix/key/v2/server
```

Response includes server's signing keys.

### Request Signing

Each request is signed:
```http
Authorization: X-Matrix origin="example.com",destination="other.com",key="ed25519:abc123",sig="..."
```

## Endpoints

### Send Transaction

```http
PUT /_matrix/federation/v1/send/{txnId}

{
  "pdus": [...events...],
  "edus": [...ephemeral...]
}
```

### Get Event

```http
GET /_matrix/federation/v1/event/{eventId}
```

### Get State

```http
GET /_matrix/federation/v1/state/{roomId}
```

### Join Room

```http
GET /_matrix/federation/v1/make_join/{roomId}/{userId}
PUT /_matrix/federation/v2/send_join/{roomId}/{eventId}
```

## PDUs and EDUs

### PDU (Persistent Data Unit)

Room events that persist:
```json
{
  "type": "m.room.message",
  "room_id": "!room:example.com",
  "sender": "@user:example.com",
  "origin_server_ts": 1234567890,
  "content": {...}
}
```

### EDU (Ephemeral Data Unit)

Non-persistent events:
- Typing notifications
- Presence updates
- Device list updates

## Room State Resolution

When servers have conflicting state, resolution algorithms determine the true state.

Current algorithm (room version 11):
1. Event with highest power level wins
2. Ties broken by origin timestamp
3. Further ties broken by event ID

## Testing Federation

Use the federation tester:
```
https://federationtester.matrix.org/api/report?server_name=example.com
```

## Resources

- [Full Server-Server Spec](https://spec.matrix.org/latest/server-server-api/)

---

*Next: [Events](./events) →*
