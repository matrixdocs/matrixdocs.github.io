---
sidebar_position: 2
title: Client-Server API
description: How clients communicate with homeservers
---

# Client-Server API

The Client-Server API defines how Matrix clients interact with homeservers.

## Base URL

All endpoints are relative to:
```
https://matrix.example.com/_matrix/client/v3/
```

## Authentication

### Password Login

```http
POST /_matrix/client/v3/login

{
  "type": "m.login.password",
  "identifier": {
    "type": "m.id.user",
    "user": "username"
  },
  "password": "password",
  "initial_device_display_name": "My Device"
}
```

Response:
```json
{
  "user_id": "@username:example.com",
  "access_token": "syt_...",
  "device_id": "DEVICEID"
}
```

### Using Access Tokens

Include in all authenticated requests:
```http
Authorization: Bearer syt_...
```

## Sync

The sync endpoint is how clients receive updates:

```http
GET /_matrix/client/v3/sync?timeout=30000
```

Response includes:
- **rooms** - Room updates
- **presence** - Online status
- **account_data** - User settings
- **to_device** - Device messages

### Incremental Sync

Use `since` parameter for incremental updates:
```http
GET /_matrix/client/v3/sync?since=s123_456&timeout=30000
```

## Rooms

### Create Room

```http
POST /_matrix/client/v3/createRoom

{
  "name": "My Room",
  "topic": "Discussion",
  "preset": "private_chat",
  "invite": ["@friend:example.com"]
}
```

### Join Room

```http
POST /_matrix/client/v3/join/{roomIdOrAlias}
```

### Send Message

```http
PUT /_matrix/client/v3/rooms/{roomId}/send/m.room.message/{txnId}

{
  "msgtype": "m.text",
  "body": "Hello!"
}
```

## Events

### Get Room Messages

```http
GET /_matrix/client/v3/rooms/{roomId}/messages?dir=b&limit=50
```

### Send State Event

```http
PUT /_matrix/client/v3/rooms/{roomId}/state/{eventType}/{stateKey}
```

### Redact Event

```http
PUT /_matrix/client/v3/rooms/{roomId}/redact/{eventId}/{txnId}
```

## User Profile

### Get Profile

```http
GET /_matrix/client/v3/profile/{userId}
```

### Set Display Name

```http
PUT /_matrix/client/v3/profile/{userId}/displayname

{
  "displayname": "New Name"
}
```

## Error Responses

Standard error format:
```json
{
  "errcode": "M_FORBIDDEN",
  "error": "You are not allowed to do this"
}
```

Common error codes:

| Code | Meaning |
|------|---------|
| M_FORBIDDEN | Permission denied |
| M_NOT_FOUND | Resource not found |
| M_UNKNOWN_TOKEN | Invalid access token |
| M_LIMIT_EXCEEDED | Rate limited |
| M_BAD_JSON | Malformed request |

## Rate Limiting

When rate limited:
```json
{
  "errcode": "M_LIMIT_EXCEEDED",
  "retry_after_ms": 5000
}
```

Wait `retry_after_ms` before retrying.

## Resources

- [Full Client-Server Spec](https://spec.matrix.org/latest/client-server-api/)

---

*Next: [Server-Server API](./server-server) →*
