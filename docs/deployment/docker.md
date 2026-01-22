---
sidebar_position: 2
title: Docker Deployment
description: Deploy Matrix with Docker and Docker Compose
---

# Docker Deployment

Deploy a complete Matrix setup using Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2+
- Domain name with DNS configured
- Ports 80, 443, 8448 available

## Quick Start

### 1. Create Directory Structure

```bash
mkdir -p matrix-server/{synapse-data,postgres-data}
cd matrix-server
```

### 2. Create Docker Compose File

```yaml title="docker-compose.yml"
version: '3.8'

services:
  synapse:
    image: matrixdotorg/synapse:latest
    container_name: synapse
    restart: unless-stopped
    environment:
      - SYNAPSE_CONFIG_PATH=/data/homeserver.yaml
    volumes:
      - ./synapse-data:/data
    depends_on:
      - postgres
    ports:
      - "8008:8008"
    networks:
      - matrix

  postgres:
    image: postgres:15-alpine
    container_name: synapse-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=synapse
      - POSTGRES_PASSWORD=CHANGE_ME_TO_SECURE_PASSWORD
      - POSTGRES_DB=synapse
      - POSTGRES_INITDB_ARGS=--encoding=UTF8 --locale=C
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    networks:
      - matrix

  caddy:
    image: caddy:2-alpine
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "8448:8448"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./caddy-data:/data
      - ./caddy-config:/config
    networks:
      - matrix

networks:
  matrix:
    driver: bridge
```

### 3. Create Caddyfile

```caddyfile title="Caddyfile"
matrix.example.com {
    reverse_proxy /_matrix/* synapse:8008
    reverse_proxy /_synapse/* synapse:8008
}

matrix.example.com:8448 {
    reverse_proxy synapse:8008
}

example.com {
    handle /.well-known/matrix/server {
        respond `{"m.server": "matrix.example.com:443"}`
    }
    handle /.well-known/matrix/client {
        header Access-Control-Allow-Origin *
        respond `{"m.homeserver": {"base_url": "https://matrix.example.com"}}`
    }
}
```

### 4. Generate Synapse Config

```bash
docker run -it --rm \
  -v $(pwd)/synapse-data:/data \
  -e SYNAPSE_SERVER_NAME=example.com \
  -e SYNAPSE_REPORT_STATS=no \
  matrixdotorg/synapse:latest generate
```

### 5. Configure Synapse

Edit `synapse-data/homeserver.yaml`:

```yaml title="homeserver.yaml"
server_name: "example.com"
public_baseurl: "https://matrix.example.com/"

database:
  name: psycopg2
  args:
    user: synapse
    password: CHANGE_ME_TO_SECURE_PASSWORD
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

### 6. Start Services

```bash
docker compose up -d
```

### 7. Create Admin User

```bash
docker exec -it synapse register_new_matrix_user \
  -c /data/homeserver.yaml \
  -a -u admin http://localhost:8008
```

## Adding Element Web

```yaml title="docker-compose.yml (add to services)"
  element:
    image: vectorim/element-web:latest
    container_name: element
    restart: unless-stopped
    volumes:
      - ./element-config.json:/app/config.json
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
  },
  "brand": "Element",
  "default_theme": "dark"
}
```

Add to Caddyfile:
```caddyfile
element.example.com {
    reverse_proxy element:80
}
```

## Adding Bridges

### Discord Bridge

```yaml title="docker-compose.yml (add to services)"
  mautrix-discord:
    image: dock.mau.dev/mautrix/discord:latest
    container_name: mautrix-discord
    restart: unless-stopped
    volumes:
      - ./discord-data:/data
    networks:
      - matrix
```

### Telegram Bridge

```yaml title="docker-compose.yml (add to services)"
  mautrix-telegram:
    image: dock.mau.dev/mautrix/telegram:latest
    container_name: mautrix-telegram
    restart: unless-stopped
    volumes:
      - ./telegram-data:/data
    networks:
      - matrix
```

## Adding Coturn (VoIP)

```yaml title="docker-compose.yml (add to services)"
  coturn:
    image: coturn/coturn:latest
    container_name: coturn
    restart: unless-stopped
    network_mode: host
    volumes:
      - ./turnserver.conf:/etc/coturn/turnserver.conf
```

```ini title="turnserver.conf"
listening-port=3478
tls-listening-port=5349
external-ip=YOUR_SERVER_IP
realm=turn.example.com
server-name=turn.example.com
lt-cred-mech
use-auth-secret
static-auth-secret=YOUR_TURN_SECRET
```

Add to Synapse config:
```yaml
turn_uris:
  - "turn:turn.example.com:3478?transport=udp"
  - "turn:turn.example.com:3478?transport=tcp"
turn_shared_secret: "YOUR_TURN_SECRET"
turn_user_lifetime: 86400000
```

## Backup Script

```bash title="backup.sh"
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR=/backups

# Stop Synapse for consistent backup
docker compose stop synapse

# Backup database
docker exec synapse-db pg_dump -U synapse synapse | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup media
tar -czf $BACKUP_DIR/media_$DATE.tar.gz synapse-data/media_store

# Backup config
cp synapse-data/homeserver.yaml $BACKUP_DIR/homeserver_$DATE.yaml
cp synapse-data/*.signing.key $BACKUP_DIR/

# Start Synapse
docker compose start synapse

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -mtime +7 -delete
```

## Monitoring

Add Prometheus monitoring:

```yaml title="docker-compose.yml (add to services)"
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - matrix

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    networks:
      - matrix
```

Enable metrics in Synapse:
```yaml
enable_metrics: true
```

## Updating

```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d
```

## Troubleshooting

### Check Logs

```bash
docker compose logs -f synapse
docker compose logs -f postgres
docker compose logs -f caddy
```

### Database Issues

```bash
docker exec -it synapse-db psql -U synapse synapse
```

### Federation Test

```bash
curl https://federationtester.matrix.org/api/report?server_name=example.com
```

---

*Next: [Ansible Deployment](/deployment/ansible) →*
