---
name: firebase-rules-deploy
description: Cambiar o revisar firestore.rules y el acceso de invitados y admins sin romper la web publicada. Usar al tocar reglas, la cuenta de invitados, colecciones nuevas o la forma de las respuestas del formulario.
---

# Reglas de Firestore y su despliegue

## Qué protegen las reglas

Las claves de `firebase-config.json` son públicas por diseño. **Lo único que protege los datos son `firestore.rules` y las cuentas.** Trátalas como código de seguridad.

| Ruta | Crear / escribir | Leer |
|---|---|---|
| `rsvps/{id}` | Sesión de invitados o admin, solo `create`, validado por `validRsvp` | Admins (también borrar). Sin `update` |
| `content/published` | Admins | Invitados (solo ese documento) y admins |
| `content/{otros}` | Admins | Admins |
| `admin/**` | Admins | Admins |
| `admins/{uid}` | Nadie (se crea en la consola) | El propio usuario |

- `isAdmin()`: existe `admins/{uid}`.
- `isGuest()`: sesión con proveedor `password` y correo `invitados@boda-daniela-pablo.firebaseapp.com`. Ese correo debe coincidir con `GUEST_EMAIL` en `src/app/core/services/guest-auth.service.ts`. Si cambia uno, cambia el otro.

## Orden de despliegue (lo más delicado)

1. Edita `firestore.rules` y pruébalas **primero en dev** (`boda-daniela-pablo-dev`): consola → Firestore → Reglas → pegar el archivo completo → Publicar.
2. Prueba con `npm start` y `npm run start:admin` (skill `env-switch`).
3. `npm run build`, commit y push (lo hace Pablo). Espera a que GitHub Actions termine.
4. **Después** publica las mismas reglas en **prod** (`boda-daniela-pablo`).

Publicar en prod antes del push puede romper la web que está en línea (por ejemplo, la web antigua deja de leer el contenido si las reglas ya exigen la sesión de invitados). Si las reglas **abren** acceso y la web nueva no las necesita aún, el riesgo es menor, pero mantén el orden por defecto.

Claude no puede publicar reglas: dale a Pablo los pasos exactos y recuérdale hacerlo en **los dos** proyectos.

## Al cambiar la forma de una respuesta del formulario

`validRsvp` y `validPerson` usan `hasOnly` y `hasAll`: un campo nuevo que el formulario envíe y las reglas no conozcan se rechaza con `permission-denied`.

1. Añade o cambia el campo en la web (formulario y envío), en `validRsvp` / `validPerson`, en `docs/MODELO-DATOS.md` y en la sincronización de la app (`rsvp-sync.service.ts`).
2. `validPeople` comprueba cada persona de forma explícita hasta 10: no uses bucles que las reglas no soportan.
3. Si el formato cambia de forma incompatible, sube `v` y mantén compatibilidad con lo ya guardado.
4. Límites de longitud: `name` 2–120, `contact` 5–120, `message` ≤1000, `allergies` ≤300, edad de niños 0–17.

## Verificación (en dev)

Con cada cambio de reglas, comprueba lo que realmente cambió:

- Invitado con contraseña: lee `content/published`, **crea** una respuesta válida, no puede leer `rsvps` ni crear una inválida.
- Sin sesión: no lee ni crea nada.
- Admin: lee y escribe `admin/**`, lee y borra `rsvps`, no escribe `admins`.
- `update` de `rsvps` sigue denegado.

Distingue en tu entrega entre lo probado en dev y lo pendiente en prod.

## Síntomas habituales

| Síntoma | Causa probable |
|---|---|
| `permission-denied` | Reglas sin publicar en ese proyecto, o campo no contemplado en `validRsvp` |
| La contraseña de la web falla | Cuenta de invitados ausente o correo distinto, o correo/contraseña sin habilitar en Authentication |
| «Esta cuenta aún no tiene acceso» en la app | Falta `admins/{uid}` **en ese proyecto** (el UID cambia entre dev y prod) |
