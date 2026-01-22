---
sidebar_position: 5
title: Server Comparison
description: Compare Matrix homeserver implementations
---

# Server Comparison

Choose the right homeserver for your needs.

## Overview

| Aspect | Synapse | Dendrite | Conduit |
|--------|---------|----------|---------|
| **Language** | Python | Go | Rust |
| **Status** | Stable | Stable | Beta |
| **Primary use** | Reference | Efficient | Lightweight |
| **Maintained by** | Element | Matrix.org | Community |

## Feature Comparison

### Core Protocol Support

| Feature | Synapse | Dendrite | Conduit |
|---------|---------|----------|---------|
| Client-Server API | ✅ Full | ✅ Full | ✅ Full |
| Server-Server API | ✅ Full | ✅ Full | ✅ Full |
| End-to-End Encryption | ✅ Full | ✅ Full | ✅ Full |
| Room versions | All | All | Most |
| Push notifications | ✅ | ✅ | ✅ |
| URL previews | ✅ | ✅ | ✅ |

### Advanced Features

| Feature | Synapse | Dendrite | Conduit |
|---------|---------|----------|---------|
| Spaces | ✅ Full | ✅ Full | 🔄 Basic |
| Threads | ✅ Full | ✅ Full | ✅ |
| VoIP/TURN | ✅ Full | ✅ | ✅ |
| Presence | ✅ | ✅ | ✅ |
| Typing indicators | ✅ | ✅ | ✅ |
| Read receipts | ✅ | ✅ | ✅ |
| SSO/OIDC | ✅ | ✅ | 🔄 |

### Integrations

| Feature | Synapse | Dendrite | Conduit |
|---------|---------|----------|---------|
| Appservices (bridges/bots) | ✅ Full | ✅ Full | 🔄 Basic |
| Integration managers | ✅ | ✅ | ✅ |
| Admin API | ✅ Extensive | 🔄 Basic | ❌ Limited |
| Prometheus metrics | ✅ | ✅ | 🔄 |

## Performance Comparison

### Resource Usage (Idle)

| Resource | Synapse | Dendrite | Conduit |
|----------|---------|----------|---------|
| **RAM** | 300-500 MB | 50-100 MB | 20-50 MB |
| **CPU** | Medium | Low | Very Low |
| **Disk I/O** | Medium | Low | Low |

### Under Load (1000+ users)

| Metric | Synapse | Dendrite | Conduit |
|--------|---------|----------|---------|
| **RAM** | 2-8 GB | 500 MB-2 GB | 200-500 MB |
| **CPU cores** | 2-4+ | 1-2 | 1 |
| **Database** | PostgreSQL | PostgreSQL | Embedded |

### Scaling Approach

```
Synapse:     Single → Workers → Multiple instances
Dendrite:    Monolith → Polylith (microservices)
Conduit:     Single instance (no horizontal scaling)
```

## Setup Complexity

### Time to First Message

| Server | Estimated Setup Time |
|--------|---------------------|
| Conduit | 15-30 minutes |
| Dendrite | 30-60 minutes |
| Synapse | 1-2 hours |

### Configuration Complexity

| Aspect | Synapse | Dendrite | Conduit |
|--------|---------|----------|---------|
| Config file | Large, many options | Medium | Small, simple |
| Database setup | Required (PostgreSQL) | Recommended | Built-in |
| Reverse proxy | Required | Required | Required |
| Documentation | Extensive | Good | Growing |

## Use Case Recommendations

### Personal Server

**Best: Conduit**
- Minimal resources
- Easy setup
- Good enough features

```
✅ Single user or small group
✅ Limited hardware (Pi, small VPS)
✅ Minimal maintenance desired
```

### Small Community (< 100 users)

**Best: Dendrite**
- Good balance of features and efficiency
- All essential features
- Moderate resources

```
✅ Community servers
✅ Small organizations
✅ Growing user base
```

### Organization / Large Community

**Best: Synapse**
- Complete feature set
- Proven at scale
- Best tooling

```
✅ Enterprise deployments
✅ Large user bases
✅ Complex requirements
✅ Bridges and integrations
```

## Migration Paths

### Conduit → Dendrite/Synapse

Currently no direct migration. Options:
1. Start fresh on new server
2. Export/import rooms manually
3. Run both in parallel

### Dendrite → Synapse

No automated migration. Same options as above.

### Synapse → Dendrite

Experimental migration tools in development.

## Decision Matrix

Score each factor (1-5) based on your needs:

| Factor | Weight | Synapse | Dendrite | Conduit |
|--------|--------|---------|----------|---------|
| Features | _ | 5 | 4 | 3 |
| Performance | _ | 3 | 4 | 5 |
| Ease of setup | _ | 2 | 3 | 5 |
| Maintenance | _ | 2 | 4 | 5 |
| Scalability | _ | 5 | 4 | 2 |
| Documentation | _ | 5 | 4 | 3 |
| Community | _ | 5 | 4 | 3 |

## Quick Decision Guide

```
Need all features? → Synapse
├── Enterprise/compliance? → Synapse
├── Large scale (1000+ users)? → Synapse + workers
└── Bridges critical? → Synapse

Want efficiency + features? → Dendrite
├── Medium scale (100-1000)? → Dendrite
├── Lower resource usage? → Dendrite
└── Modern codebase? → Dendrite

Want simplicity? → Conduit
├── Personal use? → Conduit
├── Minimal resources? → Conduit
├── Quick setup? → Conduit
└── Learning Matrix? → Conduit
```

## Hosting Options

### Self-Hosted

| Option | Synapse | Dendrite | Conduit |
|--------|---------|----------|---------|
| Docker | ✅ Official | ✅ Official | ✅ Official |
| Kubernetes | ✅ Helm charts | ✅ Helm charts | Community |
| Ansible | ✅ Playbooks | ✅ Playbooks | Community |
| NixOS | ✅ Module | ✅ Module | ✅ Module |

### Managed Hosting

| Provider | Server | Notes |
|----------|--------|-------|
| [Element Matrix Services](https://element.io/ems) | Synapse | Enterprise support |
| [etke.cc](https://etke.cc) | Synapse | Managed hosting |
| [ungleich](https://ungleich.ch) | Various | Swiss hosting |

## Conclusion

| If you want... | Choose |
|---------------|--------|
| Maximum features | Synapse |
| Best performance/features balance | Dendrite |
| Easiest setup | Conduit |
| Enterprise support | Synapse (EMS) |
| Minimal footprint | Conduit |
| Future-proof | Dendrite |

---

*Next: [Bridges Overview](../bridges/overview) →*
