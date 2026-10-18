#!/usr/bin/env node
// Checks bridge config blocks in the docs against each bridge's example config at the tag pinned in
// scripts/upstream-versions.json (fetched by scripts/fetch-upstream.sh into BRIDGES_SRC):
//   bridge        - every key path in a bridge config.yaml block exists in that bridge's example config
//                   (keys that are only commented out in the example count as existing)
//   registration  - every key in an appservice registration block is in the spec's registration schema
//                   (MATRIX_SPEC/data/api/application-service/definitions/registration.yaml)
// The bridge comes from a `mautrix/<name>` or `<project> <version>` comment in the block, else from the page.
// bridgev2 bridges: `network:` is checked against <bridge>/pkg/connector/example-config.yaml and the other
// sections against mautrix/go bridgev2/matrix/mxmain/example-config.yaml.
// Opt out of one fenced block with a line `{/* snippet:skip: reason */}` right before it.
// Usage: BRIDGES_SRC=... MATRIX_SPEC=... [DOCS_DIR=...] node scripts/check-bridge-configs.mjs [--json] [--strict]
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = process.env.BRIDGES_SRC;
const SPEC = process.env.MATRIX_SPEC;
if (!SRC || !SPEC) {
  console.error('set BRIDGES_SRC and MATRIX_SPEC to the pinned upstream files (run scripts/fetch-upstream.sh)');
  process.exit(2);
}
const args = new Set(process.argv.slice(2));
const PINS = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/upstream-versions.json'), 'utf8')).bridges;

// Bridges whose config is mautrix/go bridgev2 (shared sections) plus their own `network:` section.
const BRIDGEV2 = new Set(['mautrix-whatsapp', 'mautrix-signal', 'mautrix-slack', 'mautrix-telegram', 'mautrix-meta', 'mautrix-gmessages']);
// Default bridge per page when the block itself doesn't say. 'bridgev2' = shared sections only.
const PAGES = {
  'bridges/discord.md': 'mautrix-discord',
  'bridges/telegram.md': 'mautrix-telegram',
  'bridges/whatsapp.md': 'mautrix-whatsapp',
  'bridges/signal.md': 'mautrix-signal',
  'bridges/slack.md': 'mautrix-slack',
  'bridges/overview.md': 'bridgev2',
  'bridges/irc.md': null, // Heisenbridge has no config file; only its registration is checked
  'deployment/docker.md': 'mautrix-telegram',
  'bots/hookshot.md': 'matrix-hookshot',
};

// ---------- ground truth ----------
const GT = {};
for (const [name, pin] of Object.entries(PINS)) {
  const file = path.join(SRC, name, pin.config);
  if (!fs.existsSync(file)) { console.error(`missing ${file}; run scripts/fetch-upstream.sh`); process.exit(2); }
  const text = fs.readFileSync(file, 'utf8');
  GT[name] = {tree: yaml.load(text), loose: loosePaths(text, true).paths, label: `${pin.repo} ${pin.tag} ${pin.config}`};
}

// Key paths by indentation, including keys that are only commented out (`#key:` / `  # key:`).
// List markers are dropped, so `a:\n  - b: 1` gives a.b. Returns paths and the line of each path.
function loosePaths(text, withComments) {
  const paths = new Set(), lines = new Map(), stack = [];
  text.split('\n').forEach((raw, i) => {
    let l = raw;
    const c = l.match(/^(\s*)#(.*)$/);
    if (c) {
      if (!withComments) return;
      let rest = c[2];
      if (!c[1] && /^ \S/.test(rest)) rest = rest.slice(1); // "# key:" at column 0
      else if (c[1] && /^ /.test(rest)) rest = rest.slice(1); // "  # key:" indented
      l = c[1] + rest;
    }
    const m = l.match(/^(\s*)((?:-\s+)*)(["']?)([A-Za-z_][\w.-]*|[^\s"':#][^"':]*)\3\s*:(\s|$)/);
    if (!m || /^\s*#/.test(l)) return;
    const indent = m[1].length + m[2].length;
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    const p = [...stack.map((s) => s.key), m[4]].join('\u0000');
    paths.add(p);
    if (!lines.has(p)) lines.set(p, i);
    stack.push({indent, key: m[4]});
  });
  return {paths, lines};
}

const reg = yaml.load(fs.readFileSync(path.join(SPEC, 'data/api/application-service/definitions/registration.yaml'), 'utf8'));
const nsItem = yaml.load(fs.readFileSync(path.join(SPEC, 'data/api/application-service/definitions/namespace_list.yaml'), 'utf8'));
const REG = {
  top: new Set(Object.keys(reg.properties)),
  ns: new Set(Object.keys(reg.properties.namespaces.properties)),
  item: new Set(Object.keys(nsItem.items.properties)),
};

// ---------- matching ----------
const isMap = (v) => v && typeof v === 'object' && !Array.isArray(v);
// A map whose keys are user data (server names, user IDs, "*") rather than settings.
const freeForm = (v) => isMap(v) && (!Object.keys(v).length || Object.keys(v).some((k) => /[.@*:/]/.test(k)));
function mergeItems(list) {
  const out = {};
  for (const it of list) if (isMap(it)) for (const [k, v] of Object.entries(it)) if (!(k in out) || isMap(v)) out[k] = v;
  return out;
}

// Walk the doc block; ex is the example node (undefined when only the commented-out example covers it).
function checkNode(node, ex, gt, keyPath, out) {
  if (Array.isArray(node)) {
    const exItem = Array.isArray(ex) ? mergeItems(ex) : undefined;
    for (const it of node) checkNode(it, exItem, gt, keyPath, out);
    return;
  }
  if (!isMap(node)) return;
  if (freeForm(ex)) return;
  for (const [k, v] of Object.entries(node)) {
    const p = [...keyPath, k];
    if (isMap(ex) && k in ex) {
      const e = ex[k];
      if ((isMap(v) || Array.isArray(v)) && e !== null && typeof e !== 'object' && !gt.loose.has([...p, Object.keys(v)[0] ?? ''].join('\u0000'))) {
        out.push({path: p, msg: `is a ${typeof e} in the example config, not a ${Array.isArray(v) ? 'list' : 'map'}`});
        continue;
      }
      checkNode(v, e, gt, p, out);
    } else if (gt.loose.has(p.join('\u0000'))) {
      checkNode(v, undefined, gt, p, out);
    } else {
      out.push({path: p, msg: 'is not in'});
    }
  }
}

function checkRegistration(doc) {
  const out = [];
  for (const [k, v] of Object.entries(doc)) {
    if (k.includes('.')) continue; // namespaced extensions such as org.matrix.msc3202
    if (!REG.top.has(k)) { out.push({path: [k]}); continue; }
    if (k === 'namespaces' && isMap(v)) {
      for (const [n, list] of Object.entries(v)) {
        if (!REG.ns.has(n)) { out.push({path: [k, n]}); continue; }
        if (Array.isArray(list)) for (const it of list) if (isMap(it)) for (const f of Object.keys(it)) if (!REG.item.has(f)) out.push({path: [k, n, f]});
      }
    }
  }
  return out;
}

// Which bridge a block belongs to: a mention in the block's comments wins over the page default.
function identify(body, title, page) {
  const named = [];
  for (const m of body.matchAll(/^\s*#.*$/gm)) {
    for (const r of m[0].matchAll(/\b(mautrix\/[a-z]+|matrix-hookshot|matrix-appservice-irc)\b/g)) {
      const n = r[1].replace('/', '-');
      if (n !== 'mautrix-go' && PINS[n]) named.push(n);
    }
  }
  const t = title.match(/\b(mautrix-[a-z]+|matrix-hookshot|matrix-appservice-irc)\b/);
  if (t && PINS[t[1]]) named.push(t[1]);
  if (named.length) return named[0];
  if (/mautrix\/go\b|bridgev2/.test(body + title)) return PAGES[page] && BRIDGEV2.has(PAGES[page]) ? PAGES[page] : 'bridgev2';
  return PAGES[page];
}

// Split a doc into [section, example] pairs for the bridge.
function sections(bridge, doc) {
  if (bridge === 'bridgev2' || BRIDGEV2.has(bridge)) {
    const out = [];
    for (const [k, v] of Object.entries(doc)) {
      if (k === 'network') { if (bridge !== 'bridgev2') out.push({gt: bridge, node: v, prefix: ['network'], ex: GT[bridge].tree}); }
      else out.push({gt: 'mautrix-go', node: {[k]: v}, prefix: [], ex: GT['mautrix-go'].tree});
    }
    return out;
  }
  return [{gt: bridge, node: doc, prefix: [], ex: GT[bridge].tree}];
}

// ---------- scan ----------
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.mdx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const DOCS = process.env.DOCS_DIR ? path.resolve(process.env.DOCS_DIR) : path.join(ROOT, 'docs');
const report = [];
const totals = {bridge: 0, registration: 0};
let blocks = 0;

for (const file of walk(DOCS).sort()) {
  const rel = path.relative(DOCS, file).split(path.sep).join('/');
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const findings = [];
  const add = (kind, line, msg) => { findings.push({kind, line, msg}); totals[kind]++; };
  let inFence = false, lang = '', title = '', start = 0, buf = [], skip = false, skipNext = false;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const fence = l.match(/^\s*(```+|~~~+)\s*([\w+-]*)(.*)$/);
    if (!inFence && /\{\/\*\s*snippet:skip/.test(l)) { skipNext = true; continue; }
    if (fence && !inFence) {
      inFence = true; lang = fence[2]; title = (fence[3].match(/title="([^"]*)"/) || [, ''])[1];
      start = i + 1; buf = []; skip = skipNext; skipNext = false; continue;
    }
    if (inFence && /^\s*(```+|~~~+)\s*$/.test(l)) {
      inFence = false;
      if (skip || !/^ya?ml$/.test(lang)) continue;
      const body = buf.join('\n');
      let doc;
      try { doc = yaml.load(body); } catch { continue; }
      if (!isMap(doc) || 'services' in doc || /homeserver\.yaml|compose|prometheus/i.test(title)) continue;
      const where = loosePaths(body, false).lines;
      const lineOf = (p) => start + 1 + (where.get(p.join('\u0000')) ?? 0);
      const keys = Object.keys(doc);

      // Appservice registration files.
      if (/registration/i.test(title) || ['id', 'as_token', 'hs_token'].every((k) => k in doc)) {
        blocks++;
        for (const f of checkRegistration(doc)) add('registration', lineOf(f.path), `registration key \`${f.path.join('.')}\` is not in the spec v1.19 registration schema`);
        continue;
      }

      const bridge = identify(body, title, rel);
      if (!bridge) continue;
      const looksLikeConfig = /config\.ya?ml/i.test(title) || /example-config|config\.sample/.test(body);
      if (!looksLikeConfig) {
        // Untitled block: only check it if most top-level keys are the bridge's own sections.
        const top = new Set(sections(bridge, doc).flatMap((s) => Object.keys(s.ex)).concat(BRIDGEV2.has(bridge) ? ['network'] : []));
        if (keys.filter((k) => top.has(k)).length / keys.length < 0.5) continue;
      }
      blocks++;
      for (const s of sections(bridge, doc)) {
        const out = [];
        const gt = GT[s.gt];
        if (s.prefix.length) {
          // network: section. Its keys are the connector config's top level.
          checkNode(s.node, s.ex, {loose: gt.loose}, [], out);
          for (const f of out) f.path = [...s.prefix, ...f.path];
        } else checkNode(s.node, s.ex, gt, [], out);
        for (const f of out) {
          const shown = s.prefix.length ? f.path.slice(1) : f.path;
          const msg = f.msg === 'is not in' ? `is not in ${gt.label}` : f.msg + ` (${gt.label})`;
          add('bridge', lineOf(f.path), `${bridge} key \`${f.path.join('.')}\` ${msg}${s.prefix.length ? ` (as \`${shown.join('.')}\`)` : ''}`);
        }
      }
      continue;
    }
    if (inFence) buf.push(l);
  }
  if (findings.length) report.push({file: rel, findings});
}

if (args.has('--json')) {
  console.log(JSON.stringify({totals, blocks, report}, null, 2));
} else {
  for (const r of report) {
    console.log(`\n${r.file}`);
    for (const f of r.findings) console.log(`  L${f.line}  [${f.kind}] ${f.msg}`);
  }
  const n = Object.values(totals).reduce((a, b) => a + b, 0);
  console.log(`\n${n} findings in ${blocks} bridge config blocks: ${Object.entries(totals).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  console.log(`pages with findings: ${report.length}`);
}
const n = Object.values(totals).reduce((a, b) => a + b, 0);
process.exit(args.has('--strict') && n ? 1 : 0);
