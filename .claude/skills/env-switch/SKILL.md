---
name: env-switch
description: Trabajar con los entornos dev y prod sin mezclarlos. Usar para arrancar la web o la app, comprobar contra qué proyecto de Firebase se está trabajando, copiar datos reales a dev o dar acceso a la app.
---

# Entornos dev y prod

Detalle completo en `docs/ENTORNOS.md`. Resumen para trabajar sin equivocarse.

## Los dos entornos

| | **dev** (pruebas) | **prod** (real) |
|---|---|---|
| Proyecto de Firebase | `boda-daniela-pablo-dev` | `boda-daniela-pablo` |
| Configuración | `env/dev/firebase-config.json` (`"env": "dev"`) | `public/firebase-config.json` |
| Web / app en local | `npm start` (:4200) / `npm run start:admin` (:4300) | `npm run start:prod` / `npm run start:admin:prod` (datos reales) |
| Compilación | `ng build -c development` | `npm run build` y el despliegue de GitHub |
| Etiqueta | «DEV · datos de prueba» | ninguna (en local contra prod: «PROD · datos reales», en rojo) |

Cada proyecto tiene **sus propios datos y cuentas**: invitados, mesas, presupuesto, contenido publicado, respuestas del formulario, `admins/{uid}` y la cuenta de invitados. Lo que se hace en dev no aparece en la web real.

## Reglas

1. **Dev por defecto.** Usa `npm start` y `npm run start:admin`.
2. **No ejecutes `start:prod` ni `start:admin:prod`** sin que Pablo lo pida: todo lo que se cambie ahí es real.
3. Comprueba en qué entorno estás antes de escribir datos: etiqueta en pantalla, o `projectId` en el `firebase-config.json` que se sirve.
4. **No mezcles configuraciones en un commit:** `public/firebase-config.json` nunca apunta a dev, y `env/dev/firebase-config.json` nunca apunta a prod.
5. Los valores de `firebase-config.json` no son secretos; **sí** lo son las contraseñas, y no deben aparecer en el repositorio.
6. El contenido de cada web sale de lo publicado desde la app de **su** entorno: ensaya en dev, publica en dev y, si convence, repite en prod.
7. Cambios en `firestore.rules`: probar en dev y publicarlos en prod después del despliegue (skill `firebase-rules-deploy`).

## Cuentas y accesos

- **App de gestión:** entrar con Google; solo pasan cuentas con `admins/{uid}` **en ese proyecto**. El UID de una misma cuenta es distinto en dev y en prod. La app muestra el ID al entrar sin acceso; se crea el documento `admins/{ID}` con `nombre` en la consola.
- **Web:** contraseña de invitados (cuenta `invitados@boda-daniela-pablo.firebaseapp.com`, mismo correo en los dos proyectos, contraseñas distintas).
- Pendiente de acceso: Daniela, en prod y, si quiere, en dev.

## Copiar datos reales a dev

1. App de prod → Configuración → **Descargar copia** (`.json` con datos personales: guárdalo en un sitio seguro y bórralo después).
2. App de dev → Configuración → **Restaurar copia**. Sustituye todos los datos de la app de dev.

La copia **no** incluye el contenido de la web ni las respuestas del formulario. Ver skill `rsvp-privacy`.

## Si algo no cuadra

| Síntoma | Causa probable |
|---|---|
| No veo la etiqueta «DEV» | Estás sirviendo una compilación de producción en vez de `npm start` |
| «Esta cuenta aún no tiene acceso» en dev | Falta `admins/{uid}` en el proyecto dev |
| La web dev entra pero sale el texto de respaldo | Aún no se ha publicado nada desde la app de dev |
| `permission-denied` | Reglas sin publicar en ese proyecto |
| «Entrar con Google» falla en local | Falta `localhost` en Dominios autorizados del proyecto |
