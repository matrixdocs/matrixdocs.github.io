---
sidebar_position: 4
title: Events
description: Matrix event structure, common event types and relationships (replies, threads, edits, reactions), per spec v1.19
last_update:
  date: 2026-10-18
verified_with: "spec v1.19"
---

# Matrix events

Everything in a Matrix room is an event. This page shows the common shapes; the [events section of the spec](https://spec.matrix.org/v1.19/client-server-api/#events) and each module's page are the reference.

## Event structure

A room event as a client sees it:

```json
{
  "type": "m.room.message",
  "event_id": "$Rqnc-F-dvnEYJTyHq_iKxU2bZ1CI92-kuZq3a5lr5Zg",
  "sender": "@alice:example.org",
  "room_id": "!8sQ1Ex3dBJbCgFm4eN0LkSUAtjbAEdZ8wVSA1dl1Ytk",
  "origin_server_ts": 1760000000000,
  "content": {
    "msgtype": "m.text",
    "body": "Hello"
  },
  "unsigned": {
    "age": 1234,
    "membership": "join"
  }
}
```

- The room ID above has no `:server` part: that is the room version 12 format. Older rooms look like `!abc123:example.org`. Treat room IDs as opaque either way.
- `unsigned` is added by your server and is not signed. `unsigned.membership` (v1.11) is your own membership at the time of the event.

## Event categories

| Category | Has `state_key` | Stored in room history | Examples |
|----------|-----------------|------------------------|----------|
| Message events | No | Yes | `m.room.message`, `m.reaction`, `m.sticker`, `m.room.encrypted` |
| State events | Yes | Yes, and form the room state | `m.room.name`, `m.room.member`, `m.room.power_levels`, `m.room.server_acl` |
| Room ephemeral events | – | No | `m.typing`, `m.receipt` |

Presence (`m.presence`) is not a room event; it arrives in the top-level `presence` section of `/sync`. Account data (per user, optionally per room) and to-device messages are separate channels too.

## Common event types

### m.room.message

`msgtype` values in v1.19: `m.text`, `m.emote`, `m.notice`, `m.image`, `m.file`, `m.audio`, `m.video`, `m.location`, `m.key.verification.request` and `m.server_notice`. Bots should send `m.notice`, which the spec says must never be automatically responded to. See [m.room.message msgtypes](https://spec.matrix.org/v1.19/client-server-api/#mroommessage-msgtypes).

To mention someone, list them in `m.mentions` ([user and room mentions](https://spec.matrix.org/v1.19/client-server-api/#user-and-room-mentions)). Detecting mentions from the body text was removed in v1.17.

```json
{
  "type": "m.room.message",
  "content": {
    "msgtype": "m.text",
    "body": "Alice: the build is green",
    "m.mentions": { "user_ids": ["@alice:example.org"] }
  }
}
```

### m.room.member

```json
{
  "type": "m.room.member",
  "state_key": "@alice:example.org",
  "content": {
    "membership": "join",
    "displayname": "Alice"
  }
}
```

`membership` is one of `invite`, `join`, `knock`, `leave` or `ban`.

### m.room.power_levels

The defaults when a field is absent: `users_default` 0, `events_default` 0, `state_default` 50, `ban` 50, `kick` 50, `redact` 50, `invite` 0. Rooms created through `createRoom` usually set explicit values.

```json
{
  "type": "m.room.power_levels",
  "state_key": "",
  "content": {
    "users": { "@mod:example.org": 50 },
    "users_default": 0,
    "events_default": 0,
    "state_default": 50,
    "ban": 50,
    "kick": 50,
    "redact": 50,
    "invite": 0
  }
}
```

In room version 12, room creators (the creator plus any `additional_creators`) have unlimited power, must not appear in `users`, and cannot be demoted. See [m.room.power_levels](https://spec.matrix.org/v1.19/client-server-api/#mroompower_levels).

## Relationships

Relationships go in `content["m.relates_to"]`.

### Reactions

```json
{
  "type": "m.reaction",
  "content": {
    "m.relates_to": {
      "rel_type": "m.annotation",
      "event_id": "$target_event",
      "key": "👍"
    }
  }
}
```

### Replies

Since v1.13 the reply fallback (quoting the original in `body` and `formatted_body`) is no longer specified. Send only the relation, and mention the original sender if you want to notify them ([rich replies](https://spec.matrix.org/v1.19/client-server-api/#rich-replies)):

```json
{
  "type": "m.room.message",
  "content": {
    "msgtype": "m.text",
    "body": "Sounds good",
    "m.mentions": { "user_ids": ["@alice:example.org"] },
    "m.relates_to": {
      "m.in_reply_to": { "event_id": "$original_event" }
    }
  }
}
```

### Threads

A thread message points at the thread root. Including `m.in_reply_to` with `is_falling_back: true` lets clients without thread support show it as a reply to the latest message ([threading](https://spec.matrix.org/v1.19/client-server-api/#threading)):

```json
{
  "type": "m.room.message",
  "content": {
    "msgtype": "m.text",
    "body": "Reply in thread",
    "m.relates_to": {
      "rel_type": "m.thread",
      "event_id": "$thread_root",
      "is_falling_back": true,
      "m.in_reply_to": { "event_id": "$latest_event_in_thread" }
    }
  }
}
```

### Edits

An edit is a new event with `rel_type: m.replace`. `m.new_content` holds the replacement content; the outer `body` and `msgtype` are a fallback ([event replacements](https://spec.matrix.org/v1.19/client-server-api/#event-replacements)):

```json
{
  "type": "m.room.message",
  "content": {
    "msgtype": "m.text",
    "body": "* Corrected message",
    "m.new_content": {
      "msgtype": "m.text",
      "body": "Corrected message"
    },
    "m.relates_to": {
      "rel_type": "m.replace",
      "event_id": "$original_event"
    }
  }
}
```

## Redactions

A redaction strips an event down to the keys the room version keeps. Since room version 11, the target is given as `redacts` inside `content`:

```json
{
  "type": "m.room.redaction",
  "content": {
    "redacts": "$event_to_remove",
    "reason": "Spam"
  }
}
```

Clients usually send this with `PUT /_matrix/client/v3/rooms/{roomId}/redact/{eventId}/{txnId}`; since v1.18 it can also be sent through the normal `/send` endpoint. Redacted events keep their place in the timeline with an `unsigned.redacted_because`. See [redactions](https://spec.matrix.org/v1.19/client-server-api/#redactions).

## Newer event types

| Type | Since | Purpose |
|------|-------|---------|
| `m.topic` content block in `m.room.topic` | v1.15 | Rich-text room topics |
| `m.room.image_pack`, `m.image_pack.rooms` | v1.19 | Custom emoji and sticker packs ([image packs](https://spec.matrix.org/v1.19/client-server-api/#image-packs)) |
| `m.room.policy` | v1.18 | Names the room's policy server |
| `m.policy.rule.user` / `.room` / `.server` | long-standing | Moderation policy lists |

## Resources

- [Events, spec v1.19](https://spec.matrix.org/v1.19/client-server-api/#events)
- [Event schemas on GitHub](https://github.com/matrix-org/matrix-spec/tree/main/data/event-schemas/schema)
