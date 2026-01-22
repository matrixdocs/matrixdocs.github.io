---
sidebar_position: 3
title: Ansible Deployment
description: Deploy Matrix using matrix-docker-ansible-deploy
---

# Ansible Deployment

The **matrix-docker-ansible-deploy** playbook is the easiest way to deploy a full Matrix stack.

## Features

- Complete Matrix server setup
- Element Web client
- All major bridges
- Bots (Mjolnir, etc.)
- Automatic SSL certificates
- Easy updates
- Well-documented

## Prerequisites

- Ansible 2.9+ on your local machine
- Server with:
  - Fresh Debian/Ubuntu
  - 2+ GB RAM
  - Root access
  - Ports 80, 443, 8448

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/spantaleev/matrix-docker-ansible-deploy.git
cd matrix-docker-ansible-deploy
```

### 2. Configure DNS

Point these records to your server:

```
matrix.example.com    A    YOUR_SERVER_IP
example.com           A    YOUR_SERVER_IP
```

### 3. Create Inventory

```bash
mkdir -p inventory/host_vars/matrix.example.com
```

```yaml title="inventory/hosts"
[matrix_servers]
matrix.example.com ansible_host=YOUR_SERVER_IP
```

### 4. Create Configuration

```yaml title="inventory/host_vars/matrix.example.com/vars.yml"
# Basic configuration
matrix_domain: example.com
matrix_homeserver_implementation: synapse

# Admin contact
matrix_homeserver_generic_secret_key: 'GENERATE_LONG_RANDOM_STRING'

# PostgreSQL
devture_postgres_connection_password: 'GENERATE_ANOTHER_RANDOM_STRING'

# Element Web
matrix_client_element_enabled: true

# SSL with Let's Encrypt
matrix_ssl_retrieval_method: lets-encrypt
matrix_ssl_lets_encrypt_support_email: "admin@example.com"

# Create admin user
matrix_synapse_admin_username: admin
matrix_synapse_admin_password: 'YOUR_ADMIN_PASSWORD'
```

### 5. Run Playbook

```bash
# Install dependencies
ansible-galaxy collection install -r requirements.yml

# Run setup
ansible-playbook -i inventory/hosts setup.yml --tags=setup-all

# Start services
ansible-playbook -i inventory/hosts setup.yml --tags=start
```

## Common Configurations

### Enable Registration

```yaml
matrix_synapse_enable_registration: true
matrix_synapse_enable_registration_captcha: true
matrix_synapse_recaptcha_public_key: "YOUR_KEY"
matrix_synapse_recaptcha_private_key: "YOUR_KEY"
```

### Add Discord Bridge

```yaml
matrix_mautrix_discord_enabled: true
```

### Add Telegram Bridge

```yaml
matrix_mautrix_telegram_enabled: true
matrix_mautrix_telegram_api_id: "YOUR_API_ID"
matrix_mautrix_telegram_api_hash: "YOUR_API_HASH"
```

### Add WhatsApp Bridge

```yaml
matrix_mautrix_whatsapp_enabled: true
```

### Add Mjolnir (Moderation)

```yaml
matrix_bot_mjolnir_enabled: true
matrix_bot_mjolnir_access_token: "GENERATE_TOKEN"
matrix_bot_mjolnir_management_room: "!ROOM_ID:example.com"
```

### Configure TURN Server

```yaml
matrix_coturn_enabled: true
matrix_coturn_turn_external_ip_address: "YOUR_SERVER_IP"
```

### Custom Synapse Settings

```yaml
matrix_synapse_configuration_extension_yaml: |
  max_upload_size: 100M
  url_preview_enabled: true
```

## Full Configuration Example

```yaml title="inventory/host_vars/matrix.example.com/vars.yml"
# Domain and basics
matrix_domain: example.com
matrix_homeserver_implementation: synapse
matrix_homeserver_generic_secret_key: 'YOUR_SECRET_KEY'

# Database
devture_postgres_connection_password: 'DB_PASSWORD'

# SSL
matrix_ssl_retrieval_method: lets-encrypt
matrix_ssl_lets_encrypt_support_email: "admin@example.com"

# Synapse settings
matrix_synapse_enable_registration: false
matrix_synapse_max_upload_size_mb: 100

# Element Web
matrix_client_element_enabled: true
matrix_client_element_themes_enabled: true

# TURN (VoIP)
matrix_coturn_enabled: true
matrix_coturn_turn_external_ip_address: "YOUR_IP"

# Bridges
matrix_mautrix_discord_enabled: true
matrix_mautrix_telegram_enabled: true
matrix_mautrix_telegram_api_id: "ID"
matrix_mautrix_telegram_api_hash: "HASH"
matrix_mautrix_whatsapp_enabled: true
matrix_mautrix_signal_enabled: true

# Bots
matrix_bot_mjolnir_enabled: true

# Metrics
matrix_prometheus_enabled: true
matrix_grafana_enabled: true

# Admin user
matrix_synapse_admin_username: admin
matrix_synapse_admin_password: 'ADMIN_PASSWORD'
```

## Useful Commands

### Update Services

```bash
ansible-playbook -i inventory/hosts setup.yml --tags=setup-all,start
```

### View Logs

```bash
ssh root@matrix.example.com
journalctl -fu matrix-synapse
```

### Restart Services

```bash
ansible-playbook -i inventory/hosts setup.yml --tags=restart
```

### Create User

```bash
ansible-playbook -i inventory/hosts setup.yml --tags=register-user \
  --extra-vars='username=newuser password=password admin=no'
```

### Run Maintenance

```bash
ansible-playbook -i inventory/hosts setup.yml --tags=run-postgres-vacuum
```

## Directory Structure

```
inventory/
├── hosts                           # Server list
└── host_vars/
    └── matrix.example.com/
        ├── vars.yml               # Main config
        └── vault.yml              # Encrypted secrets (optional)
```

## Using Vault for Secrets

```bash
# Create encrypted file
ansible-vault create inventory/host_vars/matrix.example.com/vault.yml
```

```yaml title="vault.yml"
matrix_homeserver_generic_secret_key: "secret"
devture_postgres_connection_password: "secret"
```

Reference in vars.yml:
```yaml
matrix_homeserver_generic_secret_key: "{{ vault_secret_key }}"
```

## Troubleshooting

### Check Service Status

```bash
ssh root@matrix.example.com
systemctl status matrix-*
```

### View Container Logs

```bash
docker logs matrix-synapse
docker logs matrix-postgres
```

### Federation Issues

```bash
# Test federation
curl https://federationtester.matrix.org/api/report?server_name=example.com
```

## Resources

- [Official Repository](https://github.com/spantaleev/matrix-docker-ansible-deploy)
- [Full Documentation](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/README.md)
- [Configuration Options](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook.md)

---

*See also: [Docker Deployment](/deployment/docker) | [Deployment Overview](/deployment/overview)*
