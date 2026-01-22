---
sidebar_position: 5
title: Self-Hosting Tips
description: Optimization and management tips for homeserver admins
---

# Self-Hosting Tips

Expert tips for running your own Matrix homeserver.

## Homeserver Alternatives

### Conduit (Rust)

**[Conduit](https://conduit.rs)** is a lightweight Matrix homeserver written in Rust:

**Pros:**
- Single binary, no dependencies
- Low memory usage (~100MB for small deployments)
- Fast startup
- Easy configuration

**Cons:**
- Missing some advanced Synapse features
- Smaller community
- Less tested at scale

**Installation:**
```bash
# Docker
docker run -d -p 8448:6167 \
  -v db:/var/lib/matrix-conduit \
  -e CONDUIT_SERVER_NAME=your.server.name \
  -e CONDUIT_DATABASE_BACKEND=rocksdb \
  matrixconduit/matrix-conduit:latest
```

**Configuration:**
```toml title="conduit.toml"
[global]
server_name = "your.server.name"
database_backend = "rocksdb"
port = 6167
max_request_size = 20_000_000
allow_registration = false
```

### conduwuit (Conduit Fork)

**[conduwuit](https://github.com/girlbossceo/conduwuit)** is an actively maintained Conduit fork with more features:

- Experimental room v11 support
- Better federation compatibility
- More active development
- Bug fixes not in upstream

### When to Use What

| Use Case | Recommended |
|----------|-------------|
| Large deployment (500+ users) | **Synapse** with workers |
| Small personal server | **Conduit/conduwuit** |
| Maximum features | **Synapse** |
| Minimal resources | **Conduit** |
| Production critical | **Synapse** |
| Experimentation | **Conduit/Dendrite** |

---

## Performance Optimization

### Synapse Tuning

#### Worker Mode

For high-traffic servers, split into workers:

```yaml title="homeserver.yaml"
worker_app: synapse.app.generic_worker
worker_replication_host: 127.0.0.1
worker_replication_http_port: 9093
```

Workers to consider:
- **Sync workers** - Handle /sync requests
- **Federation sender** - Outbound federation
- **Media workers** - Media processing
- **Event persisters** - Database writes

#### Cache Settings

```yaml
caches:
  global_factor: 1.0
  per_cache_factors:
    get_users_in_room: 2.0
    get_current_state_ids: 2.0
    stateGroupCache: 2.0
```

### PostgreSQL Tuning

```ini title="postgresql.conf"
shared_buffers = 1GB              # 25% of RAM
effective_cache_size = 3GB        # 75% of RAM
maintenance_work_mem = 256MB
work_mem = 64MB
random_page_cost = 1.1            # For SSDs
effective_io_concurrency = 200    # For SSDs
```

### Database Maintenance

Regular maintenance tasks:

```bash
# Vacuum and analyze
psql -U synapse -d synapse -c "VACUUM ANALYZE;"

# Reindex if needed
psql -U synapse -d synapse -c "REINDEX DATABASE synapse;"
```

## Monitoring

### Prometheus + Grafana

```yaml title="docker-compose.yml"
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

### Key Metrics

| Metric | Alert Threshold |
|--------|-----------------|
| Federation lag | > 60 seconds |
| Request latency | > 500ms p95 |
| Database connections | > 80% |
| Memory usage | > 85% |
| Disk space | < 10 GB |

### Synapse Metrics

Enable in config:
```yaml
enable_metrics: true
listeners:
  - port: 9000
    type: metrics
```

## Media Management

### matrix-media-repo

**[matrix-media-repo](https://github.com/t2bot/matrix-media-repo)** is an alternative media repository:

**Features:**
- S3/MinIO storage support
- Media deduplication
- Thumbnail generation
- Federation media caching
- Multiple homeserver support

**Installation:**
```yaml title="docker-compose.yml"
services:
  media-repo:
    image: t2bot/matrix-media-repo:latest
    ports:
      - "8000:8000"
    volumes:
      - ./media-repo.yaml:/etc/media-repo.yaml
      - ./media:/media
```

**Configuration:**
```yaml title="media-repo.yaml"
repo:
  bindAddress: "0.0.0.0"
  port: 8000

database:
  postgres: "postgres://user:pass@localhost/mediarepo"

homeservers:
  - name: example.com
    csApi: "https://matrix.example.com"
    backoffAt: 10

datastores:
  - type: s3
    opts:
      tempPath: "/tmp/mediarepo_s3"
      endpoint: s3.amazonaws.com
      accessKeyId: "YOUR_ACCESS_KEY"
      secretAccessKey: "YOUR_SECRET_KEY"
      bucketName: "matrix-media"
```

### S3 Storage (Native Synapse)

Store media directly in S3 without external repo:

```yaml title="homeserver.yaml"
media_storage_providers:
  - module: s3_storage_provider.S3StorageProviderBackend
    store_local: true
    store_remote: true
    store_synchronous: true
    config:
      bucket: matrix-media
      region_name: us-east-1
      access_key_id: YOUR_KEY
      secret_access_key: YOUR_SECRET
```

**Install provider:**
```bash
pip install synapse-s3-storage-provider
```

### Media Cleanup

Remove old remote media:

```bash
# Via Admin API
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "https://matrix.server/_synapse/admin/v1/purge_media_cache?before_ts=1577836800000"
```

---

## Identity Server

### Sydent

**[Sydent](https://github.com/matrix-org/sydent)** is the reference Matrix identity server:

**Purpose:**
- Email/phone to Matrix ID lookup
- Third-party identity verification
- Required for some discovery features

**Installation:**
```yaml title="docker-compose.yml"
services:
  sydent:
    image: matrixdotorg/sydent
    ports:
      - "8090:8090"
    volumes:
      - ./sydent.yaml:/etc/sydent/sydent.yaml
      - ./sydent-data:/var/lib/sydent
```

**Configuration:**
```yaml title="sydent.yaml"
general:
  server.name: id.example.com
  log.path: /var/log/sydent

db:
  file: /var/lib/sydent/sydent.db

http:
  port: 8090

email:
  smtphost: smtp.example.com
  smtpport: 587
  smtpusername: matrix@example.com
  smtppassword: secret
  from: "Matrix ID Server <noreply@example.com>"
```

**Note:** Most small deployments don't need their own identity server. Use `matrix.org` or `vector.im` identity servers instead.

---

## Backup Strategy

### Database Backup

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
pg_dump -U synapse synapse | gzip > /backups/synapse_$DATE.sql.gz

# Keep last 7 days
find /backups -name "synapse_*.sql.gz" -mtime +7 -delete
```

### Media Backup

```bash
# Rsync media to backup location
rsync -avz /var/lib/synapse/media_store/ /backups/media/
```

### Signing Keys

**Critical!** Backup your signing key:
```bash
cp /data/*.signing.key /secure-backup/
```

Losing this means losing your server identity.

## Federation Optimization

### Federation Sender Tuning

```yaml
federation_sender_instances:
  - federation_sender1
  - federation_sender2
```

### Problematic Servers

Block abusive servers:

```yaml
federation_domain_whitelist: null  # Allow all except...

# Or use room ACLs for per-room blocking
```

### Federation Testing

```bash
# Test federation
curl "https://federationtester.matrix.org/api/report?server_name=example.com"
```

## Security Hardening

### Rate Limiting

```yaml
rc_messages:
  per_second: 0.2
  burst_count: 10

rc_registration:
  per_second: 0.1
  burst_count: 3

rc_login:
  per_second: 0.03
  burst_count: 5
```

### Registration Control

```yaml
enable_registration: false
registration_shared_secret: "long-random-secret"

# Or with email verification
enable_registration: true
registrations_require_3pid:
  - email
```

### Media Restrictions

```yaml
max_upload_size: 50M
url_preview_ip_range_blacklist:
  - '127.0.0.0/8'
  - '10.0.0.0/8'
  - '172.16.0.0/12'
  - '192.168.0.0/16'
```

## Automation

### matrix-docker-ansible-deploy

The best way to deploy Matrix:

```bash
git clone https://github.com/spantaleev/matrix-docker-ansible-deploy.git
cd matrix-docker-ansible-deploy
```

Manages:
- Synapse/Dendrite
- Element Web
- Bridges (all major ones)
- Bots (Mjolnir, etc.)
- SSL certificates
- Backups

### Automatic Updates

```yaml
# watchtower for Docker
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --cleanup --interval 86400
```

## Disaster Recovery

### Recovery Checklist

1. **Restore database** from backup
2. **Restore media** from backup
3. **Restore signing keys** (critical!)
4. **Verify configuration**
5. **Start services**
6. **Test federation**

### Testing Recovery

Regularly test your recovery process:
1. Set up test environment
2. Restore from backups
3. Verify functionality
4. Document any issues

## Resource Estimation

### Users vs Resources

| Users | RAM | CPU | Storage |
|-------|-----|-----|---------|
| 1-50 | 2GB | 1 | 20GB |
| 50-500 | 4GB | 2 | 50GB |
| 500-5000 | 8GB | 4 | 200GB |
| 5000+ | 16GB+ | 8+ | 500GB+ |

### Storage Growth

Estimate ~100MB per active user per month (varies by usage).

## Useful Commands

```bash
# Check Synapse version
curl http://localhost:8008/_synapse/admin/v1/server_version

# List users
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8008/_synapse/admin/v2/users?limit=100"

# Room stats
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8008/_synapse/admin/v1/rooms"

# Purge old events (careful!)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8008/_synapse/admin/v1/purge_history/!room:example.com" \
  -d '{"delete_local_events": true, "purge_up_to_ts": 1577836800000}'
```

## Community Resources

- [#synapse:matrix.org](https://matrix.to/#/#synapse:matrix.org) - Synapse admins
- [#homeservers:matrix.org](https://matrix.to/#/#homeservers:matrix.org) - General admin chat
- [matrix-docker-ansible-deploy](https://github.com/spantaleev/matrix-docker-ansible-deploy) - Ansible playbook

---

*You've reached the end of Hidden Gems. Happy hacking!*
