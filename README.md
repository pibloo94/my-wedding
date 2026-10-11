# Daniela & Pablo — web de la boda

Web pública de la boda (11 de septiembre de 2027): información del evento y confirmación de asistencia.

**URL:** https://pibloo94.github.io/my-wedding/

Hecha con Angular 20 (componentes standalone) y SCSS. Se publica en GitHub Pages.

## Desarrollo

```bash
npm install
npm start              # web → http://localhost:4200/
npm run start:admin    # app de gestión → http://localhost:4300/
npm run build          # compila la web y, a continuación, la app (postbuild) en dist/wedding-app/browser/admin
```

## Publicación

Cada **push a `main`** lanza el workflow `.github/workflows/deploy.yml`, que compila y publica en GitHub Pages. Los detalles están en [DEPLOYMENT.md](DEPLOYMENT.md).

## Estructura

| Ruta | Contenido |
|---|---|
| `src/app/sections/hero` | Portada: escudo, nombres, fecha, cuenta atrás |
| `src/app/sections/event-details` | Cronograma del día (ceremonia, cóctel, comida, baile) |
| `src/app/sections/need-to-know` | Información práctica (vestimenta, lugar, menú) |
| `src/app/sections/rsvp` | Formulario de confirmación |
| `src/app/sections/registry` | Lista de bodas (transferencia) |
| `src/app/shared/navbar`, `footer`, `icon` | Navegación, pie e iconos |
| `src/app/shared/password-gate` | Pantalla de acceso con contraseña |
| `src/app/core/services/rsvp.service.ts` | Envío del RSVP a Firestore |
| `src/app/core/content/wedding-content.ts` | Textos por defecto de la web y validación del contenido publicado |
| `src/app/core/services/content.service.ts` | Lee el contenido publicado (Firestore `content/published`) |
| `src/styles.scss` | Sistema visual (paleta, tipografía Butler, botones, tarjetas) |
| `public/assets/brand` | Ilustraciones en acuarela (PNG + WebP) |
| `public/fonts` | Tipografía Butler (woff2) |
| `scripts/process_assets.py` | Procesado de las ilustraciones |

Los colores también se publican desde la app (Temática): la web los aplica como variables CSS (`src/app/core/content/theme.ts`); con los colores por defecto no cambia nada.

Los textos editables (fecha, programa del día, información práctica, fecha límite y correo de contacto, datos de la lista de bodas) **se editan y publican desde la app de gestión** (Web de la boda → Contenido). La web los lee de Firestore al cargar; si Firebase no responde, usa los de `wedding-content.ts`. Si cambias la estructura del contenido, actualiza también la app (`DEFAULT_CONTENT`) y [docs/MODELO-DATOS.md](docs/MODELO-DATOS.md).

## Confirmaciones (RSVP) y Firebase

El formulario pide, para cada persona, menú (estándar o vegetariano), sin gluten, sin lactosa y alergias. También pide un correo o teléfono, y los niños que vienen con nombre, edad y alergias.

Cada respuesta se guarda en Firestore (colección `rsvps`) mediante la API REST, sin dependencias extra, y aparece al momento en la app de gestión. La configuración pública está en `public/firebase-config.json`. Guía de alta: [FIREBASE-SETUP.md](FIREBASE-SETUP.md). Reglas: [firestore.rules](firestore.rules).

El formulario incluye un campo oculto anti-spam (`website`). Los campos compartidos entre web y app están en [docs/MODELO-DATOS.md](docs/MODELO-DATOS.md).

## App de gestión (privada)

Segunda aplicación Angular del mismo proyecto, en `projects/admin`. Se publica en **https://pibloo94.github.io/my-wedding/admin/** con el mismo despliegue que la web.

- Solo entran las cuentas dadas de alta en la colección `admins` de Firestore (login con Google).
- Los datos (invitados, mesas y plano, presupuesto, tareas…) viven en Firestore y no en el código. Firestore usa caché persistente: si se corta la conexión, los cambios quedan en el navegador y se suben al volver.
- Si `firebase-config.json` no tiene proyecto, funciona en modo local, guardando en el navegador.
- Comparte con la web el modelo de contenido (`@web/content` → `src/app/core/content/wedding-content.ts`) y el cálculo de colores (`@web/theme` → `theme.ts`).

| Ruta | Contenido |
|---|---|
| `projects/admin/src/app/core` | Servicios: Firebase, estado y sincronización (`store.service`), respuestas de la web (`rsvp-sync.service`), editor de contenido, formularios y reglas de negocio |
| `projects/admin/src/app/shared` | Componentes comunes: diálogo, formulario, iconos, cabecera, dibujo de mesas |
| `projects/admin/src/app/features` | Una carpeta por sección: inicio, invitados, mesas (reparto y plano del salón), presupuesto, proveedores, tareas, temática, web, configuración |

## A tener en cuenta

- **El repositorio es público.** Todo lo que haya en el código (textos, datos bancarios, configuración de Firebase) es visible para cualquiera. Los datos de invitados no están en el código: viven en Firestore, protegidos por las reglas.
- **La contraseña de acceso se comprueba en el navegador**, comparando su hash SHA-256. Evita que la web se lea por casualidad, pero no protege datos: no publiques nada privado.
- El acceso se recuerda 30 días en el navegador de cada invitado (`localStorage`).
