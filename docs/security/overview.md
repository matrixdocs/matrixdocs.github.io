---
sidebar_position: 1
title: Security & Privacy
description: Understanding Matrix security and protecting your privacy
---

# Security & Privacy

Matrix is designed with security in mind. Understanding these features helps you make informed decisions about your privacy.

## End-to-End Encryption (E2EE)

### How It Works

Matrix uses the **Olm** and **Megolm** cryptographic protocols:

```
Alice's Device          Matrix Server           Bob's Device
     │                       │                       │
     │──── Encrypted ────────►───── Encrypted ─────►│
     │      Message          │       Message         │
     │                       │                       │
     │   (Server cannot      │    (Server cannot     │
     │    read content)      │     read content)     │
```

- **Olm**: For 1:1 device-to-device encryption
- **Megolm**: For efficient group encryption

### What's Encrypted

| Encrypted | Not Encrypted |
|-----------|---------------|
| Message content | Room membership |
| File contents | Room names/topics |
| Reactions | Timestamps |
| Edits | Sender information |
| Replies | Message type |

### Device Verification

Verify devices to ensure you're talking to the right person:

1. **Emoji Verification**: Compare emojis displayed on both devices
2. **QR Code**: Scan a QR code on the other device
3. **Cross-Signing**: Your verified devices vouch for each other

```
✓ Verified device    - Messages are secure
⚠ Unverified device  - Could be an attacker
✗ Blocked device     - Will not receive messages
```

## Key Management

### Secure Backup

**Critical!** Set up secure backup to protect your keys:

1. **Settings → Security → Secure Backup**
2. Choose recovery method:
   - **Security Key**: Save a long code
   - **Security Phrase**: Remember a passphrase
3. **Store safely** - Losing this means losing message history

### Cross-Signing

Cross-signing lets your devices trust each other:

```
Master Key
    │
    ├── Self-Signing Key (signs your devices)
    │       └── Device A ✓
    │       └── Device B ✓
    │
    └── User-Signing Key (signs other users)
            └── Friend's Master Key ✓
```

### Key Requests

When you can't decrypt a message:

1. Client requests key from your other devices
2. Other devices share the session key
3. Message becomes decryptable

## Privacy Considerations

### Metadata

Even with E2EE, some information is visible:

| Visible | To Whom |
|---------|---------|
| Who's in rooms | Server admins, other members |
| When messages sent | Server admins |
| Who you message | Server admins |
| Room names/topics | Server admins, members |

### Homeserver Trust

Your homeserver sees metadata. Choose carefully:

| Homeserver | Trust Level |
|------------|-------------|
| Self-hosted | Full control |
| Trusted provider | Read their privacy policy |
| matrix.org | Large, public |

### IP Addresses

Your IP is visible to:
- Your homeserver
- Federated servers (in some cases)
- Turn servers (for VoIP)

Use a VPN for additional privacy.

## Room Security

### Private vs Public Rooms

| Setting | Private Room | Public Room |
|---------|--------------|-------------|
| Join | Invite only | Anyone |
| Directory | Hidden | Listed |
| History | Members only | Configurable |

### History Visibility

Control who sees past messages:

| Setting | Who Can See |
|---------|-------------|
| `world_readable` | Anyone, even non-members |
| `shared` | All members (current and past) |
| `invited` | From when they were invited |
| `joined` | Only from when they joined |

### Server ACLs

Block entire servers from a room:

```json
{
  "type": "m.room.server_acl",
  "content": {
    "allow": ["*"],
    "deny": ["evil.server.com"],
    "allow_ip_literals": false
  }
}
```

## Best Practices

### For Users

1. **Enable E2EE** for sensitive conversations
2. **Verify devices** of important contacts
3. **Set up key backup** immediately
4. **Review sessions** regularly
5. **Use strong passwords** or SSO
6. **Be cautious** about room invites

### For Admins

1. **Enable registration limits** to prevent abuse
2. **Configure rate limiting** against spam
3. **Monitor federation** for problematic servers
4. **Regular backups** of signing keys
5. **Keep software updated**
6. **Use TLS everywhere**

## Security Tools

### Mjolnir/Draupnir

Moderation bots for community protection:
- Ban list management
- Spam detection
- Server ACLs

### Pantalaimon

E2EE proxy for bots:
- Allows bots to work in encrypted rooms
- Handles key management

## Reporting Security Issues

Found a vulnerability?

- **Element**: security@element.io
- **Matrix.org**: security@matrix.org
- **Responsible disclosure** expected

## Resources

- [Matrix Security Disclosures](https://matrix.org/security-disclosure-policy/)
- [E2EE Implementation Guide](https://matrix.org/docs/guides/implementing-more-advanced-e2ee-features/)
- [Olm/Megolm Specification](https://matrix.org/docs/matrix-concepts/end-to-end-encryption/)

---

*Next: [Account Security](/security/account) →*
