---
sidebar_position: 6
title: Room Version 12
description: What room version 12 (Project Hydra) changes, what breaks for clients, bots and bridges, how to upgrade a room and which servers support it, per spec v1.19
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, Element Web 1.12.32, Dendrite 0.15.2, Conduit 0.10.15, continuwuity 26.9.1, tuwunel 1.9.4"
---

# Room version 12

Room version 12 is the version the spec recommends for new rooms, and the default in Synapse since 1.162.0 (2026-09-29). Compared with version 11 it changes three things ([room version 12](https://spec.matrix.org/v1.19/rooms/v12/#client-considerations)):

- **Room IDs** are the hash of the room's `m.room.create` event and have no server name.
- **Room creators** have an infinitely high power level that nobody can change.
- **State resolution** is revised to make "state resets" less likely.

Most users notice nothing. Code that parses room IDs or reads power levels may need changes; see [What to change in your code](#what-to-change-in-your-code).

## Why it exists

In 2025-08 the Matrix project published a coordinated security release, called "Project Hydra", for two high-severity federation flaws ([matrix.org blog, 2025-08-14](https://matrix.org/blog/2025/08/project-hydra-improving-state-res/)):

| Problem | Fix in v12 | Proposal |
|---------|-----------|----------|
| CVE-2025-49090: state resolution could reset a room's state to an earlier or wrong state | State resolution changes | [MSC4297](https://github.com/matrix-org/matrix-spec-proposals/pull/4297) |
| CVE-2025-54315: older room versions do not cryptographically enforce that a room has one unique create event | Room ID is the create event's hash | [MSC4291](https://github.com/matrix-org/matrix-spec-proposals/pull/4291) |

The same release formalised room creators with unlimited power ([MSC4289](https://github.com/matrix-org/matrix-spec-proposals/pull/4289)). [MSC4304](https://github.com/matrix-org/matrix-spec-proposals/pull/4304) bundled the changes into room version 12. Synapse shipped support on 2025-08-11 (1.135.2), and the spec added the version in v1.16 (2025-09-17). See the [v1.16 changelog](https://spec.matrix.org/v1.19/changelog/v1.16/).

According to the blog post, only servers that federate with untrusted servers (such as the public federation) are affected. It advised room admins to upgrade rooms with users from untrusted servers to v12.

## Creators and infinite power level

In v12 the **room creators** are the `sender` of the `m.room.create` event plus any user IDs in its `content.additional_creators` ([authorisation rules](https://spec.matrix.org/v1.19/rooms/v12/#authorisation-rules)):

```json
{
  "type": "m.room.create",
  "state_key": "",
  "content": {
    "room_version": "12",
    "additional_creators": ["@alice:example.org"]
  }
}
```

The spec gives creators these rules ([permissions](https://spec.matrix.org/v1.19/client-server-api/#permissions)):

- Their power level is infinitely high. Nobody, including other creators, can kick, ban or demote them.
- They must **not** appear in the `users` map of `m.room.power_levels`. A power-levels event that lists a creator there is rejected (auth rule 10.4).
- The set of creators is fixed once the room is created. Other users can be raised to high power levels, but never to the creators' level.
- With `createRoom`, set `creation_content.additional_creators` to add co-creators. With the `trusted_private_chat` preset, the server SHOULD also add the invitees as creators ([createRoom](https://spec.matrix.org/v1.19/client-server-api/#post_matrixclientv3createroom)).

When a server creates a v12 room, it MUST set the power level for `m.room.tombstone` (upgrading the room) higher than `state_default`. Synapse 1.163 sets it to 150, so by default only creators can upgrade the room.

:::warning
Choose creators carefully. A creator account cannot be demoted or banned, even if it is compromised or abandoned. The only way to change who the creators are is to upgrade to a new room.
:::

## Room IDs without a server name

A v12 room ID is the event ID of the room's `m.room.create` event with `!` instead of `$`, for example `!8sQ1Ex3dBJbCgFm4eN0LkSUAtjbAEdZ8wVSA1dl1Ytk`. Rooms in versions 1–11 keep IDs like `!OGEhHVWSdvArJzumhm:matrix.org` ([room IDs](https://spec.matrix.org/v1.19/appendices/#room-ids)).

Because the ID is a hash, a room can only have one create event. A v12 create event has no `room_id` field, and other events must not list it in their `auth_events`.

A room ID has no server to route through, so links and joins need `via` servers ([routing](https://spec.matrix.org/v1.19/appendices/#routing)).

## State resolution changes

State resolution decides a room's state when servers have seen different branches of its history. Version 12 keeps the [room version 2 algorithm](https://spec.matrix.org/v1.19/rooms/v2/#state-resolution) with three changes ([state resolution](https://spec.matrix.org/v1.19/rooms/v12/#state-resolution)):

1. The first round of iterative auth checks starts from an **empty** state map instead of the unconflicted state.
2. A new **conflicted state subgraph** is defined: the events on `auth_events` paths between conflicting state events.
3. The **full conflicted set** now includes that subgraph.

The [v1.16 changelog](https://spec.matrix.org/v1.19/changelog/v1.16/) says this reduces the opportunity for state resets. Clients don't need to change anything for it. See also [Server-Server API: room state resolution](./server-server#room-state-resolution).

## What to change in your code

| If your client, bot or bridge… | In v12… | Do this instead |
|---|---|---|
| Takes a server name from the room ID (to route a join, guess the "home" server, or group rooms) | There is no server name | Treat room IDs as opaque. Use `via` from links or `m.space.child`. If you need a server, the spec suggests parsing the create event's `sender` ([room IDs](https://spec.matrix.org/v1.19/appendices/#room-ids)). |
| Validates room IDs with a `!local:server` pattern | The pattern fails | Accept `!` followed by an opaque string. |
| Reads a user's power level as `users[user_id]`, falling back to `users_default` | Creators are not in `users`, so this returns 0 for them | First check whether the user is a creator (create event `sender` or `additional_creators`). If so, rank them above every number. |
| Shows "Admin" for power level 100 | Creators rank above admins | Show a separate "Creator" level, as the spec suggests ([permissions](https://spec.matrix.org/v1.19/client-server-api/#permissions)). |
| Creates rooms with `power_level_content_override` that puts the bot itself in `users` | The bot created the room, so it is a creator, and that power-levels event is rejected | Leave creators out of `users`. Give other bots and admins explicit levels. |
| Moderates (kick, ban, demote) | No level can act on a creator | Expect the server to refuse actions against creators, and report that to the user. |
| Follows `m.room.tombstone` or `predecessor` links | The room ID has no server name | Use the event `sender`'s server as `via`, as the spec says ([room upgrades](https://spec.matrix.org/v1.19/client-server-api/#room-upgrades)). |

`additional_creators` entries are valid user IDs, but the spec warns they may not be real users or servers. Don't use them to route requests.

## How to see a room's version

- **Element Web/Desktop:** Room settings → Advanced → "Room version" (Element Web 1.12.32).
- **API:** read the create event, `GET /_matrix/client/v3/rooms/{roomId}/state/{eventType}/{stateKey}` with `m.room.create` and an empty state key ([spec](https://spec.matrix.org/v1.19/client-server-api/#get_matrixclientv3roomsroomidstateeventtypestatekey)), and look at `content.room_version`. If it's missing, the version is `"1"` ([m.room.create](https://spec.matrix.org/v1.19/client-server-api/#mroomcreate)). The [room summary](https://spec.matrix.org/v1.19/client-server-api/#get_matrixclientv1room_summaryroomidoralias) also returns `room_version`.
- **Your server's default and supported versions:** `GET /_matrix/client/v3/capabilities`, under [`m.room_versions`](https://spec.matrix.org/v1.19/client-server-api/#mroom_versions-capability).

## How to upgrade a room

You need permission to send `m.room.tombstone` in the old room. Servers without v12 support can't join the new room, and members need clients that handle v12. When it published v12 support, Synapse advised large public rooms to wait for clients across the network to update ([Synapse 1.135.2 notes](https://github.com/element-hq/synapse/releases/tag/v1.135.2)).

**In Element:** type this in the room:

```
/upgraderoom 12
/upgraderoom 12 @co-owner:example.org
```

User IDs after the version become `additional_creators` of the new room. Element then shows a warning dialog. In invite-only or knock rooms, the dialog offers to "Automatically invite members from this room to the new one". Element's **Upgrade this room** button under Room settings → Advanced only appears when the server recommends an upgrade. The spec says clients should not suggest upgrades from a stable version such as 11, so for v11 rooms the slash command is the way to upgrade ([room versions](https://spec.matrix.org/v1.19/rooms/#complete-list-of-room-versions)).

**Through the API** ([upgradeRoom](https://spec.matrix.org/v1.19/client-server-api/#post_matrixclientv3roomsroomidupgrade)):

```http
POST /_matrix/client/v3/rooms/{roomId}/upgrade
Content-Type: application/json

{ "new_version": "12", "additional_creators": ["@co-owner:example.org"] }
```

The response gives the new room's ID as `replacement_room`. If the server doesn't support the version, it returns `M_UNSUPPORTED_ROOM_VERSION`.

**What happens** ([server behaviour](https://spec.matrix.org/v1.19/client-server-api/#room-upgrades)):

1. The server creates a new room whose create event has a `predecessor` pointing at the old room. The user who upgrades becomes its creator.
2. It copies state such as the name, topic, avatar, join rules, history visibility, guest access, encryption, server ACLs and power levels. Synapse 1.163 also copies bans, and removes the new creators from the copied `users` map.
3. Local aliases move to the new room.
4. An `m.room.tombstone` in the old room points to the new room. Where it can, the server also raises the old room's `events_default` and `invite` levels so ordinary members can no longer post or invite there.
5. **Members are not moved.** Clients show a link, and each member joins the new room. Message history stays in the old room.

Existing `additional_creators` are not copied. List everyone you want as a creator in the upgrade request.

## Server support (as of 2026-10)

| Server (latest release) | Supports v12 | Default for new rooms | Evidence |
|---|---|---|---|
| Synapse 1.163.0 (2026-10-14) | Yes, since 1.135.2 | 12, since 1.162.0 | [CHANGES.md](https://github.com/element-hq/synapse/blob/v1.163.0/CHANGES.md), [`default_room_version`](https://element-hq.github.io/synapse/latest/usage/configuration/config_documentation.html#default_room_version) |
| Dendrite 0.15.2 (2025-08-15) | Yes, since 0.15.0 | 10 (`room_server.default_room_version`) | [release notes](https://github.com/element-hq/dendrite/releases/tag/v0.15.0), [config source](https://github.com/element-hq/dendrite/blob/v0.15.2/setup/config/config_roomserver.go) |
| Conduit 0.10.15 (2026-09-30) | Yes, since 0.10.8 | 12 | [release notes](https://gitlab.com/famedly/conduit/-/releases/v0.10.8), [config source](https://gitlab.com/famedly/conduit/-/blob/v0.10.15/src/config/mod.rs) |
| continuwuity 26.9.1 (2026-09-28) | Yes | 12 | [example config](https://forgejo.ellis.link/continuwuation/continuwuity/src/tag/v26.9.1/conduwuit-example.toml) |
| tuwunel 1.9.4 (2026-10-10) | Yes | 12, since 1.9.2 | [release notes](https://github.com/matrix-construct/tuwunel/releases/tag/v1.9.2) |

On Synapse, the default is the [`default_room_version`](https://element-hq.github.io/synapse/latest/usage/configuration/config_documentation.html#default_room_version) setting. Existing rooms keep their version until someone upgrades them.

## Resources

- [Room version 12, spec v1.19](https://spec.matrix.org/v1.19/rooms/v12/)
- [Room upgrades, spec v1.19](https://spec.matrix.org/v1.19/client-server-api/#room-upgrades)
- [Project Hydra announcement](https://matrix.org/blog/2025/08/project-hydra-improving-state-res/)
- [Rooms](./rooms) on this site
