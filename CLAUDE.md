# CLAUDE.md — web de la boda de Daniela y Pablo

Fecha de la boda: 11 de septiembre de 2027. Respuestas siempre en español.

## Qué es este repositorio

Dos aplicaciones Angular 20 en un mismo repo, publicadas en GitHub Pages, con Firebase (Firestore + Authentication) como único backend:

- **Web pública** (`src/`, proyecto `wedding-app`): https://pibloo94.github.io/my-wedding/. Detrás de una contraseña de cortesía. Lee y escribe Firestore por REST (`HttpClient`), sin el SDK de Firebase.
- **App de gestión** (`projects/admin/`, proyecto `admin`): `/my-wedding/admin/`. Solo Daniela y Pablo. Usa el SDK `firebase` por npm. Invitados, mesas, plano, presupuesto, proveedores, tareas y editor del contenido de la web (CMS).
- **Código compartido:** `src/app/core/content/wedding-content.ts` (modelo, textos de respaldo y la única validación, `normalizeContent`) y `theme.ts`. El modelo se cambia ahí; no se duplica.

El repositorio es **público**. Nada de secretos ni datos personales en el código, los docs, los ejemplos ni los commits.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm start` / `npm run start:admin` | Web / app en **dev** (http://localhost:4200 y :4300) |
| `npm run build` | Compila web y app en **prod**. Es la comprobación obligatoria |
| `npm run start:prod` / `start:admin:prod` | Local contra **datos reales**. Solo si Pablo lo pide |
| `npm run docs:check` | Comprueba que los documentos siguen coherentes con el código (solo lee) |

No hay suite de tests mantenida. Para lógica o interfaz de la app: Playwright contra un build con Firestore en memoria (ver skill `project-architecture`).

## Reglas de trabajo

1. **Dev por defecto.** Prod solo cuando Pablo lo pida de forma explícita. Entornos en `docs/ENTORNOS.md` (skill `env-switch`).
2. **Nunca commit ni push.** Entrega el mensaje de commit y los archivos tocados. Pablo hace el commit y el push.
3. **Reglas de Firestore:** el orden importa (probar en dev → push → publicar en prod). Skill `firebase-rules-deploy`. Claude no puede publicar reglas: se pegan en la consola de Firebase.
4. **Una sola validación del contenido:** `normalizeContent()`. No validar en otros sitios.
5. **Firestore manda:** lo borrado o cambiado fuera de la app (consola, otro dispositivo) se refleja en la app. No romper la sincronización en los dos sentidos.
6. **Cambios en la web pública = tarea independiente** de la app de gestión. No reconstruir ni duplicar la web dentro de la app.
7. **Privacidad primero:** nunca publicar en `content/published` ni en el código datos de invitados, contactos, alergias, mesas, presupuesto o notas. Sin analítica, píxeles ni cookies de terceros sin aprobación. Skill `rsvp-privacy`.
8. **No tocar `.github/workflows/deploy.yml`** (Node 22, `npm ci`, build de producción).
9. Si cambias un campo: las dos apps, `firestore.rules` si aplica y `docs/MODELO-DATOS.md`. Skill `cms-content-field`.
10. Antes de editar un archivo de Pablo, parte de su versión actual y conserva sus finales de línea (CRLF o LF).
11. Distingue lo verificado (ejecutado) de lo pendiente en cada entrega.
12. **Documentación al día:** al terminar una tarea que toque reglas, campos, scripts, entornos o skills, ejecuta `npm run docs:check`, corrige los errores y revisa los avisos. Si un cambio altera algo que los documentos describen, actualízalos en la misma tarea.

## Formato de entrega

Qué cambié, qué archivos, qué comprobaciones ejecuté, qué queda pendiente, y mensaje de commit sugerido. Corto.

## Skills del proyecto (`.claude/skills/`)

| Skill | Cuándo |
|---|---|
| `project-architecture` | Cambios estructurales, CMS, calidad de código |
| `wedding-design` | Diseño visual de la web |
| `frontend-performance` | Rendimiento, imágenes, metadatos |
| `firebase-rules-deploy` | Tocar `firestore.rules` o el acceso de invitados/admins |
| `cms-content-field` | Añadir o cambiar un campo editable de la web |
| `release-checklist` | Antes de commit y push, y al verificar el despliegue |
| `rsvp-privacy` | Cualquier cosa que toque datos de invitados o el formulario |
| `env-switch` | Cambiar entre dev y prod, copiar datos, accesos |

## Archivos clave

- `docs/ENTORNOS.md`: dev y prod, preparar Firebase, usuarios.
- `docs/MODELO-DATOS.md`: campos entre web, Firestore y app.
- `FIREBASE-SETUP.md`: guía de Firebase de prod.
- `firestore.rules`: las mismas reglas en dev y prod.
- `public/firebase-config.json` (prod) y `env/dev/firebase-config.json` (dev).
- `src/app/core/services/guest-auth.service.ts`: acceso de invitados (contraseña de la web).
- `projects/admin/src/app/core/`: `store.service.ts`, `rsvp-sync.service.ts`, `content-editor.service.ts`, `content-model.ts`.
- `projects/admin/src/app/features/guide/setup-steps.ts`: guía de configuración del CMS; si cambia un paso, cambia también `docs/ENTORNOS.md`.

## Entorno de Claude en la nube

No puede descargar de npm ni de Google Fonts. Para compilar allí hace falta aportar `node_modules` (por ejemplo `nm-linux.tgz`). En el equipo de Pablo, `npm run build` funciona con normalidad.
