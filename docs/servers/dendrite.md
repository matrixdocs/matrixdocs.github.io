---
sidebar_position: 3
title: Dendrite
description: Dendrite, the Go homeserver, now in maintenance mode
last_update:
  date: 2026-10-18
verified_with: "Dendrite v0.15.2 (element-hq/dendrite), spec v1.19"
---

# Dendrite

:::warning Maintenance mode
Dendrite is "currently in maintenance mode, meaning only security fixes are being applied", and its README still calls it **beta** software ([element-hq/dendrite README](https://github.com/element-hq/dendrite#readme)). The latest release is **v0.15.2 (2025-08-15)**. Dendrite does not support Simplified Sliding Sync (MSC4186) or next-gen OIDC auth (MSC3861), so **Element X does not work with it**.

For a new server, use [Synapse](./synapse), or a Rust server from the [Conduit family](./conduit) if you want something lighter.
:::

Dendrite is a Matrix homeserver written in Go. It moved from `matrix-org/dendrite` (now archived) to [github.com/element-hq/dendrite](https://github.com/element-hq/dendrite). Its documentation is at [element-hq.github.io/dendrite](https://element-hq.github.io/dendrite/).

## What it is and isn't

| | Status (v0.15.2) |
|---|---|
| Development | Security fixes only. v0.15.0 (2025-08-12) added room version 12 as part of the coordinated security release |
| Deployment shape | Single process ("monolith"). The old polylith/microservice mode was removed in 0.12.0 |
| Scaling | No high-availability or clustering support (README) |
| Intended size | "small (10s/100s of users) homeserver deployments" (README) |
| Database | PostgreSQL recommended; SQLite supported |
| Application services | Supported but "not well tested" ([FAQ](https://github.com/element-hq/dendrite/blob/main/docs/FAQ.md)) |
| SSO / OIDC / MAS | Not supported |
| Element X | Not supported (no MSC4186, no MSC3861) |
| Migration from Synapse | None |

## Running Dendrite with Docker

These steps follow the upstream [Docker install guide](https://element-hq.github.io/dendrite/installation/docker/install). The image is `ghcr.io/element-hq/dendrite-monolith` (the older `matrixdotorg/dendrite-monolith` on Docker Hub also has v0.15.2).

Generate the signing key once. Running it again overwrites the key:

```bash
mkdir -p ./config
docker run --rm --entrypoint="/usr/bin/generate-keys" \
  -v "$(pwd)/config:/mnt" \
  ghcr.io/element-hq/dendrite-monolith:v0.15.2 \
  -private-key /mnt/matrix_key.pem
```

Generate a config for your server name and PostgreSQL database:

```bash
docker run --rm --entrypoint="/bin/sh" \
  -v "$(pwd)/config:/mnt" \
  ghcr.io/element-hq/dendrite-monolith:v0.15.2 \
  -c "/usr/bin/generate-config \
    -dir /var/dendrite/ \
    -db postgres://dendrite:CHANGE_ME@postgres/dendrite?sslmode=disable \
    -server example.com > /mnt/dendrite.yaml"
```

Then start it with the upstream [docker-compose.yml](https://github.com/element-hq/dendrite/blob/main/build/docker/docker-compose.yml). That file publishes ports 8008 and 8448 on all interfaces; behind a reverse proxy, change them to `127.0.0.1:8008:8008` and drop 8448 unless you terminate TLS in Dendrite.

## Building from source

There are no prebuilt binaries attached to element-hq releases. Building needs Go 1.23 or later (`go.mod` at v0.15.2 declares `go 1.23.0`):

```bash
git clone --branch v0.15.2 https://github.com/element-hq/dendrite
cd dendrite
go build -o bin/ ./cmd/...
./bin/generate-keys -private-key matrix_key.pem
```

This builds `dendrite` plus helper tools such as `generate-keys`, `generate-config` and `create-account` into `bin/`. See the [manual install guide](https://element-hq.github.io/dendrite/installation/manual/build).

## Configuration

Start from [`dendrite-sample.yaml`](https://github.com/element-hq/dendrite/blob/v0.15.2/dendrite-sample.yaml) or the output of `generate-config`. The file must start with `version: 2`, or Dendrite refuses to start. The keys below are from the v0.15.2 sample config:

```yaml title="dendrite.yaml (excerpt)"
version: 2

global:
  server_name: example.com
  private_key: matrix_key.pem
  database:
    connection_string: postgresql://dendrite:CHANGE_ME@localhost/dendrite?sslmode=disable
  jetstream:
    storage_path: ./jetstream   # must persist across restarts

client_api:
  registration_disabled: true
  guests_disabled: true
  registration_shared_secret: ""   # set only while you need create-account

media_api:
  base_path: ./media_store
  max_file_size_bytes: 10485760
```

Keep `jetstream` on persistent storage. An in-memory JetStream loses queued data on restart and is for tests only.

If you enable registration, also set `enable_registration_captcha` and the reCAPTCHA keys in `client_api`; the sample config calls this "HIGHLY RECOMMENDED".

## Creating users

`create-account` is a separate binary. It talks to a running Dendrite and needs `registration_shared_secret` set in `client_api` ([upstream guide](https://element-hq.github.io/dendrite/administration/createusers)). It prompts for the password:

```bash
# From a source build
./bin/create-account -config /path/to/dendrite.yaml -username alice -admin

# In Docker
docker exec -it CONTAINERNAME /usr/bin/create-account -config /etc/dendrite/dendrite.yaml -username alice -admin
```

:::warning
`registration_shared_secret` lets anyone who knows it create admin accounts. Use a long random value, keep it out of version control, and clear it again when you no longer need it.
:::

## Reverse proxy

Proxy only `/_matrix` to Dendrite. Dendrite's admin endpoints (`/_dendrite/admin/...`) and the shared-secret registration endpoint (`/_synapse/admin/v1/register`) should not be reachable from the internet. Upstream ships an [nginx sample](https://github.com/element-hq/dendrite/blob/main/docs/nginx/dendrite-sample.conf).

For federation, use `.well-known` delegation as described in [Homeservers overview](./overview#well-known-delegation).

## Moving away from Dendrite

There is no automatic migration from Dendrite to another homeserver. Moving means creating accounts on a new server (ideally with a new server name), rejoining rooms over federation, and accepting that direct messages and encrypted history may not carry over.

## Resources

- [Dendrite repository](https://github.com/element-hq/dendrite)
- [Dendrite documentation](https://element-hq.github.io/dendrite/)
- [#dendrite:matrix.org](https://matrix.to/#/#dendrite:matrix.org)

---

*Next: [Conduit](./conduit) →*
