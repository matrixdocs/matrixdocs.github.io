---
sidebar_position: 2
title: matrix-js-sdk
description: The JavaScript/TypeScript Matrix SDK used by Element Web
last_update:
  date: 2026-10-18
verified_with: "matrix-js-sdk 44.0.0 (type-checked with tsc), spec v1.19"
---

# matrix-js-sdk

The Matrix client-server SDK for JavaScript and TypeScript, maintained by Element and used by Element Web. It runs in browsers and in Node.js.

As of 2026-10 the current release is **44.0.0** (2026-10-13). It is published as an ES module (`"type": "module"`) and declares Node.js 22 or later. Major versions are frequent but irregular (six between 2025-10 and 2026-10), so pin a version and read the [release notes](https://github.com/matrix-org/matrix-js-sdk/releases) when upgrading.

```bash
npm install matrix-js-sdk
```

## A minimal client

This logs in with a password, enables encryption, prints messages and sends one. It was type-checked against matrix-js-sdk 44.0.0 with `tsc --strict`.

```typescript
import {
    ClientEvent,
    EventType,
    MsgType,
    RoomEvent,
    SyncState,
    createClient,
} from "matrix-js-sdk";

const baseUrl = "https://matrix.example.org";

// 1. Log in to get an access token and device ID (legacy login API).
const login = await createClient({ baseUrl }).loginRequest({
    type: "m.login.password",
    identifier: { type: "m.id.user", user: "alice" },
    password: process.env.MATRIX_PASSWORD!,
    initial_device_display_name: "my-app",
});

// 2. Create the client you'll use, with those credentials.
const client = createClient({
    baseUrl,
    userId: login.user_id,
    deviceId: login.device_id,
    accessToken: login.access_token,
});

// 3. Optional: end-to-end encryption. In a browser, omit the argument to
//    store keys in IndexedDB. In Node.js the store is in memory only.
await client.initRustCrypto({ useIndexedDB: false });

client.on(RoomEvent.Timeline, (event, room, toStartOfTimeline) => {
    if (toStartOfTimeline || event.getType() !== EventType.RoomMessage) return;
    console.log(`[${room?.name}] ${event.getSender()}: ${event.getContent().body}`);
});

client.once(ClientEvent.Sync, async (state) => {
    if (state !== SyncState.Prepared) return;
    await client.sendMessage("!roomid", {
        msgtype: MsgType.Text,
        body: "Hello from matrix-js-sdk",
    });
});

await client.startClient({ initialSyncLimit: 10 });
```

Notes:

- `client.login()` and `loginWithPassword()` are deprecated in v44. Use `loginRequest()` and create a new client with the returned credentials, as above.
- Without a persistent crypto store, each start needs a new device (a new login). Browsers get persistence through IndexedDB.
- The legacy crypto stack, including `initCrypto()`, was removed in v37 (2025-02). Rust crypto via `initRustCrypto()` is the only E2EE path. The old crypto store classes (`LocalStorageCryptoStore` and others) are still exported, but only to migrate old data.

## OAuth 2.0 login

Servers that use Matrix Authentication Service (matrix.org among them) authenticate clients with the [OAuth 2.0 API](https://spec.matrix.org/v1.19/client-server-api/#oauth-20-api). Password login may be unavailable there. In v44, `client.getAuthMetadata()` fetches the server's OAuth metadata, and the exported `OAuth2` class handles dynamic client registration (`OAuth2.registerClient`), the authorization code grant, token refresh and revocation, and the device authorization grant. Element Web is the reference implementation. See the [API docs](https://matrix-org.github.io/matrix-js-sdk/).

## Authenticated media

Since spec v1.11, media is downloaded from `/_matrix/client/v1/media/download/{serverName}/{mediaId}` (and `/thumbnail/...`) with an `Authorization` header. Ask for an authenticated URL and send the token yourself:

```typescript
const url = client.mxcUrlToHttp(
    "mxc://example.org/abc123",
    undefined, undefined, undefined, // width, height, resizeMethod
    false, // allowDirectLinks
    true,  // allowRedirects
    true,  // useAuthentication
);
if (url) {
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${client.getAccessToken()}` },
    });
}
```

In a browser, `<img src>` cannot send that header. The js-sdk README suggests a Service Worker that adds it.

## Encryption setup and verification

After `initRustCrypto()`, everything E2EE goes through `client.getCrypto()`:

- `bootstrapSecretStorage()` sets up secret storage (the recovery key).
- `bootstrapCrossSigning()` creates and uploads cross-signing keys.
- `requestOwnUserVerification()` and `requestDeviceVerification(userId, deviceId)` start interactive verification.

```typescript
import { VerificationPhase, VerificationRequestEvent } from "matrix-js-sdk/lib/crypto-api/index.js";

const request = await client.getCrypto()!.requestOwnUserVerification();
request.on(VerificationRequestEvent.Change, async () => {
    if (request.phase === VerificationPhase.Ready) {
        const verifier = await request.startVerification("m.sas.v1");
        await verifier.verify();
    }
});
```

The [E2EE section of the README](https://github.com/matrix-org/matrix-js-sdk#end-to-end-encryption-support) covers the secret-storage and cross-signing callbacks in full. Cross-signing matters: since spec v1.18, other clients should not share room keys with devices that are not cross-signed.

## Spaces

A space is a room created with `creation_content.type = "m.space"`. Children are linked with `m.space.child` state events:

```typescript
const { room_id: spaceId } = await client.createRoom({
    name: "My space",
    creation_content: { type: "m.space" },
});
await client.sendStateEvent(spaceId, EventType.SpaceChild, { via: ["example.org"] }, "!child-room-id");
```

## Resources

- [GitHub: matrix-org/matrix-js-sdk](https://github.com/matrix-org/matrix-js-sdk)
- [API reference](https://matrix-org.github.io/matrix-js-sdk/)
- [Node.js example app](https://github.com/matrix-org/matrix-js-sdk/tree/develop/examples/node)
