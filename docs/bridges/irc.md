---
sidebar_position: 5
title: IRC Bridge
description: Bridge Matrix to IRC networks
---

# IRC Bridge

Connect to IRC networks from Matrix using Heisenbridge - a bouncer-style IRC bridge.

## Why Heisenbridge?

Heisenbridge takes a **bouncer approach**: each Matrix user connects to IRC individually, like a traditional IRC bouncer. This is different from portal-style bridges.

| Feature | Heisenbridge | matrix-appservice-irc |
|---------|--------------|----------------------|
| **Style** | Bouncer (per-user) | Portal (server-wide) |
| **Setup** | Simple | Complex |
| **IRC identity** | Your own | Shared prefix |
| **Admin required** | Yes (appservice) | Yes |
| **Best for** | Personal use | Communities |

### Key Features

- **Zero configuration** - No database required
- **Bouncer mode** - Each user has their own IRC connection
- **Relaybot mode** - Optional shared connection for rooms
- **Full IRC** - All standard IRC features work
- **Managed via DM** - Just message @heisenbridge
- **Sustainable maintenance** - Active development (v1.14.5+)

## Docker Setup

```yaml title="docker-compose.yml"
version: '3'
services:
  heisenbridge:
    image: hif1/heisenbridge:latest
    restart: unless-stopped
    command: -c /data/config.yaml -l heisenbridge http://synapse:8008
    volumes:
      - ./heisenbridge-data:/data
```

## Configuration

### Generate Registration

```bash
docker run --rm -v $(pwd)/heisenbridge-data:/data hif1/heisenbridge:latest \
  -c /data/config.yaml --generate
```

### Config File

```yaml title="config.yaml"
id: heisenbridge
url: http://localhost:9898
as_token: <generated>
hs_token: <generated>
sender_localpart: heisenbridge
namespaces:
  users:
    - exclusive: true
      regex: '@irc_.*'
  aliases:
    - exclusive: true
      regex: '#irc_.*'
```

Add to homeserver and restart.

## Using Heisenbridge

### Connect to Network

1. DM `@heisenbridge:example.com`
2. `ADDNETWORK libera irc.libera.chat`
3. `OPEN libera`
4. In the network room: `CONNECT`

### Join Channels

In the network room:
```
JOIN #channel
```

A new Matrix room is created for each channel.

### Commands

| Command | Description |
|---------|-------------|
| `ADDNETWORK <name> <server>` | Add IRC network |
| `DELNETWORK <name>` | Remove network |
| `NETWORKS` | List networks |
| `OPEN <network>` | Open network control room |
| `CONNECT` | Connect to network |
| `DISCONNECT` | Disconnect |
| `JOIN #channel` | Join IRC channel |
| `PART #channel` | Leave channel |
| `QUERY nick` | Start private chat |
| `NICK newnick` | Change nickname |

### Network Room Commands

```
CONNECT              - Connect to IRC
DISCONNECT           - Disconnect
STATUS              - Connection status
NICK newnick        - Change nick
JOIN #channel       - Join channel
QUIT [message]      - Quit with message
```

## Pre-configured Networks

Common IRC networks:

| Network | Server |
|---------|--------|
| Libera.Chat | irc.libera.chat:6697 |
| OFTC | irc.oftc.net:6697 |
| Freenode | chat.freenode.net:6697 |

```
ADDNETWORK libera irc.libera.chat:+6697
```

(+ prefix for TLS)

## NickServ Authentication

### SASL

```
ADDNETWORK libera irc.libera.chat:+6697 --sasl-nick=yournick --sasl-password=yourpass
```

### Traditional

In network room after connecting:
```
MSG NickServ IDENTIFY yourpassword
```

## Troubleshooting

### Can't Connect

- Check firewall for IRC ports (6667, 6697)
- Verify server address
- Check TLS settings (+6697)

### Nickname in Use

```
NICK differentnick
```

### Disconnected

Heisenbridge reconnects automatically. Check logs for errors.

## Bouncer vs Relaybot Mode

### Bouncer Mode (Default)

Each Matrix user gets their own IRC connection:

```
Matrix User Alice  →  IRC user "Alice"
Matrix User Bob    →  IRC user "Bob"
```

- Full control over your IRC identity
- Private messages work naturally
- You manage your own channels

### Relaybot Mode

Single IRC connection relays messages for a Matrix room:

```
Matrix Room  →  [Heisenbridge Relay]  →  IRC Channel
```

Use when:
- Bridging a community room
- Users don't need individual IRC identities
- Simpler management needed

**Enable relaybot:**
In the network room: `RELAYBOT #channel`

## User Synchronization

Control how IRC users appear in Matrix:

| Mode | Behavior |
|------|----------|
| **Full** | Sync all users on connect |
| **Half** | Sync users on join |
| **Lazy** | Only sync when user talks |

Configure in bridge settings for performance vs completeness tradeoff.

## Privacy Note

:::tip IRC Users Don't Know
Users on IRC shouldn't know you're using Matrix - unless you send media that links to your homeserver. Messages appear as normal IRC.
:::

## Alternative: matrix-appservice-irc

For larger deployments, consider [matrix-appservice-irc](https://github.com/matrix-org/matrix-appservice-irc):

- **Server-wide** bridging
- **Portal rooms** for channels
- **Ident support**
- More complex setup

## Resources

- [Heisenbridge GitHub](https://github.com/hifi/heisenbridge)
- [Matrix Room](https://matrix.to/#/#heisenbridge:vi.fi)
- [IRC Channel](irc://irc.libera.chat/#heisenbridge)

---

*Next: [Signal Bridge](./signal) →*
