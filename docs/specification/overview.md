---
sidebar_position: 1
title: Matrix Specification Overview
description: Understanding the Matrix protocol specification
---

# Matrix Specification

The Matrix specification defines how Matrix works. Understanding it helps you build better applications and troubleshoot issues.

## Spec Structure

The specification is divided into several APIs:

| API | Purpose |
|-----|---------|
| [Client-Server](./client-server) | Client ↔ Homeserver |
| [Server-Server](./server-server) | Homeserver ↔ Homeserver (Federation) |
| [Application Service](./events) | Bridges & bots |
| [Identity Service](https://spec.matrix.org/latest/identity-service-api/) | 3PID lookup |
| [Push Gateway](https://spec.matrix.org/latest/push-gateway-api/) | Push notifications |

## Current Version

The latest stable version is **v1.11** (as of 2024).

Check the current version at [spec.matrix.org](https://spec.matrix.org/latest/).

## Room Versions

Room behavior is defined by room versions:

| Version | Features | Status |
|---------|----------|--------|
| 1-5 | Legacy | Deprecated |
| 6 | Stricter validation | Deprecated |
| 7-8 | Knock support | Deprecated |
| 9 | Restricted rooms | Current |
| 10 | Knock + restricted | Current |
| 11 | Latest features | Latest |

### Creating Rooms

Specify room version when creating:

```json
{
  "room_version": "11",
  "name": "My Room"
}
```

## MSCs (Matrix Spec Changes)

New features are proposed through MSCs:

1. **Proposal** - Write MSC document
2. **Review** - Community feedback
3. **FCP** - Final Comment Period
4. **Merge** - Added to spec

### Notable MSCs

| MSC | Feature |
|-----|---------|
| MSC1772 | Spaces |
| MSC2674 | Event relationships (threads) |
| MSC3401 | Native group calls |
| MSC3575 | Sliding Sync |

Track MSCs at [matrix.org/docs/spec/proposals](https://spec.matrix.org/proposals/).

## Reading the Spec

### Endpoints

Each endpoint is documented with:
- **HTTP method and path**
- **Request parameters**
- **Response format**
- **Error codes**

Example:
```
POST /_matrix/client/v3/rooms/{roomId}/send/{eventType}/{txnId}
```

### Event Schemas

Events have defined schemas:

```json
{
  "type": "m.room.message",
  "content": {
    "msgtype": "m.text",
    "body": "Hello"
  }
}
```

## Useful Spec Sections

### For Client Developers

- [Syncing](https://spec.matrix.org/latest/client-server-api/#syncing)
- [Rooms](https://spec.matrix.org/latest/client-server-api/#rooms)
- [Events](https://spec.matrix.org/latest/client-server-api/#events)
- [E2EE](https://spec.matrix.org/latest/client-server-api/#end-to-end-encryption)

### For Server Admins

- [Server discovery](https://spec.matrix.org/latest/server-server-api/#server-discovery)
- [Authentication](https://spec.matrix.org/latest/server-server-api/#authentication)
- [Key management](https://spec.matrix.org/latest/server-server-api/#key-management)

## Resources

- [Matrix Spec](https://spec.matrix.org/latest/) - Full specification
- [Spec Proposals](https://spec.matrix.org/proposals/) - MSCs
- [#matrix-spec:matrix.org](https://matrix.to/#/#matrix-spec:matrix.org) - Discussion

---

*Continue: [Client-Server API](./client-server) | [Server-Server API](./server-server)*
