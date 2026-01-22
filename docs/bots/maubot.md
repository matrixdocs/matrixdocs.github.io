---
sidebar_position: 2
title: Maubot
description: Plugin-based Matrix bot system
---

# Maubot

Maubot is a plugin-based bot system for Matrix. Install plugins for various features without writing code.

## Features

- **Plugin system** - Add/remove features easily
- **Web UI** - Manage bots via browser
- **Multiple instances** - Run many bots from one Maubot
- **Hot reload** - Update plugins without restart

## Installation

### Docker (Recommended)

```yaml title="docker-compose.yml"
version: '3'
services:
  maubot:
    image: dock.mau.dev/maubot/maubot:latest
    restart: unless-stopped
    ports:
      - "29316:29316"
    volumes:
      - ./maubot-data:/data
```

```bash
docker compose up -d
# Access UI at http://localhost:29316/_matrix/maubot/
```

### pip Installation

```bash
pip install maubot
mbc init
mbc run
```

## Configuration

```yaml title="config.yaml"
server:
  hostname: 0.0.0.0
  port: 29316
  public_url: https://maubot.example.com

database: sqlite:///maubot.db

homeservers:
  example.com:
    url: https://matrix.example.com

admins:
  admin: "your-password-hash"
```

Generate password hash:
```bash
mbc auth -u admin
```

## Using the Web UI

1. Go to `http://localhost:29316/_matrix/maubot/`
2. Login with admin credentials
3. **Clients** tab → Add bot user credentials
4. **Plugins** tab → Upload plugins
5. **Instances** tab → Create bot instances

## Popular Plugins

### Utility

| Plugin | Description |
|--------|-------------|
| [echo](https://github.com/maubot/echo) | Echo messages back |
| [dice](https://github.com/maubot/dice) | Roll dice |
| [reminder](https://github.com/maubot/reminder) | Set reminders |
| [translate](https://github.com/maubot/translate) | Translate messages |

### Fun

| Plugin | Description |
|--------|-------------|
| [xkcd](https://github.com/maubot/xkcd) | XKCD comics |
| [giphy](https://github.com/maubot/giphy) | GIF search |
| [urban](https://github.com/maubot/urban) | Urban Dictionary |

### Management

| Plugin | Description |
|--------|-------------|
| [welcome](https://github.com/maubot/welcome) | Welcome new users |
| [reactbot](https://github.com/maubot/reactbot) | Auto-react |
| [rss](https://github.com/maubot/rss) | RSS feeds |
| [gitlab](https://github.com/maubot/gitlab) | GitLab notifications |

## Installing Plugins

### From Web UI

1. Download `.mbp` file from plugin repo
2. Plugins tab → Upload
3. Create instance with plugin

### From Command Line

```bash
# Build plugin
mbc build

# Upload to maubot
mbc upload -s http://localhost:29316 plugin.mbp
```

## Creating an Instance

1. **Clients** → Add Matrix account for bot
2. **Instances** → New Instance
3. Select plugin, client, primary room
4. Configure plugin settings
5. Start instance

## Writing Plugins

### Basic Plugin Structure

```python
from maubot import Plugin, MessageEvent
from maubot.handlers import command

class MyPlugin(Plugin):
    @command.new()
    async def hello(self, evt: MessageEvent) -> None:
        await evt.reply("Hello, World!")
```

### Plugin Metadata

```yaml title="maubot.yaml"
maubot: 0.1.0
id: com.example.myplugin
version: 1.0.0
license: MIT
modules:
  - myplugin
main_class: MyPlugin
```

### Building

```bash
mbc build -o myplugin.mbp
```

## Configuration for Plugins

Plugins can have configurable settings:

```python
from maubot import Plugin
from mautrix.util.config import BaseProxyConfig, ConfigUpdateHelper

class Config(BaseProxyConfig):
    def do_update(self, helper: ConfigUpdateHelper) -> None:
        helper.copy("greeting")

class MyPlugin(Plugin):
    async def start(self) -> None:
        self.config.load_and_update()

    @command.new()
    async def greet(self, evt: MessageEvent) -> None:
        await evt.reply(self.config["greeting"])
```

## Resources

- [Maubot GitHub](https://github.com/maubot/maubot)
- [Plugin Repository](https://github.com/maubot)
- [Documentation](https://docs.mau.fi/maubot/)
- [Matrix Room](https://matrix.to/#/#maubot:maunium.net)

---

*Next: [Mjolnir](/bots/mjolnir) →*
