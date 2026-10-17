---
name: project-architecture
description: Analiza y mejora la arquitectura, la estructura de carpetas, los componentes, las integraciones con el CMS y la calidad del código. Usar antes de cambios estructurales o al resolver problemas de mantenibilidad.
---

# Project Architecture & Engineering

## Principios

- Inspecciona el código y la configuración reales antes de proponer cambios.
- Respeta el stack existente y sus convenciones.
- Prefiere la solución más sencilla que resuelva correctamente el problema.
- Separa presentación, lógica de negocio, acceso a datos y configuración cuando el proyecto lo justifique.
- Evita duplicación, abstracciones prematuras y dependencias innecesarias.
- No introduzcas una librería nueva cuando las herramientas existentes sean suficientes.
- No inventes APIs, métodos, campos del CMS ni funcionalidades que no hayas verificado.

## Antes de modificar arquitectura

1. Identifica los archivos afectados y sus dependencias.
2. Comprueba si existe una solución o componente reutilizable.
3. Determina el impacto en las páginas y funcionalidades existentes.
4. Explica las decisiones estructurales relevantes antes de realizar una refactorización amplia.
5. Evita reescrituras completas cuando baste con un cambio localizado.

## Integración con el CMS

- Trata el CMS como fuente de contenido cuando esa sea la arquitectura existente.
- Mantén separados el contenido editable y la presentación.
- Centraliza y tipa las consultas al CMS cuando el stack lo permita.
- Gestiona estados de carga, errores, contenido vacío y contenido no publicado.
- Valida los datos externos y no expongas secretos ni credenciales en el frontend.
- No dupliques manualmente en el código datos que deberían ser editables desde el CMS.
- Respeta los permisos, los borradores y las reglas de publicación existentes.

## Calidad del código

- Mantén componentes pequeños cuando eso mejore la comprensión y la reutilización.
- Utiliza nombres descriptivos y tipos adecuados.
- Evita estados duplicados y lógica innecesariamente compleja.
- No añadas capas de abstracción sin una necesidad demostrable.
- Añade o actualiza pruebas cuando el cambio afecte a lógica importante.

## Verificación

Después de cada cambio relevante:

1. Ejecuta las comprobaciones disponibles en el proyecto.
2. Revisa los errores de tipos, lint y compilación cuando existan esas herramientas.
3. Comprueba las funcionalidades relacionadas que puedan haberse visto afectadas.
4. Distingue entre verificaciones ejecutadas y verificaciones pendientes.

## Entrega

Resume:

- Qué has cambiado.
- Por qué era necesario.
- Qué archivos o interfaces afecta.
- Qué comprobaciones has realizado.
- Qué riesgos o decisiones quedan pendientes.

No realices migraciones destructivas ni cambios irreversibles sin explicar su impacto y obtener confirmación.

## Contexto de este proyecto

### Estructura

- **Web pública** (`src/`, proyecto `wedding-app`): Angular 20 standalone, signals, `strictTemplates`, SCSS. Sin SDK de Firebase: lee y escribe Firestore por su API REST con `HttpClient` (`src/app/core/services/`).
- **App de gestión** (`projects/admin/`, proyecto `admin`): Angular 20 zoneless, rutas con `#`, SDK `firebase` por npm con caché persistente.
  - `core/`: servicios y reglas. `store.service.ts` (estado y sincronización), `rsvp-sync.service.ts` (respuestas del formulario), `content-editor.service.ts` (borrador y publicación), `content-model.ts`, `domain.ts`, `forms.ts`, `models.ts`.
  - `shared/`: componentes comunes (modal, formulario genérico, iconos, dibujo de mesas).
  - `features/`: una carpeta por pantalla, cargadas en diferido desde `app.routes.ts`.
- **Código compartido** entre las dos apps: `src/app/core/content/wedding-content.ts` (modelo y validación del contenido, alias `@web/content`) y `theme.ts` (alias `@web/theme`). Cambia el modelo ahí, no lo dupliques.
- **Compilación y despliegue:** `npm run build` compila la web y, en `postbuild`, la app en `dist/wedding-app/browser/admin`. GitHub Actions (`.github/workflows/deploy.yml`) publica en GitHub Pages al hacer push a `main`. No hace falta tocar `deploy.yml`, que además está protegido para escritura automática.

### El CMS es Firestore

| Ruta | Quién | Qué |
|---|---|---|
| `content/published` | lectura: invitados (sesión con la contraseña de la web) y admins; escritura: admins | Contenido de la web (`json` + `version`) |
| `admin/contentDraft2`, `admin/contentHistory/items/*` | admins | Borrador compartido (versionado) e historial. `admin/contentDraft` es el de la versión anterior y solo se lee la primera vez |
| `admin/state` + subcolecciones | admins | Datos privados de la app (invitados, mesas, presupuesto…) |
| `rsvps/*` | crear: invitados con la contraseña de la web y admins (validado); leer y borrar: admins | Respuestas del formulario |
| `admins/{uid}` | solo consola | Quién tiene acceso |

- **Fuentes de verdad:** reglas en `firestore.rules`; campos en `docs/MODELO-DATOS.md`. Si cambias un campo, actualiza las dos apps, las reglas si aplica y ese documento.
- **Firestore manda:** los cambios externos (consola, otro dispositivo) se reflejan en la app; lo borrado allí desaparece aquí. No rompas la sincronización en los dos sentidos.
- **Privacidad:** nunca publiques en `content/published` ni en el código datos de invitados, contactos, alergias, mesas, presupuesto o notas. La configuración de `public/firebase-config.json` es pública por diseño; la protección son las reglas.
- **El repositorio es público.** No subas secretos.

### Verificación disponible

- `npm run build` es la comprobación obligatoria: tipos estrictos y plantillas de las dos apps.
- No hay suite de tests mantenida. Para cambios de lógica o de interfaz en la app, prueba con Playwright contra un build en el que los módulos `firebase/*` se sustituyen por un Firestore en memoria mediante `paths` del tsconfig. Así se ejecutan los flujos sin tocar el Firebase real.
- Antes de escribir sobre archivos del usuario, parte de su versión actual: no de copias antiguas, y conserva sus finales de línea (CRLF o LF).
- Nunca hagas commit ni push por el usuario; dale el mensaje de commit.
