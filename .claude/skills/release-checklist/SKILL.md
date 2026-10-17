---
name: release-checklist
description: Checklist antes de hacer commit y push a main, y de verificación tras el despliegue en GitHub Pages. Usar al cerrar un conjunto de cambios o al preparar una publicación.
---

# Antes de publicar y después

Claude **no hace commit ni push**: prepara todo y entrega el mensaje de commit. Pablo lo ejecuta.

## Antes del commit

1. **Compila:** `npm run build`. Compila la web y, en `postbuild`, la app de gestión, con configuración de producción. Sin errores de tipos ni de plantillas. (`hero.scss` ya supera su límite de tamaño de antes; no cuenta como fallo nuevo.)
2. **Dependencias:** si cambió `package.json`, comprueba que `package-lock.json` está sincronizado: el despliegue usa `npm ci`.
3. **Restos y archivos de más:** revisa `git status`. Comprueba que no aparecen:
   - `nm-linux.tgz`, `public/admin/`, `projects/admin/src/app/features/day/` (restos de fases anteriores);
   - copias de seguridad `.json` de la app («Descargar copia»), exportaciones o capturas con datos reales;
   - secretos, contraseñas o correos que no sean los ya públicos.
4. **Configuración de entorno:**
   - `public/firebase-config.json` debe apuntar a `boda-daniela-pablo` y **no** llevar `"env": "dev"`.
   - `env/dev/firebase-config.json` debe apuntar a `boda-daniela-pablo-dev` y llevar `"env": "dev"`.
5. **Documentos al día:** si cambió un campo, `docs/MODELO-DATOS.md`; si cambió algo de entornos o de la guía del CMS, `docs/ENTORNOS.md` y `setup-steps.ts`.
6. **Reglas:** si cambió `firestore.rules`, sigue la skill `firebase-rules-deploy` (dev → push → prod).
7. **Mensaje de commit** en español, claro y en una línea de resumen.

No se toca `.github/workflows/deploy.yml` (Node 22, `npm ci`, build de producción, publica `dist/wedding-app/browser` en GitHub Pages).

## Después del push

GitHub Actions publica en unos minutos al hacer push a `main`. Comprueba:

1. La ejecución de «Deploy to GitHub Pages» termina en verde.
2. https://pibloo94.github.io/my-wedding/: pide la contraseña, entra, carga el contenido publicado y **no** muestra la etiqueta «DEV».
3. https://pibloo94.github.io/my-wedding/firebase-config.json muestra el proyecto `boda-daniela-pablo`.
4. https://pibloo94.github.io/my-wedding/admin/: carga, permite entrar con Google y la cuenta con acceso ve sus datos.
5. Si hubo cambios de reglas: publicadas ya en prod y sin `permission-denied` en la consola del navegador.
6. Si tocaste el formulario, una confirmación de prueba llega a la app (y bórrala después, en Firestore y en la invitación).

## Entrega

Resume qué se comprobó de verdad y qué queda pendiente de Pablo (push, publicar reglas, repetir en la app de prod).
