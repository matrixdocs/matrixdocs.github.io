---
sidebar_position: 5
title: Rooms
description: Room IDs, creation presets, join rules, spaces, upgrades and room version 12, per spec v1.19
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0"
---

# Matrix rooms

A room is a shared, replicated event history plus the state derived from it. This page covers the parts developers meet most; links go to spec v1.19.

## Identifiers

| Identifier | Example | Notes |
|------------|---------|-------|
| Room ID, room v12 | `!8sQ1Ex3dBJbCgFm4eN0LkSUAtjbAEdZ8wVSA1dl1Ytk` | The hash of the `m.room.create` event, no server part |
| Room ID, room v1–11 | `!OGEhHVWSdvArJzumhm:matrix.org` | Opaque localpart plus the creating server's name |
| Room alias | `#matrix:matrix.org` | Human-readable pointer to a room ID; can change |

Treat room IDs as **opaque strings**. Never parse a server name out of one: v12 room IDs don't have one, and in older rooms the domain only says who created the room, not who still hosts it. If you need a server to join through, use `via` servers from links or `m.space.child` events. See [room IDs](https://spec.matrix.org/v1.19/appendices/#room-ids).

## Creating a room

```http
POST /_matrix/client/v3/createRoom
Content-Type: application/json

{
  "preset": "private_chat",
  "name": "Project room",
  "topic": "Planning",
  "invite": ["@bob:example.org"]
}
```

Leave out `room_version` to get the server's default. The spec says servers SHOULD default to version 12; Synapse does since 1.162 (2026-09-29).

Presets set three state events ([createRoom](https://spec.matrix.org/v1.19/client-server-api/#post_matrixclientv3createroom)):

| Preset | `join_rules` | `history_visibility` | `guest_access` | Other |
|--------|--------------|----------------------|----------------|-------|
| `private_chat` | `invite` | `shared` | `can_join` | |
| `trusted_private_chat` | `invite` | `shared` | `can_join` | Invitees get the creator's power; in v12 they become `additional_creators` |
| `public_chat` | `public` | `shared` | `forbidden` | |

Presets do not turn on encryption. To create an encrypted room, include an `m.room.encryption` event in `initial_state`.

## Room state

State events are keyed by `(type, state_key)`; the latest one for each pair is the current state. Common ones:

| Type | What it controls |
|------|------------------|
| `m.room.create` | Room version, creators, type (`m.space` for spaces), predecessor |
| `m.room.power_levels` | Who can do what |
| `m.room.join_rules` | Who can join |
| `m.room.history_visibility` | Who can read past messages |
| `m.room.encryption` | E2EE settings (can't be turned off once on) |
| `m.room.server_acl` | Which servers may take part |
| `m.room.name`, `m.room.topic`, `m.room.avatar` | Display information |

## Join rules

| `join_rule` | Who can join | Room versions |
|-------------|--------------|---------------|
| `public` | Anyone | all |
| `invite` | Invited users | all |
| `knock` | Anyone can ask; members with invite power approve | 7+ |
| `restricted` | Members of any room listed in `allow` (typically a space), or invited users | 8+ |
| `knock_restricted` | As `restricted`, and others can knock | 10+ |

See [m.room.join_rules](https://spec.matrix.org/v1.19/client-server-api/#mroomjoin_rules).

## History visibility

| Value | Who can read history |
|-------|----------------------|
| `world_readable` | Anyone, including non-members |
| `shared` | Members can read everything, including from before they joined |
| `invited` | Members can read from the point they were invited |
| `joined` | Members can read from the point they joined |

## Spaces

A space is a room with `"type": "m.space"` in its create event. Children are linked by `m.space.child` state events in the space (state key = child room ID), and children can point back with `m.space.parent`:

```json
{
  "type": "m.space.child",
  "state_key": "!child-room-id",
  "content": {
    "via": ["example.org"],
    "suggested": true,
    "order": "a"
  }
}
```

Clients browse a space with `GET /_matrix/client/v1/rooms/{roomId}/hierarchy`. See [spaces](https://spec.matrix.org/v1.19/client-server-api/#spaces).

To preview a room before joining, v1.15 added `GET /_matrix/client/v1/room_summary/{roomIdOrAlias}`.

## Room version 12

Room version 12 (spec v1.16, 2025-09) came out of the 2025 "Project Hydra" security work. For clients and bots it changes three things ([room version 12](https://spec.matrix.org/v1.19/rooms/v12/)):

- **Room IDs** are the create event's hash, with no server name.
- **Creators** (the create event's `sender` plus `additional_creators`) have unlimited power level. They are not listed in `m.room.power_levels` and cannot be demoted, kicked or banned by anyone, including power level 100 admins and moderation bots.
- **State resolution v2.1** fixes state resets. See [Server-Server API](./server-server#room-state-resolution).

The power level for sending `m.room.tombstone` (upgrading the room) must be explicitly higher than `state_default`, for example 150, so ordinary admins can't upgrade the room by default.

## Room upgrades

To move a room to a new version, a user with permission calls:

```http
POST /_matrix/client/v3/rooms/{roomId}/upgrade
Content-Type: application/json

{ "new_version": "12", "additional_creators": ["@co-admin:example.org"] }
```

The server creates the new room (whose `m.room.create` has a `predecessor` pointing back), copies key state, and sends an `m.room.tombstone` in the old room:

```json
{
  "type": "m.room.tombstone",
  "state_key": "",
  "content": {
    "body": "This room has been replaced",
    "replacement_room": "!new-room-id"
  }
}
```

Members are not moved. Clients see the tombstone and offer to join the replacement room. When upgrading to v12, the upgrading user becomes a creator of the new room; other creators must be listed in `additional_creators`, as they are not copied over. See [room upgrades](https://spec.matrix.org/v1.19/client-server-api/#room-upgrades).

## Resources

- [Room versions, spec v1.19](https://spec.matrix.org/v1.19/rooms/)
- [Rooms in the Client-Server API](https://spec.matrix.org/v1.19/client-server-api/#rooms)
