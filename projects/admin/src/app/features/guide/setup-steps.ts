/**
 * Pasos de configuración de un entorno en la consola de Firebase. Es la versión guiada de
 * docs/ENTORNOS.md (secciones 2 y 3): si cambias algo aquí, cámbialo también allí.
 */
export const GUEST_EMAIL = 'invitados@boda-daniela-pablo.firebaseapp.com';

export interface SetupCopy { label: string; value: string; }

export interface SetupStep {
  id: string;
  title: string;
  /** Ruta dentro de la consola de Firebase */
  where: string;
  /** Página de la consola (se completa con el proyecto actual) */
  link?: (projectId: string) => string;
  /** Qué hacer, paso a paso */
  todo: string[];
  /** Valores para copiar */
  copy?: SetupCopy[];
  /** Solo para prod */
  prodOnly?: boolean;
  /** Se comprueba solo (no hace falta marcarlo): id de la comprobación de la guía */
  auto?: 'config' | 'access' | 'content';
}

const C = 'https://console.firebase.google.com/project/';

export const SETUP_STEPS: SetupStep[] = [
  {
    id: 'project', title: 'Proyecto y app web', where: 'Consola de Firebase → Agregar proyecto · ⚙️ Configuración del proyecto → General → Tus apps',
    link: p => `${C}${p}/settings/general`, auto: 'config',
    todo: [
      'Crea el proyecto (boda-daniela-pablo para prod, boda-daniela-pablo-dev para dev). Sin Google Analytics; plan gratuito.',
      'En Tus apps, pulsa el icono web </>, ponle nombre (web-boda o web-boda-dev), sin Firebase Hosting, y registra la app.',
      'Copia apiKey, authDomain, projectId y appId en public/firebase-config.json (prod) o en env/dev/firebase-config.json (dev, con "env": "dev").'
    ]
  },
  {
    id: 'firestore', title: 'Base de datos (Firestore)', where: 'Compilación → Firestore Database → Crear base de datos',
    link: p => `${C}${p}/firestore`,
    todo: [
      'Edición Standard si la pide; ID (default).',
      'Ubicación europe-southwest1 (Madrid). Luego no se puede cambiar.',
      'Iniciar en modo de producción → Crear.'
    ],
    copy: [{ label: 'Ubicación', value: 'europe-southwest1' }]
  },
  {
    id: 'rules', title: 'Reglas de seguridad', where: 'Firestore Database → pestaña Reglas',
    link: p => `${C}${p}/firestore/rules`,
    todo: [
      'Borra lo que haya, pega las reglas (botón «Copiar reglas») y pulsa Publicar.',
      'Cada vez que cambie firestore.rules en el repositorio, publícalas en los dos proyectos.'
    ]
  },
  {
    id: 'auth', title: 'Inicio de sesión', where: 'Compilación → Authentication → Método de inicio de sesión',
    link: p => `${C}${p}/authentication/providers`,
    todo: [
      'Google → Habilitar, con tu correo como correo de asistencia → Guardar.',
      'Agregar proveedor nuevo → Correo electrónico/contraseña → solo el primer interruptor (sin «Vínculo de correo electrónico») → Guardar.',
      'Pestaña Configuración → Dominios autorizados: localhost viene por defecto; en prod añade pibloo94.github.io.'
    ],
    copy: [{ label: 'Dominio (prod)', value: 'pibloo94.github.io' }]
  },
  {
    id: 'guest', title: 'Cuenta de invitados (contraseña de la web)', where: 'Authentication → Usuarios → Agregar usuario',
    link: p => `${C}${p}/authentication/users`,
    todo: [
      'Correo: exactamente el de abajo, el mismo en dev y en prod (no tiene que existir como buzón).',
      'Contraseña: en prod, la que dais a los invitados; en dev, una de pruebas distinta. Mínimo 6 caracteres.',
      'Para cambiarla más adelante: borra la cuenta y créala otra vez con el mismo correo.'
    ],
    copy: [{ label: 'Correo', value: GUEST_EMAIL }]
  },
  {
    id: 'admins', title: 'Acceso a esta app', where: 'Firestore Database → Datos → colección admins',
    link: p => `${C}${p}/firestore/databases/-default-/data`, auto: 'access',
    todo: [
      'Entra en esta app con Google: te dirá que no tienes acceso y te mostrará tu ID.',
      '+ Iniciar colección (o, si ya existe, abre admins → Agregar documento): colección admins, ID del documento = tu ID, campo nombre (string) con tu nombre → Guardar.',
      'Recarga la app. El ID es distinto en dev y en prod: hay que hacerlo en cada proyecto, y Daniela con su cuenta.'
    ]
  },
  {
    id: 'apikey', title: 'Limitar la clave', where: 'console.cloud.google.com → APIs y servicios → Credenciales → «Browser key»',
    link: p => `https://console.cloud.google.com/apis/credentials?project=${p}`, prodOnly: true,
    todo: [
      'Restricciones de aplicaciones → Sitios web, y añade las direcciones de abajo.',
      'La de firebaseapp.com es imprescindible para «Entrar con Google».'
    ],
    copy: [
      { label: 'Web', value: 'https://pibloo94.github.io/*' },
      { label: 'Google', value: 'https://boda-daniela-pablo.firebaseapp.com/*' },
      { label: 'Local web', value: 'http://localhost:4200/*' },
      { label: 'Local app', value: 'http://localhost:4300/*' }
    ]
  },
  {
    id: 'content', title: 'Primer contenido de la web', where: 'Esta app → Web de la boda → Contenido → Publicar', auto: 'content',
    todo: [
      'Revisa nombres, fecha y textos y pulsa Publicar. Hasta entonces la web muestra sus textos de respaldo.',
      'Para trabajar en dev con los datos reales: en la app de prod, Configuración → Descargar copia; en la de dev, Configuración → Restaurar copia.'
    ]
  }
];
