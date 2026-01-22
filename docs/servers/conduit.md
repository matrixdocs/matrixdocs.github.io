---
sidebar_position: 4
title: Conduit
description: The lightweight Rust homeserver for Matrix
---

# Conduit

Conduit is a lightweight Matrix homeserver written in Rust. It's designed to be easy to set up and run with minimal resources.

## Why Conduit?

- **Tiny footprint**: Runs on Raspberry Pi, VPS, or containers
- **Simple setup**: Single binary, SQLite built-in
- **Fast**: Rust performance
- **Easy maintenance**: Minimal configuration

:::info
Conduit is in beta. For production use, also consider [conduwuit](https://github.com/girlbossceo/conduwuit), a well-maintained fork with additional features.
:::

## Quick Start

### Docker (Recommended)

```bash
# Create directory
mkdir -p conduit-data

# Create config
cat > conduit-data/conduit.toml << 'EOF'
[global]
server_name = "example.com"
database_path = "/var/lib/conduit"
database_backend = "rocksdb"
port = 6167
max_request_size = 52_428_800
allow_registration = false
allow_federation = true
trusted_servers = ["matrix.org"]

[global.well_known]
client = "https://matrix.example.com"
server = "matrix.example.com:443"
EOF

# Run Conduit
docker run -d --name conduit \
  -v $(pwd)/conduit-data:/var/lib/conduit \
  -p 6167:6167 \
  matrixconduit/matrix-conduit:latest
```

### Binary Installation

```bash
# Download latest release
wget https://gitlab.com/famedly/conduit/-/releases/permalink/latest/downloads/conduit-linux-x86_64
chmod +x conduit-linux-x86_64
mv conduit-linux-x86_64 /usr/local/bin/conduit

# Create config directory
mkdir -p /etc/conduit
mkdir -p /var/lib/conduit

# Create config
cat > /etc/conduit/conduit.toml << 'EOF'
[global]
server_name = "example.com"
database_path = "/var/lib/conduit"
database_backend = "rocksdb"
port = 6167
max_request_size = 52_428_800
allow_registration = false
allow_federation = true
EOF

# Run Conduit
CONDUIT_CONFIG=/etc/conduit/conduit.toml /usr/local/bin/conduit
```

### Build from Source

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Clone and build
git clone https://gitlab.com/famedly/conduit.git
cd conduit
cargo build --release

# Binary at target/release/conduit
```

## Configuration

### conduit.toml

```toml title="/etc/conduit/conduit.toml"
[global]
# Server identity (REQUIRED)
server_name = "example.com"

# Database settings
database_path = "/var/lib/conduit"
database_backend = "rocksdb"  # or "sqlite"

# Network settings
address = "127.0.0.1"
port = 6167

# Limits
max_request_size = 52_428_800  # 50MB
max_concurrent_requests = 100

# Registration
allow_registration = false
registration_token = "your-secret-token"  # If registration enabled

# Federation
allow_federation = true
trusted_servers = ["matrix.org"]

# Well-known delegation
[global.well_known]
client = "https://matrix.example.com"
server = "matrix.example.com:443"

# TLS (optional, usually handled by reverse proxy)
# [global.tls]
# certs = "/etc/letsencrypt/live/matrix.example.com/fullchain.pem"
# key = "/etc/letsencrypt/live/matrix.example.com/privkey.pem"
```

### Database Backends

| Backend | Use Case |
|---------|----------|
| **RocksDB** | Recommended for most deployments |
| **SQLite** | Simpler, good for tiny instances |

```toml
# RocksDB (recommended)
database_backend = "rocksdb"

# SQLite
database_backend = "sqlite"
```

### Reverse Proxy (Caddy)

```caddyfile title="Caddyfile"
matrix.example.com {
    reverse_proxy /_matrix/* localhost:6167
}

matrix.example.com:8448 {
    reverse_proxy localhost:6167
}
```

### Reverse Proxy (Nginx)

```nginx title="/etc/nginx/sites-available/matrix"
server {
    listen 443 ssl http2;
    server_name matrix.example.com;

    ssl_certificate /etc/letsencrypt/live/matrix.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/matrix.example.com/privkey.pem;

    location /_matrix {
        proxy_pass http://127.0.0.1:6167;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 50M;
    }
}

server {
    listen 8448 ssl http2;
    server_name matrix.example.com;

    ssl_certificate /etc/letsencrypt/live/matrix.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/matrix.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:6167;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## User Management

### Admin Commands

Conduit has an admin room for management. First, create an admin account:

```bash
# With registration enabled temporarily
curl -X POST "http://localhost:6167/_matrix/client/r0/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password", "auth": {"type": "m.login.dummy"}}'
```

### Admin Room Commands

Join `#admins:your.server.name` and use commands:

```
# User management
!admin users list
!admin users create <username> <password>
!admin users deactivate <user_id>

# Room management
!admin rooms list
!admin rooms delete <room_id>

# Server management
!admin server stats
!admin server clear-cache
```

:::tip
The first user to register becomes admin automatically if `allow_registration` is enabled during initial setup.
:::

## Systemd Service

```ini title="/etc/systemd/system/conduit.service"
[Unit]
Description=Conduit Matrix Homeserver
After=network.target

[Service]
Environment="CONDUIT_CONFIG=/etc/conduit/conduit.toml"
User=conduit
Group=conduit
Restart=always
ExecStart=/usr/local/bin/conduit

[Install]
WantedBy=multi-user.target
```

```bash
# Create user
useradd -r -s /bin/false conduit
chown -R conduit:conduit /var/lib/conduit

# Enable and start
systemctl enable conduit
systemctl start conduit
```

## conduwuit Fork

For production, consider [conduwuit](https://github.com/girlbossceo/conduwuit):

```bash
# Docker
docker run -d --name conduwuit \
  -v $(pwd)/conduwuit-data:/var/lib/conduwuit \
  -p 6167:6167 \
  girlbossceo/conduwuit:latest
```

**Additional features:**
- Better Spaces support
- More MSCs implemented
- Active development
- Performance improvements
- Bug fixes

## Performance

### Resource Usage

Typical usage for small instance:
- **RAM**: 20-100 MB
- **CPU**: Minimal
- **Disk**: Depends on media/messages

### Optimization

```toml
[global]
# Increase for busy servers
max_concurrent_requests = 200

# Tune cache
cache_capacity = 1073741824  # 1GB
```

## Backup

### Database Backup

```bash
# Stop Conduit first for consistency
systemctl stop conduit

# RocksDB
cp -r /var/lib/conduit /backup/conduit-$(date +%Y%m%d)

# Start again
systemctl start conduit
```

### Media Backup

Media is stored in the database path:
```bash
# Included in database backup above
```

## Troubleshooting

### Federation Issues

```bash
# Test federation
curl "https://federationtester.matrix.org/api/report?server_name=example.com"

# Check well-known
curl https://example.com/.well-known/matrix/server
curl https://example.com/.well-known/matrix/client
```

### Debug Logging

```bash
# Run with debug output
CONDUIT_CONFIG=/etc/conduit/conduit.toml \
RUST_LOG=debug \
/usr/local/bin/conduit
```

### Common Issues

**"Server not found":**
- Check DNS/well-known configuration
- Verify port 8448 is accessible
- Test with federation tester

**"Unable to decrypt":**
- Conduit has full E2EE support
- Check client key backup

**High memory usage:**
- Unusual for Conduit
- Check for large rooms
- Consider using RocksDB

## Limitations

Compared to Synapse/Dendrite:

| Feature | Status |
|---------|--------|
| Basic messaging | ✅ Full |
| E2EE | ✅ Full |
| Federation | ✅ Full |
| Spaces | 🔄 Basic |
| Threads | ✅ Supported |
| Appservices | 🔄 Basic |
| VoIP | ✅ Supported |
| Admin API | ❌ Limited |

## Resources

- [Conduit GitLab](https://gitlab.com/famedly/conduit)
- [conduwuit GitHub](https://github.com/girlbossceo/conduwuit)
- [Conduit Documentation](https://docs.conduit.rs/)

---

*Next: [Server Comparison](/servers/comparison) →*
