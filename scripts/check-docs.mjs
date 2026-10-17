#!/usr/bin/env node
// Comprobación de coherencia entre el código y la documentación del proyecto.
// Solo lee archivos: no modifica nada. Uso: `npm run docs:check`.
//
// Errores (código de salida 1): contradicciones comprobables.
// Avisos (código de salida 0): el código cambió después que su documento; revisar a mano.
// No detecta si un texto sigue siendo cierto: solo lo que se puede comprobar de forma mecánica.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

const exists = (p) => existsSync(join(ROOT, p));
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/** Lee un archivo que el resto de comprobaciones necesita; si falta, es un error y devuelve null. */
function need(p) {
  if (!exists(p)) {
    err(`Falta el archivo ${p}`);
    return null;
  }
  return read(p);
}

function listDocs() {
  const out = ['README.md', 'DEPLOYMENT.md', 'FIREBASE-SETUP.md', 'CLAUDE.md', 'env/README.md'];
  if (exists('docs')) {
    for (const f of readdirSync(join(ROOT, 'docs'))) if (f.endsWith('.md')) out.push(`docs/${f}`);
  }
  for (const d of skillDirs()) out.push(`.claude/skills/${d}/SKILL.md`);
  return out.filter(exists);
}

function skillDirs() {
  const base = join(ROOT, '.claude', 'skills');
  if (!existsSync(base)) return [];
  return readdirSync(base).filter((d) => existsSync(join(base, d, 'SKILL.md')));
}

// 1. Correo de la cuenta de invitados: código, reglas y documentos
function checkGuestEmail(docs) {
  const ts = need('src/app/core/services/guest-auth.service.ts');
  const rules = need('firestore.rules');
  if (!ts || !rules) return;
  const inCode = ts.match(/GUEST_EMAIL\s*=\s*'([^']+)'/)?.[1];
  const inRules = rules.match(/token\.email\s*==\s*'([^']+)'/)?.[1];
  if (!inCode) return err('No encuentro GUEST_EMAIL en guest-auth.service.ts');
  if (!inRules) return err('No encuentro el correo de invitados en firestore.rules');
  if (inCode !== inRules) {
    err(`El correo de invitados no coincide: guest-auth.service.ts (${inCode}) y firestore.rules (${inRules})`);
  }
  for (const d of docs) {
    for (const m of read(d).matchAll(/invitados@[\w.-]+/g)) {
      if (m[0] !== inCode) err(`${d}: menciona ${m[0]}, pero el correo real es ${inCode}`);
    }
  }
}

// 2. Campos que aceptan las reglas del formulario: deben estar descritos en MODELO-DATOS.md
function checkRulesFields() {
  const rules = need('firestore.rules');
  const model = need('docs/MODELO-DATOS.md');
  if (!rules || !model) return;
  const keys = new Set();
  for (const m of rules.matchAll(/hasOnly\(\[([^\]]*)\]\)/g)) {
    for (const k of m[1].matchAll(/'([^']+)'/g)) keys.add(k[1]);
  }
  if (keys.size === 0) return err('No encuentro listas hasOnly([...]) en firestore.rules (¿cambió su forma?)');
  for (const k of keys) {
    if (!model.includes('`' + k + '`')) {
      err(`firestore.rules acepta el campo «${k}», pero docs/MODELO-DATOS.md no lo describe`);
    }
  }
}

// 3. Scripts de npm: los de los documentos existen, y los de arrancar/compilar están documentados
function checkNpmScripts(docs) {
  const pkgText = need('package.json');
  if (!pkgText) return;
  const scripts = Object.keys(JSON.parse(pkgText).scripts ?? {});
  for (const d of docs) {
    for (const m of read(d).matchAll(/npm run ([a-z][\w:-]*)/g)) {
      if (!scripts.includes(m[1])) err(`${d}: menciona «npm run ${m[1]}», que no existe en package.json`);
    }
  }
  const entornos = exists('docs/ENTORNOS.md') ? read('docs/ENTORNOS.md') : '';
  for (const s of scripts.filter((n) => n === 'build' || n.startsWith('start'))) {
    const form = s === 'start' ? 'npm start' : `npm run ${s}`;
    if (!entornos.includes(form)) warn(`docs/ENTORNOS.md no menciona «${form}»`);
  }
}

// 4. Rutas de archivo citadas entre comillas invertidas
const PATH_EXT = /\.(ts|json|md|rules|ya?ml|scss|html|py|mjs|webp|png|jpe?g|svg)$/;
function checkPaths(docs) {
  for (const d of docs) {
    const seen = new Set();
    for (const m of read(d).matchAll(/`([^`\s]+)`/g)) {
      let p = m[1].replace(/^\.\//, '');
      if (seen.has(p)) continue;
      seen.add(p);
      if (!p.includes('/') || !PATH_EXT.test(p) || /[*{}<>…:]/.test(p) || p.startsWith('/')) continue;
      if (!exists(p) && !exists(join(dirname(d), p))) err(`${d}: cita ${p}, que no existe`);
    }
  }
}

// 5. Configuración de Firebase de cada entorno
function checkConfigs() {
  const prodText = need('public/firebase-config.json');
  const devText = need('env/dev/firebase-config.json');
  if (prodText) {
    const prod = JSON.parse(prodText);
    if (prod.env) err('public/firebase-config.json (prod) lleva «env»: se vería la etiqueta DEV en producción');
    if (prod.projectId !== 'boda-daniela-pablo') err(`public/firebase-config.json apunta a «${prod.projectId}», no a boda-daniela-pablo`);
  }
  if (devText) {
    const dev = JSON.parse(devText);
    if (dev.env !== 'dev') err('env/dev/firebase-config.json debe llevar "env": "dev"');
    if (dev.projectId !== 'boda-daniela-pablo-dev') err(`env/dev/firebase-config.json apunta a «${dev.projectId}», no a boda-daniela-pablo-dev`);
  }
}

// 6. Skills: la tabla de CLAUDE.md coincide con las carpetas, y cada SKILL.md tiene su cabecera
function checkSkills() {
  const dirs = skillDirs();
  for (const d of dirs) {
    const head = read(`.claude/skills/${d}/SKILL.md`).match(/^---\r?\nname: (.+?)\r?\ndescription: (.+?)\r?\n---/);
    if (!head) err(`.claude/skills/${d}/SKILL.md: falta la cabecera con name y description`);
    else if (head[1].trim() !== d) err(`.claude/skills/${d}/SKILL.md: name «${head[1].trim()}» no coincide con la carpeta`);
  }
  const claude = need('CLAUDE.md');
  if (!claude) return;
  const section = claude.split(/^## Skills del proyecto.*$/m)[1]?.split(/^## /m)[0];
  if (!section) return err('CLAUDE.md: no encuentro la sección «Skills del proyecto»');
  const listed = [...section.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|/gm)].map((m) => m[1]);
  for (const d of dirs) if (!listed.includes(d)) err(`CLAUDE.md no lista la skill «${d}»`);
  for (const l of listed) if (!dirs.includes(l)) err(`CLAUDE.md lista la skill «${l}», que no existe en .claude/skills`);
}

// 7. Avisos de frescura: el código cambió después que el documento que lo describe
function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}
function changedAt(p) {
  if (!exists(p)) return null;
  if (git(['status', '--porcelain', '--', p])) return statSync(join(ROOT, p)).mtimeMs;
  const t = git(['log', '-1', '--format=%ct', '--', p]);
  return t ? Number(t) * 1000 : null;
}
const FRESHNESS = [
  ['firestore.rules', 'docs/MODELO-DATOS.md'],
  ['firestore.rules', 'FIREBASE-SETUP.md'],
  ['src/app/core/content/wedding-content.ts', 'docs/MODELO-DATOS.md'],
  ['projects/admin/src/app/features/guide/setup-steps.ts', 'docs/ENTORNOS.md'],
  ['angular.json', 'docs/ENTORNOS.md'],
];
function checkFreshness() {
  if (git(['rev-parse', '--is-inside-work-tree']) !== 'true') return;
  for (const [source, doc] of FRESHNESS) {
    const s = changedAt(source);
    const d = changedAt(doc);
    if (s && d && s > d + 60_000) warn(`${source} cambió después que ${doc}: revisa si el documento sigue al día`);
  }
}

const docs = listDocs();
checkGuestEmail(docs);
checkRulesFields();
checkNpmScripts(docs);
checkPaths(docs);
checkConfigs();
checkSkills();
checkFreshness();

for (const w of warnings) console.log(`AVISO  ${w}`);
for (const e of errors) console.log(`ERROR  ${e}`);
console.log(
  errors.length === 0 && warnings.length === 0
    ? `docs:check: todo coherente (${docs.length} documentos revisados).`
    : `docs:check: ${errors.length} error(es), ${warnings.length} aviso(s) (${docs.length} documentos revisados).`,
);
process.exit(errors.length ? 1 : 0);
