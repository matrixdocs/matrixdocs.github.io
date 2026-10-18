#!/usr/bin/env node
// Checks the docs against pinned upstream sources:
//   config    - top-level and nested keys in Synapse homeserver.yaml blocks exist in
//               Synapse's config schema (SYNAPSE_SRC/schema/synapse-config.schema.yaml)
//   endpoint  - /_matrix/... paths exist in the spec's OpenAPI (MATRIX_SPEC/data/api)
//   admin     - /_synapse/admin/... paths appear in Synapse's admin API docs
//   event     - "type": "m.*" in JSON blocks is a type the spec defines
//   install   - npm/pip/cargo/go/docker targets are in scripts/install-allowlist.json
// Opt out of one fenced block with a line `{/* snippet:skip: reason */}` right before it.
// Usage: MATRIX_SPEC=... SYNAPSE_SRC=... [DOCS_DIR=...] node scripts/check-snippets.mjs [--json] [--strict] [--targets]
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SPEC = process.env.MATRIX_SPEC;
const SYN = process.env.SYNAPSE_SRC;
if (!SPEC || !SYN) {
  console.error('set MATRIX_SPEC and SYNAPSE_SRC to the pinned upstream clones (see scripts/upstream-versions.json)');
  process.exit(2);
}
const args = new Set(process.argv.slice(2));

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.mdx?$/.test(e.name)) out.push(p);
  }
  return out;
}

// ---------- ground truth ----------
const schema = yaml.load(fs.readFileSync(path.join(SYN, 'schema/synapse-config.schema.yaml'), 'utf8'));
// A few real top-level keys (e.g. experimental_features) are read in synapse/config/*.py but not in the
// schema. Keys whose read is followed by a ConfigError are removed settings that Synapse now rejects.
const REMOVED = new Set();
for (const f of fs.readdirSync(path.join(SYN, 'synapse/config'))) {
  if (!f.endsWith('.py')) continue;
  const src = fs.readFileSync(path.join(SYN, 'synapse/config', f), 'utf8').split('\n');
  src.forEach((l, i) => {
    for (const m of l.matchAll(/\bconfig\.get\(\s*"([a-z0-9_]+)"/g)) {
      if (m[1] in schema.properties) continue;
      if (/raise ConfigError|DEPRECATED|removed|no longer/i.test(src.slice(i, i + 6).join('\n'))) REMOVED.add(m[1]);
      else schema.properties[m[1]] = {description: `read in synapse/config/${f}, not in schema`};
    }
  });
}
for (const k of REMOVED) delete schema.properties[k];

function specRoutes() {
  const routes = [];
  for (const f of walk0(path.join(SPEC, 'data/api'))) {
    let doc;
    try { doc = yaml.load(fs.readFileSync(f, 'utf8')); } catch { continue; }
    if (!doc?.paths) continue;
    const base = doc.servers?.[0]?.variables?.basePath?.default ?? '';
    for (const [p, ops] of Object.entries(doc.paths)) {
      const deprecated = Object.values(ops).some((o) => o && o.deprecated);
      routes.push({tpl: (base + p).split('/').filter(Boolean), deprecated, file: path.relative(SPEC, f)});
    }
  }
  return routes;
}
function walk0(dir, out = []) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk0(p, out);
    else if (/\.ya?ml$/.test(e.name)) out.push(p);
  }
  return out;
}
const ROUTES = specRoutes();

function adminRoutes() {
  const files = [];
  for (const d of ['docs/admin_api', 'docs/usage/administration/admin_api']) {
    const p = path.join(SYN, d);
    if (fs.existsSync(p)) for (const f of fs.readdirSync(p)) if (f.endsWith('.md')) files.push(path.join(p, f));
  }
  const set = [];
  for (const f of files) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/\/_synapse\/admin\/v\d+\/[A-Za-z0-9_./<>{}$:@!%-]*/g)) {
      set.push(m[0].replace(/[.)]+$/, '').split('/').filter(Boolean));
    }
  }
  return set;
}
const ADMIN = adminRoutes();

// Event types the spec defines: anything quoted as an m.* identifier anywhere in the spec source.
const SPEC_TYPES = new Set();
for (const f of [...walk0(path.join(SPEC, 'data')), ...walkAll(path.join(SPEC, 'content'))]) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/\bm\.[a-z0-9_.]+[a-z0-9_]/g)) SPEC_TYPES.add(m[0]);
}
for (const f of fs.readdirSync(path.join(SPEC, 'data/event-schemas/schema'))) SPEC_TYPES.add(f.replace(/\.yaml$/, ''));
function walkAll(dir, out = []) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkAll(p, out);
    else out.push(p);
  }
  return out;
}

const allow = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/install-allowlist.json'), 'utf8'));

// ---------- matching ----------
const isParam = (s) => /^[{<$:!@#]/.test(s) || /^%(21|23|24|40)/i.test(s) || /[{}<>]/.test(s) || /^[A-Z_]+$/.test(s);
function matchRoute(segs, tpl) {
  if (segs.length !== tpl.length) return false;
  return tpl.every((t, i) => {
    if (/^\{.*\}$/.test(t) || /^<.*>$/.test(t) || /^\$/.test(t)) return true;
    return t === segs[i];
  });
}
function findRoute(segs, routes) {
  const hits = routes.filter((r) => matchRoute(segs, r.tpl ?? r));
  // Prefer an exact literal match over a parameter match.
  return hits;
}

function checkConfigNode(node, sch, prefix, out) {
  if (!node || typeof node !== 'object' || Array.isArray(node) || !sch) return;
  const props = sch.properties;
  if (!props) return;
  for (const [k, v] of Object.entries(node)) {
    if (!(k in props)) {
      if (sch.additionalProperties === false || !prefix) out.push(prefix + k);
      continue;
    }
    const child = props[k];
    if (child?.type === 'array' && child.items && Array.isArray(v)) v.forEach((it) => checkConfigNode(it, child.items, `${prefix}${k}[].`, out));
    else checkConfigNode(v, child, `${prefix}${k}.`, out);
  }
}

// ---------- scan ----------
const DOCS = process.env.DOCS_DIR ? path.resolve(process.env.DOCS_DIR) : path.join(ROOT, 'docs');
const report = [];
const totals = {config: 0, endpoint: 0, deprecated: 0, admin: 0, event: 0, install: 0};
const seenTargets = new Set();

for (const file of walk(DOCS).sort()) {
  const rel = path.relative(DOCS, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const findings = [];
  let inFence = false, lang = '', start = 0, buf = [], skip = false, skipNext = false;
  const add = (kind, line, msg) => { findings.push({kind, line, msg}); totals[kind]++; };

  const scanText = (text, lineNo, inCode) => {
    for (const m of text.matchAll(/\/_matrix\/[A-Za-z0-9_./{}<>!$:%@#-]+/g)) {
      const raw = m[0].replace(/[.,:)]+$/, '').split('?')[0];
      const segs = raw.split('/').filter(Boolean);
      if (segs.length < 3 || (segs.length === 3 && /^(v\d+|r0|unstable)$/.test(segs[2]))) continue; // "/_matrix/client/v3/" style prose
      if (segs.some((s) => s === '...' || s === '*')) continue;
      const hits = findRoute(segs, ROUTES);
      if (!hits.length) add('endpoint', lineNo, `${raw} is not in spec v1.19`);
      else if (hits.every((h) => h.deprecated)) add('deprecated', lineNo, `${raw} is deprecated in spec v1.19 (${hits[0].file})`);
    }
    for (const m of text.matchAll(/\/_synapse\/admin\/v\d+\/[A-Za-z0-9_./{}<>!$:%@#-]+/g)) {
      const raw = m[0].replace(/[.,:)]+$/, '').split('?')[0];
      const segs = raw.split('/').filter(Boolean);
      if (!findRoute(segs, ADMIN).length) add('admin', lineNo, `${raw} is not in Synapse 1.163 admin API docs`);
    }
    if (!inCode) return;
    const inst = [
      /\b(?:npm (?:install|i|add)|yarn add|pnpm add)\s+((?:-{1,2}[\w-]+\s+)*)([^\s|&;]+(?:\s+[^\s|&;-][^\s|&;]*)*)/g,
      /\bpip3? install\s+((?:-{1,2}[\w-]+\s+)*)([^\s|&;]+(?:\s+[^\s|&;-][^\s|&;]*)*)/g,
      /\bcargo (?:add|install)\s+((?:-{1,2}[\w-]+\s+)*)([^\s|&;]+(?:\s+[^\s|&;-][^\s|&;]*)*)/g,
    ];
    const eco = ['npm', 'pypi', 'crates'];
    inst.forEach((re, i) => {
      for (const m of text.matchAll(re)) {
        for (let t of m[2].split(/\s+/)) {
          if (!t || /\.(txt|toml|cfg)$/.test(t) || t.startsWith('-') || t.startsWith('.') || t.startsWith('/') || t.includes('=') && i !== 1) continue;
          if (i === 0) t = t.replace(/(.)@[^/]*$/, '$1');
          if (i === 1) t = t.replace(/\[.*\]/, '').replace(/[<>=!~].*$/, '').replace(/^["']|["']$/g, '').toLowerCase();
          checkTarget(`${eco[i]}:${t}`, lineNo, add);
        }
      }
    });
    for (const m of text.matchAll(/\bgo install\s+([^\s@]+)/g)) checkTarget(`go:${m[1]}`, lineNo, add);
    for (const m of text.matchAll(/\b(?:docker (?:run|pull|create)(?:\s+-{1,2}[\w-]+(?:[ =](?!-)[^\s]+)?)*|image:)\s+["']?([a-z0-9][a-z0-9._/-]*[a-z0-9])(?::[\w.-]+)?["']?/g)) {
      if (m[1].includes('/') || /^(postgres|redis|nginx|caddy|traefik|coturn)$/.test(m[1])) checkTarget(`docker:${m[1]}`, lineNo, add);
    }
  };

  function checkTarget(t, lineNo, addFn) {
    seenTargets.add(t);
    if (allow.denied?.[t]) addFn('install', lineNo, `${t} is denied: ${allow.denied[t]}`);
    else if (!allow.allowed?.[t]) addFn('install', lineNo, `${t} is not in scripts/install-allowlist.json`);
  }

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const fence = l.match(/^\s*(```+|~~~+)\s*([\w+-]*)/);
    if (!inFence && /\{\/\*\s*snippet:skip/.test(l)) { skipNext = true; continue; }
    if (fence && !inFence) { inFence = true; lang = fence[2]; start = i + 1; buf = []; skip = skipNext; skipNext = false; continue; }
    if (fence && inFence && /^\s*(```+|~~~+)\s*$/.test(l)) {
      inFence = false;
      if (skip) continue;
      const body = buf.join('\n');
      buf.forEach((b, j) => scanText(b, start + j + 1, true));
      if (/^ya?ml$/.test(lang)) {
        let doc;
        try { doc = yaml.load(body); } catch { doc = null; }
        if (doc && typeof doc === 'object' && !Array.isArray(doc)) {
          const keys = Object.keys(doc);
          const known = keys.filter((k) => k in schema.properties);
          const synapseish = !('services' in doc) && !('version' in doc && keys.length <= 3) && (/^#.*homeserver\.yaml/m.test(body) || /homeserver\.yaml/.test(lines.slice(Math.max(0, start - 4), start).join('\n')) || (keys.length && known.length / keys.length >= 0.5));
          if (synapseish) {
            const bad = [];
            checkConfigNode(doc, schema, '', bad);
            for (const k of bad) {
              const key = k.split('.').pop().replace('[]', '');
              const ln = buf.findIndex((b) => new RegExp(`^\\s*-?\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`).test(b));
              add('config', start + (ln < 0 ? 0 : ln) + 1, REMOVED.has(k) ? `Synapse config key \`${k}\` was removed; Synapse 1.163 refuses to start with it` : `Synapse config key \`${k}\` is not in the Synapse 1.163 schema`);
            }
          }
        }
      }
      if (/^(json|jsonc|json5)$/.test(lang)) {
        buf.forEach((b, j) => {
          for (const m of b.matchAll(/"type"\s*:\s*"(m\.[a-z0-9_.]+)"/g)) {
            if (!SPEC_TYPES.has(m[1])) add('event', start + j + 1, `event type ${m[1]} is not defined in spec v1.19`);
          }
        });
      }
      continue;
    }
    if (inFence) { buf.push(l); continue; }
    scanText(l, i + 1, false);
  }
  if (findings.length) report.push({file: rel, findings});
}

if (args.has('--targets')) {
  for (const t of [...seenTargets].sort()) console.log(t, allow.allowed?.[t] ? 'ok' : allow.denied?.[t] ? 'DENIED' : 'unknown');
  process.exit(0);
}
if (args.has('--json')) {
  console.log(JSON.stringify({totals, report}, null, 2));
} else {
  for (const r of report) {
    console.log(`\n${r.file}`);
    for (const f of r.findings) console.log(`  L${f.line}  [${f.kind}] ${f.msg}`);
  }
  const n = Object.values(totals).reduce((a, b) => a + b, 0);
  console.log(`\n${n} findings: ${Object.entries(totals).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  console.log(`pages with findings: ${report.length}`);
}
const n = Object.values(totals).reduce((a, b) => a + b, 0);
process.exit(args.has('--strict') && n ? 1 : 0);
