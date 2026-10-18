---
sidebar_position: 2
title: Docker Deployment
description: Deploy Synapse with Docker Compose, Caddy and PostgreSQL
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, coturn 4.18.0, Element Web v1.12.32"
---

# Docker Deployment

This page builds a Synapse server with Docker Compose: Synapse, PostgreSQL, and Caddy as the reverse proxy with automatic TLS. It follows the upstream [Synapse Docker README](https://github.com/element-hq/synapse/blob/develop/docker/README.md) and [reverse proxy guide](https://element-hq.github.io/synapse/latest/reverse_proxy.html).

If you would rather not wire the pieces together yourself, [matrix-docker-ansible-deploy](./ansible) and [ESS Community](https://github.com/element-hq/ess-helm) do it for you.

## Prerequisites

- Docker Engine with the Compose plugin (`docker compose`)
- A domain, with `example.com` and `matrix.example.com` pointing at the server
- Ports 80 and 443 open (port 8448 is not needed with `.well-known` delegation)

## 1. Directory and secrets

```bash
mkdir -p matrix-server && cd matrix-server
mkdir synapse-data postgres-data
# Database password, kept out of the Compose file
echo "POSTGRES_PASSWORD=$(openssl rand -hex 32)" > db.env
chmod 600 db.env
```

## 2. Generate the Synapse config

Use your **server name** (`example.com`), not the subdomain. It is permanent; see [Choose your server name first](../servers/synapse#choose-your-server-name-first).

```bash
docker run -it --rm \
  -v "$(pwd)/synapse-data:/data" \
  -e SYNAPSE_SERVER_NAME=example.com \
  -e SYNAPSE_REPORT_STATS=no \
  matrixdotorg/synapse:v1.163.0 generate
```

## 3. Compose file

```yaml title="docker-compose.yml"
services:
  synapse:
    image: matrixdotorg/synapse:v1.163.0
    restart: unless-stopped
    volumes:
      - ./synapse-data:/data
    ports:
      # Optional: lets you call the admin API from the host. Never drop the 127.0.0.1 prefix.
      - "127.0.0.1:8008:8008"
    depends_on:
      - postgres
    networks:
      - matrix

  postgres:
    image: postgres:17-alpine
    restart: unless-stopped
    env_file: ./db.env
    environment:
      - POSTGRES_USER=synapse
      - POSTGRES_DB=synapse
      - POSTGRES_INITDB_ARGS=--encoding=UTF8 --locale=C
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    networks:
      - matrix

  caddy:
    image: caddy:2.11.7-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./caddy-data:/data
      - ./caddy-config:/config
    networks:
      - matrix

networks:
  matrix:
```

Caddy reaches Synapse over the `matrix` network, so Synapse needs no public port.

:::warning
Docker's port publishing bypasses host firewalls such as ufw. A mapping like `"8008:8008"` would expose plain-HTTP Synapse, including the admin API, to the internet.
:::

## 4. Caddyfile

Proxy only `/_matrix/*` and `/_synapse/client/*`. Do not proxy `/_synapse/*` or `/_synapse/admin/*`.

```caddyfile title="Caddyfile"
matrix.example.com {
    reverse_proxy /_matrix/* synapse:8008
    reverse_proxy /_synapse/client/* synapse:8008
}

example.com {
    header /.well-known/matrix/* Content-Type application/json
    header /.well-known/matrix/* Access-Control-Allow-Origin *
    respond /.well-known/matrix/server `{"m.server": "matrix.example.com:443"}`
    respond /.well-known/matrix/client `{"m.homeserver": {"base_url": "https://matrix.example.com"}}`
}
```

The `.well-known/matrix/server` file sends federation traffic to port 443, so you do not need an 8448 site block.

## 5. Configure Synapse

Edit `synapse-data/homeserver.yaml`. Replace the SQLite `database` section and check the listener:

```yaml title="homeserver.yaml"
server_name: "example.com"
public_baseurl: "https://matrix.example.com/"

database:
  name: psycopg2
  args:
    user: synapse
    password: "PASTE_POSTGRES_PASSWORD_FROM_db.env"
    database: synapse
    host: postgres
    cp_min: 5
    cp_max: 10

listeners:
  - port: 8008
    tls: false
    type: http
    x_forwarded: true
    resources:
      - names: [client, federation]
        compress: false

enable_registration: false
```

For URL previews, registration tokens, MAS and other options, see [Synapse configuration](../servers/synapse#essential-configuration).

## 6. Start and create an admin

```bash
docker compose up -d
docker compose logs -f synapse     # wait for "Synapse now listening"

# Prompts for the password (keeps it out of shell history)
docker compose exec synapse register_new_matrix_user \
  -c /data/homeserver.yaml -a http://localhost:8008
```

Check federation with the [Matrix Federation Tester](https://federationtester.matrix.org/).

## Adding Element Web

```yaml title="docker-compose.yml (add under services)"
  element:
    image: vectorim/element-web:v1.12.32
    restart: unless-stopped
    volumes:
      - ./element-config.json:/app/config.json:ro
    networks:
      - matrix
```

```json title="element-config.json"
{
  "default_server_config": {
    "m.homeserver": {
      "base_url": "https://matrix.example.com",
      "server_name": "example.com"
    }
  }
}
```

The image is also published as `ghcr.io/element-hq/element-web`. See the [Element Web config docs](https://github.com/element-hq/element-web/blob/develop/docs/config.md) for other options, and add a Caddy site:

```caddyfile
element.example.com {
    reverse_proxy element:80
}
```

## Adding bridges

mautrix bridges run as separate containers, and each must be registered with Synapse as an application service. Follow the [mautrix Docker setup guide](https://docs.mau.fi/bridges/general/docker-setup.html). In outline:

1. Run the bridge image once with `/data` mounted; it writes a `config.yaml`.
2. Edit the config: homeserver address `http://synapse:8008`, your domain, a database, and permissions. Set `appservice.address: http://mautrix-telegram:29317` and `appservice.hostname: 0.0.0.0`. The generated default of `127.0.0.1` listens only inside the bridge container, so Synapse can't reach it. Don't publish the bridge port on the host.
3. Run it again; it writes `registration.yaml`.
4. Copy the registration into Synapse's data directory and list it in `homeserver.yaml`, then restart Synapse.
5. Start the bridge on the `matrix` network.

```yaml title="homeserver.yaml"
app_service_config_files:
  - /data/telegram-registration.yaml
```

```yaml title="docker-compose.yml (add under services)"
  mautrix-telegram:
    image: dock.mau.dev/mautrix/telegram:v0.2610.0   # release of 2026-10-16
    restart: unless-stopped
    volumes:
      - ./mautrix-telegram:/data
    networks:
      - matrix
```

The mautrix-telegram image is now the Go (bridgev2) bridge; see its [docs](https://docs.mau.fi/bridges/go/telegram/index.html). On `dock.mau.dev`, `:latest` follows the latest commit, not the latest release, so pin a release tag.

:::warning
A registration file contains the `as_token` and `hs_token`, which let the bridge act as any user in its namespace. Keep these files private.
:::

## Calls

### Element Call (MatrixRTC)

Element Call needs a LiveKit SFU, the MatrixRTC Authorization Service (`lk-jwt-service`), a `matrix_rtc` entry in `homeserver.yaml`, and some experimental Synapse flags. Follow the [Element Call self-hosting guide](https://github.com/element-hq/element-call/blob/main/docs/self_hosting.md) and [Synapse: Calls](../servers/synapse#calls-element-call-and-matrixrtc). It does not use coturn: LiveKit has its own TURN.

### Legacy calls: coturn

coturn is only needed for legacy 1:1 WebRTC calls. This config follows Synapse's [coturn guide](https://element-hq.github.io/synapse/latest/setup/turn/coturn.html), including its recommended `denied-peer-ip` list. Without that list, a TURN server can be used to reach hosts on your internal network.

```yaml title="docker-compose.yml (add under services)"
  coturn:
    image: coturn/coturn:4.18.0
    restart: unless-stopped
    network_mode: host
    volumes:
      - ./turnserver.conf:/etc/coturn/turnserver.conf:ro
```

```ini title="turnserver.conf"
use-auth-secret
static-auth-secret=LONG_RANDOM_SECRET
realm=turn.example.com
external-ip=YOUR_PUBLIC_IP

# VoIP is UDP; do not relay to arbitrary TCP endpoints
no-tcp-relay

# Never relay to private, loopback, link-local or reserved ranges
no-multicast-peers
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=192.168.0.0-192.168.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
denied-peer-ip=0.0.0.0-0.255.255.255
denied-peer-ip=100.64.0.0-100.127.255.255
denied-peer-ip=127.0.0.0-127.255.255.255
denied-peer-ip=169.254.0.0-169.254.255.255
denied-peer-ip=192.0.0.0-192.0.0.255
denied-peer-ip=192.0.2.0-192.0.2.255
denied-peer-ip=192.88.99.0-192.88.99.255
denied-peer-ip=198.18.0.0-198.19.255.255
denied-peer-ip=198.51.100.0-198.51.100.255
denied-peer-ip=203.0.113.0-203.0.113.255
denied-peer-ip=240.0.0.0-255.255.255.255
denied-peer-ip=::1
denied-peer-ip=64:ff9b::-64:ff9b::ffff:ffff
denied-peer-ip=::ffff:0.0.0.0-::ffff:255.255.255.255
denied-peer-ip=100::-100::ffff:ffff:ffff:ffff
denied-peer-ip=2001::-2001:1ff:ffff:ffff:ffff:ffff:ffff:ffff
denied-peer-ip=2002::-2002:ffff:ffff:ffff:ffff:ffff:ffff:ffff
denied-peer-ip=fc00::-fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
denied-peer-ip=fe80::-febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff

# Limit relayed streams to reduce DoS risk
user-quota=12
total-quota=1200
```

If you add TLS (`tls-listening-port=5349`), also set `cert=` and `pkey=` and use `turns:` URIs. Open 3478 and 5349 (TCP and UDP) and the relay range 49152–65535 (UDP).

Then tell Synapse about it. `turn_shared_secret_path` points at a file in `synapse-data/` that holds the same value as coturn's `static-auth-secret`, which keeps the secret out of `homeserver.yaml`:

```yaml title="homeserver.yaml"
turn_uris:
  - "turn:turn.example.com:3478?transport=udp"
  - "turn:turn.example.com:3478?transport=tcp"
turn_shared_secret_path: /data/turn_shared_secret
turn_user_lifetime: 1h
```

:::warning
`static-auth-secret` lets anyone who holds it mint TURN credentials. Generate a long random value (for example `openssl rand -hex 32`) and keep it out of version control.
:::

## Backup script

```bash title="backup.sh"
#!/bin/bash
set -euo pipefail
DATE=$(date +%Y%m%d)
BACKUP_DIR=/backups
cd /path/to/matrix-server

# Database (consistent dump while running)
docker compose exec -T postgres pg_dump -Fc -U synapse synapse > "$BACKUP_DIR/db_$DATE.dump"

# Media, config and signing key
tar -czf "$BACKUP_DIR/synapse-data_$DATE.tar.gz" synapse-data

# Keep 7 days
find "$BACKUP_DIR" -mtime +7 -delete
```

Test restoring from a backup at least once. Keep an extra offline copy of `synapse-data/example.com.signing.key`.

## Monitoring

Synapse exposes metrics only with both `enable_metrics` and a `metrics` listener. Inside Docker, the listener can bind to all interfaces as long as you do not publish its port:

```yaml title="homeserver.yaml"
enable_metrics: true
listeners:
  # keep the existing http listener on 8008
  - port: 9000
    type: metrics
    bind_addresses: ['0.0.0.0']   # container-internal; do not publish 9000
```

```yaml title="prometheus.yml"
scrape_configs:
  - job_name: synapse
    metrics_path: /_synapse/metrics
    static_configs:
      - targets: ['synapse:9000']
```

```yaml title="docker-compose.yml (add under services)"
  prometheus:
    image: prom/prometheus:v3.15.0
    restart: unless-stopped
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    networks:
      - matrix

  grafana:
    image: grafana/grafana:13.2.4
    restart: unless-stopped
    env_file: ./grafana.env     # GF_SECURITY_ADMIN_PASSWORD=...; otherwise the login is admin/admin
    ports:
      - "127.0.0.1:3000:3000"
    networks:
      - matrix
```

Import Synapse's dashboard from [`contrib/grafana`](https://github.com/element-hq/synapse/tree/develop/contrib/grafana). See the [metrics guide](https://element-hq.github.io/synapse/latest/metrics-howto.html).

## Updating

Pin image tags and upgrade deliberately:

1. Read the [Synapse upgrade notes](https://element-hq.github.io/synapse/latest/upgrade.html) for every version between yours and the target.
2. Back up.
3. Change the tag in `docker-compose.yml`, then:

```bash
docker compose pull
docker compose up -d
docker compose logs -f synapse
```

Do not use unattended image auto-updaters for the homeserver: a release can need config changes before it will start.

## Troubleshooting

```bash
# Logs
docker compose logs -f synapse
docker compose logs -f caddy

# Database shell
docker compose exec postgres psql -U synapse synapse

# Federation check
curl "https://federationtester.matrix.org/api/report?server_name=example.com"
```

---

*Next: [Ansible Deployment](./ansible) →*
