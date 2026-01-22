---
sidebar_position: 4
title: Events
description: Understanding Matrix event types and structure
---

# Matrix Events

Everything in Matrix is an event. Understanding events is key to working with the protocol.

## Event Structure

Every event has:

```json
{
  "type": "m.room.message",
  "event_id": "$abc123:example.com",
  "sender": "@user:example.com",
  "room_id": "!room:example.com",
  "origin_server_ts": 1234567890123,
  "content": {
    "msgtype": "m.text",
    "body": "Hello"
  }
}
```

## Event Categories

### Message Events

Appear in room timeline:
- `m.room.message`
- `m.sticker`
- `m.room.encrypted`

### State Events

Define room state:
- `m.room.name`
- `m.room.topic`
- `m.room.member`
- `m.room.power_levels`

State events have a `state_key` field.

### Ephemeral Events

Not persisted:
- `m.typing`
- `m.receipt`
- `m.presence`

## Common Event Types

### m.room.message

```json
{
  "type": "m.room.message",
  "content": {
    "msgtype": "m.text",
    "body": "Hello, world!"
  }
}
```

Message types (`msgtype`):
| Type | Description |
|------|-------------|
| `m.text` | Plain text |
| `m.notice` | Bot/system message |
| `m.emote` | /me action |
| `m.image` | Image |
| `m.file` | File |
| `m.audio` | Audio |
| `m.video` | Video |
| `m.location` | Location |

### m.room.member

```json
{
  "type": "m.room.member",
  "state_key": "@user:example.com",
  "content": {
    "membership": "join",
    "displayname": "User",
    "avatar_url": "mxc://..."
  }
}
```

Membership values:
- `invite`
- `join`
- `leave`
- `ban`
- `knock`

### m.room.power_levels

```json
{
  "type": "m.room.power_levels",
  "state_key": "",
  "content": {
    "users_default": 0,
    "events_default": 0,
    "state_default": 50,
    "ban": 50,
    "kick": 50,
    "redact": 50,
    "invite": 0,
    "users": {
      "@admin:example.com": 100
    }
  }
}
```

### m.reaction

```json
{
  "type": "m.reaction",
  "content": {
    "m.relates_to": {
      "rel_type": "m.annotation",
      "event_id": "$event:example.com",
      "key": "👍"
    }
  }
}
```

## Event Relationships

### Replies

```json
{
  "content": {
    "body": "> Original\n\nReply",
    "m.relates_to": {
      "m.in_reply_to": {
        "event_id": "$original:example.com"
      }
    }
  }
}
```

### Threads

```json
{
  "content": {
    "body": "Thread reply",
    "m.relates_to": {
      "rel_type": "m.thread",
      "event_id": "$root:example.com"
    }
  }
}
```

### Edits

```json
{
  "content": {
    "body": "* Edited message",
    "m.new_content": {
      "body": "Edited message"
    },
    "m.relates_to": {
      "rel_type": "m.replace",
      "event_id": "$original:example.com"
    }
  }
}
```

## Redaction

Redacted events have content removed:

```json
{
  "type": "m.room.message",
  "content": {},
  "unsigned": {
    "redacted_because": {...}
  }
}
```

## Resources

- [Event Spec](https://spec.matrix.org/latest/client-server-api/#events)

---

*Next: [Rooms](/specification/rooms) →*
