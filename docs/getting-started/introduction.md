---
sidebar_position: 1
title: Introduction to Matrix
description: Learn what Matrix is and why it matters for decentralized communication
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0"
---

# Introduction to Matrix

Matrix is an **open standard** for secure, decentralized, real-time communication. It works a bit like email: anyone can run a server, and servers talk to each other, so people on different servers can chat in the same rooms.

The protocol is published by the Matrix.org Foundation at [spec.matrix.org](https://spec.matrix.org). This guide is unofficial; when in doubt, the spec and each project's own documentation win.

## Why Matrix?

### Decentralized by design

Unlike WhatsApp, Slack or Discord, Matrix does not depend on one company's servers. You can:

- **Run your own server** (a homeserver) and keep control of your data
- **Choose any client** you like; you are not locked into one app
- **Federate** with the public Matrix network, or run a closed deployment

### End-to-end encryption

Matrix uses the [Olm and Megolm](https://matrix.org/docs/matrix-concepts/end-to-end-encryption/) protocols, which build on the Double Ratchet design also used by Signal. Element and Element X turn end-to-end encryption on by default for direct messages and private rooms. Public rooms are usually not encrypted.

The main implementation of these protocols is now [vodozemac](https://github.com/matrix-org/vodozemac), written in Rust (0.11.1, 2026-09-30). The older C library libolm was [deprecated in August 2024](https://matrix.org/blog/2024/08/libolm-deprecation/).

### Bridges to other platforms

Bridges connect Matrix rooms to other networks such as IRC, Telegram, Signal, WhatsApp, Slack and Discord. Coverage and quality vary by network and change when those networks change their APIs; see [Bridges](../bridges/overview) for details.

## Key concepts

| Concept | Description |
|---------|-------------|
| **Homeserver** | A server that stores your account and the rooms you are in. Examples: Synapse, Dendrite (maintenance mode), continuwuity and tuwunel (Conduit forks) |
| **Matrix ID** | Your unique identifier, like `@username:homeserver.org` |
| **Room** | A conversation: a DM, a group chat or a public channel |
| **Space** | A room that groups other rooms into a community |
| **Federation** | Homeservers exchanging room events with each other |

:::tip
Matrix IDs follow the format `@localpart:server.name`. The server part tells you which homeserver the user is registered on. Federation lets users on different servers share rooms.
:::

## Matrix 2.0

"Matrix 2.0" is the Foundation's name for four pieces of work [announced together in October 2024](https://matrix.org/blog/2024/10/29/matrix-2.0-is-here/). As of 2026-10 the spec version has not been renamed 2.0, but most of the pieces are in use:

- **Simplified sliding sync** (MSC4186): fast startup for large accounts. Synapse implements it natively, and Element X needs it.
- **Next-generation auth**: login through OAuth 2.0, in the spec since v1.15 ([OAuth 2.0 API](https://spec.matrix.org/v1.19/client-server-api/#oauth-20-api)). The Matrix Authentication Service (MAS) provides it for Synapse. matrix.org [moved to MAS](https://matrix.org/blog/2025/04/morg-now-running-mas/) in April 2025.
- **MatrixRTC / Element Call**: voice and video calls signalled over Matrix, with media through LiveKit.
- **Invisible crypto** (MSC4153, a spec recommendation since v1.18): clients stop sharing keys with devices their owner has not verified, which removes most per-device verification prompts.

**Element X** is Element's current mobile app and is built on these features. The older Element mobile apps are now called "Element Classic"; see [Element](../clients/element).

## Who uses Matrix?

Public examples include:

- **Public sector**: France (Tchap), the German armed forces (BwMessenger), Germany's openDesk workplace suite, the gematik TI-Messenger standard for German healthcare, and a trial at the European Commission. Several of these presented at the [2025 Matrix Conference](https://matrix.org/blog/2025/10/dinum/).
- **Open source communities**: KDE, GNOME and Mozilla run their chat on Matrix.
- **Companies**: Element (which develops Synapse and the Element apps) and Beeper (owned by Automattic).

## Getting started

1. **[Core Concepts](./concepts)**: how Matrix works
2. **[Quick Start](./quick-start)**: get an account and a client
3. **[Your First Room](./your-first-room)**: create and manage rooms

## External resources

- [matrix.org](https://matrix.org): the Matrix.org Foundation
- [spec.matrix.org](https://spec.matrix.org): the specification
- [matrix.org/ecosystem/clients](https://matrix.org/ecosystem/clients/): the official client list
- [app.element.io](https://app.element.io): Element in the browser

---

*Next: [Core Concepts](./concepts) →*
