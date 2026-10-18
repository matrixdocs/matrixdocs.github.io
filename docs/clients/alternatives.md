---
sidebar_position: 3
title: Alternative Clients
description: Matrix clients beyond Element, with install details
last_update:
  date: 2026-10-18
verified_with: "Flathub, Homebrew, crates.io, App Store and Google Play listings, and each project's GitHub repo, checked 2026-10-18"
---

# Alternative Clients

Element is not the only option. The clients below are maintained as of 2026-10 unless marked otherwise. Every install ID on this page was checked against its store or registry on 2026-10-18.

## Desktop and web

### Cinny

Web and desktop client with a Discord-like layout.

- **Status**: active; v4.12.7 (2026-09-15)
- **Web**: [app.cinny.in](https://app.cinny.in)
- **Desktop**: [cinny-desktop releases](https://github.com/cinnyapp/cinny-desktop/releases) (Tauri), or Flathub:

```bash
flatpak install flathub in.cinny.Cinny
```

**Notable features**:
- Spaces, custom emoji and sticker packs
- Customizable power levels and developer tools for inspecting room state (Cinny 4.x)
- Voice/video rooms using the Element Call library (since v4.11, 2026-03), and calls in DMs and rooms (since v4.12, 2026-05)
- Thread support is still partial

### Nheko

Native Qt/C++ desktop client for Linux, Windows and macOS.

- **Status**: maintained, infrequent releases; v0.12.1 (2025-08-10)

```bash
# Linux (Flatpak)
flatpak install flathub im.nheko.Nheko

# macOS (Homebrew cask)
brew install --cask nheko
```

Windows builds are on the [releases page](https://github.com/Nheko-Reborn/nheko/releases).

**Notable features**: E2EE with cross-signing and verification, spaces, voice and video calls (support varies by platform), low resource use compared with Electron apps.

[nheko-reborn.github.io](https://nheko-reborn.github.io)

### Fractal

GNOME's Matrix client, written in Rust on matrix-rust-sdk.

- **Status**: active; 14.1 (2026-07-19)

```bash
flatpak install flathub org.gnome.Fractal
```

### NeoChat

KDE's Matrix client, released with KDE Gear.

- **Status**: active; 26.08.2 (2026-10-08)

```bash
flatpak install flathub org.kde.neochat
```

[apps.kde.org/neochat](https://apps.kde.org/neochat/)

### Quaternion

Qt desktop client built on libQuotient.

- **Status**: slow; last release 0.0.97.1 (2025-03-21)

```bash
flatpak install flathub io.github.quotient_im.Quaternion
```

### Commet

Flutter client for Windows, Linux and Android (macOS and iOS planned), with threads, spaces, custom emoji and several accounts at once.

- **Status**: active; v0.5.0 (2026-09-24)
- **Install**: [commet.chat](https://commet.chat)

### Hydrogen

Lightweight web client from Element.

- **Status**: effectively dormant; last release v0.5.1 (2024-10-21). Its README calls it a work in progress. Prefer Cinny or Element Web for daily use.

## Mobile

### Element X

Element's current mobile app. See [Element](./element#mobile-element-x) for details.

- **Android**: [Google Play](https://play.google.com/store/apps/details?id=io.element.android.x) | [F-Droid](https://f-droid.org/packages/io.element.android.x/)
- **iOS**: [App Store](https://apps.apple.com/app/element-x-secure-chat-call/id1631335820)

### FluffyChat

Friendly Flutter client for Android, iOS, web and desktop.

- **Status**: very active; v2.10.0 (2026-10-02)
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=chat.fluffy.fluffychat) | [F-Droid](https://f-droid.org/packages/chat.fluffy.fluffychat/)
- **iOS**: [App Store](https://apps.apple.com/app/fluffychat/id1551469600)
- **Linux**:

```bash
flatpak install flathub im.fluffychat.Fluffychat
```

**Notable features**: several accounts at once, threads (since v2.3.0), spaces, video calls through MatrixRTC, presence status messages. (The old "Stories" feature was removed in v1.17.0.)

### SchildiChat

The original SchildiChat apps were forks of the old Element apps. They are being replaced:

- **SchildiChat Next** (Android): a fork of Element X with extra options, in beta. [Google Play](https://play.google.com/store/apps/details?id=chat.schildi.android) | [F-Droid](https://f-droid.org/packages/chat.schildi.android) | [GitHub](https://github.com/SchildiChat/schildichat-android-next)
- **SchildiChat Revenge** (desktop and Android): a new Kotlin/Compose client on matrix-rust-sdk, in beta. Keyboard-driven, with multi-account and a merged inbox. Desktop: [GitHub releases](https://github.com/SchildiChat/schildi-revenge/releases). Android: [Google Play](https://play.google.com/store/apps/details?id=chat.schildi.revenge) or the developer's F-Droid repo listed in the README.
- **SchildiChat Desktop/Web** (the Element Web fork) is archived. Classic **SchildiChat Android** has a deprecation notice.

[schildi.chat](https://schildi.chat)

## Terminal and self-hosted web

### gomuks {#gomuks}

gomuks has been rewritten. It is now a **backend** plus several **frontends**:

- **gomuks web** is the main frontend and is ready for daily use. It also comes wrapped as an Electron desktop app and an Android app.
- **gomuks terminal** is a port of the old terminal client. Its README calls it experimental, with few features beyond basic chatting.

- **Status**: active; v0.2610.0 (2026-10-16). The Go module is now `go.mau.fi/gomuks`.
- **Install**: download a binary from [GitHub releases](https://github.com/gomuks/gomuks/releases), or use the Docker image described in the [gomuks docs](https://docs.mau.fi/gomuks/). A plain `go install` does not build the web frontend.

On first run, gomuks asks you to create basic-auth credentials. The web UI is then at `http://localhost:29325`. To reach it from another machine, change `listen_address` and `origin_patterns` in the config file and put it behind HTTPS.

:::warning
The gomuks backend holds your Matrix session and encryption keys. Do not expose it beyond localhost without HTTPS and strong credentials.
:::

gomuks supports one account per backend; run several backends for several accounts.

### iamb

Rust terminal client with Vim-style keybindings. Supports threads, spaces, E2EE and read receipts.

- **Status**: active; v0.0.12 (2026-09-20)

```bash
cargo install --locked iamb
```

Also packaged for Arch (AUR), FreeBSD and others; see [iamb.chat](https://iamb.chat).

### weechat-matrix

A Python plugin for WeeChat.

- **Status**: dormant; last commit 2023-07. It has its own E2EE through matrix-nio and libolm (which is deprecated), without cross-signing.
- Install from your distribution's package if available, or follow the [README](https://github.com/poljar/weechat-matrix).
- A Rust rewrite, [weechat-matrix-rs](https://github.com/poljar/weechat-matrix-rs), is in progress; its README says it can connect and send messages but "doesn't do much yet".

## Multi-network apps

### Beeper

Beeper is a chat app that bridges many networks (WhatsApp, Signal, Telegram and others) through Matrix. It has been owned by Automattic since 2024. Beeper offers a free plan and an optional paid subscription ([FAQ](https://www.beeper.com/faq)). The supported networks change often, so check Beeper's site for the current list.

If you prefer to run bridges yourself on your own homeserver, see [Bridges](../bridges/overview). Beeper's [bridge-manager](https://github.com/beeper/bridge-manager) tool can also run self-hosted bridges against a Beeper account.

## No longer recommended

These clients still appear in older guides but are unmaintained:

| Client | Last release | Why not |
|--------|-------------|---------|
| Syphon | 0.2.14 (2022-10) | Abandoned alpha; do not trust it with E2EE |
| SchildiChat Desktop | — | Archived; use SchildiChat Revenge |
| Hydrogen | v0.5.1 (2024-10) | Dormant |
| weechat-matrix | none | Dormant; uses deprecated libolm |

## Choosing

| Need | Suggested clients |
|------|-------------------|
| Discord-like layout | Cinny, Commet |
| Native Linux desktop | Fractal (GNOME), NeoChat (KDE), Nheko |
| Several accounts | FluffyChat, Commet, SchildiChat Revenge |
| Terminal | iamb |
| Self-hosted web client | gomuks web |
| Keyboard-driven desktop | SchildiChat Revenge, iamb |

---

*Next: [Client Comparison](./comparison) →*
