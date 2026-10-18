---
sidebar_position: 2
title: Account Security
description: Protect your Matrix account from unauthorized access
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, Synapse 1.163.0, MAS 1.27.0, Element Web 1.12.32"
---

# Account Security

How to protect your Matrix account, your devices and your encrypted history.

## Signing in

### Passwords

If your server uses passwords:

- Use a **password manager** and a long, **unique** password.
- On servers that use the **Matrix Authentication Service (MAS)**, such as matrix.org, you enter your password on the server's account page (for matrix.org, [account.matrix.org](https://account.matrix.org/)), not inside the chat app. Check the address before typing it.

### Single sign-on

Homeservers can delegate login to an identity provider:

- **MAS with OAuth 2.0** is the current approach (spec v1.15+). MAS can itself use an upstream OpenID Connect provider, such as your organization's Keycloak, Entra ID or Google Workspace.
- **Synapse's built-in SSO** (OIDC, SAML, CAS) and LDAP via a password-provider module are still supported for servers that do not use MAS.

### Two-factor authentication

As of Synapse 1.163 and MAS 1.27, neither has built-in two-factor authentication (no TOTP, passkeys or security keys). To get it, put an identity provider that supports MFA in front of them:

- **As a user**: if your server offers SSO through a provider with multi-factor authentication, use it.
- **As an admin**: enforce MFA in the upstream identity provider that MAS or Synapse uses.

## Sessions

### Review active sessions

- **Element Web / Desktop**: Settings → **Devices**
- **Element X**: Settings → **Manage account & devices** (or **Manage devices**), which opens the account portal on MAS servers
- **MAS servers**: also in the account portal (for matrix.org, [account.matrix.org](https://account.matrix.org/account/))

Look for:
- **Unknown devices**: possible compromise; sign them out
- **Old sessions**: sign out if unused
- **Unverified sessions**: verify them or sign them out

### Device trust

Under the spec's recommended behaviour (v1.18, MSC4153), a device is either cross-signed by its owner or it is not:

| Session | Trust |
|---------|-------|
| Cross-signed by you (verified) | Trusted. Receives keys for encrypted messages. |
| Not cross-signed | Not trusted. Other clients should not send it keys, and should not show its messages. |
| A session you do not recognise | Treat as a compromise: sign it out and follow [If compromised](#if-compromised). |

There is no "medium" trust level. Verify every session you use, and remove the rest.

### Remote sign-out

If a device is lost or stolen:

1. Open your session list (above).
2. Select the session and choose **Sign out**.
3. Change your password if you think it was exposed (on MAS servers, in the account portal).

## Recovery key

### Protecting it

Your recovery key unlocks your encrypted message history and your cross-signing identity.

**Do:**
- Store it in a password manager
- Keep an offline copy in a safe place

**Don't:**
- Share it with anyone, including people claiming to be admins
- Keep it in plain text or in a screenshot synced to the cloud

Check that it is set up: Element Web → Settings → **Encryption**. **Key storage** should be on, and **Recovery** should be set up.

### Recovery scenarios

| Scenario | What to do |
|----------|------------|
| New device | Verify it from a signed-in device, or enter your recovery key |
| Lost all devices, have recovery key | Sign in and enter the recovery key |
| Lost recovery key, still have a signed-in device | Create a new recovery key from that device (Settings → **Encryption**) |
| Lost recovery key **and** all devices | Reset your digital identity. You keep your account and rooms, but lose encrypted history that existed only in key backup, and must re-verify devices and contacts. |
| Recovery key exposed | Create a new recovery key; if you suspect account compromise, reset your identity |

## Social engineering

### Common attacks

| Attack | Example | Defense |
|--------|---------|---------|
| Phishing | Fake login or account page | Check the URL; on MAS servers, only enter your password on your server's account page |
| Impersonation | "Admin" asking for your password or recovery key | Never share either |
| Verification scams | A stranger asking you to "verify" them | Verify only people you can confirm through another channel |

### Verifying people safely

1. **Confirm identity** through another channel (in person, video call).
2. **Compare the emoji carefully.**
3. **Don't rush.**
4. **When in doubt, don't verify.**

## If compromised {#if-compromised}

1. **Change your password** (on MAS servers, in the account portal).
2. **Sign out all other sessions**, from your client or the account portal.
3. **Reset your digital identity** if someone may have had your recovery key or a verified device: Element Web → Settings → **Encryption** → reset. This creates new cross-signing keys and a new recovery key.
4. **Verify your remaining devices** again.
5. **Check your rooms and profile** for changes.
6. **Tell your contacts**, so they re-verify you and ignore messages sent while you were compromised.

### If locked out

1. Use your server's password reset (usually by email).
2. Contact your homeserver admin.
3. Once back in, enter your recovery key to restore encrypted history.

## Deactivating your account

### Taking a break

Sign out of your clients or mute rooms. Your account stays as it is.

### Permanent deactivation

You can deactivate your own account; no admin is needed:

- **Element Web**: Settings → **Account** → **Deactivate account**.
- **MAS servers**: in the account portal. Since spec v1.18, clients must send you there rather than deactivating the account themselves.

You cannot undo deactivation yourself (only a server admin can reactivate an account). You leave all rooms, Synapse does not let your Matrix ID be registered again, and your contact details are removed from the identity server.

Your old messages stay visible to people who already received them. Element offers to **hide your messages from people who join rooms later**; this uses the spec's `erase` option ([account deactivation](https://spec.matrix.org/v1.19/client-server-api/#post_matrixclientv3accountdeactivate)), so your homeserver shows redacted copies to future joiners. The request is not sent over federation, so other servers may still serve the originals.

### Before deactivating

- Export anything you want to keep (Element can export a room's chat history)
- Tell your contacts where to find you
- Remove personal information from your profile

## Privacy settings

### Profile

- **Display name** and **avatar** are public to everyone who shares a room with you, and are not encrypted.
- **Presence** (online status) is shared only if your homeserver enables it.

### Read receipts and typing

In Element Web, **Settings → Preferences**:
- **Send read receipts**: when off, Element sends private receipts (`m.read.private`), which your server must support.
- **Send typing notifications**

## Several accounts

Separate accounts can make sense for work and personal use. Client support varies:

- **Element Web / Desktop**: one account at a time.
- **Element X**: multi-account support is in the Android v26.10.0 pre-release (2026-10-16); the current stable release, v26.09.4, does not have it.
- **FluffyChat**, **Commet** and **SchildiChat Revenge**: several accounts at once.
- **gomuks**: one account per backend; run several backends for several accounts.

## Checklist

Every few months:

- [ ] Review sessions and sign out unused ones
- [ ] Confirm every session you use is verified
- [ ] Confirm your recovery key is stored safely and **Key storage** is on
- [ ] Review room memberships
- [ ] Update your clients

---

*See also: [Security Overview](./overview)*
