---
sidebar_position: 2
title: Power Tools
description: Admin CLIs, moderation bots, bot frameworks and command-line clients for Matrix
last_update:
  date: 2026-10-18
verified_with: "Synapse 1.163.0, Element Web 1.12.32, synadm 0.49.2, Hookshot 7.5.0, matrix-commander 8.0.6, Draupnir 3.2.0"
---

# Power Tools

Tools that go beyond a chat client: admin CLIs and UIs, moderation bots, bot frameworks, CI integrations and command-line clients. Versions are as of 2026-10.

:::warning Admin and bot tokens
Most tools on this page need a Synapse **admin** access token or a bot account with moderator power. Either one can read, change or delete data across your server or rooms. Use a dedicated account, store the token outside shell history and world-readable files, and revoke it when you no longer need it.
:::

## Server administration

### synadm

[synadm](https://codeberg.org/synadm/synadm) is a command-line client for the [Synapse admin API](https://element-hq.github.io/synapse/latest/usage/administration/admin_api/). Development is on Codeberg (v0.49.2, 2025-10-15); the old `JOJ0/synadm` GitHub repo is archived.

Install it with `pipx install synadm`, then run `synadm config` to enter the homeserver URL and an admin token. The commands below exist in v0.49.2; run `synadm <group> <command> --help` for all options.

```bash
# Users
synadm user list --name john                 # filter by name
synadm user details @alice:example.org
synadm user modify @alice:example.org --admin
synadm user modify @spammer:example.org --deactivate
synadm user password @alice:example.org      # prompts for the new password
synadm user login @alice:example.org         # token to act as the user (default expiry 24h)
synadm user shadow-ban @spammer:example.org
synadm user redact @spammer:example.org -r '!room1:example.org' -r '!room2:example.org'

# Rooms
synadm room list --empty
synadm room list --name general
synadm room details '!room:example.org'
synadm room members '!room:example.org'
synadm room delete '!room:example.org'

# Media
synadm media list -u @alice:example.org      # or: synadm user media @alice:example.org
synadm media purge -d 30                     # purge cached remote media not accessed for 30 days
synadm media quarantine --help

# Server
synadm version
synadm notice send @alice:example.org "Planned maintenance tonight"
```

`user redact` without `-r` redacts the user's events in every room. `room delete` is irreversible.

Support room: [#synadm:peek-a-boo.at](https://matrix.to/#/#synadm:peek-a-boo.at)

### Web admin UIs

- [synapse-admin](https://github.com/Awesome-Technologies/synapse-admin) (Awesome Technologies): user, room, media and registration-token management in the browser.
- [Ketesa](https://github.com/etkecc/ketesa) (etke.cc, v1.5.1, 2026-09-28): the widely used fork, formerly `etkecc/synapse-admin`, now multi-backend.

Both are static web apps that talk to the admin API with your admin token. Serve them on a private network, behind a VPN, or behind extra authentication; don't publish them on an open port.

---

## Moderation

### Draupnir

[Draupnir](https://github.com/the-draupnir-project/Draupnir) protects rooms using shared **policy lists** (ban lists stored as Matrix rooms).

- Latest is v3.2.0 (2026-10-14). v3.0.0 (2026-04-02) was a breaking release: it moved to a monorepo, needs Node 24 and requires the `--draupnir-config` option.
- v2.3.0 added takedowns, automatic suspension of matching users and support for [synapse-http-antispam](https://github.com/maunium/synapse-http-antispam).
- Setup needs a bot account (or appservice) and a management room named in its config. Follow the [Draupnir documentation](https://the-draupnir-project.github.io/draupnir-documentation/) rather than inviting the bot ad hoc.

Once it is running, these management-room commands create a policy list and subscribe to a community one:

```
!draupnir list create my-coc my-coc-ban-list
!draupnir watch #matrix-org-coc-bl:matrix.org
```

`watch` first shows a preview of what the list would ban and asks you to confirm.

Support: [#draupnir:matrix.org](https://matrix.to/#/#draupnir:matrix.org)

### Alternatives

- [Meowlnir](https://github.com/maunium/meowlnir) (v0.2609.0, 2026-09-16): a newer moderation bot by the mautrix author. It is optimised for Synapse and can act as a policy server.
- [Mjolnir](https://github.com/matrix-org/mjolnir): the original policy-list bot, still released (v2.0.x, 2026-10). See [Mjolnir](../bots/mjolnir).

---

## Bot frameworks

### Maubot

[Maubot](https://github.com/maubot/maubot) (v0.6.0, 2025-11-17) runs many plugin bots from one instance and has a web UI for managing them. The plugin index is at [plugins.mau.bot](https://plugins.mau.bot/). See also [Maubot](../bots/maubot).

Plugins worth knowing, taken from that index (last activity as of 2026-10):

| Plugin | What it does |
|--------|--------------|
| [reminder](https://github.com/maubot/reminder) | One-off reminders: `!remind <date> <message>`; others subscribe with 👍 |
| [github](https://github.com/maubot/github) | GitHub webhook receiver and issue creation |
| [rss](https://github.com/maubot/rss) | Posts RSS/Atom feed updates |
| [dice](https://github.com/maubot/dice) | Dice roller and calculator |
| [sed](https://github.com/maubot/sed) | `s/typo/fix/` corrections |
| [reactbot](https://github.com/maubot/reactbot) | Replies to messages that match rules |
| [translate](https://github.com/maubot/translate) | Google Translate (repo last updated 2024-01) |
| [antithread](https://github.com/maubot/antithread) | Redacts all messages in threads (last updated 2023) |
| [GiphyMaubot](https://github.com/TomCasavant/GiphyMaubot) (third-party) | GIF search via Giphy |
| [maubot-ntfy](https://gitlab.com/999eagle/maubot-ntfy) (third-party) | Subscribes to [ntfy](https://ntfy.sh) topics and posts them to Matrix |
| [gladia_transcribebot](https://github.com/conan747/gladia_transcribebot) (third-party) | Transcribes voice messages with the Gladia API |
| [maubot-llm](https://github.com/brokensandals/maubot-llm) (third-party) | Chat with LLMs on OpenAI-compatible servers (last updated 2024-05) |
| [maubot-token](https://github.com/yoxcu/maubot-token) (third-party) | Manage Synapse registration tokens (last updated 2024-08) |

Third-party plugins run with the bot's access token. Read the code before installing one.

### Hookshot

[Hookshot](https://github.com/matrix-org/matrix-hookshot) (7.5.0, 2026-09-22) bridges GitHub, GitLab, Jira, RSS/Atom feeds, generic webhooks, OpenProject and Figma into rooms. Full guide: [Hookshot](../bots/hookshot).

Commands in a room connected to a GitHub repository (prefix `!gh`):

```
!gh create "Login fails on Safari"     Create an issue (optional description and labels)
!gh assign 123 octocat                 Assign issue 123 to GitHub user(s); defaults to you
!gh close 123                          Close an issue
!gh workflow run deploy.yml env=prod   Run a workflow; args as key=value,key2='value 2'
```

In a room connected to a GitLab project (prefix `!gl`):

```
!gl create "Fix database migration"
!gl create-confidential "Security issue"
!gl close 42
```

Hookshot has no commands for listing PRs, approving or merging. You must log in to GitHub or GitLab through the bot before these commands work.

For inbound webhooks and JavaScript transformation functions, see [Automation](./automation#generic-webhooks-with-hookshot).

---

## CI/CD notifications

### GitHub Actions

[Cadair/matrix-notify-action](https://github.com/Cadair/matrix-notify-action) posts a workflow summary to a room. Pin a release tag (or a commit SHA), not `@main`:

```yaml title=".github/workflows/ci.yml (add to your existing jobs)"
jobs:
  # ... your build and test jobs ...
  notify:
    if: always()
    runs-on: ubuntu-latest
    needs: [build, test]
    steps:
      - uses: Cadair/matrix-notify-action@v3
        with:
          matrix_token: ${{ secrets.MATRIX_TOKEN }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          homeserver: 'https://matrix.example.org'
          roomid: '!roomId:example.org'
          summarise_success: true
```

The input names come from the action's `action.yml` at `v3`. `homeserver` defaults to `https://matrix.org` if you leave it out.

### GitLab CI

Besides Hookshot's GitLab connection, a plain client-server API call from the job works. Use `PUT` with a transaction ID, as the spec requires. Put the call in `after_script` of the job you want to report on. GitLab sets `CI_JOB_STATUS` to `success`, `failed` or `canceled` only there ([predefined variables](https://docs.gitlab.com/ci/variables/predefined_variables/)).

```yaml title=".gitlab-ci.yml"
deploy:
  script:
    - ./deploy.sh
  after_script:
    - |
      curl -sS -X PUT \
        "https://matrix.example.org/_matrix/client/v3/rooms/$MATRIX_ROOM_ID/send/m.room.message/$CI_JOB_ID" \
        -H "Authorization: Bearer $MATRIX_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"msgtype\":\"m.notice\",\"body\":\"$CI_PROJECT_NAME: $CI_JOB_NAME $CI_JOB_STATUS\"}"
```

`MATRIX_ROOM_ID` must be URL-encoded (`!` becomes `%21`, `:` becomes `%3A`). Store `MATRIX_TOKEN` as a masked CI variable.

---

## Command-line clients

### gomuks

[gomuks](https://github.com/gomuks/gomuks) (v0.2610.0, 2026-10-16) is now a Go backend with several frontends:

- **gomuks web** is the most mature frontend and is ready for daily use. Electron desktop and Android wrappers exist.
- **gomuks terminal** is an experimental port of the legacy client and supports little beyond basic chat.

The Go module is now `go.mau.fi/gomuks`; the old `maunium.net/go/gomuks` path installs the legacy v0.3 client. Install from the [releases](https://github.com/gomuks/gomuks/releases) or follow [docs.mau.fi/gomuks](https://docs.mau.fi/gomuks/). The `archivemuks` tool exports room history to JSON.

### matrix-commander

[matrix-commander](https://github.com/8go/matrix-commander) (8.0.6, 2026-07-02) sends and receives Matrix messages from scripts, with E2EE on by default. Installation and first-time login are covered in its README.

```bash
# Send a message, a file, an image
matrix-commander -m "Build complete" -r '!roomid:example.org'
matrix-commander -f ./report.pdf -r '!roomid:example.org'
matrix-commander -i ./screenshot.png -r '!roomid:example.org'

# Pipe text in
./generate-report.sh | matrix-commander -r '!reports:example.org'

# Print messages
matrix-commander --listen forever                     # all rooms, until stopped
matrix-commander --listen once                        # whatever is queued, then exit
matrix-commander --listen tail --tail 10 -r '!roomid:example.org'

# Rooms
matrix-commander --room-create myroom --name "My Room"     # alias localpart, not #myroom:server
matrix-commander --room-invite '!roomid:example.org' --user '@bob:example.org'
matrix-commander --room-kick '!roomid:example.org' --user '@bob:example.org'
```

Without `-r`, messages go to the default room saved in the credentials file. `matrix-commander-tui` is an interactive command builder that needs `fzf` and `vipe` (from moreutils).

A Rust rewrite, [matrix-commander-rs](https://github.com/8go/matrix-commander-rs), is at v0.11.0 (2026-06-27).

---

## Element Web shortcuts and commands

Checked against Element Web v1.12.32. Press `Ctrl/Cmd + /` for the full list.

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Jump to room search |
| `Ctrl/Cmd + Shift + U` | Upload a file |
| `Shift + Page Up` | Jump to oldest unread message |
| `Ctrl/Cmd + D` | Toggle microphone (in a call) |
| `Ctrl/Cmd + E` | Toggle camera in a call; toggles code formatting in the composer |
| `↑` in an empty composer | Edit your previous message |

```
/me <message>                 Emote
/shrug <message>              Prefix with ¯\_(ツ)_/¯   (also /tableflip, /unflip, /lenny)
/invite <user-id> [reason]
/remove <user-id> [reason]    Alias: /kick
/ban <user-id> [reason]
/op <user-id> [level]         Default level 50; /deop resets
/topic [topic]
/nick <name>                  Change your display name everywhere
/myroomnick <name>            Change it in this room only (alias /roomnick)
/myroomavatar [mxc-url]       Room-specific avatar; no argument opens a file picker
/plain <message>              Send without Markdown
/html <message>               Send raw HTML
/converttodm, /converttoroom
/devtools
```

Element Web has no `/markdown` command; use `/plain` to send a single message without formatting.

---

## Performance

### Sliding sync is built in

Synapse serves simplified sliding sync (MSC4186), which Element X uses, natively and enables it by default. You don't need a sliding-sync proxy or any config. (MSC3575, the original proposal, was closed without being merged.)

### Monitoring

Set `enable_metrics: true` and add a `metrics` listener bound to localhost. See [Self-Hosting Tips](./self-hosting-tips#monitoring). Synapse ships a Grafana dashboard at [contrib/grafana](https://github.com/element-hq/synapse/tree/develop/contrib/grafana).

### PostgreSQL

Size PostgreSQL settings from the machine's RAM, not from fixed numbers. See [Self-Hosting Tips](./self-hosting-tips#postgresql-tuning).

---

## Quick reference

| Need | Tool |
|------|------|
| CLI server admin | synadm |
| Web server admin | synapse-admin or Ketesa |
| Moderation | Draupnir, Meowlnir, Mjolnir |
| Plugin bots | Maubot |
| Developer integrations | Hookshot |
| Scripted messaging | matrix-commander |
| Lightweight client | gomuks web |
