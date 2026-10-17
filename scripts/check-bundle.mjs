#!/usr/bin/env node
// Comprueba que la app de gestión compilada no descarga antes del login nada de la guía completa:
// ni docs/ENTORNOS.md, ni firestore.rules, ni los pasos con valores (setup-steps.ts), ni el correo
// de la cuenta de invitados. Recorre los archivos JS que carga index.html y sus import estáticos
// (los import() dinámicos son las rutas en diferido, que solo se cargan después de entrar).
// Además comprueba que las pantallas están protegidas con canMatch en app.routes.ts.
// Se ejecuta en `postbuild`; si falla, la compilación y el despliegue fallan.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist', 'wedding-app', 'browser', 'admin');
const fail = (m) => { console.error(`check-bundle: ${m}`); process.exit(1); };

if (!existsSync(join(DIST, 'index.html'))) fail(`no encuentro ${DIST}\\index.html: ¿se ha compilado la app (ng build admin)?`);

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const guestEmail = read('src/app/core/services/guest-auth.service.ts').match(/GUEST_EMAIL\s*=\s*'([^']+)'/)?.[1];
const entornosTitle = read('docs/ENTORNOS.md').split(/\r?\n/).find((l) => l.startsWith('# '))?.slice(2).trim();
if (!guestEmail || !entornosTitle) fail('no puedo leer el correo de invitados o el título de docs/ENTORNOS.md');

const MARKERS = [
  [guestEmail, 'correo de la cuenta de invitados'],
  [entornosTitle, 'docs/ENTORNOS.md'],
  ['isGuest()', 'firestore.rules'],
  ['console.firebase.google.com/project/', 'pasos con enlaces a la consola (setup-steps.ts)'],
];

// Las pantallas (rutas en diferido) solo pueden cargarse después de entrar: el router descarga la de
// la ruta inicial aunque la pantalla de entrada la tape. Lo impide el canMatch de app.routes.ts.
const routesSrc = read('projects/admin/src/app/app.routes.ts');
if (!/screens\.map\(r => \(\{ \.\.\.r, canMatch: \[afterLogin\] \}\)\)/.test(routesSrc)) {
  fail('app.routes.ts ya no protege las pantallas con canMatch: [afterLogin]; se cargarían antes del login.');
}
if ((routesSrc.match(/loadComponent/g) || []).length !== (routesSrc.split('const screens')[1]?.split('export const routes')[0].match(/loadComponent/g) || []).length) {
  fail('app.routes.ts tiene rutas con loadComponent fuera de «screens»: se cargarían antes del login.');
}

// Archivos que index.html carga al abrir la página
const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const entry = [...html.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map((m) => m[1].replace(/^\.?\//, ''));
if (entry.length === 0) fail('index.html no carga ningún .js');

// import estáticos: import{..}from"./x.js", import"./x.js", export{..}from"./x.js" (no import("./x.js"))
const STATIC = /(?:import|export)\s*(?:[^"'();]*?from\s*)?["']\.\/([^"']+\.js)["']/g;
const initial = new Set();
const queue = [...entry];
while (queue.length) {
  const f = queue.shift();
  if (initial.has(f) || !existsSync(join(DIST, f))) continue;
  initial.add(f);
  for (const m of readFileSync(join(DIST, f), 'utf8').matchAll(STATIC)) queue.push(m[1]);
}

const leaks = [];
for (const f of initial) {
  const js = readFileSync(join(DIST, f), 'utf8');
  for (const [text, what] of MARKERS) if (js.includes(text)) leaks.push(`${f} contiene ${what}`);
}
if (leaks.length) {
  for (const l of leaks) console.error(`check-bundle: ERROR  ${l}`);
  fail('la pantalla de entrada descarga contenido de la guía completa. No importes nada de features/guide desde la entrada (usa features/gate/access-help.component.ts).');
}

// Comprobación de que el control sirve: la guía completa tiene que existir en alguna ruta en diferido
const all = readdirSync(DIST).filter((f) => f.endsWith('.js'));
const lazyHasGuide = all.some((f) => !initial.has(f) && readFileSync(join(DIST, f), 'utf8').includes(entornosTitle));
if (!lazyHasGuide) console.warn('check-bundle: AVISO  no encuentro la guía completa en ninguna ruta en diferido (¿ha cambiado el título de docs/ENTORNOS.md o la guía?)');

console.log(`check-bundle: correcto. Antes del login se cargan ${initial.size} archivos JS y ninguno contiene la guía completa.`);
