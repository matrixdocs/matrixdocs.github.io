---
sidebar_position: 5
title: IRC Bridge
description: Bridge Matrix to IRC networks with Heisenbridge
last_update:
  date: 2026-10-18
verified_with: "Heisenbridge v1.15.4 (heisenbridge/*.py, README), Synapse 1.163.0"
---

# IRC Bridge

[Heisenbridge](https://github.com/hifi/heisenbridge) is a bouncer-style IRC bridge: each Matrix user gets their own IRC connection, controlled by text commands in a DM with the bridge bot. As of 2026-10-18 the latest release is **v1.15.4 (2025-10-04)**; there have been no commits since, so expect slow maintenance.

Other options:

| Bridge | Good for | Status (2026-10) |
|--------|----------|------------------|
| Heisenbridge | Personal use, small groups | v1.15.4, slow maintenance |
| [matrix-appservice-irc](https://github.com/matrix-org/matrix-appservice-irc) | Network-wide bridges with many users | 4.0.0 (2025-10-24), maintained |
| [mautrix-irc](https://github.com/mautrix/irc) | (future) | No release; its README says switching from Heisenbridge is "not yet recommended" |

Libera.Chat has had no official Matrix bridge since 2023 ([Libera news](https://libera.chat/news/official-matrix-bridge-farewell)), so to reach Libera from Matrix you run your own bridge.

:::warning Heisenbridge does not support encryption
If your homeserver creates rooms encrypted by default, Heisenbridge can't read your commands. On Synapse, leave `encryption_enabled_by_default_for_room_type` at `off` (other rooms can still be encrypted by choice). Also note that Heisenbridge stores each network's settings, including SASL passwords, as the bridge bot's room account data on the homeserver, so anyone with admin or database access to the homeserver can read them.
:::

## Setup with Docker

Images are on Docker Hub as `hif1/heisenbridge`. Each release is tagged `x.y.z`, `x.y` and `x`; `latest` follows the master branch, so pin the full release tag.

**1. Generate the registration file.** The `url` in it must be an address the homeserver can reach. By default it is `http://127.0.0.1:9898`, which is wrong inside Docker, so pass `-l`/`-p`:

```bash
docker run --rm -v "$(pwd)":/data hif1/heisenbridge:1.15.4 \
  -c /data/heisenbridge.yaml --generate -l heisenbridge -p 9898
```

Use `--generate-compat` instead of `--generate` for Conduit-based servers and Dendrite. The generated file looks like this (tokens are random):

```yaml title="heisenbridge.yaml (registration)"
id: heisenbridge
url: http://heisenbridge:9898
as_token: <random>
hs_token: <random>
rate_limited: false
sender_localpart: heisenbridge
namespaces:
  users:
    - regex: '@irc_.*'
      exclusive: true
  aliases: []
  rooms: []
```

**2. Register it** by adding the file to Synapse's `app_service_config_files` and restarting Synapse.

**3. Run the bridge**, pointing it at the homeserver. The image's entrypoint already listens on `0.0.0.0`.

```yaml title="docker-compose.yml"
services:
  heisenbridge:
    image: hif1/heisenbridge:1.15.4
    restart: unless-stopped
    command: -c /data/heisenbridge.yaml -p 9898 -o @you:example.com http://synapse:8008
    volumes:
      - ./heisenbridge.yaml:/data/heisenbridge.yaml
```

`-o` sets the bridge owner (admin). Without it, the first local user to talk to the bridge claims it. Heisenbridge keeps its own settings on the homeserver, not in a config file. See the [README](https://github.com/hifi/heisenbridge#readme) and its [docker-compose example](https://github.com/hifi/heisenbridge/tree/master/docker-compose).

## Using Heisenbridge

Start a DM with `@heisenbridge:example.com`. Commands are case-insensitive; add `-h` to any command for help. Command names below are from the v1.15.4 source (`control_room.py`, `network_room.py`, `channel_room.py`).

**In the DM with the bridge (control room):**

```
ADDNETWORK libera                               # admin only
ADDSERVER libera irc.libera.chat 6697 --tls     # admin only; default port is 6667 without TLS
NETWORKS                                        # list networks
OPEN libera                                     # open a network room
QUIT                                            # disconnect, then leave all your network, channel and PM rooms
```

**In the network room:**

```
NICK yournick
SASL --username=yournick --password=yourpassword
CONNECT
JOIN #matrix
QUERY somenick                                  # open a private chat
DISCONNECT
```

Use `NICKSERV identify <password>` (alias `NS`) if the network has no SASL, or `CERTFP` for certificate authentication.

**In a channel room:** `PART` leaves the channel, `NAMES` lists members, `TOPIC` shows or sets the topic, and `OP`, `VOICE`, `KICK` and `KB` (kick and ban) do what you'd expect.

## Plumbing a room (relay mode)

To connect an existing Matrix room to an IRC channel through a single IRC connection, a bridge admin runs this in the network room (other users get "Plumbing is currently reserved for admins only"):

```
PLUMB !roomid:example.com #channel
```

The bridge joins the Matrix room and relays everyone's messages to the IRC channel through your connection. `UNPLUMB` undoes it.

## Member sync

How IRC users appear in Matrix is set with `SYNC`. A bridge admin sets the bridge-wide default in the DM with the bridge (control room), and anyone can override it for one channel by running `SYNC` in that channel room.

| Option | Behaviour |
|--------|-----------|
| `SYNC --full` | Members are fully synchronised |
| `SYNC --half` | Members are added when they join or talk (default) |
| `SYNC --lazy` | Members are added only when they talk |

## Troubleshooting

- **The bot doesn't answer:** the room is probably encrypted (see the warning above), or the homeserver can't reach the `url` in the registration file.
- **Can't connect:** check the server, port and `--tls` flag with `SERVERS libera`, then `CONNECT` again and read the network room for errors.
- **Nickname in use:** set another one with `NICK`.

## Resources

- [Heisenbridge on GitHub](https://github.com/hifi/heisenbridge)
- Support room: [#heisenbridge:vi.fi](https://matrix.to/#/#heisenbridge:vi.fi)
- [matrix-appservice-irc docs](https://matrix-org.github.io/matrix-appservice-irc/latest/)
