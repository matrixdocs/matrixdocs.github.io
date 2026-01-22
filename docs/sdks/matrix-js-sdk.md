---
sidebar_position: 2
title: matrix-js-sdk
description: The official JavaScript SDK for Matrix
---

# matrix-js-sdk

The official JavaScript/TypeScript SDK for Matrix, powering Element Web and other applications.

## Installation

```bash
npm install matrix-js-sdk
```

## Basic Usage

### Initialize Client

```javascript
import * as sdk from 'matrix-js-sdk';

const client = sdk.createClient({
    baseUrl: "https://matrix.example.com",
    accessToken: "your-access-token",
    userId: "@user:example.com"
});
```

### Login

```javascript
const client = sdk.createClient({
    baseUrl: "https://matrix.example.com"
});

const response = await client.login("m.login.password", {
    user: "username",
    password: "password"
});

console.log("Logged in:", response.user_id);
```

### Start Syncing

```javascript
client.startClient({ initialSyncLimit: 10 });

client.once('sync', (state) => {
    if (state === 'PREPARED') {
        console.log("Client ready!");
    }
});
```

## Sending Messages

### Text Message

```javascript
await client.sendMessage(roomId, {
    msgtype: "m.text",
    body: "Hello, Matrix!"
});
```

### Formatted Message

```javascript
await client.sendMessage(roomId, {
    msgtype: "m.text",
    body: "Hello, **Matrix**!",
    format: "org.matrix.custom.html",
    formatted_body: "Hello, <strong>Matrix</strong>!"
});
```

### Image

```javascript
const response = await client.uploadContent(imageFile);
await client.sendMessage(roomId, {
    msgtype: "m.image",
    body: "image.png",
    url: response.content_uri,
    info: {
        mimetype: "image/png",
        size: imageFile.size,
        w: 800,
        h: 600
    }
});
```

## Event Handling

### Room Messages

```javascript
client.on("Room.timeline", (event, room, toStartOfTimeline) => {
    if (event.getType() !== "m.room.message") return;

    const content = event.getContent();
    console.log(`${event.getSender()}: ${content.body}`);
});
```

### Room Membership

```javascript
client.on("RoomMember.membership", (event, member) => {
    if (member.membership === "join") {
        console.log(`${member.name} joined ${member.roomId}`);
    }
});
```

## Room Operations

### Create Room

```javascript
const response = await client.createRoom({
    name: "My Room",
    topic: "Discussion room",
    preset: "private_chat",
    invite: ["@friend:example.com"]
});
```

### Join Room

```javascript
await client.joinRoom("#room:example.com");
// or by ID
await client.joinRoom("!roomid:example.com");
```

### Invite User

```javascript
await client.invite(roomId, "@user:example.com");
```

## End-to-End Encryption

### Enable E2EE

```javascript
import { LocalStorageCryptoStore } from 'matrix-js-sdk';

const client = sdk.createClient({
    baseUrl: "https://matrix.example.com",
    accessToken: "token",
    userId: "@user:example.com",
    deviceId: "DEVICE_ID",
    cryptoStore: new LocalStorageCryptoStore(localStorage)
});

await client.initCrypto();
client.startClient();
```

### Device Verification

```javascript
const verificationRequest = await client.requestVerification(userId);

verificationRequest.on("change", () => {
    if (verificationRequest.phase === "ready") {
        // Start verification
        verificationRequest.startVerification("m.sas.v1");
    }
});
```

## Spaces

### Create Space

```javascript
const space = await client.createRoom({
    name: "My Space",
    preset: "private_chat",
    creation_content: {
        type: "m.space"
    }
});
```

### Add Room to Space

```javascript
await client.sendStateEvent(spaceId, "m.space.child", {
    via: ["example.com"]
}, roomId);
```

## Resources

- [GitHub](https://github.com/matrix-org/matrix-js-sdk)
- [API Documentation](https://matrix-org.github.io/matrix-js-sdk/)
- [TypeDoc](https://matrix-org.github.io/matrix-js-sdk/modules.html)

---

*Next: [matrix-rust-sdk](./matrix-rust-sdk) →*
