---
sidebar_position: 5
title: IRC Bridge
description: Bridge Matrix to IRC networks
---

# IRC Bridge

Connect to IRC networks from Matrix using Heisenbridge.

## Why Heisenbridge?

- **Personal bouncer** style - Each user connects separately
- **Modern codebase** - Python 3, async
- **Simple setup** - Easy to deploy
- **Full IRC support** - All standard features

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

## Alternative: matrix-appservice-irc

For larger deployments, consider [matrix-appservice-irc](https://github.com/matrix-org/matrix-appservice-irc):

- **Server-wide** bridging
- **Portal rooms** for channels
- **Ident support**
- More complex setup

---

*Next: [Signal Bridge](/bridges/signal) →*
