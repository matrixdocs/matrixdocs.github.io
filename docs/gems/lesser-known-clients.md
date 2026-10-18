---
sidebar_position: 3
title: Lesser-Known Clients
description: Matrix clients beyond Element, with their maintenance status as of 2026-10
last_update:
  date: 2026-10-18
verified_with: "project repositories and releases checked 2026-10-18"
---

# Lesser-Known Clients

Matrix has many clients besides Element. This page lists the less obvious ones and says plainly which are maintained. Release dates and activity were checked on 2026-10-18. For the full list, see [matrix.org/ecosystem/clients](https://matrix.org/ecosystem/clients/).

## Terminal and lightweight clients

### gomuks

[gomuks](https://github.com/gomuks/gomuks) (v0.2610.0, 2026-10-16) is a Go backend with several frontends:

- **gomuks web** is the main frontend and is ready for daily use. It also comes as an Electron desktop app, an Android wrapper and a wasm build.
- **gomuks terminal** is an experimental port of the legacy terminal client and supports little beyond basic chat.

Install from the [releases](https://github.com/gomuks/gomuks/releases) or see [docs.mau.fi/gomuks](https://docs.mau.fi/gomuks/). The Go module is now `go.mau.fi/gomuks`; the old `maunium.net/go/gomuks` path gives you the legacy v0.3 client. The backend's web listener is set in its config as `web.listen_address`, which defaults to `localhost:29325`. Keep it on localhost, or put it behind a TLS reverse proxy. The 2026 releases added OAuth (next-gen auth) login and full-text search.

### iamb

[iamb](https://github.com/ulyssa/iamb) (v0.0.12, 2026-09-20) is a Rust terminal client with Vim-style modal editing, windows and splits.

```bash
cargo install --locked iamb
```

### weechat-matrix (dormant)

[weechat-matrix](https://github.com/poljar/weechat-matrix) is a WeeChat plugin. It has had no commits since 2023-07, and its README says development has moved to `weechat-matrix-rs`. It isn't installed through WeeChat's script manager; follow the README's install steps if you still want it.

---

## Mobile

### Element X

Element X ([Android](https://github.com/element-hq/element-x-android), [iOS](https://github.com/element-hq/element-x-ios)) is now Element's main mobile app. It is built on matrix-rust-sdk and uses sliding sync. In 2026 it gained spaces management, a thread list and live location sharing. It is mobile only; there is no Element X desktop or web app.

:::info Coming next
Element's docs FAQ says Element Classic mobile shows a migration banner from 2026-11-15 and leaves the app stores on 2026-12-31 ([Element FAQ](https://docs.element.io/latest/element-server-suite-pro/migration/classic-to-pro-mobile-apps-faq/)).
:::

### SchildiChat Next

[SchildiChat Next](https://github.com/SchildiChat/schildichat-android-next) is an Element X Android fork with SchildiChat's tweaks (beta). The legacy SchildiChat Android app is barely maintained.

### FluffyChat

[FluffyChat](https://github.com/krille-chan/fluffychat) (v2.10.0, 2026-10-02) is a Flutter client for Android, iOS, web and desktop. It supports multiple accounts, voice messages, polls and threads.

---

## Desktop

| Client | Toolkit | Status (2026-10) |
|--------|---------|------------------|
| [SchildiChat Revenge](https://github.com/SchildiChat/schildi-revenge) | Kotlin/Compose on matrix-rust-sdk | Beta; keyboard-driven, multi-account; desktop and Android. Successor to SchildiChat Desktop, which is no longer maintained |
| [Nheko](https://github.com/Nheko-Reborn/nheko) | Qt | Maintained; v0.12.1 (2025-08-10). Custom emoji packs, VoIP via GStreamer |
| [NeoChat](https://invent.kde.org/network/neochat) | KDE / Qt | Active, ships with KDE Gear (v26.08.2). Successor to Spectral |
| [Fractal](https://gitlab.gnome.org/World/fractal) | GNOME / Rust | Active; Fractal 14.1 (2026-07-19) |
| [Quaternion](https://github.com/quotient-im/Quaternion) | Qt / libQuotient | Slow; 0.0.97.1 (2025-03-21) |
| [Commet](https://github.com/commetchat/commet) | Flutter | Active; v0.5.0 (2026-09-24). Windows, Linux and Android; spaces, threads, multi-account, custom emoji, GIF search |

### Cinny

[Cinny](https://github.com/cinnyapp/cinny) (v4.12.7, 2026-09-15) is a web and desktop client that aims for a "simple, elegant and secure interface" (its README). It supports custom emoji packs natively. Developer tools are under **Settings → Developer tools**; Cinny has no `/devtools` command.

---

## Read-only and archive tools

- [Matrix Viewer](https://github.com/matrix-org/matrix-viewer), formerly Matrix Public Archive, renders public rooms as web pages that can be read without an account. It runs at [archive.matrix.org](https://archive.matrix.org).
- [matrix-static](https://github.com/matrix-org/matrix-static) is **archived** (2023-05).

---

## Beeper

[Beeper](https://www.beeper.com) is a commercial multi-network chat app, owned by Automattic since 2024-04. In 2025-07 it relaunched with an on-device model, so network connections can run on your device instead of only in Beeper's cloud. Beeper's developer docs say its bridges are open source and built on mautrix-go. To self-host similar bridges on your own homeserver, see [Bridges](../bridges/overview).

---

## Dormant or discontinued

Older guides often recommend these. As of 2026-10 none is a good choice for daily use:

| Project | Status |
|---------|--------|
| [Hydrogen](https://github.com/element-hq/hydrogen-web) | Last release v0.5.1 (2024-10); README: "not yet ready for primetime" |
| [Syphon](https://github.com/syphon-org/syphon) | Last release 0.2.14 (2022-10) |
| [Mirage](https://github.com/mirukana/mirage) | No activity since 2023-11 |
| [Spectral](https://github.com/spectral-im/spectral) | Discontinued; continued as NeoChat |
| [Third Room](https://github.com/matrix-org/thirdroom) | 3D/virtual-world client; discontinued, no activity since 2023-08 |
| [Cactus Comments](https://cactus.chat) | Matrix-based website comments; the hosted embed (`latest.cactus.chat`) did not resolve on 2026-10-18 |
| SchildiChat Web/Desktop | Deprecated in favour of SchildiChat Revenge |

[Populus](https://github.com/lottec-ufpb/populus-viewer) describes itself as "a social annotation tool powered by Matrix". It is not a whiteboard.

---

## Choosing a client

| Question | Why it matters |
|----------|----------------|
| Does it support E2EE with cross-signing and key backup? | Without these you can't read encrypted history on new devices |
| Does it support your server's login (password or next-gen auth/OIDC)? | Servers using Matrix Authentication Service need OIDC-capable clients |
| When was the last release? | Unmaintained clients fall behind on security fixes |
| Does it support room v12? | New rooms default to v12 |
