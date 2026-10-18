---
sidebar_position: 8
title: "Matrix and Solid: a design sketch"
description: A proposal for linking Matrix accounts to WebIDs and archiving chats to Solid pods. No implementation exists.
last_update:
  date: 2026-10-18
verified_with: "spec v1.19, SolidOS solid-ui chatLogic.js and chat-pane (main, 2026-10)"
---

# Matrix and Solid: a design sketch

:::info Proposal, not software
There is no Matrix↔Solid bridge, bot or library. This page sketches what an integration could look like. Nothing here is installable, and nothing here is a standard.
:::

[Solid](https://solidproject.org/TR/protocol) stores personal data in "pods" under the user's control and identifies people by [WebID](https://www.w3.org/wiki/WebID), a URL that resolves to an RDF profile. Logins use [Solid-OIDC](https://solidproject.org/TR/oidc). Standardisation continues in the W3C [Linked Web Storage Working Group](https://www.w3.org/groups/wg/lws/).

## 1. Linking a Matrix account to a WebID

**From WebID to Matrix.** The FOAF idiom for "this person has an account" is `foaf:account` (`foaf:holdsAccount` is its deprecated old name). Don't use `owl:sameAs`, which would claim the person *is* the account. The account can be named with a [`matrix:` URI](https://spec.matrix.org/v1.19/appendices/#matrix-uri-scheme), which has been in the spec since v1.2:

```turtle title="profile/card.ttl (sketch)"
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<#me> foaf:account <matrix:u/alice:example.org> .
<matrix:u/alice:example.org> a foaf:OnlineAccount ;
    foaf:accountName "@alice:example.org" .
```

**From Matrix to WebID.** Since spec v1.16, users can set custom profile fields (MSC4133). A client could store a WebID under a namespaced key it controls, such as `org.example.webid`; that key name is only an example. A verifier would trust the link only when both sides point at each other.

## 2. Archiving a room to a pod

A bot in the room could write messages to a pod. To be readable in SolidOS, it should follow the layout the SolidOS chat code uses (`solid-ui/src/chat/chatLogic.js`):

- the channel is `index.ttl#this`, typed `meeting:LongChat` (a class used by the SolidOS code, not defined in the published meeting ontology);
- messages go in `YYYY/MM/DD/chat.ttl`;
- the channel links each message with `wf:message` (`http://www.w3.org/2005/01/wf/flow#`);
- a message has `sioc:content`, `dct:created` and `foaf:maker`;
- edits use `dct:isReplacedBy`, and deletions use `schema:dateDeleted`.

```turtle title="2026/10/18/chat.ttl (sketch)"
@prefix wf:   <http://www.w3.org/2005/01/wf/flow#> .
@prefix sioc: <http://rdfs.org/sioc/ns#> .
@prefix dct:  <http://purl.org/dc/terms/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .

<../../../index.ttl#this> wf:message <#msg1> .

<#msg1> sioc:content "Hello from Matrix" ;
    dct:created "2026-10-18T09:30:00Z"^^xsd:dateTime ;
    foaf:maker <https://alice.example/profile/card#me> .
```

Open problems: many senders have no WebID; Matrix redactions would need to reach the archive; and media needs authenticated download (spec v1.11) before it can be copied.

## 3. Consent and privacy

Archiving your own messages is your choice. Archiving **other people's** messages is not:

- **Ask first.** People in a Matrix room did not agree to have their messages copied to a third-party store. Announce the bot, explain where the data goes, and only archive rooms where members have agreed, or archive only the messages of users who opt in.
- **Keep it private.** Write the archive to a private container with access control. Never put other people's messages in a public folder.
- **Encrypted rooms.** To archive an encrypted room, the bot must be a member that decrypts every message. That defeats what members expected from end-to-end encryption, so don't do it without explicit agreement.
- **Honour deletions.** When a Matrix message is redacted, delete it from the archive too. Under laws such as the GDPR, people may also ask you to remove their data.
- **Mind the law.** Storing other people's personal data can make you a data controller, with legal duties that depend on where you and they are.

## Further reading

- [Solid Protocol](https://solidproject.org/TR/protocol) and [Solid-OIDC](https://solidproject.org/TR/oidc)
- [SolidOS chat-pane](https://github.com/SolidOS/chat-pane) and [solid-ui chat code](https://github.com/SolidOS/solid-ui/tree/main/src/chat)
- [Matrix URI scheme](https://spec.matrix.org/v1.19/appendices/#matrix-uri-scheme) and [profile endpoints](https://spec.matrix.org/v1.19/client-server-api/#profiles)
- [#solid:matrix.org](https://matrix.to/#/#solid:matrix.org)
