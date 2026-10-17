# Primer acceso a la app de gestión

Esta parte de la guía se puede leer sin haber entrado. A propósito, no lleva datos concretos del proyecto. Los pasos completos están dentro de la app, en «Guía de configuración», y en la documentación del repositorio.

## Si te van a dar acceso

1. Pulsa **Entrar con Google** con tu cuenta.
2. Si la cuenta aún no tiene acceso, la app te muestra un **ID**. Cópialo y pásaselo a quien administra la app.
3. Cuando te den de alta, recarga la página.

El ID es distinto en cada entorno (pruebas y real): hace falta darse de alta en cada uno.

## Si estás preparando un entorno nuevo

Para que el inicio de sesión funcione, en la consola de Firebase del proyecto tienen que estar:

1. **La configuración web de Firebase** en el archivo de configuración de este entorno. Si falta, la app avisa de que no tiene configuración.
2. **El inicio de sesión con Google habilitado** y esta dirección en los dominios autorizados.
3. **Las reglas de seguridad publicadas** en Firestore.
4. **Tu alta** en la lista de cuentas con acceso, con el ID que muestra la app.

El resto de pasos y los valores exactos (base de datos, cuenta de invitados, limitación de la clave, primer contenido) están en la guía completa, después de entrar.
