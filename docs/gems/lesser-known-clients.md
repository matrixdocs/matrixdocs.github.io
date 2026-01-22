---
sidebar_position: 3
title: Lesser-Known Clients
description: Hidden gem Matrix clients you might not know about
---

# Lesser-Known Clients

Beyond the popular clients, these hidden gems offer unique features.

## Terminal Clients

### gomuks

**The best terminal Matrix client - now with web UI!**

```bash
go install maunium.net/go/gomuks@latest
```

Features:
- Full E2EE support
- Image previews (Kitty/iTerm2)
- Vim-like keybindings
- Minimal resource usage
- **NEW: Web frontend option**

**Web Frontend Mode:**
```bash
# Start with web server
gomuks --web-listen :8080
```

Access at `http://localhost:8080` for a modern browser UI powered by gomuks backend.

**Power Features:**
- Export room history to JSON
- Set power levels from terminal
- Multiple account support
- Custom keybindings

:::tip Hidden Feature
In terminals that support it, gomuks can display images inline! The web frontend gives you the best of both worlds.
:::

### iamb

**Modal Matrix client (Vim-style)**

```bash
cargo install iamb
```

Features:
- True modal editing
- Multiple windows/splits
- Vim keybindings throughout
- Written in Rust

Perfect for: Vim enthusiasts who want Matrix in their terminal.

### weechat-matrix

**Matrix in WeeChat**

If you already use WeeChat for IRC:
```
/script install matrix.py
```

Integrates Matrix into your existing WeeChat setup.

## Minimal Web Clients

### Hydrogen

**Ultra-lightweight web client**

URL: [hydrogen.element.io](https://hydrogen.element.io)

- **50KB** bundle size (vs Element's 3MB+)
- Works on slow connections
- Offline-first design
- Perfect for embedding

Use cases:
- Low-bandwidth situations
- Embedded chat widgets
- Quick temporary access

### Cactus Comments

**Matrix-powered comment system**

Turn any Matrix room into a comment section for your website:

```html
<script src="https://cactus.chat/embed.js"></script>
<div id="comment-section"></div>
<script>
  initComments({ node: document.getElementById("comment-section") });
</script>
```

## Mobile Hidden Gems

### Syphon

**Privacy-focused Matrix client**

- No Google Play Services required
- Built-in Tor support
- Local-only notifications
- Minimal permissions

Perfect for: Privacy-conscious users on Android.

### Element X

**Next-gen Element (still emerging)**

While not "hidden," many don't know about:
- **Sliding sync**: Near-instant startup
- **Rust core**: Native performance
- **Fresh UI**: Modern design

Currently on mobile, desktop coming.

## Desktop Alternatives

### Spectral

**Qt-based, minimalist**

- Native Qt/QML
- Very lightweight
- Clean interface
- Linux-focused

### Quaternion

**Timeline-style view**

- Unique timeline visualization
- Built on libQuotient
- Developer-friendly

### Mirage

**Another Qt client**

- Modern QML interface
- Good keyboard navigation
- Scriptable with Python

## Specialty Clients

### Commune

**Forum-style Matrix client**

Presents Matrix as a traditional forum:
- Threaded discussions
- Topic-based organization
- Familiar forum UX

Good for: Communities transitioning from traditional forums.

### Matrix Viewer

**Read-only Matrix client**

[github.com/nichobi/matrix-viewer](https://github.com/nichobi)

- Browse public rooms without account
- Good for archives
- Lightweight

### Matrix Static

**Static HTML export**

Generate static HTML from Matrix rooms:
- Archive conversations
- Share without Matrix account
- SEO-friendly

## Bridge Services

### Beeper

**All messengers in one inbox**

Beeper provides managed Matrix bridges:
- iMessage, WhatsApp, Signal, Telegram
- Slack, Discord, Instagram, Twitter/X
- All messages unified in one place
- Matrix protocol underneath

See [beeper.com](https://www.beeper.com) or self-host with mautrix bridges.

---

## Client Experiments

### Third Room

**VR/3D Matrix client**

Experience Matrix in virtual reality:
- 3D environments
- Spatial audio
- VR headset support
- WebXR compatible

### Populus

**Collaborative whiteboard**

Matrix-based collaborative drawing and diagramming.

---

## Power User Features by Client

### Cinny v4+

**Advanced hidden features:**
- Custom power levels UI
- Developer tools (`/devtools`)
- Room state explorer
- Native custom emoji packs
- Improved threads support

### Nheko Extras

**Native Qt client power features:**

```bash
# Config location
~/.config/nheko/nheko.conf
```

- GIF search integration
- Custom emoji packs
- Video calls via GStreamer
- Room directory search
- Full message search
- Screen reader support

### FluffyChat Power Mode

Enable Developer Mode in settings for:
- Event source viewing
- Room state access
- Debug logging
- Experimental features

---

## Finding More

### Client Discovery

- [matrix.org/ecosystem/clients](https://matrix.org/ecosystem/clients/)
- [Are We Matrix Yet](https://arewematrixyet.com)
- Search GitHub for "matrix client"

### Evaluation Criteria

When trying new clients:

| Factor | Questions |
|--------|-----------|
| **E2EE** | Does it support encryption? |
| **Features** | What's missing vs Element? |
| **Performance** | Resource usage? |
| **Updates** | Actively maintained? |
| **Security** | Audited? Open source? |

---

*Next: [Advanced Features](./advanced-features) →*
