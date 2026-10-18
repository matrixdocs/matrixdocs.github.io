---
sidebar_position: 4
title: Advanced Features
description: Widgets, Element Call, image packs, push rules, Matrix URIs, admin API and room versions
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, Element Web 1.12.32, Element Call 0.28.0, matrix-widget-api 1.20.0"
---

# Advanced Features

Features beyond basic messaging, with pointers to the spec or upstream docs for details.

## Widgets

Widgets embed web apps in a room, such as calls, shared documents and dashboards. Element Web lists a room's widgets under **Room info → Extensions**. You can add one by URL with `/addwidget <url>`.

### Integration managers

An integration manager is a catalogue of widgets, bots and bridges that Element Web can open. It is set with `integrations_ui_url` and `integrations_rest_url` in Element's `config.json` (see Element's [config docs](https://github.com/element-hq/element-web/blob/develop/docs/config.md)).

:::note Dimension is archived
[Dimension](https://github.com/turt2live/matrix-dimension), the self-hosted integration manager that older guides recommend, has been archived since 2023-08. Don't deploy it for new setups. Add widgets directly, run bots and bridges yourself, or use your deployment tool's built-in options instead.
:::

### Writing a widget

Widgets talk to the client through the [matrix-widget-api](https://github.com/matrix-org/matrix-widget-api) (1.20.0, 2026-10-01). A minimal page:

```html title="widget.html"
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/matrix-widget-api@1.20.0/dist/api.js"></script>
</head>
<body>
  <h1>My widget</h1>
  <script>
    const widgetApi = new mxwidgets.WidgetApi();
    widgetApi.requestCapabilities([mxwidgets.MatrixCapabilities.AlwaysOnScreen]);
    widgetApi.start();
  </script>
</body>
</html>
```

Some capabilities:

| Capability | Meaning |
|------------|---------|
| `m.always_on_screen` | Stay visible (for example during calls) |
| `m.capability.screenshot` | Provide screenshots |
| `m.sticker` | Send stickers |
| `org.matrix.msc2762.timeline:<roomId>` | Read events in a room (MSC2762, unstable) |
| `org.matrix.msc2762.send.event:<eventType>` | Send events of a type (MSC2762, unstable) |
| `org.matrix.msc2931.navigate` | Navigate the client to a Matrix URI (MSC2931, experimental) |

The client asks the user to approve the capabilities a widget requests.

---

## Spaces

### Restricting a room to space members

Set the room's join rule to **Space members** (Element) and members of the parent space can join without an invite. On the wire this is the `restricted` join rule, available from room version 8.

### Suggested rooms

A space lists its rooms as `m.space.child` state events. Setting `suggested` highlights the room to new members:

```json
{
  "type": "m.space.child",
  "state_key": "!room:example.org",
  "content": {
    "via": ["example.org"],
    "suggested": true
  }
}
```

---

## Voice and video calls

### Element Call

[Element Call](https://github.com/element-hq/element-call) (v0.28.0, 2026-10-13) is the group calling app built on **MatrixRTC**. Element Web and Element X embed it for in-app calls, and it also runs as a standalone web app. Media goes through a **LiveKit** SFU, and calls are end-to-end encrypted.

Element Web has native Element Call built in and on by default. The `element_call` section of its `config.json` only changes how it behaves: `use_exclusively` hides the legacy and Jitsi call options, and `disable` turns it off ([config docs](https://github.com/element-hq/element-web/blob/develop/docs/config.md)). The old trick of adding `call.element.io` as a widget with `/addwidget` is not needed.

**Self-hosting** takes more than one container. Per the official [Element Call self-hosting guide](https://github.com/element-hq/element-call/blob/main/docs/self_hosting.md), a site needs:

1. A homeserver with the required MSCs enabled. For Synapse these are MSC3266 (room summaries), MSC4140 (delayed events, via `max_event_delay_duration`), MSC4222 (`state_after` in sync) and the MatrixRTC transports endpoint. It also needs raised `rc_message` and `rc_delayed_event_mgmt` limits and a `matrix_rtc` transport entry. Copy the exact block from the guide.
2. A [LiveKit](https://github.com/livekit/livekit) SFU.
3. The MatrixRTC Authorization Service, [lk-jwt-service](https://github.com/element-hq/lk-jwt-service), which issues LiveKit tokens to Matrix users. Synapse needs a `federation` or `openid` listener for it.
4. Only if you want the standalone web app: Element Call itself, built from source as the guide describes (an image is also published as `ghcr.io/element-hq/element-call`), configured with a `config.json`.

For in-app calling from Element X and Element Web, steps 1 to 3 are enough, and that is what most sites want. To let people without an account join, standalone mode needs a homeserver with open registration (no token or email), so the guide recommends a separate, ideally non-federating homeserver for it. Don't open registration on your main server for this.

:::warning
LiveKit and lk-jwt-service hand out media-server credentials. Keep their API secrets private, and follow the guide's reverse-proxy layout rather than exposing the services directly.
:::

### Video rooms

Element Web has persistent "video rooms" behind **Settings → Labs → Video rooms**, which is off by default.

### Jitsi

Element Web can still embed [Jitsi Meet](https://jitsi.github.io/handbook/) as a widget. If you self-host Jitsi, follow the official [docker-jitsi-meet guide](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker/) and **enable authentication** (`ENABLE_AUTH=1`). Otherwise anyone on the internet can use your server for meetings. Jitsi meetings are separate from Matrix room encryption.

| | Element Call | Jitsi widget |
|---|---|---|
| Built on | MatrixRTC + LiveKit | Jitsi (separate system) |
| Encryption | E2EE, keys exchanged over Matrix | Jitsi's own E2EE option |
| Self-hosting | Moderate: homeserver config, LiveKit, lk-jwt-service | Moderate: docker-jitsi-meet stack with auth |
| Element X support | Yes | No |

---

## Custom emoji and stickers

### Image packs are in the spec

Image packs ([MSC2545](https://github.com/matrix-org/matrix-spec-proposals/pull/2545)) were merged and appear in **spec v1.19** ([Image packs](https://spec.matrix.org/v1.19/client-server-api/#image-packs)):

- **`m.room.image_pack`**: a state event. A room can hold any number of packs, each with its own `state_key`.
- **`m.image_pack.rooms`**: account data listing the room packs a user wants available in every room.
- Clients should also offer packs from the room's canonical space.

A room pack (based on the spec example):

```json
{
  "type": "m.room.image_pack",
  "state_key": "cats",
  "content": {
    "images": {
      "cat_wave": {
        "url": "mxc://example.org/abc123",
        "body": "a waving cat"
      }
    },
    "pack": {
      "display_name": "Cats",
      "usage": ["emoticon"]
    }
  }
}
```

Shortcodes may contain only letters, digits, `-` and `_`, up to 100 bytes. `usage` can be `emoticon`, `sticker` or both.

Before v1.19, clients used the unstable `im.ponies.room_emotes` and `im.ponies.user_emotes` types. Some clients still read or write only those. Client support for the stable types varies, so check your client's release notes.

### Stickerpicker is archived

[maunium/stickerpicker](https://github.com/maunium/stickerpicker) is archived. Its README notes that image packs are now in the spec and that the Telegram bridge can import Telegram sticker packs itself. Don't build new setups on it.

---

## Push rules

Push rules decide which events notify you. Keyword alerts are **content** rules. To add one through the API:

```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"pattern": "deploy", "actions": ["notify", {"set_tweak": "sound", "value": "default"}]}' \
  "https://matrix.example.org/_matrix/client/v3/pushrules/global/content/deploy_keyword"
```

In Element you would normally do this under **Settings → Notifications → Mentions and keywords**.

---

## Matrix URIs

`matrix:` URIs leave out the sigil, and links to room IDs need `via`:

```
matrix:r/room:example.org                                Room by alias
matrix:roomid/abc:example.org?via=example.org            Room by ID
matrix:roomid/abc:example.org/e/eventid?via=example.org  Specific event
matrix:u/alice:example.org?action=chat                   Chat with a user
```

The equivalent `https://matrix.to/#/...` links keep the sigils and also take `?via=`. Spec: [Matrix URI scheme](https://spec.matrix.org/v1.19/appendices/#matrix-uri-scheme).

---

## Synapse admin API

:::warning
Admin API calls run with server-admin rights. Erasing a user and purging media cannot be undone. Test against a non-production server first, and keep admin tokens out of shell history.
:::

Some useful calls (Synapse 1.163; see the [admin API docs](https://element-hq.github.io/synapse/latest/usage/administration/admin_api/)). Room and user IDs in paths must be URL-encoded.

```bash
# List rooms
curl -H "Authorization: Bearer $TOKEN" \
  "https://matrix.example.org/_synapse/admin/v1/rooms"

# Quarantine all media in a room
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "https://matrix.example.org/_synapse/admin/v1/room/%21abc%3Aexample.org/media/quarantine"

# Deactivate a user and erase their data (irreversible)
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"erase": true}' \
  "https://matrix.example.org/_synapse/admin/v1/deactivate/%40spammer%3Aexample.org"

# Make a user a server admin (not on MAS servers, see below)
curl -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"admin": true}' \
  "https://matrix.example.org/_synapse/admin/v2/users/%40alice%3Aexample.org"
```

To reset a password, use the `reset_password` endpoint or `synadm user password` (which prompts). Don't put passwords on the command line.

On servers that use Matrix Authentication Service (MAS), MAS owns accounts. Synapse disables its reset-password, server-admin and login-as-user endpoints, and refuses to create users through `PUT /_synapse/admin/v2/users`. Use the [MAS admin API](https://element-hq.github.io/matrix-authentication-service/topics/admin-api.html) or `mas-cli manage` instead (for example `mas-cli manage promote-admin`).

---

## Room versions

Room versions define event formats, authorisation rules and state resolution. All versions 1 to 12 are **stable** in spec v1.19. The spec recommends **v12** as the default for new rooms, and Synapse has used v12 as its default since 1.162 (2026-09-29).

| Version | What it introduced |
|---------|--------------------|
| v1 | Initial version |
| v2 | State resolution v2 |
| v3 | Event IDs are hashes of the event |
| v4 | URL-safe base64 event IDs |
| v5 | Enforces signing-key validity periods |
| v6 | Changes to several authorisation rules |
| v7 | Knocking |
| v8 | `restricted` join rule (join via membership of another room or space) |
| v9 | Fixes redaction of some membership events |
| v10 | Integer-only power levels; `knock_restricted` join rule |
| v11 | Clarified redaction algorithm |
| v12 | Room IDs are hashes of the create event; creators have unlimited power; revised state resolution |

Source: [spec room versions](https://spec.matrix.org/v1.19/rooms/).

In Element, the version is shown under **Room settings → Advanced**.

### Upgrading a room

```
/upgraderoom 12
/upgraderoom 12 @co-owner:example.org
```

In v12 you can name extra creators after the version. An upgrade creates a new room and tombstones the old one. Members have to move to the new room (clients offer a link), and history stays in the old room. Large public rooms should check that their members' clients support v12 first.

### State resolution

When servers disagree about a room's state, for example after a network split, the room version's state-resolution algorithm decides which events win. It uses authorisation chains, power levels and event ordering, and v12 revised it. The full rules are in the spec for each [room version](https://spec.matrix.org/v1.19/rooms/). If permissions look wrong after a dispute, inspect the current `m.room.power_levels` in `/devtools`.

---

## Room discovery

[matrixrooms.info](https://matrixrooms.info) indexes public rooms across many servers, with search by topic and language.
