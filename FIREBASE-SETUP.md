# Activar Firebase

Firebase guarda tres cosas:

- **Confirmaciones del formulario:** colección `rsvps`.
- **Datos de la app de gestión:** invitados, mesas, presupuesto, tareas…
- **Contenido publicado de la web:** colección `content`, en la fase 4.

Todo cabe en el plan gratuito (Spark). Tiempo estimado: unos 20 minutos.

El formulario de la web solo funciona con Firebase configurado (`public/firebase-config.json`). Sin él, la app de gestión funciona en modo local, guardando en el navegador.

---

## 1. Crear el proyecto

1. Entra en https://console.firebase.google.com con tu cuenta de Google.
2. **Crear un proyecto** → nombre, por ejemplo `boda-daniela-pablo`. Google Analytics no hace falta.

## 2. Base de datos (Firestore)

1. Menú **Compilación → Firestore Database → Crear base de datos**.
2. Edición **Standard**.
3. Ubicación **`europe-southwest1` (Madrid)**. ⚠️ No se puede cambiar después.
4. Elige **modo de producción** (todo cerrado; las reglas del paso 4 abren solo lo necesario).

## 3. Inicio de sesión con Google

1. **Compilación → Authentication → Comenzar**.
2. **Método de inicio de sesión → Google → Habilitar**. Elige tu correo como correo de asistencia y guarda.
3. **Configuración → Dominios autorizados → Agregar dominio** → `pibloo94.github.io`.

## 4. Reglas de seguridad

1. **Firestore Database → Reglas**.
2. Borra lo que haya, pega el contenido de [`firestore.rules`](firestore.rules) y pulsa **Publicar**.

Con estas reglas:
- Cualquiera puede **crear** una confirmación con el formato correcto, pero nadie más que vosotros puede leerla, cambiarla o borrarla.
- Los datos de la app solo los leen y escriben las cuentas dadas de alta en la colección `admins` (paso 6).

## 5. Configuración pública

1. **⚙️ Configuración del proyecto → General → Tus apps → icono web `</>`**.
2. Nombre `web-boda`. No marques Firebase Hosting. Pulsa **Registrar app**.
3. Copia estos cuatro valores de `firebaseConfig` en [`public/firebase-config.json`](public/firebase-config.json):

```json
{
  "apiKey": "AIza…",
  "authDomain": "boda-daniela-pablo.firebaseapp.com",
  "projectId": "boda-daniela-pablo",
  "appId": "1:…:web:…"
}
```

Estos valores **no son secretos**: Google los diseña para ir en el navegador. Lo que protege los datos son las reglas.

**Recomendado:** limita la clave a tu web. Ve a https://console.cloud.google.com → (tu proyecto) → **APIs y servicios → Credenciales** → la clave «Browser key». En **Restricciones de aplicaciones → Sitios web** añade:

- `https://pibloo94.github.io/*`
- `http://localhost:4200/*`, para probar en local.

## 6. Publicar y daros de alta

1. `npm run build` en local. Si compila, haz `git commit` y `git push`. GitHub Actions publica en unos minutos.
2. Abre **https://pibloo94.github.io/my-wedding/admin/** y pulsa **Entrar con Google**.
3. La app te dirá que tu cuenta no tiene acceso y te mostrará tu **ID** (UID). Cópialo.
4. En la consola: **Firestore Database → Datos → Iniciar colección** → ID de colección `admins` → ID del documento = tu UID → añade un campo `nombre` = `Pablo` → Guardar.
5. Recarga la app.

La primera vez, la app sube a Firebase los datos que tenga en ese navegador. Si estaban en otro sitio, ve primero allí a Configuración → Descargar copia, y luego aquí a Configuración → Restaurar copia.

6. Daniela hace lo mismo (pasos 2 a 5) con su cuenta.

## 7. Probar el formulario

1. En la web, envía una confirmación de prueba con tu correo.
2. En la app → **Invitados**, debe aparecer en unos segundos («1 respuesta nueva de la web»).
3. Bórrala si quieres: icono de papelera en la invitación, y en Firestore → `rsvps`.

---

### Problemas habituales

| Síntoma | Causa probable |
|---|---|
| El botón de Google no hace nada o da `auth/unauthorized-domain` | Falta `pibloo94.github.io` en Dominios autorizados (paso 3) |
| «Esta cuenta aún no tiene acceso» tras crear el documento | El ID del documento en `admins` no es exactamente tu UID |
| El formulario da error al enviar | Reglas sin publicar, o `projectId`/`apiKey` mal copiados en `firebase-config.json` |
| `permission-denied` en la consola del navegador | Reglas antiguas: vuelve a pegar `firestore.rules` y publica |
