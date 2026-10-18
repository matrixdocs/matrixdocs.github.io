---
sidebar_position: 1
title: SDKs & Libraries Overview
description: Which Matrix SDK to use for clients, bots and bridges, as of October 2026
last_update:
  date: 2026-10-18
verified_with: "matrix-js-sdk 44.0.0, matrix-sdk 0.19.1, matrix-nio 0.26.0, mautrix-python 0.21.1, matrix-bot-sdk 0.8.0, spec v1.19"
---

# SDKs & Libraries

A Matrix SDK handles login, `/sync`, room state and, in most cases, end-to-end encryption (E2EE). This page helps you pick one. Versions and dates are as of 2026-10-18.

## Comparison

| SDK | Language | Maintainer | Release (2026-10) | E2EE | Cross-signing | Typical use |
|-----|----------|------------|-------------------|------|---------------|-------------|
| [matrix-js-sdk](./matrix-js-sdk) | JavaScript / TypeScript | Element / Matrix.org | 44.0.0 (2026-10-13) | Yes (Rust crypto via WASM) | Yes | Web clients, Element Web |
| [matrix-rust-sdk](./matrix-rust-sdk) | Rust, with Swift/Kotlin bindings | Element / Matrix.org | 0.19.1 (2026-09-18) | Yes | Yes | Native and mobile clients, Element X |
| [matrix-nio](./matrix-python-sdk#matrix-nio) | Python (asyncio) | Community | 0.26.0 (2026-07-23) | Yes (vodozemac) | No | Bots, scripts |
| [mautrix-python](./matrix-python-sdk#mautrix-python) | Python (asyncio) | mautrix (Tulir Asokan) | 0.21.1 (2026-07-05) | Yes | See its docs | maubot plugins, bots |
| [mautrix-go](https://github.com/mautrix/go) | Go | mautrix | 0.32.0 (2026-10-16) | Yes | Yes | mautrix bridges (bridgev2), gomuks |
| [matrix-bot-sdk](https://github.com/turt2live/matrix-bot-sdk) | TypeScript | turt2live | 0.8.0 (2026-01-16) | Yes (Rust crypto) | No | Node.js bots and appservices |
| [@vector-im/matrix-bot-sdk](https://github.com/element-hq/matrix-bot-sdk) | TypeScript | Element (fork) | 0.10.1-element.0 (2026-09-18) | Yes | No | Hookshot, Draupnir, matrix-appservice-bridge |
| [libQuotient](https://github.com/quotient-im/libQuotient) | C++ / Qt | Quotient | see repo | Yes | see repo | Qt clients such as NeoChat |
| [matrix-dart-sdk](https://pub.dev/packages/matrix) | Dart / Flutter | Famedly | 14.1.0 (2026-10-16) | Yes | see repo | FluffyChat, Flutter apps |
| [Trixnity](https://gitlab.com/connect2x/trixnity/trixnity) | Kotlin Multiplatform | connect2x | 5.9.2 (2026-09-17) | Yes | see repo | Kotlin/JVM/native apps |

The cross-signing column matters. Since spec v1.18, clients SHOULD NOT send room keys to devices that are not cross-signed, and SHOULD NOT display messages from them ([spec v1.19, recommended client behaviour](https://spec.matrix.org/v1.19/client-server-api/#recommended-client-behaviour), MSC4153). A bot built on an SDK without cross-signing should expect to lose access to encrypted rooms as clients enforce this. See [Building bots](../bots/building-bots#e2ee-and-cross-signing).

:::warning Don't `pip install matrix-python-sdk`
matrix-org's old `matrix-python-sdk` (published on PyPI as `matrix-client`) has been dead since 2021–22. The PyPI name `matrix-python-sdk` now belongs to an **unrelated project**. Use matrix-nio or mautrix-python instead. See [Python SDKs](./matrix-python-sdk).
:::

## Choosing an SDK

- **Web client:** matrix-js-sdk. Version 44 is ESM-only and needs Node.js 22 or later for tooling and tests.
- **Mobile or desktop client:** matrix-rust-sdk. Element X uses it through the Swift and Kotlin bindings. The `matrix-sdk-ui` crate provides the room list and timeline.
- **Bot, Python:** write a [maubot](../bots/maubot) plugin (mautrix-python underneath), or use matrix-nio directly for small scripts.
- **Bot, TypeScript:** matrix-bot-sdk, or Element's fork if you want what Hookshot and Draupnir run on.
- **Bridge:** mautrix-go (bridgev2) or matrix-appservice-bridge (TypeScript).

## Things every SDK user now meets

| Topic | What changed | Spec |
|-------|--------------|------|
| Authenticated media | Media downloads moved to `/_matrix/client/v1/media/download/{serverName}/{mediaId}` (and `thumbnail`) and need an access token. Many servers no longer serve new media on the old unauthenticated endpoints. | [v1.11, content repository](https://spec.matrix.org/v1.19/client-server-api/#content-repository) |
| OAuth 2.0 login | Servers using Matrix Authentication Service (MAS) use the OAuth 2.0 API. matrix.org switched in 2025-04. Password login may not be offered. | [v1.15, OAuth 2.0 API](https://spec.matrix.org/v1.19/client-server-api/#oauth-20-api) |
| Room version 12 | Room IDs have no `:server` part, and room creators outrank every power level. Don't parse a server name out of a room ID. | [Room version 12](https://spec.matrix.org/v1.19/rooms/v12/) |
| Sliding sync | Element X uses Simplified Sliding Sync (MSC4186). It was accepted in 2026-06 but is not in spec v1.19. The old sliding-sync proxy (MSC3575) was shut down on matrix.org in 2024-11. | [MSC4186](https://github.com/matrix-org/matrix-spec-proposals/pull/4186) |

matrix-js-sdk and matrix-rust-sdk support OAuth 2.0 login (js-sdk exports OAuth helpers; Rust has `client.oauth()`). The Python and bot SDKs mostly expect an access token. On a MAS server you get one as a personal access token; see [Getting a bot account](../bots/building-bots#getting-a-bot-account).

## Minimal examples

Each SDK page has one short example, type-checked against the release named in its front matter:

- [matrix-js-sdk: log in, sync, send](./matrix-js-sdk#a-minimal-client)
- [matrix-rust-sdk: log in, sync, reply](./matrix-rust-sdk#a-minimal-bot)
- [matrix-nio and mautrix-python](./matrix-python-sdk)

## Resources

- [Matrix specification v1.19](https://spec.matrix.org/v1.19/)
- [SDK list on matrix.org](https://matrix.org/ecosystem/sdks/)
- [#matrix-dev:matrix.org](https://matrix.to/#/#matrix-dev:matrix.org): developer chat
