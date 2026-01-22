---
sidebar_position: 3
title: Lesser-Known Clients
description: Hidden gem Matrix clients you might not know about
---

# Lesser-Known Clients

Beyond the popular clients, these hidden gems offer unique features.

## Terminal Clients

### gomuks

**The best terminal Matrix client**

```bash
go install maunium.net/go/gomuks@latest
```

Features:
- Full E2EE support
- Image previews (Kitty/iTerm2)
- Vim-like keybindings
- Minimal resource usage

:::tip Hidden Feature
In terminals that support it, gomuks can display images inline!
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

## Client Experiments

### Third Room

**VR/3D Matrix client**

Experience Matrix in virtual reality:
- 3D environments
- Spatial audio
- VR headset support

### Populus

**Collaborative whiteboard**

Matrix-based collaborative drawing and diagramming.

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
