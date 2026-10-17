---
name: cms-content-field
description: Añadir, cambiar o quitar un campo editable del contenido de la web (CMS) de punta a punta. Usar al tocar wedding-content.ts, el editor de contenido de la app, secciones, tema o tipografía.
---

# Campo nuevo del contenido de la web

El contenido de la web se edita en la app de gestión, se publica en `content/published` y la web lo lee. Un campo nuevo toca varias piezas; sigue esta lista para no dejar ninguna a medias.

## Piezas

1. **Modelo y respaldo:** `src/app/core/content/wedding-content.ts`
   - Tipo del campo.
   - Valor por defecto en `DEFAULT_CONTENT` (es el respaldo si Firebase no responde o no hay nada publicado).
   - `normalizeContent()`: es la **única validación** de la web y de la app.
     - Modo web: si falta algo o el tipo es inesperado, usa el valor por defecto; si una lista llega vacía, usa la de respaldo.
     - Modo borrador (`{ draft: true }`): conserva lo que aún se está escribiendo.
2. **App de gestión:**
   - `projects/admin/src/app/core/content-model.ts` y `content-editor.service.ts` (borrador y publicación).
   - La pantalla de edición, en `projects/admin/src/app/features/web/` (Contenido) o `features/theme/` (Temática). Localiza el archivo concreto con una búsqueda antes de editar.
   - Validaciones previas a publicar (nombres, horas, enlaces, correo, IBAN) si el campo las necesita.
3. **Web pública:** el componente que lo pinta en `src/`. Gestiona valor vacío y respaldo.
4. **Documentación:** la tabla correspondiente de `docs/MODELO-DATOS.md`. Si cambia un paso de la guía del CMS, también `projects/admin/src/app/features/guide/setup-steps.ts` y `docs/ENTORNOS.md`.
5. **Reglas:** `content/published` se lee por id de documento y el contenido va dentro de `json`, así que normalmente no hay que tocar `firestore.rules`. Si se toca, skill `firebase-rules-deploy`.

## Cosas que no se rompen

- **Secciones:** la portada y el pie son fijos. Las cuatro propias (`events`, `needToKnow`, `rsvp`, `registry`) se pueden ocultar y reordenar, no borrar, y su `id` es fijo (`eventos`, `detalles`, `rsvp`, `registro`). Las de tipo `text` se crean y borran libremente y se descartan si no tienen `title`.
- **Enlaces:** `linkUrl` solo se admite si empieza por `https://`.
- **Nombres y fecha:** la única fuente es lo publicado (`hero.name1`, `hero.name2`, `hero.countdownIso`, con desfase de Madrid, p. ej. `2027-09-11T13:00:00+02:00`).
- **Colores y tipografía:** `theme` y `typography` se publican con el contenido. Los tonos derivados salen de `theme.ts` (compartido con la vista previa de la app). Las ilustraciones son acuarelas y no cambian de color. Butler va con la web; las demás fuentes se cargan de Google Fonts solo si se eligen.
- **Sincronización:** el borrador (`admin/contentDraft2`) guarda en `baseKey` la versión publicada de la que parte. No cambies esa lógica sin revisar el caso de «cambios externos con borrador propio».
- **Historial:** cada publicación crea una copia en `admin/contentHistory/items`.

## Privacidad

- Nunca pongas en el contenido publicado ni en los textos de respaldo datos de invitados, contactos, alergias, mesas, presupuesto o notas.
- `wedding-content.ts` está en el código público: los textos de respaldo sensibles (titular, correo, lugares) son un pendiente conocido; no añadas más.
- `registry.iban` vacío muestra «Muy pronto…». No pongas un IBAN de ejemplo.

## Verificación

1. `npm run build` (compila las dos apps con tipos y plantillas estrictos).
2. Prueba contra **dev**: edita el campo en `npm run start:admin`, publica, y comprueba en `npm start` que se ve, y que sin publicar sale el respaldo.
3. Revisa móvil y escritorio, y el contraste si tocaste colores.
4. Resume qué se verificó y qué falta (por ejemplo, repetir y publicar en la app de prod).
