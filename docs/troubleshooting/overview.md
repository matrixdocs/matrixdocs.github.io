---
sidebar_position: 1
title: Troubleshooting Guide
description: Common Matrix client and server problems and how to fix them
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0"
---

# Troubleshooting Guide

Solutions to common Matrix problems, for users and for server admins.

## Client issues

### Can't log in

| Symptom | Likely cause | What to do |
|---------|--------------|------------|
| "Unknown user" or wrong server | The client is pointed at the wrong homeserver | Choose your homeserver first, then enter your username (most clients accept the bare name or the full `@user:example.com`) |
| "Incorrect password" | Wrong password | Use the server's password reset, or ask its admin |
| "Server not found" | Wrong address, or `.well-known/matrix/client` missing | Enter the server name (`example.com`); ask the admin to check the [client well-known](#well-known-setup) |
| Element X says the server is unsupported | Server lacks Simplified Sliding Sync | The admin should upgrade Synapse (native since 1.114) or use a server that supports it; see [Server comparison](../servers/comparison) |
| Spinning forever | Network problem | Check the connection; try another network |

### Messages not loading

1. Check the client's connection or sync indicator.
2. Clear the client cache (in Element Web: Settings → Help & About → Clear cache and reload).
3. Sign out and back in, but **set up key backup or recovery first**, or you can lose access to encrypted history.
4. Try another network.

### Can't decrypt messages

"Unable to decrypt" usually means this session never received the room key.

1. **Recovery / key backup.** In Element, Settings → Encryption (or Security & Privacy) lets you set up recovery, or enter your recovery key to restore keys from backup.
2. **Verify this session** from another signed-in session. Verified sessions can share keys.
3. **Wait.** Keys sometimes arrive late, especially after the sender's device was offline.

Messages sent before you joined a room, or to a session that was never verified or backed up, may be permanently unreadable.

**Prevention:** set up recovery as soon as you create an account, verify every new session, and keep at least one signed-in session.

### Slow client

| Issue | What to do |
|-------|------------|
| Slow sync | Leave rooms you don't use; clear cache |
| High memory | Try a lighter client (see [Clients](../clients/overview)) |
| Sluggish UI | Turn off URL previews and animations |

## Federation issues

### Messages not reaching other servers

Test with the [Matrix Federation Tester](https://federationtester.matrix.org/):

```bash
curl "https://federationtester.matrix.org/api/report?server_name=example.com"
```

| Issue | Fix |
|-------|-----|
| Port 8448 closed and no `.well-known` | Delegate to 443 with `/.well-known/matrix/server`, or open 8448 |
| Missing or wrong `.well-known` | See below |
| Certificate problems | Use a publicly trusted certificate for the hostname servers connect to |
| DNS problems | Check A/AAAA records for both the server name and the delegated host |

### Well-known setup

Server delegation, served at `https://example.com/.well-known/matrix/server`:

```json
{"m.server": "matrix.example.com:443"}
```

Client discovery, served at `https://example.com/.well-known/matrix/client` with the header `Access-Control-Allow-Origin: *`:

```json
{"m.homeserver": {"base_url": "https://matrix.example.com"}}
```

Both should be served as `application/json`. See [Well-known delegation](../servers/overview#well-known-delegation).

### Federation lag

1. Check homeserver CPU, memory and database load.
2. Check whether the remote server is up (the federation tester works for any server name).
3. Large rooms are slow to join over federation; first joins can take minutes.

## Encryption issues

### Device verification failed

1. Try again; network hiccups are common.
2. Check the clock on both devices.
3. Try another method (QR code or emoji comparison).
4. As a last resort, reset your cryptographic identity. You will need to verify your other sessions again, and contacts will see a warning.

### Key backup not working

| Problem | What to do |
|---------|------------|
| Can't set up backup | Update the client; check the server is reachable |
| Can't restore | Check the recovery key or passphrase |
| Keys not backing up | Check that backup is enabled in this session |

### Room shows "encryption not enabled"

The room was created without encryption. Encryption can be turned on later but never off. For an encrypted room, enable it in room settings or create a new room.

## Server issues (Synapse)

### High memory

`caches.global_factor` defaults to 0.5, so setting it to 0.5 changes nothing. Lower it (for example 0.25), or use `cache_autotuning` with jemalloc, which the Docker image includes. See [Synapse: caches](../servers/synapse#caches). Memory also grows with very large rooms; workers spread the load across processes.

### Synapse won't start

```bash
journalctl -u matrix-synapse -f          # Debian package
docker compose logs -f synapse           # Docker
python -m synapse.config -c homeserver.yaml   # validate config
```

Common causes:

- A config option removed or changed in an upgrade. Read the [upgrade notes](https://element-hq.github.io/synapse/latest/upgrade.html). For example, `worker_replication_host` was removed in 1.88, and 1.163 rejects `limit_profile_requests_to_users_who_share_rooms` without `require_auth_for_profile_requests`.
- `url_preview_enabled: true` without `url_preview_ip_range_blacklist`.
- MAS enabled together with `enable_registration`, `enable_registration_captcha` or password login. These conflict, and Synapse refuses to start.
- PostgreSQL older than 14, or Python older than 3.10.
- Missing signing key, port already in use, or database unreachable.

### Password login or `register_new_matrix_user` fails after enabling MAS

That is expected. With MAS, Synapse no longer handles passwords or registration, and its admin API refuses to create users (1.163). Create users with `mas-cli manage register-user`. See [Synapse: MAS](../servers/synapse#matrix-authentication-service-mas).

### Database

```bash
# Is PostgreSQL running and reachable?
systemctl status postgresql
psql -U synapse -h localhost synapse

# Vacuum and analyse
psql -U synapse -h localhost -c "VACUUM ANALYZE;" synapse
```

### Disk space

Find what is large. The data lives in `/var/lib/matrix-synapse` with the Debian package, or in `/data` inside the Docker container:

```bash
du -sh /var/lib/matrix-synapse/*
```

Cleanup options:

- Purge cached remote media: `POST /_synapse/admin/v1/purge_media_cache?before_ts=<ms>` ([media admin API](https://element-hq.github.io/synapse/latest/admin_api/media_admin_api.html)).
- Delete old local media: `POST /_synapse/admin/v1/media/delete?before_ts=<ms>`. This deletes files users uploaded, so use it with care.
- Expire media automatically with `media_retention` (see [Synapse: media retention](../servers/synapse#media-retention)).
- Compress room state with [`synapse_auto_compressor`](https://github.com/matrix-org/rust-synapse-compress-state).

Call the admin API from the host (`http://localhost:8008`), not through the public proxy.

### Signing key from ESS Community

If you deployed with the ESS Community Helm chart before version 25.12.2, your server's signing key may be weak ([CVE-2026-24044](https://github.com/element-hq/ess-helm/security/advisories/GHSA-qwcj-h6m8-vp6q)). Upgrade the chart and follow the advisory's rotation steps.

## Bridge issues

### Bridge not connecting

1. Check the bridge logs.
2. Check that the registration file is listed in `app_service_config_files` and that Synapse was restarted afterwards.
3. Check that the bridge can reach the homeserver address in its config, and that the homeserver can reach the bridge (inside Docker, use container names, not `localhost`).
4. Message the bridge bot and ask for help (`help` in mautrix bridges).

Under MAS, bridges with encryption need Synapse 1.141 or later and MSC4190 support in the bridge (for mautrix bridges, `encryption.msc4190`).

### Messages not bridging

| Direction | Check |
|-----------|-------|
| Matrix → remote | The bridge's login on the remote side; puppet permissions |
| Remote → Matrix | The portal room exists and the bridge bot is in it |
| Both | The bridge service is running |

### Double messages

- Two bridge instances running with the same registration
- A room bridged twice

## Media issues

### Upload failed

| Cause | Fix |
|-------|-----|
| File too large | Raise `max_upload_size` in Synapse and `client_max_body_size` (nginx) or equivalent in the proxy |
| Disk full | Free space (see above) |

### Media not loading

1. **Authenticated media.** Since Synapse 1.120 (`enable_authenticated_media` defaults to true), new media is only served on the authenticated endpoints such as `/_matrix/client/v1/media/download/{serverName}/{mediaId}`. Old clients and bridges that use the legacy `/_matrix/media/*` download endpoints get 404s. Update them.
2. Check the proxy forwards everything under `/_matrix`.
3. Check the certificate.
4. Clear the client cache.

## Calls

### Element Call (group calls in Element Web and Element X)

Element Call uses MatrixRTC with a LiveKit SFU, not TURN. Check:

1. LiveKit and `lk-jwt-service` are running and reachable over HTTPS/WSS.
2. Synapse's `matrix_rtc` transports point at them, and the experimental flags from the [Element Call self-hosting guide](https://github.com/element-hq/element-call/blob/main/docs/self_hosting.md) are set.
3. An error such as `MISSING_MATRIX_RTC_TRANSPORT` means the client found no transport. Some deployments still also publish the older `org.matrix.msc4143.rtc_foci` entry in `.well-known/matrix/client` for older clients.
4. LiveKit's ports are open in the firewall.

### Legacy 1:1 calls (TURN)

1. Check the TURN server: `turn_uris` and `turn_shared_secret` in Synapse, and the same secret in coturn.
2. Firewall: 3478 and 5349 (TCP and UDP), and the relay range 49152–65535 (UDP), which is coturn's default.
3. Check browser camera and microphone permissions.

### Poor call quality

- Use a wired connection
- Close other bandwidth-heavy apps
- Try audio only

## Getting help

### What to include

```
1. Client or server name and version
2. The exact error message
3. Steps to reproduce
4. What you've tried
5. Relevant logs (remove tokens and personal data)
```

### Where to ask

| Resource | For |
|----------|-----|
| [#matrix:matrix.org](https://matrix.to/#/#matrix:matrix.org) | General help |
| [#synapse:matrix.org](https://matrix.to/#/#synapse:matrix.org) | Synapse admins |
| [#element-web:matrix.org](https://matrix.to/#/#element-web:matrix.org) | Element Web |
| [element-hq/synapse issues](https://github.com/element-hq/synapse/issues) | Synapse bug reports |
| [element-hq/element-web issues](https://github.com/element-hq/element-web/issues) | Element Web bug reports |

---

*Need more help? Join [#matrix:matrix.org](https://matrix.to/#/#matrix:matrix.org)*
