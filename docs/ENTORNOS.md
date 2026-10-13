# Entornos: dev y prod

La web y la app de gestión funcionan contra dos proyectos de Firebase separados.

> **En la app de gestión:** «Guía de configuración» en el pie del menú lateral (en el móvil, en «Más»), en Configuración y, antes de tener acceso, en el botón «Guía de configuración» de la pantalla de entrada. Muestra en qué entorno estás, comprueba lo que puede (configuración, sesión, acceso, contenido publicado, contraseña de invitados) y lleva los pasos de la sección 2 con enlaces a la consola y valores para copiar. Ese mismo documento se puede leer completo dentro de la guía. Los pasos guiados están en `projects/admin/src/app/features/guide/setup-steps.ts`: si cambias uno, cambia también este documento.


| | **prod** (real) | **dev** (pruebas) |
|---|---|---|
| Proyecto de Firebase | `boda-daniela-pablo` | `boda-daniela-pablo-dev` |
| Configuración | `public/firebase-config.json` | `env/dev/firebase-config.json` |
| Se usa con | `npm run build` y el despliegue de GitHub Actions | `npm start` (web) y `npm run start:admin` (app) |
| Direcciones | https://pibloo94.github.io/my-wedding/ y `/my-wedding/admin/` | http://localhost:4200/ y http://localhost:4300/ |
| Etiqueta en pantalla | ninguna | «DEV · datos de prueba»: en la web, abajo a la izquierda; en la app, bajo los nombres del menú (y arriba en el móvil) |
| Datos | los de verdad | los vuestros de prueba |

Cada proyecto tiene **sus propios datos y sus propias cuentas**:

- **Datos:** invitados, mesas, plano, presupuesto, proveedores, tareas, contenido publicado, borrador, historial y respuestas del formulario.
- **Cuentas:** acceso a la app (`admins/{uid}`) y cuenta de invitados (la contraseña de la web).

Lo que se hace en dev no aparece nunca en la web real.

El acceso funciona igual en los dos:

- **App de gestión:** entrar con Google; solo pasan las cuentas dadas de alta en `admins`.
- **Web:** contraseña de invitados, comprobada por Firebase con la cuenta `invitados@boda-daniela-pablo.firebaseapp.com`. Es el mismo correo en los dos proyectos, con contraseñas distintas.

---

## 1. Cómo está montado en el proyecto

No hace falta tocar nada de esto; está aquí para saber dónde mirar.

- **`public/firebase-config.json`:** configuración de prod. Es la que se publica.
- **`env/dev/firebase-config.json`:** configuración de dev. Lleva `"env": "dev"`, que es lo que activa la etiqueta «DEV».
- **`angular.json`:** en la configuración `development` de los dos proyectos (`wedding-app` y `admin`), la lista de `assets` cambia el `firebase-config.json` de `public/` por el de `env/dev/`. `ng serve` usa `development` por defecto; `ng build` usa `production`.
- **Etiqueta «DEV»:**
  - web: `src/app/app.html`, a partir de `FirebaseConfigService` (`env`);
  - app: `projects/admin/src/app/app.component.html`, a partir de `FirebaseService.isDev`.
- **`firestore.rules`:** las mismas reglas para los dos proyectos.
- **`.github/workflows/deploy.yml`:** compila con `--configuration production`, así que lo publicado siempre usa prod.

| Comando | Entorno |
|---|---|
| `npm start` | web en dev |
| `npm run start:admin` | app en dev |
| `npm run build` | web y app en prod (lo mismo que publica GitHub) |
| `ng build -c development` | web compilada en dev (para probar el resultado compilado) |
| `ng build admin -c development` | app compilada en dev |

Los valores de los `firebase-config.json` **no son secretos**: Google los diseña para ir en el navegador. Lo que protege los datos son las reglas y las cuentas.

---

## 2. Firebase: preparar un proyecto

Se hace una vez por proyecto. **prod ya está preparado**; para **dev** se repite todo en `boda-daniela-pablo-dev`. Antes de cada paso, comprueba arriba a la izquierda de la consola que estás en el proyecto correcto.

Los nombres de los menús pueden variar un poco según la versión de la consola; si no encuentras algo, usa el buscador de arriba.

### 2.1 Crear el proyecto

1. https://console.firebase.google.com → **Agregar proyecto**.
2. Nombre: `boda-daniela-pablo-dev` (o `boda-daniela-pablo` para prod). Google Analytics no hace falta.
3. Plan: el gratuito (Spark) basta para todo.

### 2.2 Base de datos (Firestore)

1. Menú izquierdo: **Compilación** (o **Bases de datos y almacenamiento**) → **Firestore Database** → **Crear base de datos**.
2. Edición **Standard** si pregunta; ID `(default)`.
3. Ubicación: **europe-southwest1 (Madrid)**. Luego no se puede cambiar.
4. **Iniciar en modo de producción** → **Crear**.

### 2.3 Reglas de seguridad

1. **Firestore Database** → pestaña **Reglas**.
2. Borra todo, pega el contenido de [`firestore.rules`](../firestore.rules) y pulsa **Publicar**.
3. Cada vez que cambie `firestore.rules` en el repositorio, hay que volver a publicarlas en **los dos** proyectos.

### 2.4 Inicio de sesión

1. Menú izquierdo: **Compilación** (o **Seguridad**) → **Authentication** → **Comenzar**.
2. Pestaña **Método de inicio de sesión**:
   - **Google** → **Habilitar**, nombre público (p. ej. «Boda» o «Boda (pruebas)»), tu correo como correo de asistencia → **Guardar**.
   - **Agregar proveedor nuevo** → **Correo electrónico/contraseña** → activa solo el primer interruptor; deja apagado «Vínculo de correo electrónico» → **Guardar**.
3. Pestaña **Configuración** → **Dominios autorizados**:
   - dev: basta con `localhost`, que viene por defecto;
   - prod: además, `pibloo94.github.io`.

### 2.5 Cuenta de invitados (contraseña de la web)

1. **Authentication** → pestaña **Usuarios** → **Agregar usuario**.
2. Correo: `invitados@boda-daniela-pablo.firebaseapp.com`. Tiene que ser exactamente este en los dos proyectos: es el que esperan `firestore.rules` y `src/app/core/services/guest-auth.service.ts`. No hace falta que exista como buzón.
3. Contraseña:
   - prod: la de la web que dais a los invitados;
   - dev: una de pruebas, distinta.

   Mínimo 6 caracteres.
4. **Agregar usuario**.

### 2.6 App web y configuración

1. ⚙️ **Configuración del proyecto** → **General** → **Tus apps** → icono **`</>`**.
2. Nombre `web-boda` (prod) o `web-boda-dev` (dev). No marques Firebase Hosting → **Registrar app**.
3. Del bloque `firebaseConfig` copia `apiKey`, `authDomain`, `projectId` y `appId` en:
   - prod: `public/firebase-config.json`;
   - dev: `env/dev/firebase-config.json`, que además lleva `"env": "dev"`.

```json
{
  "env": "dev",
  "apiKey": "AIza…",
  "authDomain": "boda-daniela-pablo-dev.firebaseapp.com",
  "projectId": "boda-daniela-pablo-dev",
  "appId": "1:…:web:…"
}
```

### 2.7 Limitar la clave (solo prod, recomendado)

1. https://console.cloud.google.com → proyecto `boda-daniela-pablo` → **APIs y servicios → Credenciales** → «Browser key».
2. **Restricciones de aplicaciones → Sitios web**:
   - `https://pibloo94.github.io/*`
   - `https://boda-daniela-pablo.firebaseapp.com/*` (imprescindible para «Entrar con Google»)
   - `http://localhost:4200/*` y `http://localhost:4300/*`

En dev no hace falta: solo se usa desde vuestro ordenador.

---

## 3. Usuarios: dar acceso a la app de gestión

Se hace **en cada proyecto**: el ID de una misma cuenta de Google es distinto en dev y en prod.

1. Abre la app del entorno:
   - dev: `npm run start:admin` → http://localhost:4300/
   - prod: https://pibloo94.github.io/my-wedding/admin/
2. **Entrar con Google**. La app dirá que la cuenta no tiene acceso y mostrará su **ID**. Cópialo.
3. En la consola del proyecto correspondiente: **Firestore Database** → pestaña **Datos** → **+ Iniciar colección** (o, si ya existe, abre `admins` → **Agregar documento**).
   - ID de colección: `admins`.
   - ID del documento: el ID copiado.
   - Campo `nombre`, tipo **string**, valor `Pablo` o `Daniela`.
   - **Guardar**.
4. Recarga la app.

Para quitar el acceso a alguien, borra su documento en `admins`.

---

## 4. Trabajo del día a día

### Probar cambios de código

1. `npm start` y/o `npm run start:admin`. Verás la etiqueta «DEV».
2. Prueba con datos de dev: crea invitados, publica contenido desde la app de dev, envía el formulario con la contraseña de pruebas…
3. Cuando esté bien: `npm run build` (comprueba que compila contra prod), `git commit` y `git push`. GitHub Actions publica en unos minutos.
4. Si el cambio toca `firestore.rules`, publica las reglas en **dev** al probar y en **prod** después del despliegue.

### Copiar datos reales a dev

1. App de prod → **Configuración** → **Descargar copia**. Es un `.json` con datos personales: guárdalo en un sitio seguro y bórralo cuando acabes.
2. App de dev → **Configuración** → **Restaurar copia** → elige ese archivo. Sustituye todos los datos de la app de dev.

La copia lleva invitados, mesas, plano, presupuesto, proveedores, tareas y configuración. **No** lleva:

- el contenido de la web: en dev se edita y publica desde la app de dev;
- las respuestas del formulario.

### Contenido de la web

El contenido de cada web sale de lo publicado desde la app de **su** entorno. Para ensayar un cambio de textos, colores o tipografía, hazlo primero en dev y publícalo allí. Si te convence, repítelo en la app de prod y publícalo.

### Cambiar la contraseña de la web

En el proyecto que toque, **Authentication → Usuarios** → la cuenta de invitados → ⋮ → **Borrar cuenta**, y vuelve a crearla (paso 2.5) con el mismo correo y la contraseña nueva. Todas las sesiones guardadas de ese entorno dejan de valer. «Restablecer contraseña» no sirve: enviaría un correo a una dirección que no existe.

### Cerrar la web un tiempo

**Authentication → Usuarios** → cuenta de invitados → ⋮ → **Inhabilitar cuenta**.

---

## 5. Comprobación rápida

| Qué | Dónde comprobarlo |
|---|---|
| Estoy en dev | Etiqueta «DEV» (abajo en la web; en la cabecera del menú en la app) |
| La app de dev usa el proyecto dev | Consola de dev → Firestore → `admin/state` cambia al editar algo |
| La web publicada usa prod | Sin etiqueta; `https://pibloo94.github.io/my-wedding/firebase-config.json` muestra `boda-daniela-pablo` |
| Las reglas están al día | Firestore → Reglas: mismo contenido que `firestore.rules` en los dos proyectos |

## 6. Problemas habituales

| Síntoma | Causa probable |
|---|---|
| En local no veo la etiqueta «DEV» | Estás abriendo una compilación de producción (`npm run build`) en vez de `npm start` |
| «Esta cuenta aún no tiene acceso» en dev | Falta tu documento en `admins` **del proyecto dev** (paso 3); el ID no es el mismo que en prod |
| La contraseña de la web no entra en dev | Falta la cuenta de invitados en el proyecto dev, el proveedor correo/contraseña está sin habilitar o el correo no es exactamente el del paso 2.5 |
| La web dev entra pero sale el texto de respaldo | No se ha publicado nada todavía desde la app de dev |
| `permission-denied` en la consola del navegador | Reglas sin publicar en ese proyecto (paso 2.3) |
| «Entrar con Google» falla en local | `localhost` no está en Dominios autorizados del proyecto (paso 2.4) |
