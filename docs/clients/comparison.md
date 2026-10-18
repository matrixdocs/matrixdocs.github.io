---
sidebar_position: 4
title: Client Comparison
description: Side-by-side comparison of popular Matrix clients
last_update:
  date: 2026-10-18
verified_with: "release notes, READMEs and release assets of each client, checked 2026-10-18"
---

# Client Comparison

These tables compare the most-used Matrix clients as of 2026-10. They are built from each project's release notes, README and published downloads. Clients change monthly, so check the project before relying on one feature.

## Features

| Feature | Element Web/Desktop | Element X | Cinny | FluffyChat | Nheko |
|---------|---------|-----------|-------|------------|-------|
| **E2EE with cross-signing** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Key backup / recovery key** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Spaces** | ✅ | ✅ (including creating them) | ✅ | ✅ | ✅ |
| **Threads** | ✅ | ✅ (may need Labs) | 🔄 partial | ✅ (since v2.3.0) | 🔄 |
| **Voice/video calls** | ✅ Element Call | ✅ Element Call | ✅ voice/video rooms (v4.11+) | ✅ MatrixRTC | 🔄 varies by platform |
| **Several accounts** | ❌ | Android 26.10+ | ❌ | ✅ | 🔄 |

✅ supported · 🔄 partial · ❌ not supported

Since spec v1.18 (MSC4153), clients are expected to stop sharing room keys with devices their owner has not cross-signed, and to hide messages from such devices. Element's apps are rolling this out; check each client for its own behaviour.

## Platforms

| Platform | Element Web/Desktop | Element X | Cinny | FluffyChat | Nheko | SchildiChat Revenge |
|----------|---------|-----------|-------|------------|-------|-----|
| **Web** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Windows** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **macOS** | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| **Linux** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Android** | Classic only | ✅ | ❌ | ✅ | ❌ | ✅ |
| **iOS** | Classic only | ✅ | ❌ | ✅ | ❌ | ❌ |

"Classic only" means the old Element mobile app, which gets security fixes only; use Element X instead. SchildiChat Revenge publishes Linux and Windows desktop packages (no macOS build as of v26.10.18); see its [releases](https://github.com/SchildiChat/schildi-revenge/releases).

## Technology

| Client | Built with | Notes |
|--------|-----------|-------|
| Element Web/Desktop | TypeScript, React; Desktop is Electron | Moving onto matrix-rust-sdk piece by piece |
| Element X | Kotlin / Swift on matrix-rust-sdk | Needs simplified sliding sync on the server |
| Cinny | TypeScript, React; Desktop is Tauri | Lighter than Electron apps |
| FluffyChat | Flutter (Dart), matrix-dart-sdk | |
| Nheko | C++ / Qt | Native desktop app |
| SchildiChat Revenge | Kotlin / Compose on matrix-rust-sdk | Beta |

We do not publish RAM or startup-time numbers: they depend heavily on account size and platform, and no reproducible benchmark exists.

## Recommendations

### Organizations

Element Web/Desktop and Element X, or Element's commercial offering (Element Pro and Element Server Suite) if you need support, admin tooling and compliance features.

### Communities

Element Web/Desktop for moderators (full room settings, developer tools, widgets). Cinny is a good choice for members who like a Discord-style layout.

### Personal use

Element X or FluffyChat on mobile; Element, Cinny or a native desktop client on the computer.

### Terminal and keyboard users

iamb in the terminal. SchildiChat Revenge is keyboard-driven on desktop. gomuks web can be self-hosted and used from a browser.

## Moving between clients

Your account lives on your homeserver, so you can use several clients at once or switch at any time:

1. Install the new client.
2. Sign in with the same account.
3. Verify the new session from an existing device, or enter your recovery key.
4. Sign out of the old client if you no longer need it.

### What carries over

| Data | Carries over? | Notes |
|------|------------|-------|
| Messages | ✅ | Stored on the server |
| Room memberships | ✅ | Stored on the server |
| Encrypted message history | ✅ | Through key backup (recovery key) or verification |
| Account data (e.g. DM list, ignored users) | ✅ | Stored on the server |
| App settings and themes | ❌ | Client-specific |

## Try without installing

| Client | Web version |
|--------|-------------|
| Element | [app.element.io](https://app.element.io) |
| Cinny | [app.cinny.in](https://app.cinny.in) |
| FluffyChat | [fluffychat.im/web](https://fluffychat.im/web) |

---

*Next: [Servers Overview](../servers/overview) →*
