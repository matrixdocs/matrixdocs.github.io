---
sidebar_position: 1
title: SDKs & Libraries Overview
description: Development tools for building Matrix applications
---

# SDKs & Libraries

Build Matrix applications with official and community SDKs.

## SDK Comparison

| SDK | Language | Maintainer | E2EE | Best For |
|-----|----------|------------|------|----------|
| [matrix-js-sdk](/sdks/matrix-js-sdk) | JavaScript | Element | ✅ | Web apps, Element |
| [matrix-rust-sdk](/sdks/matrix-rust-sdk) | Rust | Element | ✅ | High performance, mobile |
| [matrix-python-sdk](/sdks/matrix-python-sdk) | Python | Community | ✅ | Scripts, bots |
| matrix-nio | Python | Community | ✅ | Async bots |
| matrix-bot-sdk | TypeScript | Community | ✅ | Node.js bots |
| mautrix-python | Python | Tulir | ✅ | Bridges, bots |
| libQuotient | C++/Qt | KDE | ✅ | Native Qt apps |

## Choosing an SDK

### For Web Applications

**matrix-js-sdk** - The official JavaScript SDK
- Powers Element Web
- Full feature support
- Browser and Node.js

### For Mobile Applications

**matrix-rust-sdk** - High-performance SDK
- Powers Element X
- Bindings for Swift, Kotlin
- Cross-platform

### For Bots & Scripts

**matrix-nio** or **matrix-bot-sdk**
- Easy to learn
- Good documentation
- Active communities

### For Desktop Applications

**libQuotient** (C++/Qt) or **matrix-rust-sdk**
- Native performance
- System integration
- Cross-platform

## Quick Start Examples

### JavaScript

```javascript
import { createClient } from 'matrix-js-sdk';

const client = createClient({
    baseUrl: "https://matrix.example.com",
    accessToken: "your-access-token",
    userId: "@user:example.com"
});

client.startClient();
client.on("Room.timeline", (event, room) => {
    if (event.getType() === "m.room.message") {
        console.log(`${event.getSender()}: ${event.getContent().body}`);
    }
});
```

### Python (nio)

```python
from nio import AsyncClient, RoomMessageText

async def main():
    client = AsyncClient("https://matrix.example.com", "@user:example.com")
    await client.login("password")

    client.add_event_callback(message_callback, RoomMessageText)
    await client.sync_forever()

async def message_callback(room, event):
    print(f"{event.sender}: {event.body}")
```

### Rust

```rust
use matrix_sdk::{Client, config::SyncSettings, ruma::events::room::message::RoomMessageEventContent};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = Client::builder()
        .homeserver_url("https://matrix.example.com")
        .build()
        .await?;

    client.login_username("user", "password").send().await?;
    client.sync(SyncSettings::default()).await?;
    Ok(())
}
```

## Feature Support Matrix

| Feature | js-sdk | rust-sdk | nio | bot-sdk |
|---------|--------|----------|-----|---------|
| Sync | ✅ | ✅ | ✅ | ✅ |
| E2EE | ✅ | ✅ | ✅ | ✅ |
| Verification | ✅ | ✅ | ✅ | ✅ |
| Spaces | ✅ | ✅ | ✅ | ✅ |
| Threads | ✅ | ✅ | 🔄 | 🔄 |
| VoIP | ✅ | 🔄 | ❌ | ❌ |
| Sliding Sync | ✅ | ✅ | ❌ | ❌ |

## Development Resources

### Official

- [Matrix Spec](https://spec.matrix.org) - Protocol specification
- [Matrix.org Docs](https://matrix.org/docs/) - General documentation
- [SDKs Page](https://matrix.org/sdks/) - Official SDK list

### Community

- [#matrix-dev:matrix.org](https://matrix.to/#/#matrix-dev:matrix.org) - Developer chat
- [#matrix-spec:matrix.org](https://matrix.to/#/#matrix-spec:matrix.org) - Spec discussion

---

*Continue: [matrix-js-sdk](/sdks/matrix-js-sdk) | [matrix-rust-sdk](/sdks/matrix-rust-sdk) | [matrix-python-sdk](/sdks/matrix-python-sdk)*
