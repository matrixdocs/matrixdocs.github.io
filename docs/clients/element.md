---
sidebar_position: 2
title: Element
description: Installing and using Element Web, Element Desktop and Element X
last_update:
  date: 2026-10-18
verified_with: "Element Web 1.12.32 (source: KeyboardShortcuts.ts, Settings.tsx, en_EN.json), Element X Android 26.09.4"
---

# Element

Element is the most widely used Matrix client family, developed by Element (the company that also develops Synapse). It comes in three forms:

| App | Platforms | Status (2026-10) |
|-----|-----------|------------------|
| **Element Web / Desktop** | Browser; Windows, macOS, Linux | Active. 1.12.32 released 2026-10-16. Desktop is the web app in Electron. |
| **Element X** | Android, iOS | Element's current mobile app, built on matrix-rust-sdk |
| **Element Classic** | Android, iOS | The old mobile apps. Security fixes only; see below. |

## Installation

### Web

Open [app.element.io](https://app.element.io). Nothing to install.

### Desktop

Downloads for all platforms are at [element.io/download](https://element.io/download).

```bash
# macOS (Homebrew)
brew install --cask element

# Windows (winget)
winget install Element.Element

# Linux (Flatpak; the Flathub listing is not verified by Element)
flatpak install flathub im.riot.Riot
```

On Debian and Ubuntu, add Element's signed package repository first, as shown on [element.io/download](https://element.io/download):

```bash
sudo apt install -y wget apt-transport-https
sudo wget -O /usr/share/keyrings/element-io-archive-keyring.gpg https://packages.element.io/debian/element-io-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/element-io-archive-keyring.gpg] https://packages.element.io/debian/ default main" | sudo tee /etc/apt/sources.list.d/element-io.list
sudo apt update
sudo apt install element-desktop
```

Since 1.12.28 (2026-09), Element Desktop on Linux needs glibc 2.34 or newer (Debian 12, Ubuntu 22.04 or later).

### Mobile: Element X

- **Android**: [Google Play](https://play.google.com/store/apps/details?id=io.element.android.x) | [F-Droid](https://f-droid.org/packages/io.element.android.x/)
- **iOS**: [App Store](https://apps.apple.com/app/element-x-secure-chat-call/id1631335820)

Element X needs a homeserver with simplified sliding sync, which Synapse supports natively. It signs in through OAuth 2.0 on servers that use the Matrix Authentication Service (such as matrix.org).

### Element Classic

The original Element Android (`im.vector.app`) and Element iOS apps are now called **Element Classic**. Their READMEs say they receive security fixes only and recommend Element X.

:::info Coming next
According to Element's [mobile migration FAQ](https://docs.element.io/latest/element-server-suite-pro/migration/classic-to-pro-mobile-apps-faq/), Element Classic will show an in-app banner pointing to Element X from 2026-11-15, and will be removed from the app stores on 2026-12-31. Installed copies keep working. These dates come only from that FAQ page; no matching blog post was found. The same FAQ says Element X still lacks widgets and slash commands.
:::

## Settings worth knowing (Element Web / Desktop)

| Tab | What's there |
|-----|--------------|
| **Account** | Display name, email and phone, password (or a link to your account portal on MAS servers), deactivate account |
| **Appearance** | Theme, message layout (Modern, Message bubbles, IRC), font size |
| **Notifications** | Keywords, per-room rules |
| **Preferences** | Send read receipts, send typing notifications, hardware acceleration (Desktop only) |
| **Security & Privacy** | Ignored users, integration manager toggle, analytics |
| **Encryption** | Recovery key, key storage, reset digital identity |
| **Devices** | Signed-in sessions; rename or sign out |
| **Labs** | Experimental features |
| **Help & About** | Version, Clear cache and reload |

### Labs

**Settings → Labs** holds experimental features. As of 1.12.32 these include the **rich text editor**, **video rooms**, **Element Call video rooms**, **Enable ask to join** and **Exclude insecure devices when sending/receiving messages**, among others. Threads are no longer a Labs feature, and voice broadcast has been removed. Labs features can change or disappear between releases.

## Keyboard shortcuts (Element Web / Desktop)

Taken from `KeyboardShortcuts.ts` in Element Web 1.12.32. Press `Ctrl/Cmd + /` in the app for the full list.

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Search rooms |
| `Alt + ↑/↓` | Previous / next room |
| `Alt + Shift + ↑/↓` | Previous / next unread room |
| `Cmd + ,` | Open settings (macOS only) |
| `Page Up / Page Down` | Scroll the timeline |

### Composer

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `↑` | Edit your last message |
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + E` | Inline code |
| `Ctrl/Cmd + ;` | Sticker picker |
| `Tab` | Autocomplete names |

### Actions

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + U` | Upload file |
| `Ctrl/Cmd + /` | Show all shortcuts |
| `Escape` | Close dialog / cancel edit |

## Features

### Threads

Hover over a message and choose **Reply in thread**. Threads keep side discussions out of the main timeline.

### Spaces

Click **+** under the spaces bar to create a space, then add rooms and sub-spaces and invite people. See [Core Concepts](../getting-started/concepts#spaces).

### Voice and video

- **1:1 calls**: use the call buttons in a DM.
- **Group calls**: Element uses **Element Call**, built on MatrixRTC with a LiveKit media server. Your homeserver advertises which LiveKit service to use. Older Jitsi widget calls still work where an integration manager or admin has set them up.
- **Video rooms**: always-on call rooms (Labs).

### Widgets

Widgets embed web apps in a room. Element adds them through an **integration manager**, which is optional. Element's default one is run by Element, and many self-hosted deployments disable it. You can also add a widget by URL with `/addwidget <url>`.

### Message formatting

Element's composer accepts Markdown:

```markdown
**bold**           → bold
*italic*           → italic
~~strikethrough~~  → strikethrough
`code`             → inline code
> quote            → blockquote
```

Fenced code blocks with a language name get syntax highlighting.

## Security

### Recovery

**Settings → Encryption → Recovery**: set up recovery and save the recovery key in a password manager. Keep **Key storage** turned on so new message keys are backed up.

### Device verification

When you sign in on a new device, confirm it from another signed-in device (QR code or emoji) or with your recovery key. A device you have not verified is not trusted. Under the spec's recommended behaviour (v1.18, MSC4153), other clients should stop sharing room keys with it and hide its messages. Element has postponed making this the default; in Element Web you can opt in under Labs → **Exclude insecure devices**.

### Sessions

**Settings → Devices** lists every signed-in session. Sign out any you do not recognise. On servers that use the Matrix Authentication Service (such as matrix.org), you can also manage sessions in the account portal (for matrix.org, [account.matrix.org](https://account.matrix.org/)).

### Sign in with QR code

On servers that support it, Element X can sign in a new device by scanning a QR code shown on a device that is already signed in. In Element Web 1.12.32 this is a Labs option that only the deployment's `config.json` can turn on (`feature_login_with_qr`, off by default).

## Bots and bridges

Most bots and bridges (Hookshot, Draupnir, mautrix bridges) are self-hosted and invited to a room like a normal user. See [Bots](../bots/overview) and [Bridges](../bridges/overview).

The integration manager can be turned on or off under **Settings → Security & Privacy**. Its address is set by the deployment's `config.json`, not in the app.

## Troubleshooting

### Messages won't decrypt

1. Enter your recovery key: **Settings → Encryption**.
2. Or verify this device from another signed-in device.
3. Check that **Key storage** is on.

### App is slow

1. **Settings → Help & About → Clear cache and reload**
2. Leave rooms you no longer read
3. On mobile, use Element X instead of Element Classic

---

*See also: [Alternative Clients](./alternatives) →*
