---
sidebar_position: 3
title: Quick Start
description: Get up and running with Matrix in minutes
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, Element Web 1.12.32, Element X Android 26.09.4"
---

# Quick Start

This page gets you an account, a client and your first rooms.

## 1. Pick a homeserver

Your homeserver holds your account. You can talk to people on any other server, so the choice is about who runs it, their rules and their limits.

- **matrix.org** is run by the Matrix.org Foundation and is the default in most apps. Free accounts have [media upload limits](https://matrix.org/homeserver/pricing/) (as of 2026-10: 10 MB per file, 100 MB per 24 hours) and a paid premium tier.
- **Other public servers** are listed at [servers.joinmatrix.org](https://servers.joinmatrix.org), with their registration rules. For example, [tchncs.de](https://tchncs.de/matrix) is a long-running German server; its page states that sign-up uses Google reCAPTCHA and that IP logs are kept for 7 days. Read each server's terms before you sign up.
- **Your own server**: see [Servers](../servers/overview).

:::tip
You can use any Matrix client with any homeserver, and switch clients at any time.
:::

## 2. Create an account

On matrix.org, accounts are managed by the Matrix Authentication Service (MAS) at [account.matrix.org](https://account.matrix.org/):

1. Open [app.element.io](https://app.element.io) (or Element X, below) and choose **Create account**.
2. The app sends you to account.matrix.org. Pick a username and password, give an email address, and complete the CAPTCHA.
3. Confirm your email, then return to the app.

Your Matrix ID will be `@username:matrix.org`. Password changes, sessions and account deletion on matrix.org are also handled at account.matrix.org.

Other servers may still show a sign-up form inside the app. The steps are similar.

## 3. Install a client

Element's current mobile app is **Element X**. The older mobile app is now **Element Classic**, which receives security fixes only and, according to Element's [migration FAQ](https://docs.element.io/latest/element-server-suite-pro/migration/classic-to-pro-mobile-apps-faq/), is due to leave the app stores on 2026-12-31.

| Platform | App | Download |
|----------|-----|----------|
| **Android** | Element X | [Google Play](https://play.google.com/store/apps/details?id=io.element.android.x) / [F-Droid](https://f-droid.org/packages/io.element.android.x/) |
| **iOS** | Element X | [App Store](https://apps.apple.com/app/element-x-secure-chat-call/id1631335820) |
| **Windows / macOS / Linux** | Element Desktop | [element.io/download](https://element.io/download) |
| **Browser** | Element Web | [app.element.io](https://app.element.io) |

Prefer something else? See [Clients](../clients/overview).

## 4. Set up recovery

**Do this first.** Your recovery key lets a new device unlock your encrypted message history.

- **Element Web / Desktop:** Settings → **Encryption** → Recovery → **Get recovery key**. Make sure **Key storage** is on.
- **Element X:** Settings → **Encryption** → Recovery.

Save the recovery key in a password manager or another safe place, then confirm it.

:::warning
If you lose your recovery key **and** all your signed-in devices, you cannot read your old encrypted messages. You will have to reset your digital identity and start again.
:::

## 5. Verify your other devices

When you sign in on a second device, the app asks you to confirm it from a device you already use (scan a QR code or compare emoji) or to enter your recovery key. Do it straight away. Since spec v1.18, clients are expected to stop sending message keys to devices you have not verified. Element has announced it will turn this on and has postponed the date, so an unverified device may work today and stop decrypting later.

## 6. Join some rooms

A few public rooms on matrix.org:

```
#matrix:matrix.org        - Matrix HQ, general discussion
#element-web:matrix.org   - Element Web and Desktop
#offtopic:matrix.org      - General chat
#homeservers:matrix.org   - Homeserver admins
```

To join one in Element Web, use **Explore rooms** in the room list, or start a new chat and paste the alias. You can also open a `https://matrix.to/#/#matrix:matrix.org` link.

## Useful settings in Element Web

| Where | What |
|-------|------|
| Settings → **Notifications** | Desktop notifications, keywords, per-room rules |
| Settings → **Appearance** | Theme, message layout (Modern, Message bubbles, IRC), font size |
| Settings → **Preferences** | Send read receipts, send typing notifications |
| Settings → **Devices** | Your signed-in sessions; sign out old ones |
| Settings → **Encryption** | Recovery key, key storage, reset identity |

## Keyboard shortcuts (Element Web)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Search rooms |
| `Ctrl/Cmd + /` | Show all shortcuts |
| `Tab` | Autocomplete names |
| `↑` | Edit your last message |
| `Ctrl/Cmd + Shift + U` | Upload a file |

## Troubleshooting

### Messages not arriving

- Check your connection and reload the app.
- Check whether your homeserver is up (for matrix.org, see [status.matrix.org](https://status.matrix.org)).

### "Unable to decrypt"

- Enter your recovery key (Settings → **Encryption**), or verify this device from another signed-in device.
- Make sure **Key storage** is on, so new keys are backed up.
- Messages sent before you joined a room may be unreadable by design, depending on the room's history settings.

### Slow app

- Element Web: Settings → Help & About → **Clear cache and reload**.
- On mobile, Element X is much faster than Element Classic. On desktop, a lighter client such as [Cinny](https://cinny.in) may help.

## What's next?

1. **[Create your first room](./your-first-room)**
2. **[Explore other clients](../clients/overview)**
3. **[Account security](../security/account)**

---

*Next: [Your First Room](./your-first-room) →*
