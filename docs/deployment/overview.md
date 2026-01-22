---
sidebar_position: 1
title: Deployment Overview
description: Options for deploying Matrix infrastructure
---

# Deployment Overview

This guide covers different approaches to deploying Matrix infrastructure.

## Deployment Options

### Use Public Homeserver

**Easiest** - Just sign up:

| Option | Pros | Cons |
|--------|------|------|
| matrix.org | Largest, well-maintained | Metadata exposure, shared resources |
| Other public | Various providers | Varies |

### Managed Hosting

**Hands-off** - Someone else runs it:

| Provider | Features | Best For |
|----------|----------|----------|
| [Element Matrix Services](https://element.io/ems) | Enterprise, support | Organizations |
| [etke.cc](https://etke.cc) | Full stack, bridges | Communities |
| [ungleich](https://ungleich.ch) | Swiss hosting | Privacy-focused |

### Self-Hosted

**Full control** - Run everything yourself:

| Approach | Complexity | Flexibility |
|----------|------------|-------------|
| Manual | High | Maximum |
| Docker Compose | Medium | High |
| Ansible playbook | Low | Medium |
| Kubernetes | Medium-High | High |

## Quick Comparison

| Factor | Public | Managed | Self-Hosted |
|--------|--------|---------|-------------|
| Setup time | Minutes | Hours | Days |
| Cost | Free | $10-100+/mo | Hosting costs |
| Maintenance | None | None | You |
| Customization | None | Limited | Full |
| Privacy | Low | Medium | High |
| Compliance | No | Possible | Possible |

## Self-Hosting Methods

### Docker Compose

Quick deployment with containers:

```yaml title="docker-compose.yml"
version: '3'
services:
  synapse:
    image: matrixdotorg/synapse:latest
    volumes:
      - ./data:/data
    ports:
      - "8008:8008"
```

### matrix-docker-ansible-deploy

**Recommended** for most users:

```bash
git clone https://github.com/spantaleev/matrix-docker-ansible-deploy.git
```

Features:
- Complete stack deployment
- All major bridges
- Automatic SSL
- Easy updates

### Kubernetes

For larger deployments:
- Helm charts available
- Horizontal scaling
- Cloud-native

## Components to Deploy

### Minimum

| Component | Purpose |
|-----------|---------|
| Homeserver | Core Matrix server |
| PostgreSQL | Database |
| Reverse proxy | TLS termination |

### Recommended

| Component | Purpose |
|-----------|---------|
| Element Web | Web client |
| Coturn | VoIP/video |
| Redis | Caching (for workers) |

### Optional

| Component | Purpose |
|-----------|---------|
| Bridges | Connect other platforms |
| Bots | Automation |
| Integration manager | Widgets/bots UI |

## Infrastructure Requirements

### Small Instance (Personal)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 1 GB | 2 GB |
| CPU | 1 core | 2 cores |
| Storage | 10 GB | 50 GB |
| Bandwidth | 100 Mbps | 1 Gbps |

### Medium Instance (Community)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 4 GB | 8 GB |
| CPU | 2 cores | 4 cores |
| Storage | 50 GB | 200 GB |
| Bandwidth | 1 Gbps | 1 Gbps |

### Large Instance (Organization)

| Resource | Minimum |
|----------|---------|
| RAM | 16+ GB |
| CPU | 8+ cores |
| Storage | 500+ GB SSD |
| Bandwidth | 1+ Gbps |

## Domain Setup

### DNS Records

```
example.com              A    → Your server IP
matrix.example.com       A    → Your server IP
element.example.com      A    → Your server IP (optional)
```

### Well-Known Delegation

For `@user:example.com` with server at `matrix.example.com`:

```json title="https://example.com/.well-known/matrix/server"
{
  "m.server": "matrix.example.com:443"
}
```

```json title="https://example.com/.well-known/matrix/client"
{
  "m.homeserver": {
    "base_url": "https://matrix.example.com"
  }
}
```

## SSL/TLS

### Let's Encrypt

Free certificates:

```bash
certbot certonly --webroot -w /var/www/html \
  -d matrix.example.com \
  -d example.com
```

### Certificate Requirements

- Valid for your domain
- Federation requires port 8448 OR .well-known
- Modern TLS (1.2+)

## Next Steps

Choose your path:

- [Docker Deployment](/deployment/docker)
- [Ansible Deployment](/deployment/ansible)

---

*See also: [Server Comparison](/servers/comparison)*
