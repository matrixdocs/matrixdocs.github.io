---
sidebar_position: 3
title: Alternative Clients
description: Explore Matrix clients beyond Element
---

# Alternative Clients

While Element is the flagship, these alternatives offer unique features and experiences.

## Desktop Clients

### Cinny

**The Discord-like experience**

```bash
# Web
https://app.cinny.in

# Desktop (various)
https://github.com/cinnyapp/cinny-desktop/releases
```

**Standout Features:**
- Beautiful, modern UI
- Discord-style server/channel layout
- Excellent keyboard navigation
- Markdown preview while typing
- Custom emoji support
- Threads support
- Spaces hierarchy

**v4+ Features (2025):**
- **Custom power levels** - Set specific levels for any action
- **Developer tools** - Explore room state and events
- **Improved notifications** - Better push notification support
- **Custom emojis** - Native emoji pack support
- **Better accessibility** - Screen reader improvements

**Power User Tips:**
- `Ctrl + K` - Quick room switcher
- `Ctrl + Shift + E` - Emoji picker
- Create custom themes via CSS
- Use `/devtools` for state exploration
- Right-click for power level management

:::tip Hidden Gem
Cinny supports custom CSS themes. Access via Settings → Appearance → Custom CSS. Community themes: [github.com/nichobi/cinny-theme](https://github.com/nichobi)
:::

### Nheko

**Native Qt client for Linux/Mac/Windows**

```bash
# Linux (Flatpak)
flatpak install flathub io.github.NhekoReborn.Nheko

# macOS
brew install nheko

# Arch Linux
pacman -S nheko
```

**Standout Features:**
- Native performance (C++/Qt)
- Low resource usage (~100MB RAM)
- Video calls via GStreamer
- System tray integration
- Good screen reader support

**Power User Tips:**
- Configure via `~/.config/nheko/nheko.conf`
- Enable GIF search in settings
- Use system proxy settings

### Fractal

**GNOME's Matrix client**

```bash
# Flatpak (recommended)
flatpak install flathub org.gnome.Fractal
```

**Standout Features:**
- Native GNOME integration
- GTK4 + Rust (Fractal 5+)
- Clean, minimal interface
- Good performance

**Best For:** GNOME desktop users wanting native integration

### Quaternion

**Qt-based client with unique features**

```bash
# Flatpak
flatpak install flathub com.github.nichobi.quaternion
```

**Standout Features:**
- Timeline as actual timeline (not chat bubbles)
- Built on libQuotient
- Lightweight
- Good for developers

## Mobile Clients

### FluffyChat

**The friendly Matrix client**

- **Android**: [Play Store](https://play.google.com/store/apps/details?id=chat.fluffy.fluffychat) | [F-Droid](https://f-droid.org/packages/chat.fluffy.fluffychat/)
- **iOS**: [App Store](https://apps.apple.com/app/fluffychat/id1551469600)

**Standout Features:**
- Stories (like Instagram/WhatsApp)
- Very beginner-friendly
- Works offline
- Multiple accounts
- Built with Flutter (cross-platform)

**Power User Tips:**
- Long-press messages for reactions
- Enable "Developer Mode" for extra options
- Use the web version for quick access: [fluffychat.im/web](https://fluffychat.im/web)

### SchildiChat

**Element with superpowers**

- **Android**: [GitHub Releases](https://github.com/SchildiChat/SchildiChat-android/releases)
- **Desktop**: [schildi.chat](https://schildi.chat)

**Standout Features:**
- Unified chat list (DMs + rooms together)
- Message bubbles toggle
- Compact mode
- More themes
- All Element features plus extras

**Power User Tips:**
- Enable "Developer options" for verbose logs
- Try "Unified inbox" view
- Custom accent colors available

### Element X

**The future of Element**

Built on matrix-rust-sdk for incredible performance.

- **Android**: [Play Store](https://play.google.com/store/apps/details?id=io.element.android.x)
- **iOS**: [App Store](https://apps.apple.com/app/element-x-secure-messenger/id6448614116)

**Standout Features:**
- Blazing fast sync
- Modern UI/UX
- Native Rust performance
- Sliding sync support

**Note:** Still in development, some features missing compared to Element.

## Terminal Clients

### gomuks

**Terminal client written in Go - now with web frontend!**

```bash
# Install
go install maunium.net/go/gomuks@latest

# Or download binary
https://github.com/gomuks/gomuks/releases
```

**Features:**
- Full TUI (terminal UI)
- **New: Web frontend** - Access via browser
- E2EE support
- Image preview (in supported terminals)
- Vim-like keybindings
- Low resource usage

**Web Frontend (New!):**
```bash
# Start gomuks with web server
gomuks --web-listen :8080

# Access in browser
http://localhost:8080
```

The web frontend provides a modern UI while using gomuks as the backend - best of both worlds.

**Commands:**
```
/join #room:server    - Join room
/leave                - Leave current room
/send filename        - Send file
/toggle markdown      - Toggle markdown
/export [format]      - Export room history
/rainbow text         - Send rainbow-colored text
```

**Power User Features:**
- Export room history to JSON
- Set power levels: `/op @user:server 50`
- Custom keybindings via config
- Multiple accounts support

### iamb

**Modal Matrix client (Vim-like)**

```bash
cargo install iamb
```

**Features:**
- Modal editing (like Vim)
- Multiple windows/tabs
- Highly keyboard-driven
- Rust-based

**For:** Vim enthusiasts who want a modal Matrix experience

### weechat-matrix

**Matrix protocol for WeeChat**

```bash
# Install script
/script install matrix.py
```

**Features:**
- Integrates with WeeChat
- Familiar IRC-style interface
- E2EE via pantalaimon
- Highly scriptable

## All-in-One Solutions

### Beeper

**Unified messaging via Matrix bridges**

Beeper is a commercial service that bridges all your messaging apps through Matrix:

**Supported Platforms:**
- iMessage, SMS (via phone/Mac)
- WhatsApp, Signal, Telegram
- Slack, Discord, Instagram
- LinkedIn, Twitter/X DMs
- And more...

**How It Works:**
1. Sign up at [beeper.com](https://www.beeper.com)
2. Connect your accounts
3. All messages appear in one inbox
4. Uses Matrix protocol underneath

**Features:**
- Unified inbox for all messengers
- Search across all platforms
- Desktop and mobile apps
- Schedule messages
- Archive functionality

**Self-Hosting Alternative:**

Use mautrix bridges with your own homeserver:
```bash
# Deploy bridges via matrix-docker-ansible-deploy
ansible-playbook -i inventory/hosts setup.yml --tags=setup-all
```

Bridges available:
- mautrix-whatsapp
- mautrix-telegram
- mautrix-signal
- mautrix-discord
- mautrix-instagram
- mautrix-twitter

**Beeper vs Self-Hosted:**

| Feature | Beeper | Self-Hosted |
|---------|--------|-------------|
| Setup | Easy (managed) | Complex |
| Cost | Subscription | Free (server costs) |
| Control | Limited | Full |
| iMessage | ✅ (needs Mac/phone) | ✅ (needs Mac/phone) |
| Privacy | Trust Beeper | Self-controlled |

---

## Special Purpose Clients

### Hydrogen

**Lightweight web client**

- **URL**: [hydrogen.element.io](https://hydrogen.element.io)

**Best For:**
- Slow connections
- Older devices
- Embedding in other apps
- Quick access without full client

### Syphon

**Privacy-focused mobile client**

- **Platforms**: Android, iOS

**Features:**
- Tor support
- No Google services required
- Local notifications only
- Privacy-first design

### Neochat

**KDE's Matrix client**

```bash
flatpak install flathub org.kde.neochat
```

**Features:**
- Native KDE/Plasma integration
- Kirigami UI (works on mobile too)
- Good Plasma Mobile support

## Client Feature Matrix

| Feature | Cinny | Nheko | FluffyChat | gomuks |
|---------|-------|-------|------------|--------|
| E2EE | ✅ | ✅ | ✅ | ✅ |
| Spaces | ✅ | 🔄 | 🔄 | ❌ |
| Threads | ✅ | ❌ | ❌ | ❌ |
| VoIP | ❌ | ✅ | ✅ | ❌ |
| Widgets | ❌ | ❌ | ❌ | ❌ |
| Stories | ❌ | ❌ | ✅ | ❌ |
| Custom Themes | ✅ | ✅ | ✅ | ✅ |

## Recommendations by Use Case

| Use Case | Recommended Client |
|----------|-------------------|
| Daily driver (full-featured) | Element, SchildiChat |
| Speed & simplicity | Cinny, Element X |
| Privacy maximum | Syphon, FluffyChat |
| Linux native | Nheko, Fractal |
| KDE Plasma | Neochat |
| Terminal/SSH | gomuks, iamb |
| Low bandwidth | Hydrogen |
| Multi-account | FluffyChat |

---

*Next: [Client Comparison](./comparison) →*
