---
sidebar_position: 3
title: matrix-rust-sdk
description: The Rust Matrix SDK behind Element X, with Swift and Kotlin bindings
last_update:
  date: 2026-10-18
verified_with: "matrix-sdk 0.19.1 (example checked with cargo check), spec v1.19"
---

# matrix-rust-sdk

A Matrix client SDK written in Rust, maintained by Element and the Matrix.org Foundation. Element X (iOS and Android) is built on it, and Element Web uses its crypto crate through `matrix-sdk-crypto-wasm`.

As of 2026-10:

| Package | Version | Notes |
|---------|---------|-------|
| [`matrix-sdk`](https://crates.io/crates/matrix-sdk) (crate) | 0.19.1 (2026-09-18) | MSRV Rust 1.96. Default features include `e2e-encryption` and `sqlite`. |
| [`matrix-sdk-ui`](https://crates.io/crates/matrix-sdk-ui) (crate) | same release train | Room list, timeline and sync service used by Element X |
| Swift package [`matrix-rust-components-swift`](https://github.com/element-hq/matrix-rust-components-swift) | 26.10.15 | UniFFI bindings, calendar-style versions |
| Kotlin `org.matrix.rustcomponents:sdk-android` | 26.10.15 | UniFFI bindings on Maven Central |
| [`@matrix-org/matrix-sdk-crypto-wasm`](https://github.com/matrix-org/matrix-sdk-crypto-wasm) | 18.9.0 (2026-09-21) | Crypto only; used by matrix-js-sdk |

There are no official Python or Go bindings.

## Installation

```toml title="Cargo.toml"
[dependencies]
matrix-sdk = "0.19"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
anyhow = "1"
```

## A minimal bot

This logs in, stores state and keys in SQLite, skips old messages and answers `!ping`. It was checked with `cargo check` against matrix-sdk 0.19.1.

```rust
use matrix_sdk::{
    Client, Room, RoomState,
    config::SyncSettings,
    ruma::events::room::message::{
        MessageType, OriginalSyncRoomMessageEvent, RoomMessageEventContent,
    },
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = Client::builder()
        .homeserver_url("https://matrix.example.org")
        .sqlite_store("./store", None) // persists sync state and E2EE keys
        .build()
        .await?;

    client
        .matrix_auth()
        .login_username("bot", &std::env::var("BOT_PASSWORD")?)
        .initial_device_display_name("example bot")
        .send()
        .await?;

    // Sync once first, so the handler doesn't answer old messages.
    let response = client.sync_once(SyncSettings::default()).await?;

    client.add_event_handler(|ev: OriginalSyncRoomMessageEvent, room: Room| async move {
        if room.state() != RoomState::Joined {
            return;
        }
        let MessageType::Text(text) = ev.content.msgtype else { return };
        if text.body == "!ping" {
            let content = RoomMessageEventContent::text_plain("pong");
            if let Err(e) = room.send(content).await {
                eprintln!("send failed: {e}");
            }
        }
    });

    client.sync(SyncSettings::default().token(response.next_batch)).await?;
    Ok(())
}
```

Points that often trip people up:

- Event handlers take *sync* event types such as `OriginalSyncRoomMessageEvent`, not `RoomMessageEvent`.
- Login lives under `client.matrix_auth()` (the legacy Matrix login API). For servers using Matrix Authentication Service, use `client.oauth()` and the [OAuth 2.0 API](https://spec.matrix.org/v1.19/client-server-api/#oauth-20-api).
- Logging in again creates a new device each time. Real apps save the session (`client.session()`) and restore it on the next start.

## Encryption

With default features, the client encrypts and decrypts automatically. `client.encryption()` gives access to cross-signing, key backup, recovery and verification. Clients should set up cross-signing: since spec v1.18, other clients should not share room keys with non-cross-signed devices ([spec](https://spec.matrix.org/v1.19/client-server-api/#recommended-client-behaviour)). The [`encryption` module docs](https://docs.rs/matrix-sdk/0.19.1/matrix_sdk/encryption/index.html) cover the flows.

## Building a full client

For a chat client, don't drive `/sync` yourself. Use the `matrix-sdk-ui` crate:

- `SyncService` and `RoomListService` run Simplified Sliding Sync (MSC4186). The server must support it; Synapse 1.163 does natively, enabled by default.
- `Timeline` gives a ready-to-render room timeline with edits, reactions, threads, read receipts and a send queue.

Simplified Sliding Sync is accepted but not yet in the spec (not in v1.19). Expect API changes between releases.

## Swift and Kotlin

The bindings are generated with UniFFI from `bindings/matrix-sdk-ffi` and follow Element X's needs. The API is not stable and changes between releases. Use Element X ([iOS](https://github.com/element-hq/element-x-ios), [Android](https://github.com/element-hq/element-x-android)) as the working reference rather than copying old snippets.

## Resources

- [GitHub: matrix-org/matrix-rust-sdk](https://github.com/matrix-org/matrix-rust-sdk)
- [API docs on docs.rs](https://docs.rs/matrix-sdk/0.19.1/matrix_sdk/)
- [Examples](https://github.com/matrix-org/matrix-rust-sdk/tree/main/examples)
- [#matrix-rust-sdk:matrix.org](https://matrix.to/#/#matrix-rust-sdk:matrix.org)
