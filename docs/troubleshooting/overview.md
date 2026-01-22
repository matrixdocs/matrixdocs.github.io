---
sidebar_position: 1
title: Troubleshooting Guide
description: Common Matrix issues and how to fix them
---

# Troubleshooting Guide

Solutions to common Matrix problems.

## Client Issues

### Can't Login

| Symptom | Cause | Solution |
|---------|-------|----------|
| "Unknown user" | Wrong username format | Use `@user:server.com` format |
| "Incorrect password" | Wrong password | Reset via homeserver admin |
| "Server not found" | Wrong server URL | Check homeserver address |
| Spinning forever | Network issue | Check internet, try different network |

### Messages Not Loading

1. **Check sync status** - Look for sync indicator
2. **Clear cache** - Settings → Help → Clear cache
3. **Re-login** - Sign out and back in
4. **Check network** - Try different connection

### Can't Decrypt Messages

**"Unable to decrypt" error:**

1. **Check key backup** - Settings → Security → Secure Backup
2. **Verify devices** - Verify other sessions
3. **Request keys** - Click message to request keys
4. **Re-verify** - May need to verify with sender

**Prevention:**
- Always set up key backup
- Verify new devices immediately
- Keep at least one verified session active

### Slow Performance

| Issue | Solution |
|-------|----------|
| Slow sync | Leave unused rooms, clear cache |
| High memory | Use lighter client (Cinny, Hydrogen) |
| Sluggish UI | Disable URL previews, reduce animations |

## Federation Issues

### Messages Not Reaching Other Servers

**Test federation:**
```bash
curl https://federationtester.matrix.org/api/report?server_name=example.com
```

**Common causes:**

| Issue | Solution |
|-------|----------|
| Port 8448 blocked | Open firewall |
| Missing .well-known | Configure delegation |
| SSL issues | Valid certificate required |
| DNS problems | Check A/CNAME records |

### .well-known Setup

**Server delegation** (`/.well-known/matrix/server`):
```json
{"m.server": "matrix.example.com:443"}
```

**Client discovery** (`/.well-known/matrix/client`):
```json
{"m.homeserver": {"base_url": "https://matrix.example.com"}}
```

### Federation Lag

If messages are delayed:

1. Check homeserver resources (CPU, RAM)
2. Review federation queue size
3. Check target server status
4. Consider rate limiting from remote

## Encryption Issues

### Device Verification Failed

1. Try again - temporary network issues
2. Check time sync on both devices
3. Use different verification method (QR vs emoji)
4. As last resort, reset cross-signing

### Key Backup Not Working

| Problem | Solution |
|---------|----------|
| Can't create backup | Check server supports backup |
| Can't restore | Verify recovery key is correct |
| Keys not syncing | Check backup is enabled |

### Room Shows "Encryption not enabled"

- Room was created without E2EE
- Encryption is permanent - can't be disabled once enabled
- Create new room with encryption enabled

## Server Issues

### Synapse High Memory

```yaml
# Reduce caches in homeserver.yaml
caches:
  global_factor: 0.5
```

Or enable workers for horizontal scaling.

### Database Issues

**PostgreSQL connection errors:**
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Check connection
psql -U synapse -h localhost synapse
```

**Database maintenance:**
```bash
# Vacuum and analyze
psql -U synapse -c "VACUUM ANALYZE;" synapse
```

### Disk Space Full

**Find large items:**
```bash
du -sh /var/lib/synapse/*
```

**Cleanup options:**
- Purge old media: Admin API
- Purge remote media: Admin API
- Compress database

### Service Won't Start

**Check logs:**
```bash
journalctl -u matrix-synapse -f
```

**Common issues:**
- Config syntax error
- Missing signing key
- Port already in use
- Database connection failed

## Bridge Issues

### Bridge Not Connecting

1. Check bridge logs
2. Verify registration file is loaded
3. Confirm homeserver URL
4. Test with `!bridge ping` or similar

### Messages Not Bridging

| Direction | Check |
|-----------|-------|
| Matrix → Remote | Bridge account permissions |
| Remote → Matrix | Room is bridged correctly |
| Both | Bridge service running |

### Double Messages

- Multiple bridge instances running
- Room bridged twice
- Check bridge configuration

## Media Issues

### Upload Failed

| Cause | Solution |
|-------|----------|
| File too large | Check `max_upload_size` |
| Unsupported type | Check server accepts format |
| Disk full | Free space on server |

### Media Not Loading

1. Check media URL is accessible
2. Verify SSL certificate
3. Check CDN/proxy configuration
4. Clear client cache

## VoIP/Video Issues

### Calls Not Connecting

1. **Check TURN server** - Needed for most calls
2. **Firewall** - Ports 3478, 5349, 10000-20000
3. **Browser permissions** - Camera/mic allowed?
4. **NAT issues** - TURN helps traverse NAT

### Poor Call Quality

- Use wired connection
- Close other bandwidth-heavy apps
- Check TURN server location
- Try audio-only first

## Getting Help

### Information to Include

When asking for help:

```
1. Client/Server name and version
2. Error message (exact text)
3. Steps to reproduce
4. What you've tried
5. Relevant logs (sanitized)
```

### Support Channels

| Resource | Best For |
|----------|----------|
| [#matrix:matrix.org](https://matrix.to/#/#matrix:matrix.org) | General help |
| [#synapse:matrix.org](https://matrix.to/#/#synapse:matrix.org) | Synapse issues |
| [#element-web:matrix.org](https://matrix.to/#/#element-web:matrix.org) | Element issues |
| [GitHub Issues](https://github.com/matrix-org) | Bug reports |

---

*Need more help? Join [#matrix:matrix.org](https://matrix.to/#/#matrix:matrix.org)*
