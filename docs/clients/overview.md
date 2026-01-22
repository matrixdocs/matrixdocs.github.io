---
sidebar_position: 1
title: Matrix Clients Overview
description: Discover the wide range of Matrix clients available for every platform
---

# Matrix Clients

Matrix's open protocol means you can choose from dozens of clients. Each offers different features, designs, and platform support.

## The Big Picture

| Category | Best For | Top Picks |
|----------|----------|-----------|
| **Full-Featured** | Power users, organizations | Element, SchildiChat |
| **Lightweight** | Speed, low resources | Cinny, Nheko, gomuks |
| **Mobile-First** | On-the-go messaging | FluffyChat, Element X |
| **Terminal** | CLI enthusiasts | gomuks, iamb, weechat-matrix |

## Featured Clients

### Element

The **flagship** Matrix client, developed by Element (formerly New Vector).

- **Platforms**: Web, Desktop, Android, iOS
- **Best for**: Full Matrix feature support
- **Website**: [element.io](https://element.io)

**Pros:**
- Most complete feature set
- Regular updates
- Spaces, threads, VoIP support
- Enterprise features

**Cons:**
- Can be resource-heavy
- Sometimes slow with many rooms

### Element X

The **next-generation** Element client, rebuilt from scratch using matrix-rust-sdk.

- **Platforms**: Android, iOS (Desktop coming)
- **Best for**: Speed and modern UX
- **Status**: Under active development

**Pros:**
- Extremely fast
- Modern, clean interface
- Efficient sync

**Cons:**
- Still missing some features
- Desktop version not yet available

### Cinny

A **Discord-like** Matrix client with a beautiful, modern interface.

- **Platforms**: Web, Desktop (Electron)
- **Best for**: Discord refugees, visual appeal
- **Website**: [cinny.in](https://cinny.in)

**Pros:**
- Beautiful UI
- Familiar for Discord users
- Fast and lightweight
- Active development

**Cons:**
- No voice/video calls
- No mobile app

### FluffyChat

A **cute** and simple Matrix client with great mobile support.

- **Platforms**: Android, iOS, Web, Linux, macOS, Windows
- **Best for**: Simplicity, cross-platform
- **Website**: [fluffychat.im](https://fluffychat.im)

**Pros:**
- Very user-friendly
- Works everywhere
- Good encryption support
- Stories feature

**Cons:**
- Less powerful than Element
- Occasional sync issues

### SchildiChat

Element **fork** with enhanced features and traditional IM feel.

- **Platforms**: Web, Desktop, Android
- **Best for**: Power users who want more than Element
- **Website**: [schildichat.de](https://schildi.chat)

**Pros:**
- All Element features plus extras
- Unified chat list option
- More compact UI options
- Active development

**Cons:**
- Slightly behind Element on updates
- No iOS version

### Nheko

A **native** desktop client written in C++/Qt.

- **Platforms**: Linux, macOS, Windows
- **Best for**: Native performance, Linux users
- **Website**: [nheko.im](https://nheko.im/nheko)

**Pros:**
- Native performance
- Low resource usage
- Good Linux integration
- Video calls support

**Cons:**
- Desktop only
- Smaller feature set

## Quick Comparison Table

| Client | Web | Desktop | Android | iOS | E2EE | Spaces | Threads | VoIP |
|--------|-----|---------|---------|-----|------|--------|---------|------|
| Element | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Element X | ❌ | 🔄 | ✅ | ✅ | ✅ | ✅ | 🔄 | 🔄 |
| Cinny | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| FluffyChat | ✅ | ✅ | ✅ | ✅ | ✅ | 🔄 | ❌ | ✅ |
| SchildiChat | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Nheko | ❌ | ✅ | ❌ | ❌ | ✅ | 🔄 | ❌ | ✅ |

✅ = Full support | 🔄 = Partial/In progress | ❌ = Not available

## Choosing the Right Client

### For Beginners

Start with **Element** - it's the most complete and well-documented option.

### For Discord Users

Try **Cinny** - the interface will feel familiar and comfortable.

### For Privacy-Conscious Users

**FluffyChat** or **Nheko** - both have strong encryption implementations and are community-driven.

### For Power Users

**SchildiChat** or **Element with labs features** - maximum functionality.

### For Developers

**gomuks** or **iamb** (terminal) - minimal distractions, keyboard-driven.

## Client Discovery Tools

- [clients.matrix.org](https://matrix.org/ecosystem/clients/) - Official client list
- [Are We Matrix Yet?](https://arewematrixyet.com) - Client feature comparison
- [Can I Matrix?](https://matrix-org.github.io/canitmatrix//clients/) - Feature support checker

---

*Continue: [Element Deep Dive](./element) | [Alternative Clients](./alternatives)*
