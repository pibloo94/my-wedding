# Modelo de datos: web ↔ Firestore ↔ app de gestión

La web y la app usan los mismos nombres de campo. Este documento es la referencia para mantenerlos alineados.

## Colecciones

| Ruta | Quién escribe | Quién lee | Qué guarda |
|---|---|---|---|
| `rsvps/{id}` | Cualquiera (solo crear, validado por reglas) | Los novios | Una respuesta del formulario por documento |
| `admin/state` | Los novios | Los novios | Configuración, paleta, estado de la web |
| `admin/state/{colección}/{id}` | Los novios | Los novios | `guests`, `tables`, `expenses`, `vendors`, `tasks`, `inspo`, `webResources`, `webLog` (las antiguas `day`, `logistics`, `webPlan`, `webChecks`, `webTexts` y `webInfo` ya no se usan; sus datos siguen en Firestore) |
| `admins/{uid}` | Nadie desde fuera (se crea en la consola) | El propio usuario | Quién tiene acceso a la app |
| `content/published` | Los novios | Cualquiera | Contenido publicado de la web: `{ json, version, publishedAt, by }` |
| `admin/contentDraft` | Los novios | Los novios | Borrador del contenido, compartido entre los dos |
| `admin/contentHistory/items/v0001…` | Los novios | Los novios | Una copia por publicación (para volver atrás) |

## Respuesta del formulario (`rsvps`)

| Campo | Tipo | Formulario de la web | Notas |
|---|---|---|---|
| `name` | texto (2–120) | Nombre completo | |
| `contact` | texto (5–120) | Correo o teléfono | Clave para unir respuestas repetidas |
| `attending` | `si` / `no` | ¿Confirmas tu asistencia? | |
| `message` | texto (≤1000) | Mensaje para los novios | |
| `people` | lista (1–10) | Tú + acompañante + niños | Ver tabla siguiente |
| `submittedAt` | texto ISO | automático | La última respuesta de cada contacto es la que vale |
| `source`, `v` | `web`, `1` | automático | Versión del formato |

### Persona (`people[]`)

| Campo | Adulto / acompañante | Niño | En la app (`members[]`) |
|---|---|---|---|
| `role` | `adulto` / `acompañante` | `niño` | `role` |
| `name` | ✓ | ✓ | `name` |
| `age` | — | 0–17 | `age` |
| `menu` | `estandar` / `vegetariano` | — | `menu` (`''` = infantil o sin indicar) |
| `glutenFree` | ✓ | — | `gf` |
| `lactoseFree` | ✓ | — | `lf` |
| `allergies` | texto (≤300) | texto (≤300) | `allergies` |

Si la respuesta es «no asistiré», `people` lleva solo a la persona que responde, sin menú.

## Invitación en la app (`admin/state/guests/{id}`)

| Campo | Origen | Notas |
|---|---|---|
| `name` | respuesta o a mano | Nombre de la primera persona |
| `contact`, `contactKey` | respuesta o a mano | `contactKey` es el correo en minúsculas, o los últimos 9 dígitos del teléfono |
| `status` | `si` → `confirmado`, `no` → `rechazado`; a mano también `pendiente` | |
| `members[]` | `people[]` + campos propios | Cada persona añade `id` y `table` (mesa), que no vienen de la web |
| `group`, `notes` | solo la app | Nunca los toca una respuesta |
| `message`, `rsvpAt`, `rsvpId`, `source` | respuesta | `source`: `web`, `manual` u `hoja` (CSV antiguo) |

### Cómo se une una respuesta con una invitación

1. Se agrupan las respuestas por `contactKey` y se toma la más reciente.
2. Se busca la invitación con el mismo `contactKey`. Si no hay, se busca una creada a mano con el mismo nombre y sin contacto. Si tampoco, se crea una nueva con un ID derivado del contacto, el mismo en ambos dispositivos.
3. Se sustituyen las personas por las de la respuesta. **Se conservan la mesa y el ID** de quien ya estaba, emparejando por nombre.
4. Grupo y notas no se tocan.

### Borrados (Firestore manda)

- **Borrar una invitación en la app** borra también sus respuestas en `rsvps` (las de su mismo contacto). La app avisa antes de hacerlo.
- **Borrar una respuesta en Firestore** hace que, en la app:
  - si la invitación vino solo de la web, desaparezca;
  - si la invitación existía antes a mano, se conserve (mesa, grupo y notas incluidos), quede desvinculada y vuelva a «pendiente»;
  - si quedan respuestas más antiguas del mismo contacto, se aplique la más reciente de las que quedan.

## Contenido de la web (`content/published`)

El campo `json` guarda un objeto con esta forma (por defecto: `src/app/core/content/wedding-content.ts`):

| Bloque | Campos | Dónde se ve |
|---|---|---|
| `sections[]` | `id`, `kind`, `visible`, `navLabel`, `label`, `title`, `subtitle`, `body`, `items[]`, `linkText`, `linkUrl` | Orden, visibilidad y títulos de las secciones; menú de la web (ver abajo) |
| `hero` | `name1`, `name2`, `dateText`, `location`, `countdownIso` (fecha y hora de Madrid con su desfase, p. ej. `2027-09-11T13:00:00+02:00`) | Portada, menú, pantalla de contraseña, título de la pestaña, cuenta atrás, pie y mensaje de gracias |
| `events[]` | `id`, `icon`, `type`, `title`, `timeStart`, `timeEnd`, `venue`, `address`, `mapsUrl`, `dressCode`, `description` | Programa del día |
| `needToKnow[]` | `icon`, `title`, `accent`, `items[]` | Lo que debes saber |
| `rsvp` | `deadlineText`, `contactEmail` | Formulario de confirmación |
| `registry` | `titular`, `iban`, `concepto` | Lista de bodas (con `iban` vacío se muestra «Muy pronto…») |
| `theme` | `primary`, `primaryDeep`, `sage`, `sageDeep`, `sand`, `orange`, `background`, `surface` (HEX `#RRGGBB`) | Colores de toda la web. Se editan en la app → Temática |

La validación es una sola, `normalizeContent()` en `src/app/core/content/wedding-content.ts`, y la usan la web y la app:

- **Web:** si algo falta o tiene un tipo inesperado, usa el valor por defecto; si una lista llega vacía, usa la de respaldo; descarta momentos, tarjetas y secciones de texto sin título.
- **App (modo borrador, `{ draft: true }`):** conserva lo que aún se está escribiendo. Antes de publicar comprueba nombres, horas, enlaces, correo e IBAN (dígitos de control), y avisa si la fecha visible no coincide con el día de la cuenta atrás.

### Nombres y fecha de la boda

Lo publicado en `hero` es la única fuente: `name1`/`name2` y el día y la hora de `countdownIso` (en Madrid) son los que usa la app para su cabecera, la cuenta atrás y las fechas de las tareas. Configuración solo los muestra y enlaza a Web de la boda → Contenido. Los campos `n1`, `n2`, `weddingDate` y `ceremonyTime` de `admin/state` quedan como respaldo sin Firebase o mientras no hay nada publicado.

### Colores (`theme`)

- La web solo aplica los colores que difieren de los de por defecto (`DEFAULT_CONTENT.theme`, que coinciden con `src/styles.scss`). Los tonos derivados (suave, claro, borde, fondo alternativo) se calculan en `src/app/core/content/theme.ts`, el mismo archivo que usa la vista previa de la app.
- Las ilustraciones son imágenes en acuarela y no cambian de color.
- La app avisa (sin bloquear) si el contraste de botones, textos o títulos baja de lo recomendado (WCAG).

### Secciones (`sections[]`)

La portada y el pie son fijos. El resto de la página se pinta en el orden de `sections`, solo las que tienen `visible: true`.

| `kind` | `id` (ancla) | Qué es |
|---|---|---|
| `events` | `eventos` | Programa del día (contenido en `events[]`) |
| `needToKnow` | `detalles` | Lo que debes saber (contenido en `needToKnow[]`) |
| `rsvp` | `rsvp` | Formulario; `subtitle` va seguido de la fecha límite |
| `registry` | `registro` | Lista de bodas |
| `text` | `sec-…` | Sección libre: `body` (párrafos separados por línea en blanco), `items[]`, botón opcional `linkText` + `linkUrl` |

- Las cuatro propias aparecen una sola vez y su `id` es fijo; si falta alguna en lo publicado, la web la añade al final con sus textos por defecto.
- Las de texto sin `title` se descartan; `linkUrl` solo se admite si empieza por `https://`.
- El menú usa `navLabel` (o `title` si está vacío). Si `rsvp` está oculta, la portada no muestra «Confirmar»; si `events` está oculta, «Ver detalles» baja a la primera sección visible.
- La app no deja publicar sin ninguna sección visible, con secciones visibles sin título o con secciones de texto vacías.

### Sincronización del contenido (Firestore manda)

- El borrador (`admin/contentDraft`) guarda en `baseKey` la versión publicada de la que parte.
- Si `content/published` cambia fuera del editor (consola de Firebase u otro dispositivo) y el borrador **no tiene cambios propios**, el editor pasa a mostrar lo publicado.
- Si el borrador **sí tiene cambios propios**, la app avisa y no deja publicar hasta elegir entre «Usar lo publicado» o «Mantener mi borrador».
- Los cambios hechos a mano en `admin/contentDraft` también aparecen en el editor al momento.

## Mesas y plano del salón

| Dónde | Campo | Notas |
|---|---|---|
| `admin/state/tables/{id}` | `name`, `shape` (`redonda`/`rectangular`/`presidencial`), `cap`, `notes` | |
| `admin/state/tables/{id}` | `x`, `y`, `rot` | Posición del centro en el plano (unidades del plano) y giro en grados. Sin `x`/`y` = sin colocar |
| `admin/state` → `plan` | `title`, `width`, `height`, `zones[]` (`id`, `label`, `x`, `y`, `w`, `h`) | Salón y zonas fijas (pista de baile, entrada…) |

Quién se sienta en cada mesa sigue en cada persona de la invitación (`members[].table`). La posición se guarda al soltar la mesa.

## Tareas (`admin/state/tasks`)

Cada tarea tiene una fecha que se agrupa por meses (lista y calendario de la app):

- **Se mueve con la boda** (`due` vacío): la fecha es la de la boda menos `offset` días; si cambia la fecha de la boda, la tarea se mueve con ella.
- **Fecha fija** (`due` = `AAAA-MM-DD`): no se mueve. `offset` se guarda igualmente como referencia.

El campo `phase` de versiones anteriores ya no se usa; se conserva en las tareas antiguas sin efecto.
