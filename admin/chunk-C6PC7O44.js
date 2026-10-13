import{a as Z,b as ee}from"./chunk-L2I6HWTD.js";import{e as Y}from"./chunk-EQIPIM5D.js";import{$ as I,$a as V,Aa as m,Ba as g,Ca as R,Ea as q,Fa as F,Ga as b,Gb as J,Ha as r,Hb as Q,Ia as i,Ja as v,Lc as X,Pa as E,Q as D,Ra as k,Sa as c,U as S,V as P,_a as T,ab as h,db as l,eb as C,fa as j,fb as A,ga as z,gb as N,ia as s,jb as B,kb as U,lb as H,mb as W,rb as K,sa as L}from"./chunk-ROFTGBZB.js";var G=n=>n.replace(/[&<>"]/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[a]),ie="https://github.com/pibloo94/my-wedding/blob/main/";function se(n,a){if(/^https?:\/\//.test(n)||n.startsWith("#"))return n;let e=(a+n).split("/"),t=[];for(let o of e)o===".."?t.pop():o!=="."&&o!==""&&t.push(o);return ie+t.join("/")}function O(n,a){let e=[],t=n.replace(/`([^`]+)`/g,(o,d)=>`\0${e.push(G(d))-1}\0`);return t=G(t),t=t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(o,d,_)=>`<a href="${G(se(_.replace(/&amp;/g,"&"),a))}" target="_blank" rel="noopener noreferrer">${d}</a>`),t=t.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g,(o,d,_)=>`${d}<a href="${_}" target="_blank" rel="noopener noreferrer">${_}</a>`),t=t.replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>"),t.replace(/\u0000(\d+)\u0000/g,(o,d)=>`<code>${e[+d]}</code>`)}function te(n,a=""){let e=n.replace(/\r\n/g,`
`).split(`
`),t=[],o=0,d=f=>/^\s*\|.*\|\s*$/.test(f),_=f=>/^\s*([-*]|\d+\.)\s+/.test(f);for(;o<e.length;){let f=e[o];if(!f.trim()){o++;continue}if(f.startsWith("```")){let u=[];for(o++;o<e.length&&!e[o].startsWith("```");)u.push(e[o++]);o++,t.push(`<pre><code>${G(u.join(`
`))}</code></pre>`);continue}let M=/^(#{1,4})\s+(.*)$/.exec(f);if(M){t.push(`<h${M[1].length+1}>${O(M[2],a)}</h${M[1].length+1}>`),o++;continue}if(/^---+\s*$/.test(f)){t.push("<hr>"),o++;continue}if(f.startsWith(">")){let u=[];for(;o<e.length&&e[o].startsWith(">");)u.push(e[o++].replace(/^>\s?/,""));t.push(`<blockquote><p>${O(u.join(" "),a)}</p></blockquote>`);continue}if(d(f)){let u=[];for(;o<e.length&&d(e[o]);){let p=e[o].trim().replace(/^\||\|$/g,"").split("|").map(x=>x.trim());p.every(x=>/^:?-{2,}:?$/.test(x))||u.push(p),o++}let[y,...w]=u;t.push('<div class="md-table"><table>'+(y?`<thead><tr>${y.map(p=>`<th>${O(p,a)}</th>`).join("")}</tr></thead>`:"")+`<tbody>${w.map(p=>`<tr>${p.map(x=>`<td>${O(x,a)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);continue}if(_(f)){let u=[];for(;o<e.length&&(_(e[o])||/^\s{2,}\S/.test(e[o])&&u.length);){let p=e[o],x=/^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(p);x?u.push({depth:Math.floor(x[1].length/2),ordered:/\d/.test(x[2]),text:x[3]}):u[u.length-1].text+=" "+p.trim(),o++}let y="",w=[];for(let p of u){for(;w.length>p.depth+1;)y+=`</li></${w.pop()?"ol":"ul"}>`;if(w.length<p.depth+1)for(;w.length<p.depth+1;)w.push(p.ordered),y+=p.ordered?"<ol>":"<ul>";else y+="</li>";y+=`<li>${O(p.text,a)}`}for(;w.length;)y+=`</li></${w.pop()?"ol":"ul"}>`;t.push(y);continue}let $=[];for(;o<e.length&&e[o].trim()&&!d(e[o])&&!_(e[o])&&!/^(#{1,4}\s|```|---+\s*$|>)/.test(e[o]);)$.push(e[o++].trim());t.push(`<p>${O($.join(" "),a)}</p>`)}return t.join(`
`)}var ne=`# Entornos: dev y prod

La web y la app de gesti\xF3n funcionan contra dos proyectos de Firebase separados.

> **En la app de gesti\xF3n:** \xABGu\xEDa de configuraci\xF3n\xBB en el pie del men\xFA lateral (en el m\xF3vil, en \xABM\xE1s\xBB), en Configuraci\xF3n y, antes de tener acceso, en el bot\xF3n \xABGu\xEDa de configuraci\xF3n\xBB de la pantalla de entrada. Muestra en qu\xE9 entorno est\xE1s, comprueba lo que puede (configuraci\xF3n, sesi\xF3n, acceso, contenido publicado, contrase\xF1a de invitados) y lleva los pasos de la secci\xF3n 2 con enlaces a la consola y valores para copiar. Ese mismo documento se puede leer completo dentro de la gu\xEDa. Los pasos guiados est\xE1n en \`projects/admin/src/app/features/guide/setup-steps.ts\`: si cambias uno, cambia tambi\xE9n este documento.


| | **prod** (real) | **dev** (pruebas) |
|---|---|---|
| Proyecto de Firebase | \`boda-daniela-pablo\` | \`boda-daniela-pablo-dev\` |
| Configuraci\xF3n | \`public/firebase-config.json\` | \`env/dev/firebase-config.json\` |
| Se usa con | \`npm run build\` y el despliegue de GitHub Actions | \`npm start\` (web) y \`npm run start:admin\` (app) |
| Direcciones | https://pibloo94.github.io/my-wedding/ y \`/my-wedding/admin/\` | http://localhost:4200/ y http://localhost:4300/ |
| Etiqueta en pantalla | ninguna | \xABDEV \xB7 datos de prueba\xBB: en la web, abajo a la izquierda; en la app, bajo los nombres del men\xFA (y arriba en el m\xF3vil) |
| Datos | los de verdad | los vuestros de prueba |

Cada proyecto tiene **sus propios datos y sus propias cuentas**:

- **Datos:** invitados, mesas, plano, presupuesto, proveedores, tareas, contenido publicado, borrador, historial y respuestas del formulario.
- **Cuentas:** acceso a la app (\`admins/{uid}\`) y cuenta de invitados (la contrase\xF1a de la web).

Lo que se hace en dev no aparece nunca en la web real.

El acceso funciona igual en los dos:

- **App de gesti\xF3n:** entrar con Google; solo pasan las cuentas dadas de alta en \`admins\`.
- **Web:** contrase\xF1a de invitados, comprobada por Firebase con la cuenta \`invitados@boda-daniela-pablo.firebaseapp.com\`. Es el mismo correo en los dos proyectos, con contrase\xF1as distintas.

---

## 1. C\xF3mo est\xE1 montado en el proyecto

No hace falta tocar nada de esto; est\xE1 aqu\xED para saber d\xF3nde mirar.

- **\`public/firebase-config.json\`:** configuraci\xF3n de prod. Es la que se publica.
- **\`env/dev/firebase-config.json\`:** configuraci\xF3n de dev. Lleva \`"env": "dev"\`, que es lo que activa la etiqueta \xABDEV\xBB.
- **\`angular.json\`:** en la configuraci\xF3n \`development\` de los dos proyectos (\`wedding-app\` y \`admin\`), la lista de \`assets\` cambia el \`firebase-config.json\` de \`public/\` por el de \`env/dev/\`. \`ng serve\` usa \`development\` por defecto; \`ng build\` usa \`production\`.
- **Etiqueta \xABDEV\xBB:**
  - web: \`src/app/app.html\`, a partir de \`FirebaseConfigService\` (\`env\`);
  - app: \`projects/admin/src/app/app.component.html\`, a partir de \`FirebaseService.isDev\`.
- **\`firestore.rules\`:** las mismas reglas para los dos proyectos.
- **\`.github/workflows/deploy.yml\`:** compila con \`--configuration production\`, as\xED que lo publicado siempre usa prod.

| Comando | Entorno |
|---|---|
| \`npm start\` | web en dev |
| \`npm run start:admin\` | app en dev |
| \`npm run build\` | web y app en prod (lo mismo que publica GitHub) |
| \`npm run start:prod\` | web **en local contra prod** (datos reales; etiqueta roja \xABPROD \xB7 datos reales\xBB) |
| \`npm run start:admin:prod\` | app **en local contra prod** (datos reales; etiqueta roja \xABPROD\xBB) |
| \`ng build -c development\` | web compilada en dev (para probar el resultado compilado) |
| \`ng build admin -c development\` | app compilada en dev |

\`start:prod\` y \`start:admin:prod\` usan la configuraci\xF3n \`prod-data\` de \`angular.json\` (como \`development\`, pero con el \`firebase-config.json\` de prod). Sirven para revisar algo con los datos reales sin publicar; todo lo que cambies ah\xED es de verdad, as\xED que \xFAsalos lo justo.

Los valores de los \`firebase-config.json\` **no son secretos**: Google los dise\xF1a para ir en el navegador. Lo que protege los datos son las reglas y las cuentas.

---

## 2. Firebase: preparar un proyecto

Se hace una vez por proyecto. **prod ya est\xE1 preparado**; para **dev** se repite todo en \`boda-daniela-pablo-dev\`. Antes de cada paso, comprueba arriba a la izquierda de la consola que est\xE1s en el proyecto correcto.

Los nombres de los men\xFAs pueden variar un poco seg\xFAn la versi\xF3n de la consola; si no encuentras algo, usa el buscador de arriba.

### 2.1 Crear el proyecto

1. https://console.firebase.google.com \u2192 **Agregar proyecto**.
2. Nombre: \`boda-daniela-pablo-dev\` (o \`boda-daniela-pablo\` para prod). Google Analytics no hace falta.
3. Plan: el gratuito (Spark) basta para todo.

### 2.2 Base de datos (Firestore)

1. Men\xFA izquierdo: **Compilaci\xF3n** (o **Bases de datos y almacenamiento**) \u2192 **Firestore Database** \u2192 **Crear base de datos**.
2. Edici\xF3n **Standard** si pregunta; ID \`(default)\`.
3. Ubicaci\xF3n: **europe-southwest1 (Madrid)**. Luego no se puede cambiar.
4. **Iniciar en modo de producci\xF3n** \u2192 **Crear**.

### 2.3 Reglas de seguridad

1. **Firestore Database** \u2192 pesta\xF1a **Reglas**.
2. Borra todo, pega el contenido de [\`firestore.rules\`](../firestore.rules) y pulsa **Publicar**.
3. Cada vez que cambie \`firestore.rules\` en el repositorio, hay que volver a publicarlas en **los dos** proyectos.

### 2.4 Inicio de sesi\xF3n

1. Men\xFA izquierdo: **Compilaci\xF3n** (o **Seguridad**) \u2192 **Authentication** \u2192 **Comenzar**.
2. Pesta\xF1a **M\xE9todo de inicio de sesi\xF3n**:
   - **Google** \u2192 **Habilitar**, nombre p\xFAblico (p. ej. \xABBoda\xBB o \xABBoda (pruebas)\xBB), tu correo como correo de asistencia \u2192 **Guardar**.
   - **Agregar proveedor nuevo** \u2192 **Correo electr\xF3nico/contrase\xF1a** \u2192 activa solo el primer interruptor; deja apagado \xABV\xEDnculo de correo electr\xF3nico\xBB \u2192 **Guardar**.
3. Pesta\xF1a **Configuraci\xF3n** \u2192 **Dominios autorizados**:
   - dev: basta con \`localhost\`, que viene por defecto;
   - prod: adem\xE1s, \`pibloo94.github.io\`.

### 2.5 Cuenta de invitados (contrase\xF1a de la web)

1. **Authentication** \u2192 pesta\xF1a **Usuarios** \u2192 **Agregar usuario**.
2. Correo: \`invitados@boda-daniela-pablo.firebaseapp.com\`. Tiene que ser exactamente este en los dos proyectos: es el que esperan \`firestore.rules\` y \`src/app/core/services/guest-auth.service.ts\`. No hace falta que exista como buz\xF3n.
3. Contrase\xF1a:
   - prod: la de la web que dais a los invitados;
   - dev: una de pruebas, distinta.

   M\xEDnimo 6 caracteres.
4. **Agregar usuario**.

### 2.6 App web y configuraci\xF3n

1. \u2699\uFE0F **Configuraci\xF3n del proyecto** \u2192 **General** \u2192 **Tus apps** \u2192 icono **\`</>\`**.
2. Nombre \`web-boda\` (prod) o \`web-boda-dev\` (dev). No marques Firebase Hosting \u2192 **Registrar app**.
3. Del bloque \`firebaseConfig\` copia \`apiKey\`, \`authDomain\`, \`projectId\` y \`appId\` en:
   - prod: \`public/firebase-config.json\`;
   - dev: \`env/dev/firebase-config.json\`, que adem\xE1s lleva \`"env": "dev"\`.

\`\`\`json
{
  "env": "dev",
  "apiKey": "AIza\u2026",
  "authDomain": "boda-daniela-pablo-dev.firebaseapp.com",
  "projectId": "boda-daniela-pablo-dev",
  "appId": "1:\u2026:web:\u2026"
}
\`\`\`

### 2.7 Limitar la clave (solo prod, recomendado)

1. https://console.cloud.google.com \u2192 proyecto \`boda-daniela-pablo\` \u2192 **APIs y servicios \u2192 Credenciales** \u2192 \xABBrowser key\xBB.
2. **Restricciones de aplicaciones \u2192 Sitios web**:
   - \`https://pibloo94.github.io/*\`
   - \`https://boda-daniela-pablo.firebaseapp.com/*\` (imprescindible para \xABEntrar con Google\xBB)
   - \`http://localhost:4200/*\` y \`http://localhost:4300/*\`

En dev no hace falta: solo se usa desde vuestro ordenador.

---

## 3. Usuarios: dar acceso a la app de gesti\xF3n

Se hace **en cada proyecto**: el ID de una misma cuenta de Google es distinto en dev y en prod.

1. Abre la app del entorno:
   - dev: \`npm run start:admin\` \u2192 http://localhost:4300/
   - prod: https://pibloo94.github.io/my-wedding/admin/
2. **Entrar con Google**. La app dir\xE1 que la cuenta no tiene acceso y mostrar\xE1 su **ID**. C\xF3pialo.
3. En la consola del proyecto correspondiente: **Firestore Database** \u2192 pesta\xF1a **Datos** \u2192 **+ Iniciar colecci\xF3n** (o, si ya existe, abre \`admins\` \u2192 **Agregar documento**).
   - ID de colecci\xF3n: \`admins\`.
   - ID del documento: el ID copiado.
   - Campo \`nombre\`, tipo **string**, valor \`Pablo\` o \`Daniela\`.
   - **Guardar**.
4. Recarga la app.

Para quitar el acceso a alguien, borra su documento en \`admins\`.

---

## 4. Trabajo del d\xEDa a d\xEDa

### Probar cambios de c\xF3digo

1. \`npm start\` y/o \`npm run start:admin\`. Ver\xE1s la etiqueta \xABDEV\xBB.
2. Prueba con datos de dev: crea invitados, publica contenido desde la app de dev, env\xEDa el formulario con la contrase\xF1a de pruebas\u2026
3. Cuando est\xE9 bien: \`npm run build\` (comprueba que compila contra prod), \`git commit\` y \`git push\`. GitHub Actions publica en unos minutos.
4. Si el cambio toca \`firestore.rules\`, publica las reglas en **dev** al probar y en **prod** despu\xE9s del despliegue.

### Copiar datos reales a dev

1. App de prod \u2192 **Configuraci\xF3n** \u2192 **Descargar copia**. Es un \`.json\` con datos personales: gu\xE1rdalo en un sitio seguro y b\xF3rralo cuando acabes.
2. App de dev \u2192 **Configuraci\xF3n** \u2192 **Restaurar copia** \u2192 elige ese archivo. Sustituye todos los datos de la app de dev.

La copia lleva invitados, mesas, plano, presupuesto, proveedores, tareas y configuraci\xF3n. **No** lleva:

- el contenido de la web: en dev se edita y publica desde la app de dev;
- las respuestas del formulario.

### Contenido de la web

El contenido de cada web sale de lo publicado desde la app de **su** entorno. Para ensayar un cambio de textos, colores o tipograf\xEDa, hazlo primero en dev y publ\xEDcalo all\xED. Si te convence, rep\xEDtelo en la app de prod y publ\xEDcalo.

### Cambiar la contrase\xF1a de la web

En el proyecto que toque, **Authentication \u2192 Usuarios** \u2192 la cuenta de invitados \u2192 \u22EE \u2192 **Borrar cuenta**, y vuelve a crearla (paso 2.5) con el mismo correo y la contrase\xF1a nueva. Todas las sesiones guardadas de ese entorno dejan de valer. \xABRestablecer contrase\xF1a\xBB no sirve: enviar\xEDa un correo a una direcci\xF3n que no existe.

### Cerrar la web un tiempo

**Authentication \u2192 Usuarios** \u2192 cuenta de invitados \u2192 \u22EE \u2192 **Inhabilitar cuenta**.

---

## 5. Comprobaci\xF3n r\xE1pida

| Qu\xE9 | D\xF3nde comprobarlo |
|---|---|
| Estoy en dev | Etiqueta \xABDEV\xBB (abajo en la web; en la cabecera del men\xFA en la app) |
| La app de dev usa el proyecto dev | Consola de dev \u2192 Firestore \u2192 \`admin/state\` cambia al editar algo |
| La web publicada usa prod | Sin etiqueta; \`https://pibloo94.github.io/my-wedding/firebase-config.json\` muestra \`boda-daniela-pablo\` |
| Las reglas est\xE1n al d\xEDa | Firestore \u2192 Reglas: mismo contenido que \`firestore.rules\` en los dos proyectos |

## 6. Problemas habituales

| S\xEDntoma | Causa probable |
|---|---|
| En local no veo la etiqueta \xABDEV\xBB | Est\xE1s abriendo una compilaci\xF3n de producci\xF3n (\`npm run build\`) en vez de \`npm start\` |
| \xABEsta cuenta a\xFAn no tiene acceso\xBB en dev | Falta tu documento en \`admins\` **del proyecto dev** (paso 3); el ID no es el mismo que en prod |
| La contrase\xF1a de la web no entra en dev | Falta la cuenta de invitados en el proyecto dev, el proveedor correo/contrase\xF1a est\xE1 sin habilitar o el correo no es exactamente el del paso 2.5 |
| La web dev entra pero sale el texto de respaldo | No se ha publicado nada todav\xEDa desde la app de dev |
| \`permission-denied\` en la consola del navegador | Reglas sin publicar en ese proyecto (paso 2.3) |
| \xABEntrar con Google\xBB falla en local | \`localhost\` no est\xE1 en Dominios autorizados del proyecto (paso 2.4) |
`;var oe=`rules_version = '2';

// Reglas de seguridad de Firestore para la boda de Daniela y Pablo.
// Se pegan en Firebase \u2192 Firestore Database \u2192 Reglas (ver FIREBASE-SETUP.md).
//
//   rsvps/{id}            Respuestas del formulario. Los invitados (con la contrase\xF1a) pueden CREAR (validado); solo los novios leen.
//   content/published     Contenido de la web. Lo leen los invitados (con la contrase\xF1a) y los novios; solo los novios escriben.
//   content/{otros}       Borradores e historial. Solo los novios.
//   admin/state/**        Datos de la app de gesti\xF3n (invitados, mesas, presupuesto\u2026). Solo los novios.
//   admins/{uid}          Lista de qui\xE9n tiene acceso. Se crea a mano en la consola; nadie la escribe desde fuera.
//
// Invitados: la contrase\xF1a de la web es la de la cuenta invitados@boda-daniela-pablo.firebaseapp.com
// (Authentication \u2192 Correo electr\xF3nico/contrase\xF1a). Debe coincidir con GUEST_EMAIL en
// src/app/core/services/guest-auth.service.ts.

service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Sesi\xF3n iniciada con la contrase\xF1a de la web (no basta con entrar con cualquier cuenta de Google)
    function isGuest() {
      return request.auth != null
        && request.auth.token.firebase.sign_in_provider == 'password'
        && request.auth.token.email == 'invitados@boda-daniela-pablo.firebaseapp.com';
    }

    function str(v, min, max) {
      return v is string && v.size() >= min && v.size() <= max;
    }

    function optBool(p, k) {
      return !(k in p) || p[k] is bool;
    }

    function validPerson(p) {
      return p is map
        && p.keys().hasOnly(['role', 'name', 'age', 'menu', 'glutenFree', 'lactoseFree', 'allergies'])
        && p.role in ['adulto', 'acompa\xF1ante', 'ni\xF1o']
        && str(p.name, 1, 120)
        && str(p.allergies, 0, 300)
        && (!('menu' in p) || p.menu in ['estandar', 'vegetariano'])
        && (!('age' in p) || (p.age is int && p.age >= 0 && p.age <= 17))
        && optBool(p, 'glutenFree')
        && optBool(p, 'lactoseFree');
    }

    function validPeople(ps) {
      return ps is list && ps.size() >= 1 && ps.size() <= 10
        && validPerson(ps[0])
        && (ps.size() < 2 || validPerson(ps[1]))
        && (ps.size() < 3 || validPerson(ps[2]))
        && (ps.size() < 4 || validPerson(ps[3]))
        && (ps.size() < 5 || validPerson(ps[4]))
        && (ps.size() < 6 || validPerson(ps[5]))
        && (ps.size() < 7 || validPerson(ps[6]))
        && (ps.size() < 8 || validPerson(ps[7]))
        && (ps.size() < 9 || validPerson(ps[8]))
        && (ps.size() < 10 || validPerson(ps[9]));
    }

    function validRsvp(d) {
      return d.keys().hasOnly(['name', 'contact', 'attending', 'message', 'people', 'submittedAt', 'source', 'v'])
        && d.keys().hasAll(['name', 'contact', 'attending', 'message', 'people', 'submittedAt', 'source', 'v'])
        && str(d.name, 2, 120)
        && str(d.contact, 5, 120)
        && d.attending in ['si', 'no']
        && str(d.message, 0, 1000)
        && str(d.submittedAt, 10, 40)
        && d.source == 'web'
        && d.v == 1
        && validPeople(d.people);
    }

    match /rsvps/{id} {
      allow create: if (isGuest() || isAdmin()) && validRsvp(request.resource.data);
      allow read, delete: if isAdmin();
      allow update: if false;
    }

    match /content/{docId} {
      allow read: if (docId == 'published' && isGuest()) || isAdmin();
      allow write: if isAdmin();
    }

    match /admin/{path=**} {
      allow read, write: if isAdmin();
    }

    match /admins/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false;
    }
  }
}
`;var de=()=>[],ce=(n,a)=>a.id,pe=(n,a)=>a.value;function ue(n,a){n&1&&(l(0," Falta "),r(1,"code"),l(2,"firebase-config.json"),i(),l(3,": los datos se guardan solo en este navegador. Sigue el paso 1. "))}function me(n,a){n&1&&(l(0," Est\xE1s en el entorno de pruebas ("),r(1,"code"),l(2,"npm start"),i(),l(3," / "),r(4,"code"),l(5,"npm run start:admin"),i(),l(6,"). Lo que hagas aqu\xED no llega a la web real. "))}function ge(n,a){n&1&&l(0," Est\xE1s en el entorno real: es la web y la app que ven los invitados y que us\xE1is a diario. ")}function be(n,a){if(n&1&&(r(0,"li"),v(1,"adm-icon",9),l(2," Contenido de la web publicado"),i()),n&2){let e=c();h("ok",e.auto().content),s(),b("name",e.auto().content?"check":"x")("size",15)}}function ve(n,a){if(n&1){let e=E();r(0,"div",11)(1,"span",7),l(2,"Tu ID en este proyecto (para el paso \xABAcceso a esta app\xBB):"),i(),r(3,"code"),l(4),i(),r(5,"button",20),k("click",function(){S(e);let o=c();return P(o.copy(o.fb.user().uid,"ID"))}),l(6,"Copiar ID"),i()()}if(n&2){let e,t=c();s(4),C((e=t.fb.user())==null?null:e.uid)}}function fe(n,a){if(n&1&&(r(0,"span",26),l(1),i()),n&2){let e=a;h("okt",e.ok)("bad",!e.ok),s(),C(e.text)}}function _e(n,a){if(n&1){let e=E();r(0,"div",12)(1,"span",21)(2,"b"),l(3,"Probar la contrase\xF1a de la web"),i(),r(4,"span",7),l(5,"(cuenta de invitados de este proyecto)"),i()(),r(6,"div",22)(7,"input",23,0),k("keydown.enter",function(){S(e);let o=T(8),d=c();return P(d.testGuest(o.value))}),i(),r(9,"button",24),k("click",function(){S(e);let o=T(8),d=c();return P(d.testGuest(o.value))}),l(10,"Probar"),i()(),m(11,fe,2,5,"span",25),i()}if(n&2){let e,t=c();s(9),b("disabled",t.testing()),s(2),g((e=t.guestResult())?11:-1,e)}}function xe(n,a){if(n&1){let e=E();r(0,"button",27),k("click",function(){S(e);let o=c();return P(o.setup.markAll())}),l(1,"Ya est\xE1 todo configurado"),i()}}function he(n,a){n&1&&v(0,"adm-icon",30),n&2&&b("size",14)}function Ce(n,a){if(n&1&&l(0),n&2){let e=c().$index;A(" ",e+1," ")}}function ye(n,a){n&1&&(r(0,"span",3),l(1,"solo prod"),i())}function we(n,a){if(n&1&&(r(0,"li"),l(1),i()),n&2){let e=a.$implicit;s(),C(e)}}function Se(n,a){if(n&1){let e=E();r(0,"button",41),k("click",function(){let o=S(e).$implicit,d=c(3);return P(d.copy(o.value,o.label))}),r(1,"span",7),l(2),i(),r(3,"code"),l(4),i()()}if(n&2){let e=a.$implicit;b("title","Copiar "+e.value),s(2),C(e.label),s(2),C(e.value)}}function Pe(n,a){if(n&1){let e=E();r(0,"button",20),k("click",function(){S(e);let o=c(3);return P(o.copy(o.rules,"Reglas"))}),l(1,"Copiar reglas"),i()}}function ke(n,a){if(n&1&&(r(0,"div",33),q(1,Se,5,3,"button",39,pe),m(3,Pe,2,0,"button",40),i()),n&2){let e=c().$implicit;s(),F(e.copy??W(1,de)),s(2),g(e.id==="rules"?3:-1)}}function Ee(n,a){if(n&1&&(r(0,"a",35),l(1,"Abrir en la consola "),v(2,"adm-icon",42),i()),n&2){let e=c().$implicit,t=c();b("href",e.link(t.setup.projectId()),z),s(2),b("size",13)}}function Oe(n,a){n&1&&(r(0,"a",36),l(1,"Ir a Contenido"),i())}function Me(n,a){n&1&&(r(0,"span",37),v(1,"adm-icon",30),l(2," Comprobado"),i()),n&2&&(s(),b("size",13))}function De(n,a){if(n&1){let e=E();r(0,"label",38)(1,"input",43),k("change",function(o){S(e);let d=c().$implicit,_=c();return P(_.setup.toggle(d.id,o.target.checked))}),i(),l(2," Hecho"),i()}if(n&2){c();let e=H(0);s(),b("checked",e)}}function qe(n,a){if(n&1&&(B(0),r(1,"details",28)(2,"summary")(3,"span",29),m(4,he,1,1,"adm-icon",30)(5,Ce,1,1),i(),r(6,"span",31)(7,"b"),l(8),i(),r(9,"span",7),l(10),i()(),m(11,ye,2,0,"span",3),i(),r(12,"ol",32),q(13,we,2,1,"li",null,R),i(),m(15,ke,4,2,"div",33),r(16,"div",34),m(17,Ee,3,2,"a",35),m(18,Oe,2,0,"a",36),v(19,"span",15),m(20,Me,3,1,"span",37)(21,De,3,1,"label",38),i()()),n&2){let e=a.$implicit,t=a.$index,o=c(),d=U(o.setup.done().has(e.id));s(),h("ok",d),b("open",!d&&t===o.firstPending()),s(2),h("ok",d),s(),g(d?4:5),s(4),C(e.title),s(2),C(e.where),s(),g(e.prodOnly?11:-1),s(2),F(e.todo),s(2),g(e.copy!=null&&e.copy.length||e.id==="rules"?15:-1),s(2),g(e.link&&o.setup.projectId()?17:-1),s(),g(e.id==="content"&&o.auto().access?18:-1),s(2),g(e.auto&&o.autoFor(e)?20:21)}}var ae=class n{fb=D(J);setup=D(ee);ui=D(Q);isDev=this.fb.isDev;auto=this.setup.autoOk;rules=oe;doc=te(ne,"docs/");testing=I(!1);guestResult=I(null);firstPending=K(()=>this.setup.steps().findIndex(a=>!this.setup.done().has(a.id)));autoFor(a){return!!a.auto&&this.auto()[a.auto]}copy(a,e){navigator.clipboard.writeText(a).then(()=>this.ui.toast(`${e} copiado`),()=>this.ui.toast("Selecci\xF3nalo y c\xF3pialo a mano"))}async testGuest(a){let e=this.fb.config?.apiKey;if(!(!e||!a)){this.testing.set(!0);try{let t=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(e)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:Z,password:a,returnSecureToken:!1})}),o=await t.json(),d=String(o.error?.message||"");this.guestResult.set(t.ok?{ok:!0,text:"Correcto: la web entra con esta contrase\xF1a."}:/OPERATION_NOT_ALLOWED|PASSWORD_LOGIN_DISABLED/.test(d)?{ok:!1,text:"El acceso con correo/contrase\xF1a no est\xE1 habilitado (paso \xABInicio de sesi\xF3n\xBB)."}:/INVALID_LOGIN_CREDENTIALS|EMAIL_NOT_FOUND|INVALID_PASSWORD/.test(d)?{ok:!1,text:"No entra: o la cuenta de invitados no existe en este proyecto o la contrase\xF1a no es esa."}:d.startsWith("TOO_MANY")?{ok:!1,text:"Demasiados intentos: espera unos minutos."}:{ok:!1,text:"No se pudo comprobar ("+(d||t.status)+")."})}catch{this.guestResult.set({ok:!1,text:"No se pudo comprobar: revisa la conexi\xF3n."})}this.testing.set(!1)}}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=L({type:n,selectors:[["adm-setup-guide"]],decls:48,vars:31,consts:[["pw",""],[1,"card","env"],[1,"eh"],[1,"badge"],[1,"small","muted"],[1,"prog-row"],[1,"prog"],[1,"xs","muted"],[1,"checks"],[3,"name","size"],[3,"ok"],[1,"uidbox"],[1,"guest"],[1,"steps"],[1,"sh"],[1,"spacer"],[1,"btn","ghost","sm"],[1,"card","step",3,"ok","open"],[1,"card","doc"],[1,"md-doc",3,"innerHTML"],[1,"btn","out","sm",3,"click"],[1,"small"],[1,"gt"],["type","password","placeholder","Contrase\xF1a de invitados","aria-label","Contrase\xF1a de invitados",3,"keydown.enter"],[1,"btn","out","sm",3,"click","disabled"],[1,"xs",3,"okt","bad"],[1,"xs"],[1,"btn","ghost","sm",3,"click"],[1,"card","step",3,"open"],[1,"n"],["name","check",3,"size"],[1,"st"],[1,"todo"],[1,"copies"],[1,"sa"],["target","_blank","rel","noopener noreferrer",1,"btn","ghost","sm",3,"href"],["routerLink","/web/contenido",1,"btn","ghost","sm"],[1,"xs","okt"],[1,"ck"],[1,"cp",3,"title"],[1,"btn","out","sm"],[1,"cp",3,"click","title"],["name","ext",3,"size"],["type","checkbox",3,"change","checked"]],template:function(e,t){if(e&1&&(r(0,"section",1)(1,"div",2)(2,"span",3),l(3),i(),r(4,"h3"),l(5),i()(),r(6,"p",4),m(7,ue,4,0)(8,me,7,0)(9,ge,1,0),i(),r(10,"div",5)(11,"span",6),v(12,"i"),i(),r(13,"b"),l(14),i(),r(15,"span",7),l(16,"pasos listos"),i()(),r(17,"ul",8)(18,"li"),v(19,"adm-icon",9),l(20," Configuraci\xF3n de Firebase"),i(),r(21,"li"),v(22,"adm-icon",9),l(23),i(),r(24,"li"),v(25,"adm-icon",9),l(26," Acceso a esta app (colecci\xF3n "),r(27,"code"),l(28,"admins"),i(),l(29,")"),i(),m(30,be,3,4,"li",10),i(),m(31,ve,7,1,"div",11),m(32,_e,12,2,"div",12),i(),r(33,"section",13)(34,"div",14)(35,"h3"),l(36,"Pasos en Firebase"),i(),v(37,"span",15),m(38,xe,2,0,"button",16),i(),q(39,qe,22,14,"details",17,ce),i(),r(41,"details",18)(42,"summary")(43,"h3"),l(44,"Documento completo: entornos dev y prod"),i(),r(45,"span",7),l(46,"docs/ENTORNOS.md"),i()(),v(47,"div",19),i()),e&2){let o;h("dev",t.isDev()),s(2),h("b-warn",!t.isDev())("b-dev",t.isDev()),s(),C(t.fb.state()==="local"?"Sin Firebase":t.isDev()?"DEV \xB7 pruebas":"PROD \xB7 real"),s(2),C(t.fb.state()==="local"?"Esta app no tiene configuraci\xF3n de Firebase":"Proyecto "+t.setup.projectId()),s(2),g(t.fb.state()==="local"?7:t.isDev()?8:9),s(5),V("width",t.setup.progress().done/t.setup.progress().total*100,"%"),s(2),N("",t.setup.progress().done,"/",t.setup.progress().total),s(4),h("ok",t.auto().config),s(),b("name",t.auto().config?"check":"x")("size",15),s(2),h("ok",!!t.fb.user()),s(),b("name",t.fb.user()?"check":"x")("size",15),s(),A(" Sesi\xF3n con Google ",(o=t.fb.user())!=null&&o.email?"("+((o=t.fb.user())==null?null:o.email)+")":""),s(),h("ok",t.auto().access),s(),b("name",t.auto().access?"check":"x")("size",15),s(5),g(t.auto().access?30:-1),s(),g(t.fb.user()&&!t.auto().access?31:-1),s(),g(t.auto().config?32:-1),s(6),g(t.setup.complete()?-1:38),s(),F(t.setup.steps()),s(8),b("innerHTML",t.doc,j)}},dependencies:[X,Y],styles:["[_nghost-%COMP%]{display:flex;flex-direction:column;gap:16px;text-align:left}.env[_ngcontent-%COMP%]   .eh[_ngcontent-%COMP%]{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}.b-dev[_ngcontent-%COMP%]{background:#dce9f5;color:#1f5f99;border-color:#bcd5ec}.prog-row[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;margin:12px 0 8px}.prog-row[_ngcontent-%COMP%]   .prog[_ngcontent-%COMP%]{flex:1;max-width:260px}.checks[_ngcontent-%COMP%]{list-style:none;display:flex;flex-direction:column;gap:4px;font-size:.88rem}.checks[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{display:flex;align-items:center;gap:6px;color:var(--muted)}.checks[_ngcontent-%COMP%]   li.ok[_ngcontent-%COMP%]{color:var(--ok-fg)}.uidbox[_ngcontent-%COMP%], .guest[_ngcontent-%COMP%]{margin-top:12px;padding:10px 12px;background:var(--bg-alt);border-radius:12px;display:flex;flex-direction:column;gap:6px;align-items:flex-start}.uidbox[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{word-break:break-all}.gt[_ngcontent-%COMP%]{display:flex;gap:8px;width:100%;flex-wrap:wrap}.gt[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{flex:1;min-width:160px}.okt[_ngcontent-%COMP%]{color:var(--ok-fg);display:inline-flex;align-items:center;gap:4px}.bad[_ngcontent-%COMP%]{color:var(--bad-fg)}.steps[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:10px}.sh[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.step[_ngcontent-%COMP%]{padding:0}.step[_ngcontent-%COMP%] > summary[_ngcontent-%COMP%]{list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;padding:14px 16px}.step[_ngcontent-%COMP%] > summary[_ngcontent-%COMP%]::-webkit-details-marker{display:none}.step[_ngcontent-%COMP%]   .n[_ngcontent-%COMP%]{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--bg-alt);color:var(--sage-deep);font-weight:600;font-size:.8rem;flex:none}.step[_ngcontent-%COMP%]   .n.ok[_ngcontent-%COMP%]{background:var(--ok-bg);color:var(--ok-fg)}.step[_ngcontent-%COMP%]   .st[_ngcontent-%COMP%]{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}.step.ok[_ngcontent-%COMP%]   .st[_ngcontent-%COMP%]   b[_ngcontent-%COMP%]{color:var(--muted)}.todo[_ngcontent-%COMP%]{margin:0 16px 10px 54px;font-size:.9rem;display:flex;flex-direction:column;gap:4px}.copies[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:8px;margin:0 16px 10px 54px;align-items:center}.cp[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line-strong);background:#fff;border-radius:10px;padding:6px 10px;cursor:pointer;max-width:100%;color:var(--muted)}.cp[_ngcontent-%COMP%]   code[_ngcontent-%COMP%]{color:var(--dark);overflow-wrap:anywhere}.cp[_ngcontent-%COMP%]:hover{border-color:var(--sage)}.sa[_ngcontent-%COMP%]{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 16px 12px 54px;border-top:1px solid var(--line)}.ck[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:6px;font-size:.86rem;cursor:pointer}.doc[_ngcontent-%COMP%]{padding:0}.doc[_ngcontent-%COMP%] > summary[_ngcontent-%COMP%]{list-style:none;cursor:pointer;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;padding:14px 16px}.doc[_ngcontent-%COMP%] > summary[_ngcontent-%COMP%]::-webkit-details-marker{display:none}@media (max-width: 600px){.todo[_ngcontent-%COMP%], .copies[_ngcontent-%COMP%]{margin-left:16px}.sa[_ngcontent-%COMP%]{padding-left:16px}}"],changeDetection:0})};export{ae as a};
