# 📋 Instrucciones: Conectar RSVP con Google Sheets

> **Respaldo temporal.** Las confirmaciones pasan a guardarse en Firebase (ver [FIREBASE-SETUP.md](FIREBASE-SETUP.md)). Este Apps Script solo se usa mientras `public/firebase-config.json` esté vacío; con el formulario nuevo, menús, niños y contacto llegan resumidos en las columnas «Alergias» y «Mensaje».

Sigue estos pasos para que el formulario de confirmación guarde los datos en tu Google Sheets.
**Tiempo estimado: ~10 minutos.**

---

## Paso 1: Crear el Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com) e inicia sesión con tu cuenta Google.
2. Crea una hoja nueva → ponle el nombre: **"RSVP Boda Pablo & Daniela"**
3. En la **fila 1** añade estas cabeceras (una por celda):

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Fecha | Nombre | Asistencia | ¿Acompañante? | Nombre Acompañante | Alergias | Mensaje |

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

    // Anti-spam: el campo oculto "website" solo lo rellenan los bots.
    // Se responde "success" para no darles pistas, pero no se guarda nada.
    if (params.website) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Convertir booleanos a texto más legible para Sheets
    const acompanante = params.hasPartner === 'true' ? 'SÍ' : 'NO';

    sheet.appendRow([
      params.submittedAt || new Date().toLocaleString('es-ES'),
      params.name        || '',
      params.attending   || '',
      acompanante,
      params.partnerName || '-',
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

Busca esta línea y reemplaza la URL con la tuya real:

```typescript
private readonly APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID_AQUI/exec';
```

---

## Paso 5: Probar

1. Arranca el proyecto: `ng serve`
2. Ve al formulario RSVP en la web
3. Rellena todos los campos y pulsa "Enviar Confirmación"
4. Ve a tu Google Sheet → deberías ver una nueva fila con los datos ✅

---

## ⚠️ Importante

- Cada vez que **modifiques el Apps Script**, publica una nueva versión **sobre la implementación existente** para conservar la misma URL: **Implementar → Gestionar implementaciones → ✏️ (editar) → Versión: «Nueva versión» → Implementar**. Si en lugar de eso creas una *nueva implementación*, la URL cambia y tendrás que actualizarla en `rsvp.service.ts`.
- La URL es pública pero no indexada. No la compartas públicamente.
- **Anti-spam (honeypot):** el formulario incluye un campo oculto `website`. Si llega relleno, la web no envía nada y el script de arriba lo descarta. Frena bots simples, no ataques dirigidos: revisa la hoja antes de importar las respuestas.

---

## 🆘 Solución de Problemas

| Problema | Solución |
|---|---|
| "El RSVP da error" | Verifica que la URL en `rsvp.service.ts` es correcta |
| "No llegan datos a Sheets" | Comprueba que el script tiene permisos y que implementaste como "Cualquier persona" |
| "Aparece pantalla de login de Google" | El script está configurado solo para ti. Cambia a "Cualquier persona" |
| "Error de CORS en consola" | Asegúrate de estar enviando como `application/x-www-form-urlencoded` |
