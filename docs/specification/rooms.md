---
sidebar_position: 5
title: Rooms
description: Understanding Matrix rooms and their properties
---

# Matrix Rooms

Rooms are the fundamental unit of communication in Matrix.

## Room Identifiers

### Room ID

Internal, permanent identifier:
```
!abc123xyz:example.com
```

- Starts with `!`
- Globally unique
- Never changes

### Room Alias

Human-readable address:
```
#general:example.com
```

- Starts with `#`
- Can be changed/deleted
- Multiple aliases per room

## Room Creation

```json
POST /_matrix/client/v3/createRoom

{
  "room_version": "11",
  "name": "My Room",
  "topic": "Discussion topic",
  "preset": "private_chat",
  "is_direct": false,
  "initial_state": [...],
  "invite": ["@user:example.com"]
}
```

### Presets

| Preset | Join Rules | History | Encryption |
|--------|------------|---------|------------|
| `private_chat` | invite | shared | optional |
| `trusted_private_chat` | invite | shared | recommended |
| `public_chat` | public | shared | not set |

## Room State

State defines room properties:

| State Event | Purpose |
|-------------|---------|
| `m.room.name` | Room name |
| `m.room.topic` | Room topic |
| `m.room.avatar` | Room icon |
| `m.room.canonical_alias` | Main alias |
| `m.room.join_rules` | Who can join |
| `m.room.history_visibility` | Who sees history |
| `m.room.guest_access` | Guest permissions |
| `m.room.power_levels` | Permissions |
| `m.room.encryption` | E2EE settings |

## Join Rules

```json
{
  "type": "m.room.join_rules",
  "content": {
    "join_rule": "invite"
  }
}
```

| Rule | Description |
|------|-------------|
| `public` | Anyone can join |
| `invite` | Must be invited |
| `knock` | Can request to join |
| `restricted` | Space members can join |
| `knock_restricted` | Knock + restricted |

## History Visibility

```json
{
  "type": "m.room.history_visibility",
  "content": {
    "history_visibility": "shared"
  }
}
```

| Setting | Description |
|---------|-------------|
| `world_readable` | Anyone (even non-members) |
| `shared` | All members (past and present) |
| `invited` | From invitation onward |
| `joined` | From join onward |

## Spaces

Spaces are rooms with `m.space` type:

```json
{
  "creation_content": {
    "type": "m.space"
  }
}
```

### Space Children

```json
{
  "type": "m.space.child",
  "state_key": "!child:example.com",
  "content": {
    "via": ["example.com"],
    "order": "a",
    "suggested": true
  }
}
```

### Space Parents

```json
{
  "type": "m.space.parent",
  "state_key": "!parent:example.com",
  "content": {
    "via": ["example.com"],
    "canonical": true
  }
}
```

## Room Upgrades

Rooms can be upgraded to new versions:

1. Create new room with new version
2. Tombstone old room
3. Auto-redirect clients

Tombstone event:
```json
{
  "type": "m.room.tombstone",
  "content": {
    "body": "Room upgraded",
    "replacement_room": "!newroom:example.com"
  }
}
```

## Resources

- [Rooms Spec](https://spec.matrix.org/latest/client-server-api/#rooms)
- [Spaces Spec](https://spec.matrix.org/latest/client-server-api/#spaces)

---

*Next: [Hidden Gems](../gems/overview) →*
