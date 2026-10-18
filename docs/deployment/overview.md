---
sidebar_position: 1
title: Deployment Overview
description: Options for deploying a Matrix homeserver and the services around it
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, MAS v1.27.0, ess-helm 26.10.2, Element Call v0.28.0"
---

# Deployment Overview

This page compares ways to run Matrix infrastructure and lists the components a deployment usually needs.

## Deployment options

### Use a public homeserver

The easiest option is an account on an existing server such as matrix.org. See [public homeservers](../servers/overview#use-a-public-homeserver). You avoid running anything, but the operator sees your metadata, and you depend on their policies.

### Managed hosting

| Provider | What it offers (checked 2026-10-18) |
|----------|-------------------------------------|
| [etke.cc](https://etke.cc/) | Managed Synapse hosting; also maintains the Ketesa admin UI |
| [Element](https://element.io/pricing) | Element's pricing page lists self-hosted Element Server Suite (ESS) plans: Community (free), Enterprise and Sovereign. It does not list a hosted plan |

Check the provider's current terms before relying on this table; hosting offers change.

### Self-hosted

| Approach | Effort | Notes |
|----------|--------|-------|
| [Docker Compose](./docker) | Medium | You assemble Synapse, PostgreSQL and a reverse proxy yourself |
| [matrix-docker-ansible-deploy](./ansible) (MDAD) | Low to medium | Ansible playbook that installs and wires up the homeserver, clients, bridges, bots, MAS and Element Call |
| [ESS Community](https://github.com/element-hq/ess-helm) | Low to medium | Element's Helm charts for Kubernetes or K3s. Bundles Synapse, MAS, Element Web, Element Admin and the MatrixRTC backend. Aimed at non-commercial use with up to 100 users; quick setup needs at least 2 CPU cores and 2 GB RAM. Latest 26.10.2 (2026-10-16) |
| Packages or source | High | See [Synapse install](../servers/synapse#install-from-packages-or-pip) |

:::warning ESS Community signing keys (CVE-2026-24044)
ESS Community charts before 25.12.2 generated weak Synapse signing keys ([GHSA-qwcj-h6m8-vp6q](https://github.com/element-hq/ess-helm/security/advisories/GHSA-qwcj-h6m8-vp6q), critical, published 2026-02-12). If you installed ESS Community before then, upgrade to 25.12.2 or later and follow the advisory's key rotation steps.
:::

`element-hq/element-docker-demo` is a Docker Compose demo of the same stack. Its README says it is not for serious production use, and it has had no commits since 2025-03.

## Components

### Required

| Component | Purpose |
|-----------|---------|
| Homeserver | Synapse, or one of the [alternatives](../servers/comparison) |
| PostgreSQL | Database for Synapse (14 or later) and MAS. The Rust servers use an embedded database instead |
| Reverse proxy | TLS termination; forwards only `/_matrix` and `/_synapse/client` to Synapse |

### Common additions

| Component | Purpose |
|-----------|---------|
| [Element Web](https://github.com/element-hq/element-web) | Web client |
| [Matrix Authentication Service](https://github.com/element-hq/matrix-authentication-service) (MAS) | OAuth 2.0 / OIDC login and registration for Synapse; latest v1.27.0 (2026-10-13) |
| [Element Call](https://github.com/element-hq/element-call) with [LiveKit](https://github.com/livekit/livekit) and [lk-jwt-service](https://github.com/element-hq/lk-jwt-service) | Group voice and video calls (MatrixRTC). Element Call v0.28.0 and lk-jwt-service v0.9.0 were both released on 2026-10-13 |
| Admin UI | Element Admin (in ESS) or [Ketesa](https://github.com/etkecc/ketesa) |
| Redis (or Valkey) | **Required** if you run Synapse workers; not needed for a single process |
| coturn | Only for legacy 1:1 WebRTC calls and Jitsi. Element Call does not need it |
| Bridges and bots | See [Bridges](../bridges/overview) and [Bots](../bots/overview) |

## Infrastructure

See [hardware guidance](../servers/overview#hardware). As a rough rule, a Synapse server for a family or small group runs comfortably on 2 GB RAM and 2 cores with SSD storage. Memory grows with the size of the rooms users join.

## Domain setup

### DNS records

```
example.com          A/AAAA  → server that serves the .well-known files
matrix.example.com   A/AAAA  → homeserver (reverse proxy)
element.example.com  A/AAAA  → web client (optional)
```

### Well-known delegation

For user IDs like `@alice:example.com` with the server at `matrix.example.com`:

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

Serve both with `Content-Type: application/json`, and the client file with `Access-Control-Allow-Origin: *`. With the server file pointing at port 443, port 8448 is not needed. See [Well-known delegation](../servers/overview#well-known-delegation) for SRV records and details.

## TLS

Federation needs a certificate from a publicly trusted CA for the hostname other servers connect to (`matrix.example.com` when using `.well-known`). Let's Encrypt works. Caddy and Traefik obtain certificates automatically; with nginx, use certbot:

```bash
certbot certonly --webroot -w /var/www/html \
  -d matrix.example.com \
  -d example.com
```

This issues one certificate for both names and only works if both hostnames are served from that web root on this host. Otherwise run certbot on each host.

## Next steps

- [Docker deployment](./docker)
- [Ansible deployment](./ansible)

---

*See also: [Server Comparison](../servers/comparison)*
