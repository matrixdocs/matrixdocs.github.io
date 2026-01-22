---
sidebar_position: 2
title: Account Security
description: Protect your Matrix account from unauthorized access
---

# Account Security

Protect your Matrix account with these security practices.

## Strong Authentication

### Passwords

If using password authentication:

- **Minimum 16 characters**
- Use a **password manager**
- **Unique password** for Matrix
- Consider **passphrase** (4+ random words)

### Single Sign-On (SSO)

Many homeservers support SSO:

- **OAuth/OIDC** providers (Google, GitHub)
- **SAML** for enterprise
- **LDAP** for organizations

SSO benefits:
- Centralized authentication
- 2FA at provider level
- No Matrix-specific password

### Two-Factor Authentication

Enable 2FA when available:

1. Check homeserver supports it
2. Configure via homeserver admin
3. Use authenticator app

## Session Management

### Review Active Sessions

Regularly check your logged-in devices:

**Element**: Settings → Security → Sessions

Look for:
- **Unknown devices** - Potential compromise
- **Old sessions** - Remove if unused
- **Unverified** - Verify or remove

### Session Security

| Session Type | Security Level |
|--------------|---------------|
| Verified, cross-signed | Highest |
| Verified | High |
| Unverified | Medium |
| Unknown | Low - investigate |

### Remote Sign-Out

If a device is lost/stolen:

1. Go to Security settings
2. Find the session
3. Click "Sign out" or "Remove"
4. Change password if compromised

## Key Backup Security

### Recovery Key

Your recovery key provides full access. Protect it:

**DO:**
- Store in password manager
- Keep offline backup
- Use encrypted storage

**DON'T:**
- Share with anyone
- Store in plain text
- Screenshot and sync to cloud

### Recovery Scenarios

| Scenario | Solution |
|----------|----------|
| New device | Verify from existing device |
| Lost all devices | Use recovery key |
| Lost recovery key | Create new backup |
| Compromised key | Reset and re-verify |

## Social Engineering

### Common Attacks

| Attack | Example | Defense |
|--------|---------|---------|
| Phishing | Fake login pages | Check URL carefully |
| Impersonation | "Admin" asking for password | Never share passwords |
| Verification scams | "Verify with me" | Verify out-of-band |

### Verification Best Practices

Before verifying someone:

1. **Confirm identity** through another channel
2. **Compare emojis carefully**
3. **Don't rush** the process
4. **When in doubt**, don't verify

## Account Recovery

### If Compromised

1. **Change password** immediately
2. **Sign out all sessions**
3. **Reset key backup**
4. **Re-verify all devices**
5. **Check room memberships**
6. **Notify contacts** if needed

### If Locked Out

1. Try **recovery key/phrase**
2. Contact **homeserver admin**
3. May need to **create new account**
4. History in encrypted rooms **may be lost**

## Deactivation

### Temporary Leave

To take a break without deleting:
- Log out of all clients
- Leave/mute rooms
- Account remains

### Permanent Deactivation

Irreversible account deletion:

1. Contact homeserver admin
2. Or use admin API (if available)
3. All messages remain (by design)
4. Display name erased

### Before Deactivating

- Export important data
- Leave rooms manually
- Inform contacts
- Remove personal info from profile

## Privacy Settings

### Profile Visibility

Control what others see:

- **Display name** - Can be anything or empty
- **Avatar** - Optional
- **Presence** - Can disable

### Read Receipts

Disable if you don't want others to know you've read messages:

Settings → Preferences → Disable read receipts

### Typing Indicators

Can also be disabled for privacy.

## Multi-Account Usage

### Separate Accounts

Consider separate accounts for:

| Purpose | Why |
|---------|-----|
| Work | Compliance, separation |
| Personal | Privacy |
| Testing | Experimentation |
| Anonymous | Sensitive topics |

### Account Switching

Most clients support multiple accounts:
- Element: Profile menu → Add account
- FluffyChat: Built-in multi-account

## Audit Checklist

Monthly security review:

- [ ] Review active sessions
- [ ] Remove unused sessions
- [ ] Check verified devices
- [ ] Verify key backup works
- [ ] Review room memberships
- [ ] Update password if needed
- [ ] Check for client updates

---

*See also: [Security Overview](/security/overview)*
