# Daniela & Pablo — web de la boda

Web pública de la boda (11 de septiembre de 2027): información del evento y confirmación de asistencia.

**URL:** https://pibloo94.github.io/my-wedding/

Hecha con Angular 20 (componentes standalone) y SCSS. Se publica en GitHub Pages.

## Desarrollo

```bash
npm install
npm start        # ng serve → http://localhost:4200/
npm run build    # compilación de producción en dist/wedding-app/browser
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
| `src/styles.scss` | Sistema visual (paleta, tipografía Butler, botones, tarjetas) |
| `public/assets/brand` | Ilustraciones en acuarela (PNG + WebP) |
| `public/fonts` | Tipografía Butler (woff2) |
| `scripts/process_assets.py` | Procesado de las ilustraciones |

Los textos de cada sección están, por ahora, dentro de su archivo `.ts` o `.html`.

## Confirmaciones (RSVP) y Firebase

El formulario pide, para cada persona, menú (estándar o vegetariano), sin gluten, sin lactosa y alergias. También pide un correo o teléfono, y los niños que vienen con nombre, edad y alergias.

Cada respuesta se guarda en Firestore (colección `rsvps`) mediante la API REST, sin dependencias extra, y aparece al momento en la app de gestión. La configuración pública está en `public/firebase-config.json`. Guía de alta: [FIREBASE-SETUP.md](FIREBASE-SETUP.md). Reglas: [firestore.rules](firestore.rules).

El formulario incluye un campo oculto anti-spam (`website`). Los campos compartidos entre web y app están en [docs/MODELO-DATOS.md](docs/MODELO-DATOS.md).

## App de gestión (privada)

`public/admin/index.html` se publica en **https://pibloo94.github.io/my-wedding/admin/**. Es una página independiente de Angular, con login de Google, que usa el SDK de Firebase cargado desde gstatic.com.

- Solo entran las cuentas dadas de alta en la colección `admins` de Firestore.
- Los datos (invitados, mesas, presupuesto, tareas…) viven en Firestore y no en el código.
- Si `firebase-config.json` no tiene proyecto, funciona en modo local, guardando en el navegador.

## A tener en cuenta

- **El repositorio es público.** Todo lo que haya en el código (textos, datos bancarios, configuración de Firebase) es visible para cualquiera. Los datos de invitados no están en el código: viven en Firestore, protegidos por las reglas.
- **La contraseña de acceso se comprueba en el navegador**, comparando su hash SHA-256. Evita que la web se lea por casualidad, pero no protege datos: no publiques nada privado.
- El acceso se recuerda 30 días en el navegador de cada invitado (`localStorage`).
