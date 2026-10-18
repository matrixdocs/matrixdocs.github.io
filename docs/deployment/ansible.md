---
sidebar_position: 3
title: Ansible Deployment
description: Deploy Matrix with the matrix-docker-ansible-deploy playbook
last_update:
  date: 2026-10-18
verified_with: "matrix-docker-ansible-deploy master @ 4912a37 (2026-10-17), Synapse 1.163.0"
---

# Ansible Deployment

[matrix-docker-ansible-deploy](https://github.com/spantaleev/matrix-docker-ansible-deploy) (MDAD) is a community Ansible playbook that installs a Matrix server and related services as Docker containers managed by systemd. It covers the homeserver, PostgreSQL, Traefik with Let's Encrypt, Element Web, bridges, bots, MAS, Element Call and monitoring.

This page is a short orientation. Every variable below was checked against the playbook's `master` branch (commit `4912a37`, 2026-10-17): the role defaults, `group_vars/matrix_servers`, `examples/vars.yml`, or the pinned external roles in `requirements.yml`. The playbook changes often and renames variables in its [CHANGELOG](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/CHANGELOG.md), so treat the [official docs](https://github.com/spantaleev/matrix-docker-ansible-deploy/tree/master/docs) as the reference.

## Prerequisites

- On your computer: `ansible-core` 2.15.1 or newer (the oldest version upstream expects to work), `git`, and optionally [`just`](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/just.md).
- A server running a supported Linux distribution, reachable over SSH as root or a sudo user.
- DNS records as described in [Configuring DNS](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-dns.md): at least `matrix.example.com` pointing at the server.

See the [prerequisites page](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/prerequisites.md) for details.

## Quick start

### 1. Get the playbook

```bash
git clone https://github.com/spantaleev/matrix-docker-ansible-deploy.git
cd matrix-docker-ansible-deploy
mkdir -p inventory/host_vars/matrix.example.com
cp examples/vars.yml inventory/host_vars/matrix.example.com/vars.yml
cp examples/hosts inventory/hosts
```

### 2. Inventory

```ini title="inventory/hosts"
[matrix_servers]
matrix.example.com ansible_host=YOUR_SERVER_IP ansible_ssh_user=root
```

### 3. Configuration

Start from `examples/vars.yml` and set at least these:

```yaml title="inventory/host_vars/matrix.example.com/vars.yml"
# Acknowledges the breaking changes you have reviewed. Keep the value
# from examples/vars.yml; the playbook tells you when it needs updating.
matrix_playbook_migration_validated_version: v2026.05.18.0

# The server name: the part after ":" in user IDs. Cannot be changed later.
matrix_domain: example.com

matrix_homeserver_implementation: synapse

# A long random string used to derive other secrets (e.g. `pwgen -s 64 1`).
matrix_homeserver_generic_secret_key: 'CHANGE_ME_LONG_RANDOM_STRING'

# Traefik, managed by the playbook, is the reverse proxy.
matrix_playbook_reverse_proxy_type: playbook-managed-traefik

# Email address for Let's Encrypt
traefik_config_certificatesResolvers_acme_email: 'admin@example.com'

# A long random string for the built-in PostgreSQL server.
postgres_connection_password: 'CHANGE_ME_ANOTHER_RANDOM_STRING'
```

Element Web is installed by default (`matrix_client_element_enabled`).

### 4. Install

Fetch the external roles, then install and start everything ([installing guide](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/installing.md)):

```bash
just roles
# without just: rm -rf roles/galaxy; ansible-galaxy install -r requirements.yml -p roles/galaxy/ --force

ansible-playbook -i inventory/hosts setup.yml --tags=install-all,ensure-matrix-users-created,start
```

### 5. Create your admin user

The password ends up in your shell history, so clear it afterwards or change the password after first login:

```bash
just register-user alice 'A_STRONG_PASSWORD' yes
# or
ansible-playbook -i inventory/hosts setup.yml \
  --extra-vars='username=alice password=A_STRONG_PASSWORD admin=yes' --tags=register-user
```

## Common additions

Each block goes into `vars.yml`, after which you re-run the playbook.

### Registration

Registration is off by default. If you open it, require a token or a CAPTCHA:

```yaml
matrix_synapse_enable_registration: true
matrix_synapse_registration_requires_token: true
```

Create tokens with Synapse's [registration tokens admin API](https://element-hq.github.io/synapse/latest/usage/administration/admin_api/registration_tokens.html). For reCAPTCHA (`matrix_synapse_enable_registration_captcha`, `matrix_synapse_recaptcha_public_key`, `matrix_synapse_recaptcha_private_key`), see [Configuring captcha](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-captcha.md). These Synapse settings do not apply when MAS is enabled.

### Bridges

Bridge variables use the `matrix_bridge_` prefix since 2026-07-16. The old `matrix_mautrix_*` names fail validation.

```yaml
matrix_bridge_mautrix_discord_enabled: true

matrix_bridge_mautrix_whatsapp_enabled: true

matrix_bridge_mautrix_telegram_enabled: true
matrix_bridge_mautrix_telegram_api_id: YOUR_TELEGRAM_APP_ID
matrix_bridge_mautrix_telegram_api_hash: YOUR_TELEGRAM_APP_HASH
```

Each bridge has its own page in the [MDAD docs](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook.md), for example [mautrix-telegram](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook-bridge-mautrix-telegram.md).

### Moderation bot

MDAD supports Draupnir (`matrix_bot_draupnir_enabled`) and Meowlnir; Mjolnir is also still supported. Draupnir needs a management room and a bot account; follow [Setting up Draupnir](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook-bot-draupnir.md).

:::warning
A moderation bot with server admin rights can ban users and redact messages across rooms. Give it only the rights it needs and restrict who can command it.
:::

### Matrix Authentication Service

```yaml
matrix_authentication_service_enabled: true
```

MDAD describes MAS support as experimental and not a default. Read [its MAS page](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook-matrix-authentication-service.md) before enabling it, especially for an existing server: migration is hard to reverse, and some services do not work with MAS yet.

### Calls

For Element Call, enable the MatrixRTC stack (LiveKit and lk-jwt-service). The playbook recommends this without installing the Element Call frontend, because Element Web and Element X embed it:

```yaml
matrix_rtc_enabled: true
```

See [Setting up Matrix RTC](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook-matrix-rtc.md) and [Element Call](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook-element-call.md).

coturn is no longer enabled by default (since 2026-02-21). Enable it only for legacy 1:1 calls or Jitsi:

```yaml
coturn_enabled: true
coturn_turn_external_ip_addresses: ['YOUR_PUBLIC_IP']
```

### Monitoring

```yaml
prometheus_enabled: true
grafana_enabled: true
```

See [Prometheus and Grafana](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook-prometheus-grafana.md). Grafana is served on `stats.example.com` by default and starts with `admin`/`admin` credentials unless you set `grafana_default_admin_user` and `grafana_default_admin_password`; set them before the first run.

### Custom Synapse settings

```yaml
matrix_synapse_max_upload_size_mb: 100

matrix_synapse_configuration_extension_yaml: |
  url_preview_enabled: true
```

The playbook supplies its own URL preview block list. Check it in the generated `homeserver.yaml` before enabling previews.

## Other homeservers

Set `matrix_homeserver_implementation` to `conduit`, `continuwuity`, `tuwunel` or `dendrite` instead of `synapse`. Each has its own page: [Conduit](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook-conduit.md), [continuwuity](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook-continuwuity.md), [tuwunel](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook-tuwunel.md), [Dendrite](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook-dendrite.md). Choose before the first install; switching later means a new server. Dendrite is in [maintenance mode](../servers/dendrite).

## Maintenance

```bash
# Update the playbook and its roles
git pull && just roles

# Apply changes and restart what changed (faster)
ansible-playbook -i inventory/hosts setup.yml --tags=install-all,start

# After removing components from vars.yml
ansible-playbook -i inventory/hosts setup.yml --tags=setup-all,ensure-matrix-users-created,start

# Restart all services
just start-all

# PostgreSQL vacuum
just run-tags run-postgres-vacuum
```

Before updating, read the [CHANGELOG](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/CHANGELOG.md). Breaking changes make the playbook stop until you update `matrix_playbook_migration_validated_version`. See [Upgrading services](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/maintenance-upgrading-services.md).

## Keeping secrets out of vars.yml

You can encrypt secrets with Ansible Vault and reference them from `vars.yml`:

```bash
ansible-vault create inventory/host_vars/matrix.example.com/vault.yml
```

```yaml title="vault.yml (encrypted)"
vault_matrix_homeserver_generic_secret_key: "..."
vault_postgres_connection_password: "..."
```

```yaml title="vars.yml"
matrix_homeserver_generic_secret_key: "{{ vault_matrix_homeserver_generic_secret_key }}"
postgres_connection_password: "{{ vault_postgres_connection_password }}"
```

Run the playbook with `--ask-vault-pass`, or set `vault_password_file` in `ansible.cfg`.

## Troubleshooting

```bash
# On the server
systemctl status matrix-synapse
journalctl -fu matrix-synapse
docker logs matrix-postgres
```

For federation problems, use the [Matrix Federation Tester](https://federationtester.matrix.org/). The playbook's [maintenance and troubleshooting docs](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/maintenance-and-troubleshooting.md) cover the rest.

## Resources

- [Repository](https://github.com/spantaleev/matrix-docker-ansible-deploy)
- [Documentation index](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/README.md)
- [Configuring the playbook](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/docs/configuring-playbook.md)
- [#matrix-docker-ansible-deploy:devture.com](https://matrix.to/#/#matrix-docker-ansible-deploy:devture.com)

---

*See also: [Docker Deployment](./docker) | [Deployment Overview](./overview)*
