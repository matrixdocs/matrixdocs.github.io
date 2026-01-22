---
sidebar_position: 3
title: Dendrite
description: Deploy the efficient Go-based Matrix homeserver
---

# Dendrite

Dendrite is a second-generation Matrix homeserver written in Go. It's more efficient than Synapse and designed for better horizontal scaling.

## Why Dendrite?

- **Efficient**: Lower resource usage than Synapse
- **Scalable**: Microservice architecture
- **Modern**: Written in Go with clean codebase
- **Fast**: Quick startup and sync times

## Quick Start with Docker

```bash
# Create directories
mkdir -p dendrite-config dendrite-data

# Generate keys
docker run --rm -v $(pwd)/dendrite-config:/etc/dendrite \
  matrixdotorg/dendrite-monolith:latest \
  generate-keys --private-key /etc/dendrite/matrix_key.pem

# Download sample config
curl -o dendrite-config/dendrite.yaml \
  https://raw.githubusercontent.com/matrix-org/dendrite/main/dendrite-sample.yaml

# Edit config (set server_name, database, etc.)
nano dendrite-config/dendrite.yaml

# Run Dendrite
docker run -d --name dendrite \
  -v $(pwd)/dendrite-config:/etc/dendrite \
  -v $(pwd)/dendrite-data:/var/dendrite \
  -p 8008:8008 \
  -p 8448:8448 \
  matrixdotorg/dendrite-monolith:latest
```

## Docker Compose Setup

```yaml title="docker-compose.yml"
version: '3.8'

services:
  dendrite:
    image: matrixdotorg/dendrite-monolith:latest
    container_name: dendrite
    restart: unless-stopped
    ports:
      - "8008:8008"
      - "8448:8448"
    volumes:
      - ./config:/etc/dendrite
      - ./data:/var/dendrite
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    container_name: dendrite-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: dendrite
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: dendrite
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
```

## Binary Installation

### Download Binary

```bash
# Download latest release
wget https://github.com/matrix-org/dendrite/releases/latest/download/dendrite-linux-amd64

# Make executable
chmod +x dendrite-linux-amd64
mv dendrite-linux-amd64 /usr/local/bin/dendrite

# Generate keys
/usr/local/bin/dendrite generate-keys --private-key /etc/dendrite/matrix_key.pem
```

### Build from Source

```bash
# Install Go (1.20+)
git clone https://github.com/matrix-org/dendrite.git
cd dendrite
go build -o bin/ ./cmd/...
```

## Configuration

### dendrite.yaml

```yaml title="dendrite.yaml"
# Server configuration
global:
  server_name: example.com
  private_key: /etc/dendrite/matrix_key.pem

  # Database configuration
  database:
    connection_string: postgresql://dendrite:password@localhost/dendrite?sslmode=disable
    max_open_conns: 90
    max_idle_conns: 5
    conn_max_lifetime: -1

  # JetStream for internal messaging
  jetstream:
    storage_path: /var/dendrite/jetstream
    addresses: []

  # Federation settings
  key_validity_period: 168h0m0s
  disable_federation: false

  # Caching
  cache:
    max_size_estimated: 1gb
    max_age: 1h

# Client API configuration
client_api:
  registration_disabled: true
  guests_disabled: true
  registration_shared_secret: "your-secret-here"

# Media API configuration
media_api:
  base_path: /var/dendrite/media
  max_file_size_bytes: 52428800  # 50MB
  dynamic_thumbnails: true

# Sync API configuration
sync_api:
  real_ip_header: X-Forwarded-For
  search:
    enabled: true
    index_path: /var/dendrite/searchindex

# Federation API
federation_api:
  send_max_retries: 16
  disable_tls_validation: false
  prefer_direct_fetch: false

# User API configuration
user_api:
  bcrypt_cost: 10

# MSC settings (experimental features)
mscs:
  mscs: []
```

### PostgreSQL Setup

```sql
-- Single database for monolith
CREATE USER dendrite WITH PASSWORD 'secretpassword';
CREATE DATABASE dendrite OWNER dendrite;
```

### Nginx Configuration

```nginx title="/etc/nginx/sites-available/matrix"
server {
    listen 443 ssl http2;
    server_name matrix.example.com;

    ssl_certificate /etc/letsencrypt/live/matrix.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/matrix.example.com/privkey.pem;

    location /_matrix {
        proxy_pass http://127.0.0.1:8008;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        client_max_body_size 50M;
    }
}

server {
    listen 8448 ssl http2;
    server_name matrix.example.com;

    ssl_certificate /etc/letsencrypt/live/matrix.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/matrix.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8008;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }
}
```

## User Management

### Create Users

```bash
# Create admin user
/usr/local/bin/dendrite create-account \
  --config /etc/dendrite/dendrite.yaml \
  --url http://localhost:8008 \
  --username admin \
  --admin

# Create regular user
/usr/local/bin/dendrite create-account \
  --config /etc/dendrite/dendrite.yaml \
  --url http://localhost:8008 \
  --username user
```

### Using Shared Secret

Enable in config:
```yaml
client_api:
  registration_shared_secret: "your-long-secret"
```

Then register via API:
```bash
curl -X POST "http://localhost:8008/_synapse/admin/v1/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nonce": "'"$(curl -s http://localhost:8008/_synapse/admin/v1/register | jq -r .nonce)"'",
    "username": "newuser",
    "password": "password123",
    "admin": false
  }'
```

## Polylith Mode

For larger deployments, run Dendrite as separate services:

```
┌─────────────────────────────────────────────────┐
│                   Load Balancer                  │
└─────────────┬───────────────────┬───────────────┘
              │                   │
      ┌───────▼────────┐ ┌───────▼────────┐
      │  Client API    │ │ Federation API │
      └───────┬────────┘ └───────┬────────┘
              │                   │
      ┌───────▼───────────────────▼───────┐
      │            JetStream NATS          │
      └───────────────────────────────────┘
              │
      ┌───────▼───────┐
      │  PostgreSQL   │
      └───────────────┘
```

Services available:
- `dendrite-client-api`
- `dendrite-federation-api`
- `dendrite-media-api`
- `dendrite-sync-api`
- `dendrite-room-api`
- `dendrite-user-api`

## Performance Tuning

### Memory Settings

```yaml
global:
  cache:
    max_size_estimated: 1gb  # Adjust based on RAM
    max_age: 1h
```

### Database Connections

```yaml
global:
  database:
    max_open_conns: 90
    max_idle_conns: 5
    conn_max_lifetime: -1
```

### JetStream Settings

```yaml
global:
  jetstream:
    storage_path: /var/dendrite/jetstream
    in_memory: false  # Set true for better performance, false for persistence
```

## Monitoring

### Prometheus Metrics

```yaml
global:
  metrics:
    enabled: true
    basic_auth:
      username: metrics
      password: password
```

Access at: `http://localhost:8008/metrics`

### Health Endpoint

```bash
curl http://localhost:8008/health
```

## Migration from Synapse

Currently, there's no direct migration tool. Options:

1. **Fresh start**: Create new accounts, manually invite to rooms
2. **Export/Import**: Use Matrix's room export features
3. **Run both**: Gradual migration with both servers

:::info
The Dendrite team is working on migration tools. Check [GitHub issues](https://github.com/matrix-org/dendrite/issues) for updates.
:::

## Troubleshooting

### Common Issues

**Federation not working:**
```bash
# Check federation tester
curl "https://federationtester.matrix.org/api/report?server_name=example.com"
```

**Database errors:**
- Ensure PostgreSQL is running
- Check connection string format
- Verify user permissions

**High memory usage:**
- Reduce cache size
- Check for memory leaks (report to GitHub)

### Logs

```bash
# Docker logs
docker logs -f dendrite

# Systemd logs
journalctl -u dendrite -f

# Increase verbosity
# In dendrite.yaml:
logging:
  - type: std
    level: debug
```

## Comparison with Synapse

| Aspect | Dendrite | Synapse |
|--------|----------|---------|
| Language | Go | Python |
| RAM usage | Lower | Higher |
| CPU usage | Lower | Higher |
| Features | Most | All |
| Maturity | Stable | Mature |
| Scaling | Better | Workers |
| Docs | Good | Extensive |

## Resources

- [Official Documentation](https://matrix-org.github.io/dendrite/)
- [GitHub Repository](https://github.com/matrix-org/dendrite)
- [Configuration Reference](https://github.com/matrix-org/dendrite/blob/main/dendrite-sample.yaml)

---

*Next: [Conduit](./conduit) →*
