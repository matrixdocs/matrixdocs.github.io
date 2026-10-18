---
title: About this site
last_update:
  date: 2026-10-18
description: Who writes Matrix Docs, how it was made, how pages are verified, and where the official documentation lives.
---

# About this site

**Matrix Docs is an independent, unofficial guide.** It is not affiliated with or endorsed by The Matrix.org Foundation, Element, or any project it describes. Matrix is a trademark of The Matrix.org Foundation C.I.C.

## How it was made

The first version of every page was drafted with an AI model in January 2026 and published without being checked. Readers noticed, rightly ([issue #1](https://github.com/matrixdocs/matrixdocs.github.io/issues/1)). That first draft contained invented packages, configuration keys and features, and was out of date in places.

In October 2026 every page was audited and then rewritten or corrected. Each one was checked against pinned upstream sources:

| Source | Pinned version |
|---|---|
| [Matrix specification](https://spec.matrix.org/v1.19/) | v1.19 (2026-07-08) |
| [Synapse documentation](https://element-hq.github.io/synapse/latest/) | v1.163.0 (2026-10-14) |

Bridges, bots, clients, SDKs and other servers were checked against each project's current release, and every page records what it was checked against in its front matter (`verified_with`). An automated check (`npm run check`) compares Synapse config keys, `/_matrix` endpoints, admin API paths, event types and install commands with these pinned sources on every change.

Verification reduces errors; it does not remove them. Projects change quickly, and a page is only as current as its date.

## Official documentation

When this site and an official source disagree, the official source wins. Start here:

- **Specification:** [spec.matrix.org](https://spec.matrix.org/), and proposals in [matrix-org/matrix-spec-proposals](https://github.com/matrix-org/matrix-spec-proposals).
- **Synapse:** [element-hq.github.io/synapse](https://element-hq.github.io/synapse/latest/).
- **Matrix.org guides and ecosystem listings:** [matrix.org/docs](https://matrix.org/docs/) and [matrix.org/ecosystem](https://matrix.org/ecosystem/).
- **Element:** [docs.element.io](https://docs.element.io/).
- Every other server, client, bridge, bot and SDK: its own repository and documentation, linked from the relevant page here.

## Reporting errors

Open an issue or a pull request at [matrixdocs/matrixdocs.github.io](https://github.com/matrixdocs/matrixdocs.github.io/issues). Please include the page, the claim, and a link to the source that contradicts it.
