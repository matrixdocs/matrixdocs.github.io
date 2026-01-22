---
sidebar_position: 1
title: Matrix Homeservers Overview
description: Understanding and choosing Matrix homeservers
---

# Matrix Homeservers

A homeserver is the backbone of your Matrix experience - it stores your account, messages, and handles federation with other servers.

## What is a Homeserver?

Your homeserver:
- **Stores your account** and authentication
- **Persists messages** from rooms you're in
- **Federates** with other homeservers
- **Handles media** uploads and downloads
- **Manages encryption** keys and device verification

## Homeserver Options

### Use a Public Homeserver

The easiest option - just sign up:

| Homeserver | Registration | Notes |
|------------|-------------|-------|
| [matrix.org](https://matrix.org) | Open | Largest, run by Matrix.org Foundation |
| [envs.net](https://element.envs.net) | Open | Privacy-focused, no phone required |
| [tchncs.de](https://tchncs.de/matrix) | Open | German, privacy-respecting |
| [nitro.chat](https://nitro.chat) | Open | Fast, US-based |
| [matrix.im](https://matrix.im) | Open | Community server |

:::tip
For privacy, consider smaller homeservers. matrix.org is popular but high-traffic means more metadata exposure.
:::

### Run Your Own Homeserver

Full control over your data:

| Implementation | Language | Best For |
|----------------|----------|----------|
| [**Synapse**](/servers/synapse) | Python | Features, compatibility |
| [**Dendrite**](/servers/dendrite) | Go | Efficiency, scaling |
| [**Conduit**](/servers/conduit) | Rust | Simplicity, performance |

## Quick Comparison

| Feature | Synapse | Dendrite | Conduit |
|---------|---------|----------|---------|
| **Maturity** | Stable | Stable | Beta |
| **Features** | Complete | Most | Core |
| **RAM (idle)** | 300MB+ | 50MB | 20MB |
| **Setup** | Moderate | Easy | Easiest |
| **Federation** | Full | Full | Full |
| **Appservices** | Full | Full | Basic |
| **Documentation** | Extensive | Good | Growing |

## Choosing Your Approach

### When to Use a Public Server

- **Testing Matrix** - Try before self-hosting
- **Low maintenance** - No server to manage
- **Quick start** - Instant account creation

### When to Self-Host

- **Privacy** - Full control over data
- **Compliance** - Meet regulatory requirements
- **Customization** - Configure everything
- **Communities** - Run servers for your group
- **Learning** - Understand the protocol

## Hardware Requirements

### Minimum (Small Instance)

For personal use or small groups:

| Resource | Synapse | Dendrite | Conduit |
|----------|---------|----------|---------|
| **RAM** | 1 GB | 512 MB | 256 MB |
| **CPU** | 1 core | 1 core | 1 core |
| **Storage** | 10 GB | 5 GB | 5 GB |

### Recommended (Medium Instance)

For communities up to ~1000 users:

| Resource | Synapse | Dendrite | Conduit |
|----------|---------|----------|---------|
| **RAM** | 4 GB | 2 GB | 1 GB |
| **CPU** | 2 cores | 2 cores | 1 core |
| **Storage** | 50 GB | 30 GB | 20 GB |

### Production (Large Instance)

For organizations or large communities:

| Resource | Synapse | Dendrite |
|----------|---------|----------|
| **RAM** | 8+ GB | 4+ GB |
| **CPU** | 4+ cores | 2+ cores |
| **Storage** | 100+ GB SSD | 50+ GB SSD |
| **Database** | PostgreSQL | PostgreSQL |

## Domain Setup

You'll need a domain for your homeserver:

```
example.com              → Your main domain
matrix.example.com       → Homeserver address
element.example.com      → (Optional) Web client
```

### Well-Known Delegation

If you want Matrix IDs like `@user:example.com` but host on `matrix.example.com`:

**Option 1: `.well-known` file**

Create `https://example.com/.well-known/matrix/server`:
```json
{
  "m.server": "matrix.example.com:443"
}
```

**Option 2: SRV record**
```
_matrix._tcp.example.com. 3600 IN SRV 10 0 443 matrix.example.com.
```

## Essential Services

### Database

| Homeserver | SQLite | PostgreSQL |
|------------|--------|------------|
| Synapse | Dev only | Recommended |
| Dendrite | Small | Recommended |
| Conduit | Built-in | Not needed |

:::warning
Never use SQLite for Synapse in production. It will become extremely slow.
:::

### Reverse Proxy

A reverse proxy (nginx, Caddy, Traefik) handles:
- SSL/TLS termination
- Federation port (8448)
- Client API port (443)
- Rate limiting

### Media Storage

Options for media storage:
- **Local disk** - Simple, good for small instances
- **S3/MinIO** - Scalable, good for large instances
- **CDN** - Best performance for global access

## Security Considerations

### Network Security

```
Ports needed:
- 443   → Client API (HTTPS)
- 8448  → Federation (HTTPS)

Optional:
- 3478  → TURN server (VoIP)
- 5349  → TURN TLS
```

### Data Protection

- **Enable E2EE** by default for new rooms
- **Regular backups** of database and media
- **Key backup** setup for users
- **Access logs** for audit trails

### Rate Limiting

Protect against abuse:
- Login attempts
- Registration (if open)
- Message sending
- Federation requests

## Monitoring

Track homeserver health:

| Metric | Tool |
|--------|------|
| **Synapse** | Prometheus + Grafana |
| **Dendrite** | Prometheus + Grafana |
| **Conduit** | Metrics endpoint |

Key metrics to watch:
- Federation lag
- Database size
- Memory usage
- API response times

## Next Steps

- [Synapse Setup Guide](/servers/synapse)
- [Dendrite Setup Guide](/servers/dendrite)
- [Conduit Setup Guide](/servers/conduit)
- [Server Comparison](/servers/comparison)

---

*Continue: [Synapse](/servers/synapse) | [Dendrite](/servers/dendrite) | [Conduit](/servers/conduit)*
