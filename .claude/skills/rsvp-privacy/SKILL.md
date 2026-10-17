---
name: rsvp-privacy
description: Proteger los datos de los invitados. Usar al tocar el formulario de confirmación, la colección rsvps, la lista de invitados, copias de seguridad, datos de prueba o cualquier cosa que pueda exponer datos personales.
---

# Privacidad de invitados y confirmaciones

Los invitados no han consentido más uso que el que explica el aviso de privacidad del formulario: **los datos se usan solo para la boda, y al catering solo van menús y alergias.** Todo cambio debe respetarlo.

## Qué se recoge

- Respuesta: `name`, `contact`, `attending` (`si`/`no`), `message`.
- Cada persona (`people[]`): `role`, `name`, y según el caso `age` (niños), `menu` (`estandar`/`vegetariano`), `glutenFree`, `lactoseFree`, `allergies`.
- Niños: solo datos básicos (nombre, edad, alergias). No añadir más.
- Identificación: el formulario pide solo el **móvil**; vale la última respuesta de cada contacto. La app une respuestas e invitaciones por `contactKey` (correo en minúsculas o últimos 9 dígitos del teléfono), que también cubre datos antiguos.
- No se recoge nada que no esté en `docs/MODELO-DATOS.md`. Si un campo nuevo es necesario, justifícalo antes de añadirlo.

## Quién puede ver qué

- Crear una respuesta: la sesión de invitados (la contraseña de la web), validado por reglas.
- Leer y borrar respuestas, y todo `admin/**`: solo cuentas en `admins`.
- La web pública no lee nunca invitados, respuestas, alergias, mesas, presupuesto ni notas.

## Reglas para trabajar

1. **Nunca** datos reales en código, ejemplos, documentación, capturas, mensajes de commit ni datos de prueba. Usa nombres y contactos inventados.
2. **Nunca** datos personales en `content/published` ni en los textos de respaldo de `wedding-content.ts` (es código público).
3. **Copias de seguridad:** «Descargar copia» genera un `.json` con datos personales. No lo subas al repositorio ni lo pegues en chats; bórralo cuando acabe. Comprueba que `.gitignore` o `git status` no lo recogen.
4. **Pruebas:** en dev, con datos inventados. Borra las respuestas de prueba al terminar (Firestore y la invitación en la app).
5. **Sin analítica, píxeles, cookies ni servicios de terceros** que reciban datos de invitados, salvo aprobación explícita de los novios.
6. **Logs y errores:** no escribas en consola ni en mensajes de error datos de invitados.
7. **Si el uso de los datos cambia** (campo nuevo, destinatario nuevo, exportación), actualiza el texto del aviso de privacidad del formulario y avisa a los novios antes de publicar.
8. **Catering:** cualquier exportación para el catering lleva solo menús y alergias (sin contactos, mensajes ni notas).

## Antes de entregar

- Revisa el diff buscando datos personales, correos, teléfonos o nombres reales.
- Si tocaste reglas del formulario, usa también la skill `firebase-rules-deploy`.
- Indica en tu entrega qué datos toca el cambio y si cambia el aviso de privacidad.
