---
sidebar_position: 2
title: Maubot
description: Run and write plugin-based Matrix bots with maubot
last_update:
  date: 2026-10-18
verified_with: "maubot 0.6.0 (example-config.yaml, mbc CLI and plugin loader read from the release wheel)"
---

# Maubot

[maubot](https://github.com/maubot/maubot) is a plugin-based bot system written in Python on top of [mautrix-python](../sdks/matrix-python-sdk#mautrix-python). One maubot server hosts many bot accounts ("clients") and many plugin instances, managed through a web UI.

As of 2026-10 the current release is **0.6.0** (2025-11-17). It added verification with a recovery key and room v12 creator power when checking power levels after a room upgrade. The official documentation is at [docs.mau.fi/maubot](https://docs.mau.fi/maubot/).

## Concepts

| Term | Meaning |
|------|---------|
| Client | A Matrix account the server logs in as |
| Plugin | A `.mbp` archive containing Python code and `maubot.yaml` |
| Instance | A plugin running as a client, with its own config |

## Installation

### Docker

```yaml title="docker-compose.yml"
services:
  maubot:
    image: dock.mau.dev/maubot/maubot:v0.6.0
    restart: unless-stopped
    volumes:
      - ./data:/data
    ports:
      - "127.0.0.1:29316:29316"
```

The first start writes `data/config.yaml` and exits. Edit it, then start again. The management UI is at `http://localhost:29316/_matrix/maubot/`. Put it behind a reverse proxy with TLS if you need remote access.

### Python

```bash
pip install maubot
```

Copy [`example-config.yaml`](https://github.com/maubot/maubot/blob/master/maubot/example-config.yaml) from the release to `config.yaml`, edit it, and run `python -m maubot`. The `mbc` command is a separate CLI for plugin developers; `mbc init` creates a new *plugin*, not a server.

## Configuration

The keys below come from maubot 0.6.0's `example-config.yaml`:

```yaml title="config.yaml (excerpt)"
database: sqlite:maubot.db
# Key used to encrypt E2EE keys in the crypto database. Change it before first start.
crypto_db_pickle_key: change-me
crypto_database: default

server:
  hostname: 0.0.0.0
  port: 29316
  public_url: https://maubot.example.org

homeservers:
  example.org:
    url: https://matrix.example.org
    # registration_shared_secret from Synapse, only needed for `mbc auth --register`
    secret: null

# Username -> password. Plaintext passwords are bcrypt-hashed on startup.
admins:
  root: ""
  admin: a-long-random-password
```

`mbc auth` logs a Matrix account in through the maubot server and prints a token for creating a client. It does not hash admin passwords.

:::warning
Anyone with a maubot admin login controls every bot account on that server. Use strong admin passwords, don't expose port 29316 directly, and leave `homeservers.*.secret` empty unless you need `mbc auth --register`.
:::

## Running a plugin

1. Find a plugin in the index at [plugins.mau.bot](https://plugins.mau.bot) and download its `.mbp` from the plugin's releases.
2. In the UI, upload it under **Plugins**.
3. Under **Clients**, add the bot account (homeserver, user ID, access token, device ID), or create it with `mbc auth`.
4. Under **Instances**, create an instance that pairs the plugin with the client, then edit its config.
5. Invite the bot to a room.

## Writing a plugin

A plugin needs a `maubot.yaml` and a Python module. `mbc init` scaffolds both. Here is a ping plugin with one config option:

```yaml title="maubot.yaml"
id: org.example.ping
version: 1.0.0
license: MIT
modules:
  - ping
main_class: PingBot
config: true
extra_files:
  - base-config.yaml
```

```yaml title="base-config.yaml"
reply: pong
```

```python title="ping.py"
from typing import Type

from maubot import MessageEvent, Plugin
from maubot.handlers import command
from mautrix.util.config import BaseProxyConfig, ConfigUpdateHelper


class Config(BaseProxyConfig):
    def do_update(self, helper: ConfigUpdateHelper) -> None:
        helper.copy("reply")


class PingBot(Plugin):
    async def start(self) -> None:
        self.config.load_and_update()

    @classmethod
    def get_config_class(cls) -> Type[BaseProxyConfig]:
        return Config

    @command.new("ping", help="Check that the bot is alive")
    async def ping(self, evt: MessageEvent) -> None:
        await evt.reply(self.config["reply"])
```

Users type `!ping`. Build and upload with:

```bash
mbc login            # once, to your maubot server
mbc build --upload   # zips the plugin into an .mbp and uploads it
```

This plugin was import-tested against maubot 0.6.0. The [plugin development docs](https://docs.mau.fi/maubot/dev/getting-started.html) cover databases, web endpoints and event handlers.

### Testing

maubot 0.6.0 ships pytest fixtures in `maubot.testing` (`maubot_test_bot`, `maubot_plugin`, `maubot_plugin_config` and others), so you can test command handlers without a homeserver.

## Encryption

maubot supports E2EE for clients that have a device ID. Set `crypto_db_pickle_key` before first start and keep the crypto database. Since 0.6.0 you can verify a bot's device with a recovery key, which gives it cross-signing, as encrypted rooms increasingly require ([spec](https://spec.matrix.org/v1.19/client-server-api/#recommended-client-behaviour)). The account needs cross-signing and a recovery key first; one way is to log in to the bot account once with Element and set up recovery there.

## Standalone mode

For a single bot without the management UI, maubot has a standalone mode (`python -m maubot.standalone`) that runs one plugin from a config file. The Docker images have matching `-standalone` tags. See [standalone mode](https://docs.mau.fi/maubot/usage/standalone.html).

## Resources

- [maubot docs](https://docs.mau.fi/maubot/)
- [Plugin index](https://plugins.mau.bot)
- [GitHub: maubot/maubot](https://github.com/maubot/maubot)
- [#maubot:maunium.net](https://matrix.to/#/#maubot:maunium.net)
