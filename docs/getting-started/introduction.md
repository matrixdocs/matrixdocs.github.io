---
sidebar_position: 1
title: Introduction to Matrix
description: Learn what Matrix is and why it matters for decentralized communication
---

# Introduction to Matrix

Matrix is an **open standard** for secure, decentralized, real-time communication. Think of it as an open protocol for messaging, similar to how email works - anyone can run their own server, and all servers can communicate with each other.

## Why Matrix?

### Decentralized by Design

Unlike WhatsApp, Slack, or Discord, Matrix doesn't rely on a single company's servers. You can:

- **Run your own server** (homeserver) with full control over your data
- **Choose any client** you prefer - not locked into one app
- **Federate** with the global Matrix network or run isolated

### End-to-End Encryption

Matrix uses the [Olm and Megolm](https://matrix.org/docs/matrix-concepts/end-to-end-encryption/) cryptographic protocols (the same underlying technology as Signal) for optional end-to-end encryption in rooms.

### Bridges to Other Platforms

Matrix can bridge to virtually any chat platform:
- Discord, Slack, Telegram, IRC
- WhatsApp, Signal, iMessage
- MS Teams, and more

This means you can use Matrix as your **unified inbox** for all messaging.

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Homeserver** | A server that stores your account and messages. Examples: Synapse, Dendrite, Conduit |
| **Matrix ID** | Your unique identifier, like `@username:homeserver.org` |
| **Room** | A conversation space. Can be 1:1, group, or public |
| **Space** | A way to organize rooms into communities |
| **Federation** | Homeservers talking to each other across the network |

## Who Uses Matrix?

Matrix has been adopted by:

- **Governments**: France (Tchap), Germany (BwMessenger), European Commission
- **Organizations**: Mozilla, KDE, GNOME, Wikimedia
- **Companies**: Element, Beeper, Automattic

:::tip Power User Insight
Matrix IDs follow the format `@localpart:server.name`. The server part tells you which homeserver the user is registered on, but thanks to federation, users from different servers can chat seamlessly.
:::

## Getting Started

Ready to dive in? Here's your path:

1. **[Core Concepts](/getting-started/concepts)** - Understand how Matrix works
2. **[Quick Start](/getting-started/quick-start)** - Get chatting in minutes
3. **[Your First Room](/getting-started/your-first-room)** - Create and manage rooms

## External Resources

- [Matrix.org](https://matrix.org) - Official Matrix Foundation website
- [Matrix Spec](https://spec.matrix.org) - Technical specification
- [Element](https://element.io) - Most popular Matrix client
- [Try Matrix](https://app.element.io) - Start using Matrix right now

---

*Next: [Core Concepts](/getting-started/concepts) →*
