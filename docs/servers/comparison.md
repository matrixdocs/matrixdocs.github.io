---
sidebar_position: 5
title: Server Comparison
description: Compare Synapse, Dendrite, Conduit, tuwunel and continuwuity
last_update:
  date: 2026-10-18
verified_with: "Synapse 1.163.0, Dendrite v0.15.2, Conduit v0.10.15, tuwunel v1.9.4, continuwuity v26.9.1, spec v1.19"
---

# Server Comparison

This table compares the homeservers you might choose in October 2026. Versions and statuses were checked against each project's repository on 2026-10-18. The "fit" rows are this site's assessment, not the projects' claims.

## At a glance

| | Synapse | Dendrite | Conduit | tuwunel | continuwuity |
|---|---|---|---|---|---|
| Language | Python + Rust | Go | Rust | Rust | Rust |
| Latest release | 1.163.0 (2026-10-14) | v0.15.2 (2025-08-15) | v0.10.15 (2026-09-30) | v1.9.4 (2026-10-10) | v26.9.1 (2026-09-28) |
| Status | Active, about every two weeks | Maintenance mode (security fixes only), beta | Active, beta | Active | Active |
| Maintainer | Element | Element | Famedly and community | matrix-construct | Community |
| Licence | AGPL-3.0 (or commercial) | AGPL-3.0 | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Database | PostgreSQL (SQLite for testing) | PostgreSQL or SQLite | RocksDB or SQLite (embedded) | RocksDB (embedded) | RocksDB (embedded) |
| Default room version | 12 (since 1.162) | – | 12 | 12 | 12 |
| Simplified Sliding Sync (Element X) | Yes, native since 1.114 | No | Yes | Yes | Yes |
| MAS / OIDC login | MAS (stable since 1.136), legacy SSO/OIDC too | No | No | Native OIDC option | OIDC option |
| Application services (bridges) | Yes | "Not well tested" | Yes | Yes | Yes |
| Horizontal scaling | Workers | No | No | No | No |
| Metrics | Prometheus | Prometheus | No | See project docs | See project docs |
| Ansible (MDAD) support | Default | Yes | Yes | Yes | Yes |
| Kubernetes | [ESS Community](https://github.com/element-hq/ess-helm) Helm chart | Helm chart in repo | – | – | – |

Sources: each project's README and changelog; [Dendrite FAQ](https://github.com/element-hq/dendrite/blob/main/docs/FAQ.md) for appservices; the MDAD [README](https://github.com/spantaleev/matrix-docker-ansible-deploy#readme) for Ansible support. "–" means no setting or no first-party option exists. Check licence files in each repository if the licence matters to you.

## Which one to pick

| Situation | Suggested server | Why |
|---|---|---|
| You want everything to work (Element X, MAS, Element Call, bridges) | Synapse | Reference for new features; Element tests against it |
| Organisation, or more than a few hundred active users | Synapse with PostgreSQL, workers when needed | Only option with horizontal scaling |
| Kubernetes | Synapse via ESS Community | Packages Synapse, MAS, Element Web and MatrixRTC together |
| Small server on modest hardware | Conduit, tuwunel or continuwuity | Single binary, embedded database, low memory |
| Existing Dendrite server | Keep patched; plan a move | Security fixes only, no Element X support |
| New Dendrite server | Not recommended | Maintenance mode |

## Resource use

Memory depends mainly on the size of the rooms your users join, not on the number of local users. One user in several large public rooms can push Synapse past 1 GB. Synapse's installation docs ask for "at least 1GB of free RAM if you want to join large public rooms like #matrix:matrix.org". The Rust servers typically need much less memory for the same rooms; check each project's docs for current guidance.

## Migration between servers

| From → To | Supported? |
|---|---|
| conduwuit → tuwunel | Yes, in place |
| conduwuit → continuwuity | Yes |
| Conduit → tuwunel | Yes, RocksDB in place on first boot |
| Conduit → continuwuity | No |
| Synapse → Conduit family | No |
| Synapse ↔ Dendrite | No |

Where there is no migration path, moving means a new server, new accounts, and rejoining rooms over federation. Back up the database before any in-place migration.

## Feature notes

- **End-to-end encryption** is done by clients. Servers only store and relay encrypted events, device keys and key backups, so all of these servers can host encrypted rooms.
- **Element X** needs Simplified Sliding Sync. Without it, Element X will not connect.
- **Element Call** needs a LiveKit SFU and `lk-jwt-service` next to the homeserver, plus MatrixRTC support in the homeserver (`matrix_rtc` in Synapse). See [Synapse: Calls](./synapse#calls-element-call-and-matrixrtc).
- **Hosted options:** Element's pricing page (checked 2026-10-18) lists only self-hosted Element Server Suite plans. See [Deployment overview](../deployment/overview) for hosting choices.

## Resources

- [Synapse](./synapse) · [Dendrite](./dendrite) · [Conduit and forks](./conduit)
- [Homeservers overview](./overview)

---

*See also: [Deployment overview](../deployment/overview)*
