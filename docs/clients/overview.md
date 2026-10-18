---
sidebar_position: 1
title: Matrix Clients Overview
description: Matrix clients for every platform, and how to choose one
last_update:
  date: 2026-10-18
verified_with: "Element Web 1.12.32, Element X Android 26.09.4 (and 26.10.0 pre-release), Cinny 4.12.7, FluffyChat 2.10.0 (release notes and repos checked 2026-10-18)"
---

# Matrix Clients

Matrix is an open protocol, so you can pick any client and switch later. Your account and rooms live on your homeserver, not in the app. The official list is at [matrix.org/ecosystem/clients](https://matrix.org/ecosystem/clients/).

## Quick picks (as of 2026-10)

| Use case | Clients |
|----------|---------|
| **Desktop / browser, full-featured** | Element Web / Desktop |
| **Mobile** | Element X, FluffyChat |
| **Lightweight desktop / web** | Cinny, Nheko, Fractal (GNOME), NeoChat (KDE) |
| **Terminal** | iamb; gomuks terminal (experimental) |
| **Self-hosted web client with its own backend** | gomuks web |

## Element family

Element is developed by Element, the company that also develops Synapse.

### Element Web / Desktop

- **Platforms**: browser, Windows, macOS, Linux
- **Status**: active; Element Web 1.12.32 (2026-10-16)
- **Strengths**: the most complete feature set: threads, spaces, Element Call video rooms, widgets, developer tools
- **Weaknesses**: heavy (Electron on desktop); one account at a time

[Element guide →](./element)

### Element X (mobile)

- **Platforms**: Android, iOS
- **Status**: Element's main mobile app, built on matrix-rust-sdk
- **Strengths**: fast startup through simplified sliding sync; Element Call voice and video; spaces (on Android, creating them is on by default since 26.02, 2026-02); OAuth 2.0 login
- **Limits**: needs a homeserver that supports simplified sliding sync (Synapse does natively). As of 2026-10, Element's [migration FAQ](https://docs.element.io/latest/element-server-suite-pro/migration/classic-to-pro-mobile-apps-faq/) says it still lacks widgets and slash commands. There is no Element X for desktop; use Element Web or Desktop there.

### Element Classic (old mobile apps)

The original Element Android and iOS apps are now called **Element Classic** and get security fixes only. Element's migration FAQ (the only source for these dates found so far) says an in-app banner will push users to Element X from 2026-11-15, and the apps will leave the stores on 2026-12-31. Installed copies keep working. New users should install Element X.

## Other clients

### Cinny

- **Platforms**: web ([app.cinny.in](https://app.cinny.in)), desktop (Tauri)
- **Status**: active; v4.12.7 (2026-09-15)
- **Strengths**: clean Discord-like layout, spaces, custom emoji and stickers, voice/video rooms through the Element Call library (since v4.11, 2026-03) and calls in DMs and rooms (since v4.12, 2026-05)
- **Limits**: no native mobile app (the web app works on phones); thread support is partial

[cinny.in](https://cinny.in)

### FluffyChat

- **Platforms**: Android, iOS, web, desktop (Flutter)
- **Status**: very active; v2.10.0 (2026-10-02)
- **Strengths**: friendly UI, several accounts at once, threads (since v2.3.0), spaces, video calls through MatrixRTC

[fluffychat.im](https://fluffychat.im)

### SchildiChat

SchildiChat's original apps were forks of the old Element apps. Both are being replaced:

- **SchildiChat Next** (Android): a fork of Element X, in beta. [GitHub](https://github.com/SchildiChat/schildichat-android-next)
- **SchildiChat Revenge** (desktop and Android): a new Kotlin client on matrix-rust-sdk, in beta, keyboard-driven and multi-account. Desktop builds are on [GitHub](https://github.com/SchildiChat/schildi-revenge); Android builds are on Google Play and the developer's F-Droid repo.
- The old **SchildiChat Desktop/Web** is archived, and classic **SchildiChat Android** carries a deprecation notice.

[schildi.chat](https://schildi.chat)

### Nheko

- **Platforms**: Linux, Windows, macOS (Qt/C++)
- **Status**: maintained, rare releases; v0.12.1 (2025-08-10)
- **Strengths**: native desktop app, low resource use, E2EE with cross-signing

[nheko-reborn.github.io](https://nheko-reborn.github.io)

### Fractal and NeoChat

- **Fractal** is GNOME's client, written in Rust on matrix-rust-sdk (14.1, 2026-07-19).
- **NeoChat** is KDE's client, shipped with KDE Gear (26.08.2, 2026-10-08).

### gomuks

gomuks is now split into a backend and frontends. **gomuks web** is the main frontend, with Electron and Android wrappers; the terminal frontend is still experimental. See [Alternative clients](./alternatives#gomuks).

### iamb

A Rust terminal client with Vim-style keys, E2EE, threads and spaces. v0.0.12 (2026-09-20). [iamb.chat](https://iamb.chat)

## Feature support

This table reflects release notes and documentation checked on 2026-10-18. Clients change quickly; check each project's release notes before relying on a feature.

| Client | E2EE | Threads | Spaces | Voice/Video | Multi-account | Platforms |
|--------|------|---------|--------|-------------|---------------|-----------|
| Element Web/Desktop | ✅ | ✅ | ✅ | ✅ (Element Call) | ❌ | Web, desktop |
| Element X | ✅ | ✅ (may need Labs) | ✅ | ✅ (Element Call) | Android 26.10.0 pre-release | Android, iOS |
| Cinny | ✅ | 🔄 partial | ✅ | ✅ (calls and voice/video rooms) | ❌ | Web, desktop |
| FluffyChat | ✅ | ✅ | ✅ | ✅ (MatrixRTC video calls) | ✅ | Mobile, web, desktop |
| Nheko | ✅ | 🔄 | ✅ | 🔄 (varies by platform) | 🔄 | Desktop |
| SchildiChat Revenge | ✅ | 🔄 | ✅ | ❌ | ✅ | Desktop, Android |

✅ supported · 🔄 partial or limited · ❌ not supported

## Choosing a client

### New to Matrix
**Element X** on your phone and **Element Web** on your computer. Most help pages assume Element.

### Coming from Discord
**Cinny** has the most familiar layout.

### Desktop users who want a native app
**Nheko** (Qt), **Fractal** (GNOME) or **NeoChat** (KDE).

### Several accounts
**FluffyChat** or **SchildiChat Revenge**. Element Web does not support more than one account.

### Terminal
**iamb**. gomuks terminal exists but is experimental.

## Further resources

- [matrix.org/ecosystem/clients](https://matrix.org/ecosystem/clients/): the official client list
- [Element](./element): using Element in depth
- [Alternative clients](./alternatives): install details for other clients
- [Comparison](./comparison): side-by-side tables
