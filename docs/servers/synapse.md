---
sidebar_position: 2
title: Synapse
description: Install, configure and run the Synapse Matrix homeserver
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0"
---

# Synapse

Synapse is the most widely deployed Matrix homeserver. It is written in Python with a growing Rust core, maintained by Element at [github.com/element-hq/synapse](https://github.com/element-hq/synapse), and licensed AGPL-3.0 (Element also offers a commercial licence). The old `matrix-org/synapse` repository is archived.

This page covers Synapse 1.163.0 (released 2026-10-14). The [official documentation](https://element-hq.github.io/synapse/latest/) is the reference; this page summarises it and links to the relevant sections.

## Requirements

| Item | Requirement (Synapse 1.163) | Source |
|------|-----------------------------|--------|
| Python | 3.10 or later (3.9 dropped in 1.142) | [upgrade notes](https://element-hq.github.io/synapse/latest/upgrade.html#upgrading-to-v11420) |
| PostgreSQL | 14 or later (13 dropped in 1.143) | [upgrade notes](https://element-hq.github.io/synapse/latest/upgrade.html#upgrading-to-v11430) |
| SQLite | Testing only; do not use in production | [installation docs](https://element-hq.github.io/synapse/latest/setup/installation.html) |
| Docker image | `matrixdotorg/synapse` or `ghcr.io/element-hq/synapse` (Debian trixie, Python 3.13) | [installation docs](https://element-hq.github.io/synapse/latest/setup/installation.html#docker-images-and-ansible-playbooks) |

:::info Coming next
Synapse PR [#20359 "Drop support for Python 3.10"](https://github.com/element-hq/synapse/pull/20359) was opened on 2026-10-15 and was still open on 2026-10-18. If it merges, the next release (1.164) will need Python 3.11 or later. Check the [upgrade notes](https://element-hq.github.io/synapse/latest/upgrade.html) before upgrading.
:::

Read the upgrade notes for every version you skip. Synapse can refuse to start after an upgrade if your config uses a removed or newly invalid option. For example, 1.163 refuses `limit_profile_requests_to_users_who_share_rooms: true` unless `require_auth_for_profile_requests: true` is also set.

## Choose your server name first

`server_name` is the domain in your user IDs (`@alice:example.com`). It **cannot be changed later** without starting a new server, and the signing key file is named after it.

Most people use the bare domain (`example.com`) as the server name and run Synapse on a subdomain (`matrix.example.com`). Clients and other servers find the subdomain through `.well-known` files on the bare domain. See [Well-known delegation](./overview#well-known-delegation) and the upstream [delegation guide](https://element-hq.github.io/synapse/latest/delegate.html).

## Install with Docker Compose

Generate a config for `example.com` (the server name, not the subdomain):

```bash
mkdir -p ~/synapse && cd ~/synapse
docker run -it --rm \
  -v "$(pwd)/data:/data" \
  -e SYNAPSE_SERVER_NAME=example.com \
  -e SYNAPSE_REPORT_STATS=no \
  matrixdotorg/synapse:v1.163.0 generate
```

This writes `data/homeserver.yaml`, `data/example.com.signing.key` and a log config. The generated config uses SQLite; switch it to PostgreSQL (below) before the first start.

```yaml title="docker-compose.yml"
services:
  synapse:
    image: matrixdotorg/synapse:v1.163.0   # pin a version; read the upgrade notes before bumping
    restart: unless-stopped
    volumes:
      - ./data:/data
    ports:
      # Reachable only from this host. The reverse proxy on the host forwards to it.
      - "127.0.0.1:8008:8008"
    depends_on:
      - db

  db:
    image: postgres:17-alpine
    restart: unless-stopped
    env_file: ./db.env          # contains POSTGRES_PASSWORD=...; keep it out of version control
    environment:
      - POSTGRES_USER=synapse
      - POSTGRES_DB=synapse
      - POSTGRES_INITDB_ARGS=--encoding=UTF8 --locale=C
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
```

:::warning
Do not publish `8008:8008` without the `127.0.0.1:` prefix. Docker's port publishing bypasses host firewalls such as ufw, and the plain-HTTP listener also serves the admin API (`/_synapse/admin`).
:::

## Install from packages or pip

Debian and Ubuntu packages (amd64) come from packages.matrix.org, as given in the [installation docs](https://element-hq.github.io/synapse/latest/setup/installation.html#matrixorg-packages):

```bash
sudo apt install -y lsb-release wget apt-transport-https
sudo wget -O /usr/share/keyrings/matrix-org-archive-keyring.gpg https://packages.matrix.org/debian/matrix-org-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/matrix-org-archive-keyring.gpg] https://packages.matrix.org/debian/ $(lsb_release -cs) main" |
    sudo tee /etc/apt/sources.list.d/matrix-org.list
sudo apt update
sudo apt install matrix-synapse-py3
```

The repository's signing key expiry was extended in 2026. If you see `EXPKEYSIG`, re-run the `wget` line above; the old key expires on 2027-03-15 ([upgrade notes for 1.159](https://element-hq.github.io/synapse/latest/upgrade.html#upgrading-to-v11590)).

With pip in a virtualenv, include the `postgres` extra, or the PostgreSQL driver is missing:

```bash
python3 -m venv ~/synapse/env
source ~/synapse/env/bin/activate
pip install "matrix-synapse[postgres]"

cd ~/synapse
python -m synapse.app.homeserver \
  --server-name example.com \
  --config-path homeserver.yaml \
  --generate-config \
  --report-stats=no
```

Workers also need the `redis` extra (`matrix-synapse[postgres,redis]`). Logging to the systemd journal needs `systemd-python` installed separately; the `systemd` extra was removed in 1.150.

## Essential configuration

### PostgreSQL

Create the database with C collation, as in the [PostgreSQL guide](https://element-hq.github.io/synapse/latest/postgres.html):

```bash
sudo -u postgres createuser --pwprompt synapse
sudo -u postgres createdb --encoding=UTF8 --locale=C --template=template0 --owner=synapse synapse
```

### homeserver.yaml

The generated file already contains `server_name`, `registration_shared_secret`, `macaroon_secret_key`, `form_secret` and the signing key path. Edit or add these:

```yaml title="homeserver.yaml"
server_name: "example.com"
public_baseurl: "https://matrix.example.com/"

database:
  name: psycopg2
  args:
    user: synapse
    password: "CHANGE_ME"
    database: synapse
    host: db                  # the Compose service name; "localhost" on a bare-metal host
    cp_min: 5
    cp_max: 10

listeners:
  - port: 8008
    tls: false
    type: http
    x_forwarded: true
    # On a bare-metal host add: bind_addresses: ['127.0.0.1']
    resources:
      - names: [client, federation]
        compress: false

# No public sign-up. See "Registration" below.
enable_registration: false

media_store_path: /data/media_store
max_upload_size: 50M
```

New rooms use room version 12 by default since Synapse 1.162 (see `default_room_version` in the [config manual](https://element-hq.github.io/synapse/latest/usage/configuration/config_documentation.html#default_room_version)). To validate a config without starting the server:

```bash
python -m synapse.config -c homeserver.yaml                              # pip install
docker compose exec synapse python -m synapse.config -c /data/homeserver.yaml   # Docker
```

### URL previews

URL previews make Synapse fetch any URL posted in a room. Without a block list, anyone in any room can make your server request internal addresses such as cloud metadata endpoints or admin panels. The list has no default, and Synapse refuses to start with `url_preview_enabled: true` and no list. Use the full list from the [config manual](https://element-hq.github.io/synapse/latest/usage/configuration/config_documentation.html#url_preview_ip_range_blacklist), plus any other internal ranges your network uses:

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
```

The list is ignored when Synapse uses an outbound HTTP proxy, so in that case the proxy must do the filtering.

### Registration

Keep `enable_registration: false` unless you need public sign-up. If you enable it, require a registration token or a CAPTCHA:

```yaml title="homeserver.yaml"
enable_registration: true
registration_requires_token: true
```

Create tokens with the [registration tokens admin API](https://element-hq.github.io/synapse/latest/usage/administration/admin_api/registration_tokens.html) (`POST /_synapse/admin/v1/registration_tokens/new`). For CAPTCHA, see `enable_registration_captcha` and the [CAPTCHA guide](https://element-hq.github.io/synapse/latest/CAPTCHA_SETUP.html). These options do not apply when MAS handles authentication (below).

## Reverse proxy

Proxy only `/_matrix` and `/_synapse/client`. Do not proxy `/_synapse/admin` to the internet: anyone with an admin token could then control the server from anywhere. This example follows the upstream [reverse proxy guide](https://element-hq.github.io/synapse/latest/reverse_proxy.html):

```nginx title="/etc/nginx/sites-available/matrix"
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name matrix.example.com;

    ssl_certificate     /etc/letsencrypt/live/matrix.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/matrix.example.com/privkey.pem;

    location ~ ^(/_matrix|/_synapse/client) {
        # Do not add a path (even "/") after the port: nginx would rewrite
        # the URI and break federation signature checks.
        proxy_pass http://127.0.0.1:8008;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host:$server_port;
        proxy_http_version 1.1;
        client_max_body_size 50M;   # match max_upload_size
    }
}
```

With `.well-known` delegation to port 443 you do not need port 8448. If you do serve federation on 8448, add `listen 8448 ssl;` to the same server block so it uses the same restricted `location`. Never add a catch-all `location /` that proxies to Synapse.

Synapse can serve `/.well-known/matrix/server` itself if `https://example.com/` reaches it: set `serve_server_wellknown: true`. Otherwise serve the files from the web server on `example.com` (see [Well-known delegation](./overview#well-known-delegation)).

Every HTTP listener also answers `GET /health` with 200, for load-balancer checks.

## Users and the admin API

:::warning
Admin accounts and admin access tokens can read and change everything on the server. Keep the admin API off the public internet, call it from the host, and do not paste admin tokens into shared shells or chats.
:::

Create the first admin with the shared secret from `homeserver.yaml`. Leave out `-p` so the password is prompted for and not saved in shell history:

```bash
# Docker Compose
docker compose exec synapse register_new_matrix_user -c /data/homeserver.yaml -a http://localhost:8008

# Debian package
register_new_matrix_user -c /etc/matrix-synapse/homeserver.yaml -a http://localhost:8008
```

Send admin API calls to the local listener, not the public hostname:

```bash
# Version check
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8008/_synapse/admin/v1/server_version

# User details
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8008/_synapse/admin/v2/users/@alice:example.com"

# Deactivate and erase a user
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" -d '{"erase": true}' \
  "http://localhost:8008/_synapse/admin/v1/deactivate/@alice:example.com"

# List rooms
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8008/_synapse/admin/v1/rooms
```

To get a token, log in as the admin user and copy that session's access token (in Element Web: Settings → Help & About → Advanced). Log the session out when you are done, which revokes the token. The full reference is the [admin API documentation](https://element-hq.github.io/synapse/latest/usage/administration/admin_api/index.html).

## Matrix Authentication Service (MAS)

[MAS](https://github.com/element-hq/matrix-authentication-service) is Element's OAuth 2.0 / OIDC service for Matrix ("next-generation auth"). It handles login, registration and sessions in place of Synapse. matrix.org moved to MAS in April 2025.

Synapse's stable integration (since 1.136; needs MAS 0.20 or later) is the `matrix_authentication_service` block. The old `experimental_features.msc3861` block was removed in 1.157.

```yaml title="homeserver.yaml"
matrix_authentication_service:
  enabled: true
  endpoint: http://localhost:8080          # where Synapse reaches MAS
  secret_path: /data/mas_shared_secret     # same value as matrix.secret in the MAS config
```

With MAS enabled:

- Synapse refuses to start if any of these are also configured: `enable_registration`, `enable_registration_captcha`, `password_config.enabled` set to `true` or `only_for_reauth` (password login is off by default with MAS), password auth providers, SSO providers (OIDC, SAML, CAS, JWT), `user_consent`, `login_via_existing_session.enabled`, `enable_3pid_changes`, or session and token lifetimes. Remove them first.
- Synapse's admin API refuses to create users (since 1.163).
- You manage users with `mas-cli`, for example `mas-cli manage register-user`. For a Synapse admin token, use `mas-cli manage issue-compatibility-token <username> <device_id> --yes-i-want-to-grant-synapse-admin-privileges` (see the [MAS CLI reference](https://element-hq.github.io/matrix-authentication-service/reference/cli/manage.html)).
- MAS needs PostgreSQL.

For a full walkthrough (install, reverse proxy, migration and checks), see [Matrix Authentication Service (MAS)](./mas). Read the [MAS migration guide](https://element-hq.github.io/matrix-authentication-service/setup/migration.html) before moving an existing server. For example, SAML, LDAP and custom password providers are not migrated directly.

## Sliding sync and Element X

Synapse has served native Simplified Sliding Sync (MSC4186) by default since 1.114. It needs no configuration and no separate proxy; the old `sliding-sync` proxy is archived. Element X needs sliding sync, and uses OIDC login when the server offers MAS.

## Calls: Element Call and MatrixRTC

Element Call uses MatrixRTC with a [LiveKit](https://github.com/livekit/livekit) SFU and the [MatrixRTC Authorization Service](https://github.com/element-hq/lk-jwt-service) (`lk-jwt-service`), not TURN. Synapse tells clients about the SFU through `matrix_rtc` (see the [config manual](https://element-hq.github.io/synapse/latest/usage/configuration/config_documentation.html#matrix_rtc)). Since 1.161, `url` (the SFU WebSocket URL) is preferred. Clients that use `url` reach lk-jwt-service through Synapse, so lk-jwt-service must be registered with Synapse as an application service (see its [README](https://github.com/element-hq/lk-jwt-service#readme)). `livekit_service_url` is deprecated, but keep listing it for older clients:

```yaml title="homeserver.yaml"
matrix_rtc:
  transports:
    - type: livekit
      url: wss://matrix-rtc.example.com/livekit/sfu
      livekit_service_url: https://matrix-rtc.example.com/livekit/jwt

max_event_delay_duration: 24h   # delayed events (MSC4140), needed by Element Call
```

Element Call also needs some `experimental_features` flags and rate-limit settings. Follow the [Element Call self-hosting guide](https://github.com/element-hq/element-call/blob/main/docs/self_hosting.md). Legacy 1:1 calls still use TURN (`turn_uris`, `turn_shared_secret`); see [Docker deployment](../deployment/docker#legacy-calls-coturn).

## Workers

A single Synapse process is enough for small and medium servers. Larger servers split the load across [workers](https://element-hq.github.io/synapse/latest/workers.html). Workers need three things on the main process: Redis, an HTTP replication listener, and an `instance_map` entry for `main`. The old `worker_replication_host` and `worker_replication_http_port` options were removed in 1.88.

Shared config (read by the main process and all workers):

```yaml title="homeserver.yaml"
listeners:
  # Keep the existing client/federation listener from above.
  - port: 9093
    bind_addresses: ['127.0.0.1']   # never expose replication publicly
    type: http
    resources:
      - names: [replication]

worker_replication_secret: "CHANGE_ME"

redis:
  enabled: true

instance_map:
  main:
    host: 'localhost'
    port: 9093
```

One extra file per worker:

```yaml title="workers/generic_worker1.yaml"
worker_app: synapse.app.generic_worker
worker_name: generic_worker1

worker_listeners:
  - type: http
    port: 8083
    bind_addresses: ['127.0.0.1']   # only the reverse proxy should reach workers
    x_forwarded: true
    resources:
      - names: [client, federation]
```

Then route the matching endpoints to each worker in your reverse proxy, and add stream writers as needed. The [workers guide](https://element-hq.github.io/synapse/latest/workers.html) lists the endpoints each worker type can serve.

## Performance

### Caches

`caches.global_factor` defaults to 0.5. Raising it uses more memory; lowering it saves memory at the cost of more database load. With jemalloc (included in the Docker image), `cache_autotuning` caps cache memory. Example adapted from the [config manual](https://element-hq.github.io/synapse/latest/usage/configuration/config_documentation.html#caches):

```yaml title="homeserver.yaml"
caches:
  global_factor: 0.5
  per_cache_factors:
    get_users_who_share_room_with_user: 2.0
  cache_autotuning:
    max_cache_memory_usage: 1024M
    target_cache_memory_usage: 758M
    min_cache_ttl: 5m
```

`cache_autotuning` only works if all three of its values are set.

### Media retention

To stop the remote media cache growing without limit:

```yaml title="homeserver.yaml"
media_retention:
  remote_media_lifetime: 14d
```

## Monitoring

Metrics need both `enable_metrics` and a `metrics` listener. Bind the listener to localhost or a private network:

```yaml title="homeserver.yaml"
enable_metrics: true
listeners:
  - port: 9000
    type: metrics
    bind_addresses: ['127.0.0.1']
```

Synapse ships a Grafana dashboard in [`contrib/grafana`](https://github.com/element-hq/synapse/tree/develop/contrib/grafana). Federation metric labels changed in 1.136, so older dashboards may need edits. See the [metrics guide](https://element-hq.github.io/synapse/latest/metrics-howto.html).

## Backup

Back up three things:

1. **The database:** `pg_dump -Fc -U synapse synapse > synapse.dump`. With Docker Compose: `docker compose exec -T db pg_dump -Fc -U synapse synapse > synapse.dump` (`-T` stops a terminal from corrupting the binary dump).
2. **The media store** (`media_store_path`).
3. **The config and signing key:** `homeserver.yaml` and `example.com.signing.key`.

:::warning
Keep an offline copy of the signing key. It is your server's identity on the federation, and other servers cache it. Replacing it is possible but causes avoidable federation problems.
:::

## Troubleshooting

| Problem | Check |
|---------|-------|
| Synapse will not start after an upgrade | The [upgrade notes](https://element-hq.github.io/synapse/latest/upgrade.html) for every version you skipped; removed options cause startup errors |
| High memory | Lower `caches.global_factor`, use `cache_autotuning`, look for very large rooms |
| Federation fails | [federationtester.matrix.org](https://federationtester.matrix.org), the `.well-known` files, a certificate for the right hostname |
| Old clients or bridges show broken media | Authenticated media is on by default since 1.120 (`enable_authenticated_media`); update the client or bridge |
| Element X cannot sign in | Synapse version (native sliding sync since 1.114), and MAS if you want OIDC login |

Useful commands:

```bash
# Installed version (pip)
pip show matrix-synapse

# Validate config
python -m synapse.config -c homeserver.yaml

# Logs (Debian package)
journalctl -u matrix-synapse -f
```

## Resources

- [Synapse documentation](https://element-hq.github.io/synapse/latest/)
- [Configuration manual](https://element-hq.github.io/synapse/latest/usage/configuration/config_documentation.html)
- [Upgrade notes](https://element-hq.github.io/synapse/latest/upgrade.html)
- [Admin API](https://element-hq.github.io/synapse/latest/usage/administration/admin_api/index.html)
- [GitHub repository](https://github.com/element-hq/synapse)

---

*Next: [Dendrite](./dendrite) →*
