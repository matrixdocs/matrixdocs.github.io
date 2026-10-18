---
sidebar_position: 5
title: Self-Hosting Tips
description: Practical tuning, monitoring, security and backup tips for Matrix homeserver admins
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0"
---

# Self-Hosting Tips

Tips for running a homeserver, mostly Synapse. Config keys are from the Synapse 1.163 [configuration manual](https://element-hq.github.io/synapse/latest/usage/configuration/config_documentation.html). Read it, and the [upgrade notes](https://element-hq.github.io/synapse/latest/upgrade.html), before changing a production server.

:::info Coming next
Synapse 1.164 (RC expected around 2026-10-20) will probably drop Python 3.10 support ([PR #20359](https://github.com/element-hq/synapse/pull/20359), open as of 2026-10-18). Check your Python version before upgrading.
:::

## Choosing a homeserver

| Server | Status (2026-10) | Good for |
|--------|------------------|----------|
| [Synapse](https://github.com/element-hq/synapse) | Reference server, v1.163.0 (2026-10-14) | Most deployments; the widest feature support |
| [Conduit](https://gitlab.com/famedly/conduit) | Active, v0.10.15 (2026-09-30) | Small servers; a single Rust binary |
| [Tuwunel](https://github.com/matrix-construct/tuwunel) | Active, v1.9.4 (2026-10-10) | Successor to conduwuit |
| [Continuwuity](https://forgejo.ellis.link/continuwuation/continuwuity) | Active | Community successor to conduwuit |
| [Dendrite](https://github.com/element-hq/dendrite) | Maintenance mode, security fixes only | Existing installs |

conduwuit ended in 2025 and its repo is archived. Its README names Tuwunel as successor, while Continuwuity is a community continuation; both are maintained. See [Server comparison](../servers/comparison) and [Conduit](../servers/conduit).

Whatever you run, don't expose a homeserver's plain-HTTP port on 8448. Port 8448 is for federation over TLS. Put a TLS reverse proxy in front, or delegate with `.well-known`.

---

## Authentication: Matrix Authentication Service

New deployments, and anyone who wants Element X's full login experience, should look at [Matrix Authentication Service](https://github.com/element-hq/matrix-authentication-service) (MAS). It provides OIDC-based next-gen auth, and matrix.org has used it since 2025-04. Synapse integrates with it through the `matrix_authentication_service` block:

```yaml title="homeserver.yaml"
matrix_authentication_service:
  enabled: true
  endpoint: http://localhost:8080
  secret_path: /etc/matrix-synapse/mas_secret
```

Migrating an existing server needs PostgreSQL and uses `mas-cli syn2mas`; follow the [MAS documentation](https://element-hq.github.io/matrix-authentication-service/). With MAS enabled, users are managed in MAS. Synapse refuses to create users through its admin API and disables its reset-password, server-admin and login-as-user endpoints.

## Sliding sync

Synapse serves simplified sliding sync (MSC4186) natively and has it on by default. Element X uses it. You don't need the old sliding-sync proxy or any config.

---

## Performance

### Workers

A single Synapse process is enough for small servers. For larger ones, split load across [workers](https://element-hq.github.io/synapse/latest/workers.html). Synapse 1.88 removed `worker_replication_host`, `worker_replication_http_port` and `worker_replication_http_tls`, and Synapse refuses to start if they are present. (`worker_replication_secret` and `worker_replication_secret_path` are still valid.) The main process and workers now share an `instance_map` and Redis:

```yaml title="homeserver.yaml (shared config)"
listeners:
  - port: 9093
    bind_addresses: ['127.0.0.1']
    type: http
    resources:
      - names: [replication]

worker_replication_secret_path: /etc/matrix-synapse/replication_secret

redis:
  enabled: true

instance_map:
  main:
    host: localhost
    port: 9093
```

Each worker gets its own small file:

```yaml title="workers/generic_worker1.yaml"
worker_app: synapse.app.generic_worker
worker_name: generic_worker1

worker_listeners:
  - type: http
    port: 8083
    bind_addresses: ['127.0.0.1']   # only the reverse proxy should reach it
    x_forwarded: true
    resources:
      - names: [client, federation]

worker_log_config: /etc/matrix-synapse/generic-worker-log.yaml
```

Never expose the replication listener publicly; replication traffic is unencrypted. Your reverse proxy must route the endpoints each worker handles; the workers guide lists them. Deployment tools such as matrix-docker-ansible-deploy can generate all this for you.

### Caches

```yaml title="homeserver.yaml"
caches:
  global_factor: 1.0
  per_cache_factors:
    get_users_in_room: 2.0
    stateGroupCache: 2.0
```

The default `global_factor` is 0.5. Raise factors only if you have the RAM, and watch the cache metrics before and after.

### PostgreSQL tuning

Use PostgreSQL rather than SQLite for anything beyond testing. Size settings from the RAM available to PostgreSQL, not fixed numbers. A common starting point:

| Setting | Starting point |
|---------|----------------|
| `shared_buffers` | About 25% of RAM |
| `effective_cache_size` | About 50–75% of RAM |
| `random_page_cost` | 1.1 on SSDs |

Autovacuum handles routine `VACUUM ANALYZE`. Don't schedule `REINDEX DATABASE` as routine maintenance; it takes heavy locks. See also Synapse's [PostgreSQL guide](https://element-hq.github.io/synapse/latest/postgres.html).

---

## Monitoring

Enable metrics and give them a listener bound to **localhost only**. Without `bind_addresses`, a listener binds to all interfaces and your metrics become public.

```yaml title="homeserver.yaml"
enable_metrics: true
listeners:
  - port: 9000
    type: metrics
    bind_addresses: ['::1', '127.0.0.1']
```

(Add this listener to your existing `listeners` list rather than replacing it.)

Scrape it with Prometheus on the same host or over a private network, following Synapse's [metrics how-to](https://element-hq.github.io/synapse/latest/metrics-howto.html). Synapse's Grafana dashboard is in [contrib/grafana](https://github.com/element-hq/synapse/tree/develop/contrib/grafana). If you run Grafana, change the default admin password and don't publish it without authentication.

Useful things to alert on: federation send lag, request latency, database connection pool usage, memory and disk space.

---

## Media

### S3 storage for Synapse

[synapse-s3-storage-provider](https://github.com/matrix-org/synapse-s3-storage-provider) (1.7.0) copies media to S3. Install it into **the same Python environment as Synapse**, for example `pip install synapse-s3-storage-provider` inside Synapse's virtualenv.

```yaml title="homeserver.yaml"
media_storage_providers:
  - module: s3_storage_provider.S3StorageProviderBackend
    store_local: true
    store_remote: true
    store_synchronous: true
    config:
      bucket: matrix-media
      region_name: us-east-1
      # access_key_id / secret_access_key can be set here, but prefer the
      # standard AWS credential sources (environment, ~/.aws, instance role)
      # so secrets are not in homeserver.yaml.
```

Media is still written to the local media store first. To free local disk, run the provider's `s3_media_upload` script on a schedule, as its README describes.

### matrix-media-repo

[matrix-media-repo](https://github.com/t2bot/matrix-media-repo) (image `ghcr.io/t2bot/matrix-media-repo`, last release v1.3.8 from 2025-01) replaces Synapse's media handling. Its README recommends it only for large servers or hosting providers, and points people who just want S3 at synapse-s3-storage-provider. If you deploy it, start from its `config.sample.yaml`. Each datastore needs `id` and `forKinds`, and the S3 secret key is `accessSecret`.

### Cleaning up remote media

```bash
# Purge cached remote media not accessed since the given time (ms since epoch)
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8008/_synapse/admin/v1/purge_media_cache?before_ts=1735689600000"
```

Or with synadm: `synadm media purge -d 30`.

---

## Identity server

Most homeservers don't need their own identity server. Sydent's README notes that most servers use the matrix.org instance or none at all. If you do need one, [Sydent](https://github.com/element-hq/sydent) is now maintained under `element-hq` (the `matrix-org/sydent` repo is archived). It uses an INI-style `sydent.conf`; follow its README instead of writing one from scratch.

---

## Security hardening

:::warning
The settings below control who can register and what your server will fetch. Getting them wrong can turn your server into a spam source or a proxy into your internal network.
:::

### Registration

Never run open registration without a token or a captcha:

```yaml title="homeserver.yaml"
enable_registration: true
registration_requires_token: true
```

Create tokens with the [registration tokens admin API](https://element-hq.github.io/synapse/latest/usage/administration/admin_api/registration_tokens.html) or `synadm regtok`. Email verification on its own doesn't stop spam bots. On MAS-based servers, registration is configured in MAS.

### Rate limiting

Synapse rate-limits by default. The values below **are the defaults** from the configuration manual, shown so you can see the structure. Add a block only if you want to change it: lower values are stricter.

```yaml title="homeserver.yaml (defaults shown)"
rc_message:
  per_second: 0.2
  burst_count: 10

rc_registration:
  per_second: 0.17
  burst_count: 3

rc_login:
  address:
    per_second: 0.003
    burst_count: 5
  account:
    per_second: 0.003
    burst_count: 5
  failed_attempts:
    per_second: 0.17
    burst_count: 3
```

The key is `rc_message` (singular), and `rc_login` takes `address`, `account` and `failed_attempts` sub-sections. Misspelled or flattened keys are silently ignored. If you run Element Call, it needs higher `rc_message` limits; see [Advanced Features](./advanced-features#element-call).

### URL previews

If you set `url_preview_enabled: true`, you **must** also set `url_preview_ip_range_blacklist`. Otherwise anyone in any room can make your server fetch internal addresses, including cloud metadata at `169.254.169.254`. Use the full list from the Synapse docs:

```yaml title="homeserver.yaml"
url_preview_enabled: true
url_preview_ip_range_blacklist:
  - '127.0.0.0/8'
  - '10.0.0.0/8'
  - '172.16.0.0/12'
  - '192.168.0.0/16'
  - '100.64.0.0/10'
  - '192.0.0.0/24'
  - '169.254.0.0/16'
  - '192.88.99.0/24'
  - '198.18.0.0/15'
  - '192.0.2.0/24'
  - '198.51.100.0/24'
  - '203.0.113.0/24'
  - '224.0.0.0/4'
  - '::1/128'
  - 'fe80::/10'
  - 'fc00::/7'
  - '2001:db8::/32'
  - 'ff00::/8'
  - 'fec0::/10'
max_upload_size: 50M
```

Add any other internal ranges your network uses. Note that the blacklist is ignored when Synapse uses an HTTP proxy.

### Blocking abusive servers

Synapse has no server blocklist setting. `federation_domain_whitelist` is an **allowlist**: if it is unset or `null`, Synapse federates with everyone. To keep out abusive servers:

- Set `m.room.server_acl` in the rooms you moderate (Element: room settings, or `/devtools`).
- Use a moderation bot such as [Draupnir](./power-tools#draupnir) to apply server bans from policy lists across rooms.
- Firewall the federation port against specific hosts if needed.

Check your federation setup with the [federation tester](https://federationtester.matrix.org/).

---

## Backups

### Database

```bash title="backup.sh"
#!/bin/sh
set -e
DATE=$(date +%Y%m%d)
pg_dump -U synapse -Fc synapse > /backups/synapse_$DATE.dump
find /backups -name 'synapse_*.dump' -mtime +7 -delete
```

A database dump does **not** include your config, signing key or media. Back those up too:

```bash
rsync -a /var/lib/synapse/media_store/ /backups/media/
cp /etc/matrix-synapse/*.signing.key /secure-backup/
```

### Signing key

Keep the signing key safe. If you lose it you can generate a new one, but other servers will have cached the old key. List it under `old_signing_keys` if you still have its public part; the Synapse docs explain how to recover it from another server.

### Test your restores

Restore to a test machine regularly: database, media, signing key and config. Then start Synapse and check that federation works.

---

## Upgrades

Upgrade deliberately:

1. Pin image tags or package versions; don't track `latest`.
2. Read the [Synapse upgrade notes](https://element-hq.github.io/synapse/latest/upgrade.html) for every version you skip. Some releases need config changes, such as the worker settings removed in 1.88.
3. Back up, upgrade, and check logs and federation.

Don't let a container auto-updater (such as Watchtower, which is archived) upgrade Synapse or PostgreSQL unattended. A PostgreSQL major-version change needs a dump and restore or `pg_upgrade`, and skipped upgrade steps can stop Synapse from starting.

### Deployment tools

- [matrix-docker-ansible-deploy](https://github.com/spantaleev/matrix-docker-ansible-deploy): an Ansible playbook covering Synapse and Conduit-family servers, Element Web, bridges, Draupnir, MAS and more. See [Ansible deployment](../deployment/ansible).
- [Element Server Suite Community](https://github.com/element-hq/ess-helm): Element's Helm chart for Kubernetes, bundling Synapse, MAS, Element Web and the Element Call backend. Its README aims it at small and mid-sized non-commercial deployments of up to about 100 users.

---

## Useful admin API calls

```bash
# Synapse version (no auth needed)
curl http://localhost:8008/_synapse/admin/v1/server_version

# List users
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8008/_synapse/admin/v2/users?limit=100"

# List rooms
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8008/_synapse/admin/v1/rooms"

# Purge history before a timestamp (room ID URL-encoded)
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"delete_local_events": false, "purge_up_to_ts": 1577836800000}' \
  "http://localhost:8008/_synapse/admin/v1/purge_history/%21abc%3Aexample.org"
```

Setting `delete_local_events: true` also deletes your own users' messages permanently. Leave it `false` unless you mean it.

## Community

- [#synapse:matrix.org](https://matrix.to/#/#synapse:matrix.org): Synapse admins
- [#homeservers:matrix.org](https://matrix.to/#/#homeservers:matrix.org): general homeserver admin chat
