---
sidebar_position: 3
title: "Matrix Authentication Service (MAS)"
description: Add OAuth 2.0 login to Synapse with the Matrix Authentication Service, or migrate an existing server to it
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, MAS v1.27.0, Element X Android 26.09.4, Element X iOS 26.10.4"
---

# Matrix Authentication Service (MAS)

The [Matrix Authentication Service](https://github.com/element-hq/matrix-authentication-service) (MAS) is Element's login server for Synapse. Once you enable it, MAS owns user accounts, passwords and sessions. Synapse stops handling login and only checks the access tokens that MAS issues.

This page covers MAS v1.27.0 (released 2026-10-13) with Synapse 1.163.0 (2026-10-14). MAS is AGPL-3.0 and ships about every two weeks. The [MAS documentation](https://element-hq.github.io/matrix-authentication-service/) is the reference, and this page links to it throughout.

## What MAS does

Since spec v1.15, Matrix has two login APIs ([spec v1.19: authentication APIs](https://spec.matrix.org/v1.19/client-server-api/#client-authentication)):

| | Legacy API | OAuth 2.0 API |
|---|---|---|
| Discovery | `GET /_matrix/client/v3/login` | `GET /_matrix/client/v1/auth_metadata` |
| Where the user types the password | In the client | In a browser, on the server's own login page |
| Sign-up | `/register` from the client | On the server's web page; the client can only ask for the sign-up page |
| Served by | Synapse on its own | MAS |

The two APIs cannot be mixed: a client must keep using the API it logged in with. MAS implements the [OAuth 2.0 API](https://spec.matrix.org/v1.19/client-server-api/#oauth-20-api). It also has a **compatibility layer** that answers the legacy `/login`, `/logout` and `/refresh` endpoints, so older clients and bots that log in with a password keep working.

Synapse checks each access token by asking MAS's introspection endpoint, and MAS calls Synapse's `/_synapse/mas/` endpoints to create users and devices. Both directions use a shared secret.

## When you need it

| You want | Do you need MAS? |
|---|---|
| Element X users to log in with a password | No. Element X Android 26.09.4 and iOS 26.10.4 still log in with a password on servers without MAS |
| Users to **sign up from inside Element X** | Yes. Element X only offers sign-up on servers with the OAuth 2.0 API ([Android](https://github.com/element-hq/element-x-android/blob/v26.09.4/features/login/impl/src/main/kotlin/io/element/android/features/login/impl/login/LoginModePresenter.kt), [iOS](https://github.com/element-hq/element-x-ios/blob/release/26.10.4/ElementX/Sources/Services/Authentication/AuthenticationService.swift)) |
| Element X's browser-based login, as on matrix.org | Yes. Element X uses OAuth whenever the server offers it |
| SSO through an external OpenID Connect provider | No. Synapse's own `oidc_providers` still works in 1.163. If you add MAS, the providers move into MAS |
| A small server where an admin creates every account | No |

matrix.org [moved to MAS](https://matrix.org/blog/2025/04/morg-now-running-mas/) in April 2025. Synapse is the only homeserver MAS supports.

## Before you start

- **Synapse 1.136.0 or later** (MAS supports nothing older; this page uses 1.163.0). The old `experimental_features.msc3861` block was removed in 1.157.
- **PostgreSQL** for both. MAS needs its own empty database and does not share Synapse's. MAS recommends PostgreSQL 13 or later; Synapse 1.163 needs 14 or later. Do not put MAS behind pgBouncer in transaction pooling mode; use session pooling ([database setup](https://element-hq.github.io/matrix-authentication-service/setup/database.html)).
- **A separate hostname for MAS**, such as `auth.example.com`, with TLS. Users see it during login. This page uses `example.com` as the server name, `matrix.example.com` for Synapse and `auth.example.com` for MAS ([planning](https://element-hq.github.io/matrix-authentication-service/setup/)).
- **Working email** if users will sign up themselves. MAS sends no mail until you configure the [`email`](https://element-hq.github.io/matrix-authentication-service/reference/configuration.html#email) section.

For an existing server, read [Migrating an existing server](#migrate) before you change anything.

## Install MAS

Element publishes Linux binaries (x86_64 and aarch64) and a container image. Pin the version:

```bash
VERSION=v1.27.0
ARCH=x86_64        # or aarch64
sudo mkdir -p /opt/mas
curl -fsSL "https://github.com/element-hq/matrix-authentication-service/releases/download/${VERSION}/mas-cli-${ARCH}-linux.tar.gz" |
  sudo tar xzC /opt/mas
/opt/mas/mas-cli --version
```

The archive holds `mas-cli` and a `share/` directory (web assets, templates, translations and the compiled policy). The default config looks for `share/` in the **working directory**, so run MAS from `/opt/mas`. The rest of this page writes `mas-cli` for `/opt/mas/mas-cli`.

The container image is `ghcr.io/element-hq/matrix-authentication-service:1.27.0`. Its entrypoint is `mas-cli` and the `share/` files are already in place. Use a version tag, not `latest`. Inside a container, bind the listener to `[::]:8080` and publish the port only on `127.0.0.1`. See [installation](https://element-hq.github.io/matrix-authentication-service/setup/installation.html).

## Configure MAS

Generate a config with fresh keys and secrets. Keep this file private:

```bash
sudo mkdir -p /etc/mas
sudo /opt/mas/mas-cli config generate --output /etc/mas/config.yaml
sudo chmod 600 /etc/mas/config.yaml   # then chown it to the user that runs MAS
```

The generated file lists every option with its default. Change these sections ([configuration reference](https://element-hq.github.io/matrix-authentication-service/reference/configuration.html)):

```yaml title="/etc/mas/config.yaml (excerpt)"
http:
  public_base: https://auth.example.com/
  issuer: https://auth.example.com/      # the generated file sets this to http://[::]:8080/
  listeners:
    - name: web
      resources:
        - name: discovery
        - name: human
        - name: oauth
        - name: compat
        - name: graphql
        - name: assets
      binds:
        - host: localhost                  # the generated file binds [::]:8080, all interfaces
          port: 8080
    - name: internal
      resources:
        - name: health
      binds:
        - host: localhost
          port: 8081

database:
  uri: postgresql://mas_user:CHANGE_ME@localhost/mas

matrix:
  kind: synapse
  homeserver: example.com                  # Synapse's server_name, not its hostname
  endpoint: http://localhost:8008          # where MAS reaches Synapse
  secret_file: /etc/mas/synapse_secret     # replaces the generated inline `secret:`
```

Create the shared secret once and give each service its own copy. Anyone holding it can act as a Synapse admin:

```bash
openssl rand -hex 32 | sudo tee /etc/mas/synapse_secret > /dev/null
sudo cp /etc/mas/synapse_secret /etc/matrix-synapse/mas_secret
sudo chmod 600 /etc/mas/synapse_secret /etc/matrix-synapse/mas_secret
# then chown each file to the user that runs that service
```

Create the database as in [Database setup](https://element-hq.github.io/matrix-authentication-service/setup/database.html) (`createuser --pwprompt mas_user`, `createdb --owner=mas_user mas`), then check the config:

```bash
cd /opt/mas && ./mas-cli config check --config /etc/mas/config.yaml
```

MAS runs its database migrations at startup.

## Connect Synapse

Add the `matrix_authentication_service` section ([config manual](https://element-hq.github.io/synapse/latest/usage/configuration/config_documentation.html#matrix_authentication_service)):

```yaml title="homeserver.yaml"
matrix_authentication_service:
  enabled: true
  endpoint: http://localhost:8080/             # MAS's `web` listener
  secret_path: /etc/matrix-synapse/mas_secret  # same value as matrix.secret_file in MAS
```

| Key | Synapse 1.163 behaviour |
|---|---|
| `enabled` | Default `false` |
| `endpoint` | Default `http://localhost:8080`. Synapse fetches `/.well-known/openid-configuration` and calls `/oauth2/introspect` here, so this listener must serve the `discovery` and `oauth` resources. Use an internal URL. In Docker, `localhost` is the Synapse container itself; use the MAS service name |
| `secret` / `secret_path` | Exactly one is required. Inline `secret` is refused if Synapse runs with `--no-secrets-in-config` |
| `force_http2` | Default `false`. Use HTTP/2 without TLS (h2c) to reach MAS; only if nothing in between breaks h2c |

### Remove settings that conflict

With MAS enabled, Synapse 1.163 refuses to start if any of these are set ([`synapse/config/mas.py`](https://github.com/element-hq/synapse/blob/v1.163.0/synapse/config/mas.py)):

- `enable_registration: true` or `enable_registration_captcha: true`
- `password_config.enabled: true` or `only_for_reauth` (it defaults to off when MAS is enabled), or legacy `password_providers` / `ldap_config`
- SSO: `oidc_providers`/`oidc_config`, `saml2_config`, `cas_config` or `jwt_config`
- `user_consent`
- `refresh_token_lifetime`, `nonrefreshable_access_token_lifetime` or `session_lifetime`
- `login_via_existing_session.enabled: true`
- `enable_3pid_changes: true` (it defaults to off when MAS is enabled)

Move any SSO providers into MAS's [`upstream_oauth2`](https://element-hq.github.io/matrix-authentication-service/setup/sso.html) section instead. Then validate:

```bash
python -m synapse.config -c /etc/matrix-synapse/homeserver.yaml
```

If you run [workers](https://element-hq.github.io/synapse/latest/workers.html), `^/_synapse/mas/` can be routed to a generic worker.

## Reverse proxy

Two changes, following the MAS [reverse proxy guide](https://element-hq.github.io/matrix-authentication-service/setup/reverse-proxy.html):

1. Serve `auth.example.com` from MAS.
2. On `matrix.example.com`, send `/login`, `/logout` and `/refresh` to MAS (the compatibility layer). Synapse 1.163 does not serve these endpoints when MAS is enabled.

```nginx title="/etc/nginx/sites-available/matrix (additions)"
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name auth.example.com;
    ssl_certificate     /etc/letsencrypt/live/auth.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/auth.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    server_name matrix.example.com;
    # ... existing listen, ssl and Synapse location from the Synapse page ...

    # Must come before the Synapse location: nginx uses the first matching regex.
    location ~ ^/_matrix/client/(.*)/(login|logout|refresh) {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Keep the Synapse location from [Synapse: Reverse proxy](./synapse#reverse-proxy). The upstream example also proxies `/_synapse/mas` publicly. You don't need that when MAS reaches Synapse on its internal `matrix.endpoint`, and leaving it out keeps one more admin-level API off the internet. MAS trusts `X-Forwarded-For` only from the private ranges in `http.trusted_proxies`.

## Run it

Run MAS as an unprivileged user from the directory that contains `share/`. `mas-cli server` starts both the web server and the background worker ([running](https://element-hq.github.io/matrix-authentication-service/setup/running.html)):

```ini title="/etc/systemd/system/mas.service"
[Unit]
Description=Matrix Authentication Service
After=network-online.target postgresql.service

[Service]
User=mas
WorkingDirectory=/opt/mas
ExecStart=/opt/mas/mas-cli server --config /etc/mas/config.yaml
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Start MAS, then restart Synapse.

## Migrating an existing server {#migrate}

The migration tool is built into `mas-cli` as **`mas-cli syn2mas`**. At v1.27.0 the repository has no separate syn2mas tool any more. It imports users, password hashes, devices, access tokens and upstream SSO links, so users stay logged in ([migration guide](https://element-hq.github.io/matrix-authentication-service/setup/migration.html)).

:::warning
The import needs downtime and is hard to undo once MAS has started. Back up both databases and your Synapse config first.
:::

It won't work for every server:

- Synapse on **SQLite** is not supported. Move to PostgreSQL first.
- **SAML** and **LDAP** login are not supported. The guide suggests putting [Dex](https://github.com/dexidp/dex) in between.
- **Custom password provider modules** are not supported.

Steps:

1. Install MAS as above, with an empty database. Instead of the plain `config generate`, start from your Synapse config, then make the same `http`, `database` and `matrix` edits:
   ```bash
   cd /opt/mas
   sudo ./mas-cli config generate --synapse-config /etc/matrix-synapse/homeserver.yaml --output /etc/mas/config.yaml
   ```
   Read the warnings it prints.
2. Accept existing Synapse password hashes (bcrypt), and re-hash them with argon2id at next login:
   ```yaml title="/etc/mas/config.yaml"
   passwords:
     enabled: true
     schemes:
       - version: 1
         algorithm: bcrypt
         unicode_normalization: true
         # secret: must equal password_config.pepper, if Synapse had one
       - version: 2
         algorithm: argon2id
   ```
3. For each SSO provider your users logged in with, add an `upstream_oauth2` provider whose `synapse_idp_id` matches Synapse's ID (`oidc` for the legacy `oidc_config`, `oidc-<idp_id>` for `oidc_providers`).
4. Check, then do a dry run. Both are safe while Synapse is running:
   ```bash
   ./mas-cli syn2mas check --config /etc/mas/config.yaml --synapse-config /etc/matrix-synapse/homeserver.yaml
   ./mas-cli syn2mas migrate --config /etc/mas/config.yaml --synapse-config /etc/matrix-synapse/homeserver.yaml --dry-run
   ```
5. Stop Synapse. Add `matrix_authentication_service` and remove the conflicting settings (see [Connect Synapse](#connect-synapse)).
6. Migrate while MAS is still stopped:
   ```bash
   ./mas-cli syn2mas migrate --config /etc/mas/config.yaml --synapse-config /etc/matrix-synapse/homeserver.yaml
   ```
7. Start Synapse, then MAS.

syn2mas never writes to the Synapse database. If the import fails **and MAS has not started**, you can revert the Synapse config and go back.

Bridges and other application services must call `/register` with `inhibit_login=true` under MAS (Synapse [1.139 upgrade notes](https://element-hq.github.io/synapse/latest/upgrade.html#upgrading-to-v11390)). Encrypted bridges also need MSC4190 support; see [Troubleshooting](../troubleshooting/overview).

## Users, admins and registration

:::warning
The commands below create admins and admin tokens. Run them on the server, keep the MAS config (with its keys) unreadable to other users, and don't leave admin tokens in shell history or chats.
:::

MAS now owns accounts. Synapse disables shared-secret registration (so `register_new_matrix_user` fails), its registration-token, reset-password, set-admin and login-as-user admin APIs, and refuses to create users through the admin API (1.163). Use `mas-cli manage` from `/opt/mas` with `--config /etc/mas/config.yaml` instead ([CLI reference](https://element-hq.github.io/matrix-authentication-service/reference/cli/manage.html)):

| Task | Command |
|---|---|
| Create a user (prompts for details) | `mas-cli manage register-user` |
| Let a user request admin access | `mas-cli manage promote-admin <username>` |
| Get a token for Synapse's admin API | `mas-cli manage issue-compatibility-token <username> --yes-i-want-to-grant-synapse-admin-privileges` |
| Issue a registration token | `mas-cli manage issue-user-registration-token --usage-limit 1 --expires-in 86400` |
| Log a user out everywhere | `mas-cli manage kill-sessions <username>` |
| Lock and deactivate a user | `mas-cli manage lock-user <username> --deactivate` |

`promote-admin` doesn't make the user's existing sessions admin. It lets them request admin rights when logging in to an admin tool. Leave `--password` off `register-user`; it will prompt for the password, so the password stays out of shell history.

**Self-service sign-up** is off by default. To allow it with invite tokens:

```yaml title="/etc/mas/config.yaml"
account:
  password_registration_enabled: true
  password_registration_token_required: true
```

Sign-up also requires an email address by default (`password_registration_email_required`), so configure `email` first. For CAPTCHA, see the MAS [`captcha`](https://element-hq.github.io/matrix-authentication-service/reference/configuration.html#captcha) section. Don't open sign-up without tokens or CAPTCHA.

For scripts and tools, MAS has its own **admin API** at `/api/admin/v1/`. It is off until you add the `adminapi` resource to a listener, and it needs a token with the `urn:mas:admin` scope ([admin API](https://element-hq.github.io/matrix-authentication-service/topics/admin-api.html)). Bots should use a personal access token, as described in [Building bots](../bots/building-bots#getting-a-bot-account).

## Check that it works

From any machine:

```bash
# OAuth 2.0 discovery, answered by Synapse with metadata from MAS
curl -s https://matrix.example.com/_matrix/client/v1/auth_metadata

# Legacy login flows, answered by MAS's compatibility layer
curl -s https://matrix.example.com/_matrix/client/v3/login
```

- `auth_metadata` should return JSON whose `issuer` is `https://auth.example.com/`, with `authorization_endpoint`, `token_endpoint` and `registration_endpoint` on the same host. A 404 with `M_UNRECOGNIZED` means Synapse is not running with MAS enabled.
- `/login` should list `m.login.sso` with `"oauth_aware_preferred": true`. Without it, the request is not reaching MAS.

On the server, `curl http://localhost:8081/health` checks MAS itself. `mas-cli doctor --config /etc/mas/config.yaml` checks the deployment from MAS's point of view ([doctor](https://element-hq.github.io/matrix-authentication-service/reference/cli/doctor.html)). Then log in with Element X or Element Web; you should be sent to `auth.example.com`.

## Common failures

| Symptom | Cause and fix |
|---|---|
| Synapse won't start: "Registration cannot be enabled when OAuth delegation is enabled" (or password auth, SSO, CAPTCHA, consent, lifetimes) | A conflicting setting is still in `homeserver.yaml`. Remove it ([list](#remove-settings-that-conflict)) |
| Synapse won't start: "Could not validate Matrix Authentication Service configuration" | Usually `secret` and `secret_path` are both set, or neither is. Set exactly one; `secret_path` must point to an existing file |
| Login completes in the browser, but the client is then rejected | Synapse can't reach MAS at `endpoint`, or the two copies of the shared secret differ. Run `curl <endpoint>/.well-known/openid-configuration` from the Synapse host (or container) and compare the two secret files |
| `issuer` in `auth_metadata` is `http://[::]:8080/`, and logins fail | `http.public_base` and `http.issuer` still have their generated values. Set both to `https://auth.example.com/` |
| Old clients or bots get 404 on `/login` | The compatibility routes don't reach MAS. Add the `login\|logout\|refresh` location **above** the Synapse location |
| MAS fails at startup while loading templates, the policy or assets | MAS isn't running from the directory that holds `share/`. Set `WorkingDirectory`, or set the paths in the config |
| `register_new_matrix_user` or the user admin API fails | Expected under MAS. Use `mas-cli manage` |
| Migrated users can't log in with their old password | Missing `bcrypt` scheme with `unicode_normalization: true`, or a missing pepper (`secret`) |
| Element X won't create an account on your server | The server has no OAuth 2.0 API. Set up MAS, or create accounts as an admin |
| Bridge fails with `IO.ELEMENT.MSC4190.M_APPSERVICE_LOGIN_UNSUPPORTED` | The bridge doesn't use `inhibit_login=true`. Update it |

## Further reading

- [MAS documentation](https://element-hq.github.io/matrix-authentication-service/): setup, configuration reference, CLI and admin API
- [Synapse: Matrix Authentication Service](./synapse#matrix-authentication-service-mas): Synapse-side summary
- [Spec v1.19: OAuth 2.0 API](https://spec.matrix.org/v1.19/client-server-api/#oauth-20-api)
- [ESS Community](https://github.com/element-hq/ess-helm): Element's Helm chart, which deploys Synapse and MAS already connected
