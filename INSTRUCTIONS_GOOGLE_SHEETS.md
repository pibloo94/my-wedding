# 📋 Instrucciones: Conectar RSVP con Google Sheets

Sigue estos pasos para que el formulario de confirmación guarde los datos en tu Google Sheets.
**Tiempo estimado: ~10 minutos.**

---

## Paso 1: Crear el Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com) e inicia sesión con tu cuenta Google.
2. Crea una hoja nueva → ponle el nombre: **"RSVP Boda Pablo & Daniela"**
3. En la **fila 1** añade estas cabeceras (una por celda):

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Fecha | Nombre | Asistencia | ¿Acompañante? | Nombre Acompañante | Autobús | Alergias | Mensaje |

---

## Paso 2: Crear el Apps Script

1. Con la hoja abierta, ve a **Extensiones → Apps Script**
2. Borra todo el código que hay y pega **exactamente** este:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Leer los datos del form (application/x-www-form-urlencoded)
    const params = e.parameter;
    
    // Convertir booleanos a texto más legible para Sheets
    const acompanante = params.hasPartner === 'true' ? 'SÍ' : 'NO';
    const autobus = params.needsBus === 'true' ? 'SÍ' : 'NO';

    sheet.appendRow([
      params.submittedAt || new Date().toLocaleString('es-ES'),
      params.name        || '',
      params.attending   || '',
      acompanante,
      params.partnerName || '-',
      autobus,
      params.dietary     || '',
      params.message     || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Necesario para que CORS funcione (preflight OPTIONS)
function doGet(e) {
  return ContentService.createTextOutput('OK');
}
```

3. Haz clic en **Guardar** (icono de disco o Ctrl+S)
4. Dale un nombre al proyecto, por ejemplo: `rsvp-boda`

---

## Paso 3: Publicar como Web App

1. Haz clic en el botón azul **"Implementar"** → **"Nueva implementación"**
2. En el tipo, selecciona **"Aplicación web"**
3. Configura así:
   - **Ejecutar como:** `Yo (tu@gmail.com)`
   - **Quién tiene acceso:** `Cualquier persona`
4. Haz clic en **"Implementar"**
5. Google te pedirá autorización → acepta todos los permisos
6. **¡Copia la URL de implementación!** Tendrá el formato:
   ```
   https://script.google.com/macros/s/AKfyc.../exec
   ```

---

## Paso 4: Pegar la URL en el proyecto Angular

Abre el archivo:
```
src/app/core/services/rsvp.service.ts
```

Busca esta línea y reemplaza `TU_SCRIPT_ID_AQUI` con tu URL real:

```typescript
private readonly APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID_AQUI/exec';
```

Resultado:
```typescript
private readonly APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfyc.../exec';
```

---

## Paso 5: Probar

1. Arranca el proyecto: `ng serve`
2. Ve al formulario RSVP en la web
3. Rellena todos los campos y pulsa "Enviar Confirmación"
4. Ve a tu Google Sheet → deberías ver una nueva fila con los datos ✅

---

## ⚠️ Importante

- Cada vez que **modifiques el Apps Script**, debes crear una **nueva implementación** (no actualizar la existente) para que los cambios surtan efecto. Luego actualiza la URL en `rsvp.service.ts`.
- La URL es pública pero no indexada. No la compartas públicamente.
- Para evitar spam, puedes añadir una validación de email o un campo honeypot en el futuro.

---

## 🆘 Solución de Problemas

| Problema | Solución |
|---|---|
| "El RSVP da error" | Verifica que la URL en `rsvp.service.ts` es correcta |
| "No llegan datos a Sheets" | Comprueba que el script tiene permisos y que implementaste como "Cualquier persona" |
| "Aparece pantalla de login de Google" | El script está configurado solo para ti. Cambia a "Cualquier persona" |
| "Error de CORS en consola" | Asegúrate de estar enviando como `application/x-www-form-urlencoded` |
