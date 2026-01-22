---
sidebar_position: 2
title: Synapse
description: Deploy and configure the reference Matrix homeserver
---

# Synapse

Synapse is the reference Matrix homeserver implementation, written in Python. It's the most feature-complete and widely deployed option.

## Quick Start with Docker

The fastest way to get Synapse running:

```bash
# Create data directory
mkdir -p ~/synapse-data

# Generate config
docker run -it --rm \
  -v ~/synapse-data:/data \
  -e SYNAPSE_SERVER_NAME=matrix.example.com \
  -e SYNAPSE_REPORT_STATS=no \
  matrixdotorg/synapse:latest generate

# Start Synapse
docker run -d --name synapse \
  -v ~/synapse-data:/data \
  -p 8008:8008 \
  matrixdotorg/synapse:latest
```

## Docker Compose Setup

For production, use Docker Compose:

```yaml title="docker-compose.yml"
version: '3'

services:
  synapse:
    image: matrixdotorg/synapse:latest
    container_name: synapse
    restart: unless-stopped
    volumes:
      - ./data:/data
    environment:
      - SYNAPSE_CONFIG_PATH=/data/homeserver.yaml
    ports:
      - "8008:8008"
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    container_name: synapse-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=synapse
      - POSTGRES_PASSWORD=secretpassword
      - POSTGRES_DB=synapse
      - POSTGRES_INITDB_ARGS=--encoding=UTF8 --locale=C
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
```

## Manual Installation

### Debian/Ubuntu

```bash
# Add Matrix repository
sudo apt install -y lsb-release wget apt-transport-https
sudo wget -O /usr/share/keyrings/matrix-org-archive-keyring.gpg https://packages.matrix.org/debian/matrix-org-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/matrix-org-archive-keyring.gpg] https://packages.matrix.org/debian/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/matrix-org.list

# Install Synapse
sudo apt update
sudo apt install matrix-synapse-py3
```

### Python (pip)

```bash
# Create virtual environment
python3 -m venv ~/synapse-venv
source ~/synapse-venv/bin/activate

# Install Synapse
pip install matrix-synapse

# Generate config
python -m synapse.app.homeserver \
  --server-name matrix.example.com \
  --config-path homeserver.yaml \
  --generate-config \
  --report-stats=no
```

## Essential Configuration

### homeserver.yaml

Key settings to configure:

```yaml title="homeserver.yaml"
# Server identity
server_name: "example.com"
public_baseurl: "https://matrix.example.com/"

# Database (PostgreSQL recommended)
database:
  name: psycopg2
  args:
    user: synapse
    password: secretpassword
    database: synapse
    host: localhost
    cp_min: 5
    cp_max: 10

# Listeners
listeners:
  - port: 8008
    tls: false
    type: http
    x_forwarded: true
    resources:
      - names: [client, federation]
        compress: false

# Registration
enable_registration: false
enable_registration_without_verification: false

# Media storage
media_store_path: /data/media_store
max_upload_size: 50M

# URL previews
url_preview_enabled: true
url_preview_ip_range_blacklist:
  - '127.0.0.0/8'
  - '10.0.0.0/8'
  - '172.16.0.0/12'
  - '192.168.0.0/16'
```

### PostgreSQL Setup

```sql
-- Create database and user
CREATE USER synapse WITH PASSWORD 'secretpassword';
CREATE DATABASE synapse
  ENCODING 'UTF8'
  LC_COLLATE='C'
  LC_CTYPE='C'
  template=template0
  OWNER synapse;
```

### Nginx Reverse Proxy

```nginx title="/etc/nginx/sites-available/matrix"
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name matrix.example.com;

    ssl_certificate /etc/letsencrypt/live/matrix.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/matrix.example.com/privkey.pem;

    location ~ ^(/_matrix|/_synapse/client) {
        proxy_pass http://localhost:8008;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        client_max_body_size 50M;
    }
}

# Federation
server {
    listen 8448 ssl http2 default_server;
    listen [::]:8448 ssl http2 default_server;
    server_name matrix.example.com;

    ssl_certificate /etc/letsencrypt/live/matrix.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/matrix.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8008;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }
}
```

## User Management

### Create Admin User

```bash
# Register new user (interactive)
register_new_matrix_user -c /data/homeserver.yaml http://localhost:8008

# Or non-interactive
register_new_matrix_user -c /data/homeserver.yaml \
  -u admin -p password -a http://localhost:8008
```

### Admin API

Synapse has a powerful Admin API:

```bash
# Get user info
curl -H "Authorization: Bearer $TOKEN" \
  "https://matrix.example.com/_synapse/admin/v2/users/@user:example.com"

# Deactivate user
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"erase": true}' \
  "https://matrix.example.com/_synapse/admin/v1/deactivate/@user:example.com"

# List rooms
curl -H "Authorization: Bearer $TOKEN" \
  "https://matrix.example.com/_synapse/admin/v1/rooms"
```

:::tip Power User Tip
Get an admin access token from Element: Settings → Help & About → Access Token (Advanced)
:::

## Performance Tuning

### Workers

For high-traffic servers, run Synapse with workers:

```yaml title="homeserver.yaml"
# Enable workers
worker_app: synapse.app.generic_worker
worker_replication_host: 127.0.0.1
worker_replication_http_port: 9093

# Example worker config
worker_listeners:
  - type: http
    port: 8085
    resources:
      - names: [client, federation]
```

Common workers:
- **Sync worker** - Handles /sync requests
- **Federation sender** - Outbound federation
- **Media repository** - Media handling
- **Event persister** - Database writes

### Caching

```yaml
# Increase caches for better performance
caches:
  global_factor: 1.0
  per_cache_factors:
    get_users_in_room: 2.0
    get_current_state_ids: 2.0
```

### Database Tuning

```yaml
# Connection pool settings
database:
  args:
    cp_min: 5
    cp_max: 10
```

PostgreSQL settings for Synapse:
```
shared_buffers = 256MB
effective_cache_size = 768MB
maintenance_work_mem = 64MB
work_mem = 16MB
```

## Monitoring

### Prometheus Metrics

Enable in config:
```yaml
enable_metrics: true
listeners:
  - port: 9000
    type: metrics
    bind_addresses: ['127.0.0.1']
```

### Grafana Dashboards

Use official dashboards:
- Synapse dashboard: [grafana.com/dashboards/10046](https://grafana.com/grafana/dashboards/10046)

### Health Check

```bash
curl http://localhost:8008/health
```

## Backup & Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump -U synapse synapse > synapse_backup.sql

# Restore
psql -U synapse synapse < synapse_backup.sql
```

### Media Backup

```bash
# Backup media store
tar -czf media_backup.tar.gz /data/media_store
```

### Signing Keys

**Critical!** Back up your signing key:
```bash
cp /data/example.com.signing.key /secure/backup/
```

:::warning
Losing your signing key means losing your server's identity. Federation will break!
:::

## Troubleshooting

### Common Issues

**High memory usage:**
- Enable worker mode
- Reduce cache sizes
- Upgrade RAM

**Slow sync:**
- Check database performance
- Enable caching
- Use PostgreSQL (not SQLite)

**Federation issues:**
- Verify DNS/well-known setup
- Check port 8448 is open
- Test with [federationtester.matrix.org](https://federationtester.matrix.org)

### Useful Commands

```bash
# Check Synapse version
python -m synapse.app.homeserver --version

# Verify config
python -m synapse.config homeserver -c homeserver.yaml

# View logs
journalctl -u matrix-synapse -f
```

## Resources

- [Official Documentation](https://element-hq.github.io/synapse/latest/)
- [GitHub Repository](https://github.com/element-hq/synapse)
- [Admin API Reference](https://element-hq.github.io/synapse/latest/admin_api/)

---

*Next: [Dendrite](./dendrite) →*
