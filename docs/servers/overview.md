---
sidebar_position: 1
title: Matrix Homeservers Overview
description: What a homeserver does, which one to choose, and how to set up your domain
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0"
---

# Matrix Homeservers

A homeserver holds your account and the rooms you take part in, and exchanges events with other homeservers (federation).

## What a homeserver does

- **Stores accounts** and handles login, or hands login to an auth service such as MAS.
- **Stores room history** for rooms its users are in.
- **Federates** with other homeservers over the server-server API.
- **Stores and serves media** (uploads, thumbnails, cached remote media).
- **Relays encryption data.** End-to-end encryption happens in clients; the server stores device keys, key backups and encrypted events, but cannot read encrypted messages.

## Use a public homeserver

If you only need an account, sign up on an existing server. Registration policies change often. These were checked on 2026-10-18:

| Homeserver | Sign-up |
|------------|---------|
| [matrix.org](https://matrix.org) | Through [account.matrix.org](https://account.matrix.org/) (MAS). Run by the Matrix.org Foundation |
| [tchncs.de](https://tchncs.de/matrix) | Through its MAS at auth.matrix.tchncs.de. Hosted in Germany |

For more choices, see the community list at [servers.joinmatrix.org](https://servers.joinmatrix.org/). Larger servers see more of your metadata (who talks to whom, when), so a smaller server you trust can be a better choice for privacy.

## Run your own

| Implementation | Language | Status (2026-10-18) | Good for |
|----------------|----------|---------------------|----------|
| [**Synapse**](./synapse) | Python + Rust | Active, maintained by Element | Most deployments; full feature set (MAS, workers, Element Call) |
| [**Conduit**](./conduit) | Rust | Active, beta | Small servers with low resource use |
| [**tuwunel** / **continuwuity**](./conduit#forks-continuwuity-and-tuwunel) | Rust | Active forks of the archived conduwuit | Small to medium servers with low resource use |
| [**Dendrite**](./dendrite) | Go | Maintenance mode (security fixes only), beta | Existing deployments only |

See the [server comparison](./comparison) for features, migration paths and which to pick.

### Ways to deploy

| Approach | Notes |
|----------|-------|
| [Docker Compose](../deployment/docker) | Synapse, PostgreSQL and a reverse proxy; you manage each part |
| [matrix-docker-ansible-deploy](../deployment/ansible) | Ansible playbook covering Synapse or the Rust servers, plus clients, bridges, MAS and Element Call |
| [ESS Community](https://github.com/element-hq/ess-helm) | Element's Helm chart for Kubernetes/K3s: Synapse, MAS, Element Web, Element Admin and the MatrixRTC backend. AGPL-3.0, aimed at non-commercial use with up to 100 users. Latest 26.10.2 (2026-10-16) |
| Debian/Ubuntu packages or pip | See [Synapse](./synapse#install-from-packages-or-pip) |

:::warning ESS Community signing keys (CVE-2026-24044)
ESS Community charts before 25.12.2 generated weak Synapse signing keys that would let an attacker impersonate the server ([GHSA-qwcj-h6m8-vp6q](https://github.com/element-hq/ess-helm/security/advisories/GHSA-qwcj-h6m8-vp6q), published 2026-02-12, critical). If you installed ESS Community before then, upgrade to 25.12.2 or later and follow the advisory's key rotation steps.
:::

## The modern Matrix stack

A current homeserver deployment that works well with Element X usually includes:

| Piece | What it does |
|-------|--------------|
| Simplified Sliding Sync (MSC4186) | Fast sync that Element X requires. Native in Synapse since 1.114 and in Conduit and its forks; no separate proxy any more |
| [Matrix Authentication Service](https://github.com/element-hq/matrix-authentication-service) (MAS) | OAuth 2.0 / OIDC login, registration and sessions for Synapse. matrix.org has used it since April 2025 |
| MatrixRTC: [Element Call](https://github.com/element-hq/element-call), [LiveKit](https://github.com/livekit/livekit) and [lk-jwt-service](https://github.com/element-hq/lk-jwt-service) | Group voice and video calls. Uses a LiveKit SFU instead of TURN |
| coturn | Only for legacy 1:1 WebRTC calls (and Jitsi) |

## Hardware

These are rough starting points, not benchmarks. Memory depends far more on the size of the rooms your users join than on the number of users.

| Server size | Synapse | Conduit family |
|-------------|---------|----------------|
| Personal or family | 2 GB RAM, 2 cores | 512 MB–1 GB RAM, 1 core |
| Community of a few hundred | 4–8 GB RAM, 4 cores, SSD | 2–4 GB RAM, 2 cores, SSD |
| Larger | Synapse with workers; size from measurements | Check the project's guidance |

Synapse's docs ask for at least 1 GB of free RAM to join large public rooms. ESS Community's quick setup asks for at least 2 CPUs and 2 GB of RAM.

## Domain setup

Pick your **server name** first. It is the part after the colon in user IDs (`@alice:example.com`) and cannot be changed later. Usually you use the bare domain as the server name and run the server on a subdomain:

```
example.com          → server name, serves the .well-known files
matrix.example.com   → the homeserver itself (behind a reverse proxy on 443)
```

### Well-known delegation

Serve two small JSON files from `https://example.com/.well-known/matrix/`.

The server file tells other homeservers where to connect. With it pointing at port 443, you do not need to open port 8448:

```json title="https://example.com/.well-known/matrix/server"
{
  "m.server": "matrix.example.com:443"
}
```

The client file tells clients where the client-server API is:

```json title="https://example.com/.well-known/matrix/client"
{
  "m.homeserver": {
    "base_url": "https://matrix.example.com"
  }
}
```

Serve both as `application/json`. Serve the client file with `Access-Control-Allow-Origin: *` so web clients can read it (spec v1.19, client-server API, "Web browser clients"). Synapse can serve the server file itself with `serve_server_wellknown: true` if `example.com` is routed to it.

:::note SRV records
The spec still allows SRV delegation through `_matrix-fed._tcp.example.com`; the older `_matrix._tcp` form is deprecated. With SRV delegation the target must present a TLS certificate for **`example.com`**, not for `matrix.example.com`, which makes it harder to set up. The spec encourages `.well-known` instead (spec v1.19, server-server API, "Resolving server names").
:::

### Ports

| Port | Needed for |
|------|-----------|
| 443 | Client API, and federation when delegated with `.well-known` |
| 8448 | Federation only if you do not delegate to 443 |
| 3478, 5349 (UDP/TCP), 49152–65535 (UDP) | coturn, only for legacy 1:1 calls |
| LiveKit ports | Element Call (see the LiveKit and Element Call docs) |

Test federation with the [Matrix Federation Tester](https://federationtester.matrix.org/).

## Security basics

- Keep **registration closed**, or require registration tokens or a CAPTCHA. Open registration attracts spam accounts.
- Do not expose admin APIs (`/_synapse/admin`, Dendrite's `/_dendrite/admin`) through the reverse proxy.
- Bind homeserver ports to `127.0.0.1` and let only the reverse proxy reach them.
- Back up the database, media and the server's **signing key**.
- Update promptly when security releases come out, but read the upgrade notes first instead of updating unattended.

## Next steps

- [Synapse setup](./synapse)
- [Conduit and its forks](./conduit)
- [Dendrite (maintenance mode)](./dendrite)
- [Server comparison](./comparison)

---

*Continue: [Synapse](./synapse) | [Conduit](./conduit) | [Dendrite](./dendrite)*
