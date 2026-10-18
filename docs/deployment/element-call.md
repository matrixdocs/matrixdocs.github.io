---
sidebar_position: 3
title: Element Call and LiveKit
description: Self-host MatrixRTC group calls next to Synapse with a LiveKit SFU and lk-jwt-service
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, Element Call v0.28.0, Element Web v1.12.32, lk-jwt-service v0.9.0, LiveKit v1.13.10"
---

# Element Call and LiveKit

This page sets up the backend for **Element Call** next to an existing Synapse server, so that Element Web, Element Desktop and Element X can make group voice and video calls through your own media server. It assumes Synapse is already running behind a reverse proxy with TLS, as in [Docker Deployment](./docker).

If you would rather not wire this up by hand, [matrix-docker-ansible-deploy](./ansible) and [ESS Community](https://github.com/element-hq/ess-helm) both install the same backend for you.

## What it is

**MatrixRTC** is the protocol for calls on Matrix ([MSC4143](https://github.com/matrix-org/matrix-spec-proposals/pull/4143)). Participants announce that they are in a call with Matrix events in the room, and the media flows through a separate media server. **Element Call** is Element's MatrixRTC calling app. Element Web and Element X embed it for in-room calls, and it can also run as a standalone web app.

Media goes through a **LiveKit SFU** (selective forwarding unit): each participant sends its streams once to the SFU, which forwards them to everyone else ([MSC4195](https://github.com/matrix-org/matrix-spec-proposals/pull/4195)). Calls are end-to-end encrypted, so the SFU forwards encrypted media.

| | Element Call (MatrixRTC) | Legacy 1:1 VoIP |
|---|---|---|
| Call size | Group calls, including 1:1 | 1:1 only |
| Media path | Through your LiveKit SFU | Peer to peer, or relayed by TURN |
| Server pieces | LiveKit SFU, lk-jwt-service, Synapse settings | A TURN server such as coturn (`turn_uris`, `turn_shared_secret` in Synapse) |
| NAT traversal | LiveKit's own ports, with optional built-in TURN | coturn |

You do not need coturn for Element Call. Keep it only if clients still place legacy 1:1 calls or you run Jitsi; see [Legacy calls: coturn](./docker#legacy-calls-coturn).

## Components

| Component | Role | Version checked (2026-10-18) |
|---|---|---|
| [LiveKit server](https://github.com/livekit/livekit) | The SFU. Carries the media. | v1.13.10 (2026-10-14), image `livekit/livekit-server:v1.13.10` on Docker Hub |
| [lk-jwt-service](https://github.com/element-hq/lk-jwt-service) | The **MatrixRTC Authorization Service**. Checks that a caller really is a given Matrix user, then issues a LiveKit access token (a JWT) for the call. | v0.9.0 (2026-10-13), image `ghcr.io/element-hq/lk-jwt-service:0.9.0` |
| Synapse | Tells clients where the SFU is and supports the MSCs that calls use. | 1.163.0 (2026-10-14) |
| [Element Call](https://github.com/element-hq/element-call) | The calling app. Only needed on your server if you want the standalone web app; Element Web 1.12.32 bundles Element Call 0.26.0. | v0.28.0 (2026-10-13) |

How a call is set up:

1. The client asks Synapse for the site's MatrixRTC transports. Synapse answers from its `matrix_rtc` config.
2. The client gets a short-lived OpenID token from its own homeserver and sends it to lk-jwt-service.
3. lk-jwt-service checks the token with the user's homeserver over the federation API, then returns a LiveKit JWT and the SFU's WebSocket URL.
4. The client connects to LiveKit over WebSocket (signalling) and UDP (media).

Element Call's guide recommends one hostname for both services, split by path. This page uses `matrix-rtc.example.com`, with `/livekit/jwt` for lk-jwt-service and `/livekit/sfu` for LiveKit ([Element Call self-hosting guide](https://github.com/element-hq/element-call/blob/v0.28.0/docs/self_hosting.md)).

:::warning
- **Protect the LiveKit API key and secret.** Anyone holding them can mint tokens for any room on your SFU and call LiveKit's server API. Keep them out of shell history and Compose files: put them in files readable only by the services (mode `600`), and use lk-jwt-service's `LIVEKIT_SECRET_FROM_FILE`.
- **Restrict who can use your SFU.** If `LIVEKIT_FULL_ACCESS_HOMESERVERS` is `*`, or LiveKit's `room.auto_create` is left at its default of `true`, users from any homeserver can start calls on your SFU and use your bandwidth.
:::

## Prerequisites

- Synapse 1.163 with a working TLS reverse proxy.
- Synapse's federation API (or at least the `openid` listener resource) must be reachable from lk-jwt-service, because it checks OpenID tokens through it ([Element Call guide](https://github.com/element-hq/element-call/blob/v0.28.0/docs/self_hosting.md#a-matrix-homeserver), [`listeners`](https://element-hq.github.io/synapse/v1.163/usage/configuration/config_documentation.html#listeners)).
- A DNS name for the RTC services, such as `matrix-rtc.example.com`, with a TLS certificate.
- A host with a public IP, or a NAT that forwards the UDP range below. LiveKit needs [these ports](https://docs.livekit.io/home/self-hosting/ports-firewall/) reachable from clients.

## 1. Create the LiveKit key

Choose an API key name and generate a secret. LiveKit logs an error if a secret is shorter than 32 characters ([source](https://github.com/livekit/livekit/blob/v1.13.10/pkg/config/config.go)).

```bash
umask 077
mkdir -p secrets
openssl rand -hex 32 > secrets/livekit_secret   # 64 hex characters
```

## 2. LiveKit config

Keys below are from LiveKit's [`config-sample.yaml` at v1.13.10](https://github.com/livekit/livekit/blob/v1.13.10/config-sample.yaml). Paste the secret from `secrets/livekit_secret` in place of the placeholder, and keep this file at mode `600`.

```yaml title="livekit.yaml"
port: 7880                  # HTTP and WebSocket; keep it behind the reverse proxy
rtc:
  tcp_port: 7881            # ICE over TCP, used when UDP is blocked
  port_range_start: 50000   # UDP media range; open it on the firewall
  port_range_end: 60000
  use_external_ip: true     # find the public IP with STUN; set node_ip instead if that gets it wrong
keys:
  lk-matrixrtc: PASTE_SECRET_HERE
room:
  auto_create: false        # only lk-jwt-service may create rooms (default is true)
```

**Optional built-in TURN.** Clients on networks that block UDP can reach LiveKit through its TURN server. It needs a certificate for `domain`:

```yaml title="livekit.yaml (add)"
turn:
  enabled: true
  domain: matrix-rtc.example.com   # must match the certificate
  udp_port: 3478
  tls_port: 5349                   # TURN over TLS
  cert_file: /path/to/fullchain.pem
  key_file: /path/to/privkey.pem
```

Networks that allow only outbound port 443 need TURN over TLS on 443, If your web proxy already holds 443, that needs a second IP address or a layer-4 load balancer in front (see `tls_port` and `external_tls` in the sample config). By default, LiveKit's TURN refuses to relay to private, loopback and link-local addresses. Leave `allow_restricted_peer_cidrs` unset so that it stays that way.

**Running it.** The LiveKit image's entrypoint is `livekit-server`, so mount the file and pass `--config /etc/livekit.yaml` as the command. Clients must reach TCP 7881 and the whole UDP range on the host (see [Firewall and ports](#firewall-and-ports)).

## 3. lk-jwt-service

lk-jwt-service is configured only through environment variables. These are from its [README at v0.9.0](https://github.com/element-hq/lk-jwt-service/blob/v0.9.0/README.md#%EF%B8%8F-configuration), checked against `src/config.rs` at that tag:

```ini title="lk-jwt-service.env"
# Public WebSocket URL of the SFU, returned to clients
LIVEKIT_URL=wss://matrix-rtc.example.com/livekit/sfu
# Must match the key name in livekit.yaml
LIVEKIT_KEY=lk-matrixrtc
# Path to secrets/livekit_secret as the service sees it
LIVEKIT_SECRET_FROM_FILE=/run/secrets/livekit_secret
# Only users on these homeservers may create calls and publish media on your SFU
LIVEKIT_FULL_ACCESS_HOMESERVERS=example.com
# Default is :8080 on all interfaces
LIVEKIT_JWT_BIND=127.0.0.1:8080
```

`LIVEKIT_FULL_ACCESS_HOMESERVERS` takes Matrix server names (the part after `:` in user IDs), comma-separated, and is required. Users from other homeservers get a token that lets them join an existing call and receive media, but not publish on your SFU or create rooms on it; their own homeserver's SFU carries their media. This has been the behaviour since lk-jwt-service 0.7.0. It only holds if LiveKit has `room.auto_create: false`; otherwise LiveKit creates the room for any token holder ([README warning](https://github.com/element-hq/lk-jwt-service/blob/v0.9.0/README.md#%EF%B8%8F-configuration)).

If you run it in a container, set `LIVEKIT_JWT_BIND=:8080` and publish the port only on loopback (`127.0.0.1:8080:8080`). The image has a built-in health check.

## 4. Reverse proxy routes

Both services go behind the proxy on one hostname. The prefix is stripped before the request reaches each service. The LiveKit route must pass WebSocket upgrades.

With Caddy (as on the [Docker page](./docker#4-caddyfile)), `handle_path` strips the prefix and WebSockets work without extra settings:

```text title="Caddyfile"
matrix-rtc.example.com {
	handle_path /livekit/jwt/* {
		reverse_proxy 127.0.0.1:8080
	}
	handle_path /livekit/sfu/* {
		reverse_proxy 127.0.0.1:7880
	}
}
```

Route the whole `/livekit/jwt/` prefix. The Caddy and HAProxy examples in Element Call's guide forward only `/sfu/get` (and `/healthz`), but Element Call 0.28.0 also calls `/get_token` ([source](https://github.com/element-hq/element-call/blob/v0.28.0/src/livekit/openIDSFU.ts)).

With nginx, from the [Element Call guide](https://github.com/element-hq/element-call/blob/v0.28.0/docs/self_hosting.md#matrix-site-endpoint-routing):

```nginx
location ^~ /livekit/jwt/ {
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:8080/;
}

location ^~ /livekit/sfu/ {
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_send_timeout 120;
    proxy_read_timeout 120;
    proxy_buffering off;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_pass http://127.0.0.1:7880/;
}
```

## 5. Synapse settings

Synapse 1.163 needs these settings for Element Call. They follow the [Element Call guide](https://github.com/element-hq/element-call/blob/v0.28.0/docs/self_hosting.md#a-matrix-homeserver) and were checked against the Synapse 1.163 config schema and `synapse/config/experimental.py`. Merge them into your existing `homeserver.yaml`; do not add a second `experimental_features` section.

```yaml title="homeserver.yaml"
experimental_features:
  msc4143_enabled: true   # serves matrix_rtc to clients (the rtc/transports endpoint)
  msc4222_enabled: true   # state_after in /sync, used to track room state

# Delayed events (MSC4140). Without them, calls get stuck with ghost participants.
max_event_delay_duration: 24h

# Raised from the defaults (0.2/s, burst 10) for bursty call key sharing
rc_message:
  per_second: 0.5
  burst_count: 30
# Call membership heartbeats restart a delayed event about every 5 seconds
rc_delayed_event_mgmt:
  per_second: 1
  burst_count: 20

matrix_rtc:
  transports:
    - type: livekit
      livekit_service_url: https://matrix-rtc.example.com/livekit/jwt
```

Notes:

- **`msc4143_enabled` is required.** Without it, Synapse never serves the `matrix_rtc` block to clients, even if it is set.
- **`rc_message` is server-wide.** It raises the message rate limit for every user, not only for calls.
- **`msc3266_enabled` is no longer needed.** The Element Call guide still lists it, but Synapse 1.153 made the room summary API (MSC3266) stable and removed the flag. Synapse ignores it.
- **`livekit_service_url` versus `url`.** Since Synapse 1.161, `livekit_service_url` is deprecated in favour of `url`, the SFU's WebSocket URL ([upgrade notes](https://github.com/element-hq/synapse/blob/v1.163.0/docs/upgrade.md#upgrading-to-v11610)). Clients that use `url` request their token through Synapse, which only works once lk-jwt-service is registered as an application service (see [below](#application-service-mode)). Element Call 0.28.0 and Element Web 1.12.32 still use `livekit_service_url`, so keep it.

### The `.well-known` `rtc_foci` key

Clients used to find the SFU through an `org.matrix.msc4143.rtc_foci` key in `/.well-known/matrix/client`. That key has been dropped from MSC4143. Element Call has not read it since v0.24.0 (2026-08-18), and Element Web 1.12.32 reads it only as a fallback when Synapse's transports endpoint returns nothing. Older clients may still need it, and the lk-jwt-service README still lists it. Publishing it alongside `matrix_rtc` does no harm:

```json title="/.well-known/matrix/client (add to the existing object)"
"org.matrix.msc4143.rtc_foci": [
  {
    "type": "livekit",
    "livekit_service_url": "https://matrix-rtc.example.com/livekit/jwt"
  }
]
```

matrix-docker-ansible-deploy briefly removed this key in 2026-08 and restored it a day later, after Element Web calls failed with `MISSING_MATRIX_RTC_TRANSPORT` ([changelog, 2026-08-20](https://github.com/spantaleev/matrix-docker-ansible-deploy/blob/master/CHANGELOG.md)).

## Application-service mode

lk-jwt-service can also run as a Synapse application service. Clients then fetch tokens through Synapse's client API instead of calling lk-jwt-service directly, and the service can send "leave" events on behalf of users whose clients drop off. It relies on two unstable MSCs, [MSC4502](https://github.com/matrix-org/matrix-spec-proposals/pull/4502) and [MSC4512](https://github.com/matrix-org/matrix-spec-proposals/pull/4512), behind Synapse experimental flags. Most sites can start without it.

To set it up, follow the [Homeserver Wiring section of the lk-jwt-service README](https://github.com/element-hq/lk-jwt-service/blob/v0.9.0/README.md#-homeserver-wiring-application-service). In short:

- In Synapse, enable `msc4502_enabled` and `msc4512_enabled` under `experimental_features`, and add the service's registration file to `app_service_config_files`. The registration claims the `rtc/livekit` proxy prefix (`io.element.msc4512.proxy_prefix`) and points `io.element.msc4512.proxy_url` at lk-jwt-service.
- In lk-jwt-service, set `LIVEKIT_AS_REGISTRATION_FILE` (or `LIVEKIT_AS_TOKEN` and `LIVEKIT_HS_TOKEN`) and `LIVEKIT_HS_SERVER_NAME`.
- In LiveKit, add a `webhook` block that uses your `LIVEKIT_KEY` and points at `https://matrix-rtc.example.com/livekit/jwt/sfu_webhook`, so that the service sees participants disconnect.
- In `matrix_rtc`, add `url`. It must be exactly the same string as `LIVEKIT_URL`, or lk-jwt-service rejects requests with `M_INVALID_PARAM`.

In this mode, the direct `/sfu/get` and `/get_token` endpoints also check that the caller is joined to the room, but only if `LIVEKIT_FULL_ACCESS_HOMESERVERS` lists your homeserver alone. lk-jwt-service logs at startup whether it checks membership.

:::warning
The registration file holds the `as_token` and `hs_token`. With them, lk-jwt-service can act for users in its namespace, which here is every local user (`regex: ".*"`). Keep the file private.
:::

## Firewall and ports

| Port | Protocol | Used by | Open to |
|---|---|---|---|
| 443 | TCP | Reverse proxy (lk-jwt-service and LiveKit WebSocket) | Internet |
| 7881 | TCP | LiveKit ICE over TCP | Internet |
| 50000–60000 | UDP | LiveKit media | Internet |
| 3478 | UDP | LiveKit TURN (if enabled) | Internet |
| 5349 | TCP | LiveKit TURN over TLS (if enabled) | Internet |
| 7880 | TCP | LiveKit HTTP/WebSocket | Loopback only (reverse proxy) |
| 8080 | TCP | lk-jwt-service | Loopback only (reverse proxy) |

lk-jwt-service also makes outbound HTTPS calls to the federation API of each homeserver whose users join calls.

## Check that it works

1. **lk-jwt-service** answers its health check with HTTP 200:

   ```bash
   curl -sS -o /dev/null -w '%{http_code}\n' https://matrix-rtc.example.com/livekit/jwt/healthz
   ```

2. **LiveKit** answers `OK` on its root path through the proxy:

   ```bash
   curl -sS https://matrix-rtc.example.com/livekit/sfu/
   ```

3. **Synapse** advertises the transport. Use the access token of any local user (in Element: Settings, Help & About). `read -s` keeps it out of shell history:

   {/* snippet:skip: unstable MSC4143 endpoint, not in spec v1.19; checked in synapse/rest/client/matrixrtc.py at v1.163.0 */}
   ```bash
   read -rs TOKEN
   curl -sS -H "Authorization: Bearer $TOKEN" \
     https://matrix.example.com/_matrix/client/unstable/org.matrix.msc4143/rtc/transports
   ```

   Expect `{"rtc_transports":[{"type":"livekit","livekit_service_url":"https://matrix-rtc.example.com/livekit/jwt"}]}`. An empty `{}` means `matrix_rtc` is missing. A 404 means `msc4143_enabled` is off.

4. **A real call.** Start a call in a room with two accounts on different networks (for example, one on mobile data). The lk-jwt-service log shows each token request with `access` set to `full` or `restricted`.

5. For a fuller test, the Element Call guide links [testmatrix](https://codeberg.org/spaetz/testmatrix), a community sanity checker that includes MatrixRTC checks.

## Common failures

| Symptom | Likely cause |
|---|---|
| `MISSING_MATRIX_RTC_TRANSPORT` when starting a call | The transports endpoint returns nothing: `msc4143_enabled` or `matrix_rtc` is missing. Older clients may need the `.well-known` `rtc_foci` key. |
| Element Call can't connect to the call | The token request to lk-jwt-service failed. Check the lk-jwt-service log. Common causes are the proxy not routing all of `/livekit/jwt/`, or lk-jwt-service being unable to reach the user's homeserver federation API to check the OpenID token. |
| Connected, but no audio or video | Media can't flow: UDP 50000–60000 or TCP 7881 is blocked, or LiveKit is advertising the wrong IP. Behind NAT, set `rtc.node_ip` (with `use_external_ip: false`) or forward the ports. Enable TURN for clients on restrictive networks. |
| WebSocket to `/livekit/sfu` fails | The proxy drops the `Upgrade` and `Connection` headers, or the `/livekit/sfu/` prefix isn't stripped. |
| Users from another server can watch but not unmute or share their screen | This is expected: they aren't in `LIVEKIT_FULL_ACCESS_HOMESERVERS`. Their homeserver should run its own MatrixRTC backend. Add a server name to the list only if you trust it to use your bandwidth. |
| Calls stay "ongoing" after everyone left | Delayed events are off (`max_event_delay_duration` unset) or rate-limited (`rc_delayed_event_mgmt`). See [How to resolve stuck MatrixRTC calls](https://sspaeth.de/2025/02/how-to-resolve-stuck-matrixrtc-calls/). |
| HTTP 429 errors during calls | `rc_message` or `rc_delayed_event_mgmt` is too low. |
| LiveKit logs `secret is too short` | The secret has fewer than 32 characters. |

:::info Coming next
MSC4143 (MatrixRTC) and MSC4195 (LiveKit transport) entered final comment period on 2026-10-15 with disposition to merge ([MSC4143](https://github.com/matrix-org/matrix-spec-proposals/pull/4143), [MSC4195](https://github.com/matrix-org/matrix-spec-proposals/pull/4195)). Once they are in a spec release, expect the unstable `org.matrix.msc4143` endpoint and the experimental Synapse flags to give way to stable ones. Synapse has also deprecated `livekit_service_url`, with no removal date yet.
:::

## Further reading

- [Element Call self-hosting guide (v0.28.0)](https://github.com/element-hq/element-call/blob/v0.28.0/docs/self_hosting.md)
- [lk-jwt-service README (v0.9.0)](https://github.com/element-hq/lk-jwt-service/blob/v0.9.0/README.md)
- [LiveKit self-hosting](https://docs.livekit.io/home/self-hosting/deployment/), [ports and firewall](https://docs.livekit.io/home/self-hosting/ports-firewall/) and [`config-sample.yaml` (v1.13.10)](https://github.com/livekit/livekit/blob/v1.13.10/config-sample.yaml)
- [Synapse `matrix_rtc` config](https://element-hq.github.io/synapse/v1.163/usage/configuration/config_documentation.html#matrix_rtc)
- [Synapse: Calls](../servers/synapse#calls-element-call-and-matrixrtc)
