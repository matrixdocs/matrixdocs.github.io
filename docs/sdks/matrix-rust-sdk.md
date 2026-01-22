---
sidebar_position: 3
title: matrix-rust-sdk
description: High-performance Rust SDK for Matrix
---

# matrix-rust-sdk

A high-performance Matrix SDK written in Rust with bindings for multiple languages.

## Features

- **Performance** - Native speed, low memory
- **Cross-platform** - Works everywhere Rust compiles
- **Bindings** - Swift, Kotlin, WASM, Python, Go
- **E2EE** - Full encryption support
- **Sliding Sync** - Next-gen sync protocol

## Installation

### Rust

```toml title="Cargo.toml"
[dependencies]
matrix-sdk = "0.7"
tokio = { version = "1", features = ["full"] }
```

### Swift (iOS/macOS)

```swift
// Swift Package Manager
.package(url: "https://github.com/matrix-org/matrix-rust-sdk", from: "1.0.0")
```

### Kotlin (Android)

```kotlin
// build.gradle
implementation("org.matrix.rustcomponents:sdk-android:1.0.0")
```

## Basic Usage

### Create Client

```rust
use matrix_sdk::{Client, config::SyncSettings};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = Client::builder()
        .homeserver_url("https://matrix.example.com")
        .build()
        .await?;

    Ok(())
}
```

### Login

```rust
client.matrix_auth()
    .login_username("user", "password")
    .initial_device_display_name("My App")
    .send()
    .await?;
```

### Sync

```rust
client.sync(SyncSettings::default()).await?;
```

### Event Handler

```rust
use matrix_sdk::{
    event_handler::Ctx,
    room::Room,
    ruma::events::room::message::{
        RoomMessageEvent,
        MessageType,
    },
};

client.add_event_handler(|ev: RoomMessageEvent, room: Room| async move {
    let MessageType::Text(text) = ev.content.msgtype else { return };
    println!("{}: {}", ev.sender, text.body);
});
```

## Sending Messages

```rust
use matrix_sdk::ruma::events::room::message::RoomMessageEventContent;

let content = RoomMessageEventContent::text_plain("Hello, Matrix!");
room.send(content).await?;
```

## E2EE

```rust
// Encryption is enabled by default when crypto feature is enabled
let client = Client::builder()
    .homeserver_url("https://matrix.example.com")
    .build()
    .await?;

// Verify device
let verification = client
    .encryption()
    .get_verification(&user_id, &flow_id)
    .await?;
```

## Sliding Sync

```rust
use matrix_sdk::sliding_sync::SlidingSync;

let sliding_sync = client
    .sliding_sync("main")?
    .with_all_extensions()
    .add_list(
        SlidingSyncList::builder("all_rooms")
            .sync_mode(SlidingSyncMode::Growing { batch_size: 20 })
    )
    .build()
    .await?;
```

## Language Bindings

### Swift Example

```swift
let client = try await ClientBuilder()
    .homeserverUrl(url: "https://matrix.example.com")
    .build()

try await client.login(username: "user", password: "pass")
```

### Kotlin Example

```kotlin
val client = ClientBuilder()
    .homeserverUrl("https://matrix.example.com")
    .build()

client.login("user", "password")
```

## Resources

- [GitHub](https://github.com/matrix-org/matrix-rust-sdk)
- [Crate Documentation](https://docs.rs/matrix-sdk)
- [Examples](https://github.com/matrix-org/matrix-rust-sdk/tree/main/examples)

---

*Next: [matrix-python-sdk](/sdks/matrix-python-sdk) →*
