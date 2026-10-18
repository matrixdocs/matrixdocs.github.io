---
sidebar_position: 4
title: Python SDKs
description: matrix-nio and mautrix-python, the maintained Python libraries for Matrix
last_update:
  date: 2026-10-18
verified_with: "matrix-nio 0.26.0, mautrix 0.21.1 (examples checked with pyright and import tests)"
---

# Python SDKs

Two Python libraries are maintained as of 2026-10. Both are asyncio-based.

| Library | PyPI name | Release (2026-10) | Python | E2EE | Good for |
|---------|-----------|-------------------|--------|------|----------|
| [matrix-nio](https://github.com/matrix-nio/matrix-nio) | `matrix-nio` | 0.26.0 (2026-07-23) | 3.10+ | Yes, with the `e2e` extra; no cross-signing | Small bots and scripts |
| [mautrix-python](https://github.com/mautrix/python) | `mautrix` | 0.21.1 (2026-07-05) | 3.10+ | Yes | maubot plugins, larger bots |

For most bots, the easiest route is a [maubot](../bots/maubot) plugin, which uses mautrix-python and gives you a web UI, config and a database for free.

:::warning matrix-python-sdk is dead
matrix-org's original **matrix-python-sdk** (PyPI package `matrix-client`, last release 0.4.0 in 2021) is unmaintained. Its own README recommends matrix-nio. It never supported E2EE.

The PyPI name **`matrix-python-sdk` now belongs to an unrelated project**. Do not `pip install matrix-python-sdk` expecting a Matrix client library.
:::

## matrix-nio

```bash
pip install "matrix-nio[e2e]"
```

The `e2e` extra now pulls in `vodozemac`, so libolm is no longer needed. Leave the extra off if you don't need encryption.

### A minimal bot

This logs in, skips messages from before startup, and answers `!ping`. It was checked with pyright against matrix-nio 0.26.0 (pyright flags only the usual narrower-callback-type warning on `add_event_callback`).

```python
import asyncio
import os

from nio import AsyncClient, LoginResponse, MatrixRoom, RoomMessageText, RoomSendError


async def main() -> None:
    client = AsyncClient("https://matrix.example.org", "@bot:example.org")
    resp = await client.login(os.environ["BOT_PASSWORD"], device_name="example-bot")
    if not isinstance(resp, LoginResponse):
        raise SystemExit(f"Login failed: {resp}")

    # Sync once before adding callbacks, so old messages are not answered again.
    await client.sync(timeout=30000)

    async def on_message(room: MatrixRoom, event: RoomMessageText) -> None:
        if event.sender == client.user_id or event.body != "!ping":
            return
        result = await client.room_send(
            room.room_id,
            message_type="m.room.message",
            content={"msgtype": "m.notice", "body": "pong"},
        )
        if isinstance(result, RoomSendError):
            print(f"Send failed: {result.message}")

    client.add_event_callback(on_message, RoomMessageText)
    try:
        await client.sync_forever(timeout=30000)
    finally:
        await client.close()


asyncio.run(main())
```

nio returns error objects instead of raising. Check the type of every response, as above.

To reuse a session instead of logging in each time, call `client.restore_login(user_id, device_id, access_token)`. Setting only `client.access_token` leaves the device ID unset and breaks the encryption store.

### Uploading a file

`upload()` returns a tuple: the response and, for encrypted uploads, the decryption keys.

```python
import os

from nio import AsyncClient, UploadResponse


async def send_image(client: AsyncClient, room_id: str, path: str) -> None:
    with open(path, "rb") as f:
        resp, _keys = await client.upload(
            f,
            content_type="image/png",
            filename=os.path.basename(path),
            filesize=os.path.getsize(path),
        )
    if not isinstance(resp, UploadResponse):
        raise RuntimeError(f"Upload failed: {resp}")
    await client.room_send(
        room_id,
        message_type="m.room.message",
        content={
            "msgtype": "m.image",
            "body": os.path.basename(path),
            "url": resp.content_uri,
            "info": {"mimetype": "image/png", "size": os.path.getsize(path)},
        },
    )
```

In an encrypted room, upload with `encrypt=True` and send the returned keys in a `file` object instead of `url` (see the [spec on sending encrypted attachments](https://spec.matrix.org/v1.19/client-server-api/#sending-encrypted-attachments)).

### Encryption limits

Pass `store_path` to `AsyncClient` so keys survive restarts. matrix-nio 0.26.0 has **no cross-signing support**. Since spec v1.18, clients SHOULD NOT send room keys to non-cross-signed devices, so a nio bot may stop being able to read encrypted rooms as clients enforce this. See [E2EE and cross-signing](../bots/building-bots#e2ee-and-cross-signing).

## mautrix-python

```bash
pip install mautrix
```

mautrix-python is the library under [maubot](../bots/maubot). Most mautrix bridges have moved to Go, but the Python library is still released.

### A minimal client

Checked against mautrix 0.21.1 by constructing the client and registering the handler, without network access. Create the `Client` inside a running event loop.

```python
import asyncio
import os

from mautrix.client import Client
from mautrix.types import EventType, MessageEvent, UserID


async def main() -> None:
    client = Client(
        mxid=UserID("@bot:example.org"),
        base_url="https://matrix.example.org",
        token=os.environ["ACCESS_TOKEN"],
    )
    client.ignore_initial_sync = True  # don't replay history on startup
    client.ignore_first_sync = True

    @client.on(EventType.ROOM_MESSAGE)
    async def handler(evt: MessageEvent) -> None:
        if evt.sender != client.mxid and evt.content.body == "!ping":
            await client.send_notice(evt.room_id, "pong")

    await client.start(None)  # runs until stopped


asyncio.run(main())
```

For encryption, mautrix-python provides `mautrix.crypto.OlmMachine` with a crypto store. maubot sets this up for you; see the [mautrix-python docs](https://docs.mau.fi/python/latest/).

## Resources

- [matrix-nio documentation](https://matrix-nio.readthedocs.io/)
- [matrix-nio examples](https://github.com/matrix-nio/matrix-nio/tree/main/examples)
- [mautrix-python documentation](https://docs.mau.fi/python/latest/)
- [#nio:matrix.org](https://matrix.to/#/#nio:matrix.org), [#maubot:maunium.net](https://matrix.to/#/#maubot:maunium.net)
