# Modelo de datos: web ↔ Firestore ↔ app de gestión

La web y la app usan los mismos nombres de campo. Este documento es la referencia para mantenerlos alineados.

## Colecciones

| Ruta | Quién escribe | Quién lee | Qué guarda |
|---|---|---|---|
| `rsvps/{id}` | Cualquiera (solo crear, validado por reglas) | Los novios | Una respuesta del formulario por documento |
| `admin/state` | Los novios | Los novios | Configuración, paleta, estado de la web |
| `admin/state/{colección}/{id}` | Los novios | Los novios | `guests`, `tables`, `expenses`, `vendors`, `tasks`, `day`, `logistics`, `inspo`, `webPlan`, `webChecks`, `webResources`, `webTexts`, `webInfo`, `webLog` |
| `admins/{uid}` | Nadie desde fuera (se crea en la consola) | El propio usuario | Quién tiene acceso a la app |
| `content/published` | Los novios | Cualquiera | Contenido público de la web (fase 4) |

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
