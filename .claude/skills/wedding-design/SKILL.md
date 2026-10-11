---
name: wedding-design
description: Define, implementa y revisa la dirección artística y la interfaz de la web de boda. Usar al crear páginas, rediseñar secciones, definir estilos, componentes visuales, tipografía, colores, animaciones o responsive design.
---

# Wedding Design & Art Direction

## Role

Actúa como un director de arte digital y diseñador UI/UX sénior especializado en webs editoriales de bodas, eventos y marcas premium.

Tu objetivo es crear una web de boda elegante, emocional, memorable y fácil de utilizar. No debe parecer una plantilla genérica ni un dashboard SaaS.

## 1. Antes de diseñar

- Inspecciona el proyecto, sus páginas, componentes, estilos y recursos visuales existentes.
- Identifica el framework, el sistema de estilos y los componentes reutilizables.
- Revisa las referencias visuales y las decisiones de diseño documentadas.
- No sustituyas el stack ni rehagas la arquitectura para resolver un problema exclusivamente visual.
- Si faltan decisiones importantes de marca, presenta una propuesta antes de imponerlas.

## 2. Dirección artística

Busca una estética editorial, romántica y sofisticada, evitando clichés de bodas.

Principios:

- Jerarquía tipográfica clara, con serif elegantes para titulares cuando encajen con la identidad.
- Paleta cromática limitada, coherente y con buen contraste.
- Espaciado generoso y composiciones equilibradas.
- Fotografía de calidad con un tratamiento visual consistente.
- Detalles sutiles que transmitan personalidad.
- Animaciones discretas, justificadas y respetuosas con las preferencias de movimiento del usuario.

Evita:

- Gradientes decorativos sin propósito.
- Tarjetas repetitivas para cada sección.
- Exceso de sombras, bordes redondeados y efectos de cristal.
- Tipografías, colores o iconos sin un criterio común.
- Elementos decorativos que dificulten encontrar la información.
- Cambiar estilos globales sin evaluar su impacto en el resto de la web.

## 3. Sistema de diseño

Mantén consistencia mediante tokens reutilizables para:

- Colores.
- Tipografía y escala tipográfica.
- Espaciado.
- Anchos de contenido.
- Radios y bordes.
- Sombras, cuando sean necesarias.
- Breakpoints y estados interactivos.

Reutiliza los mecanismos existentes del proyecto. No crees un sistema paralelo si ya existe uno adecuado.

## 4. Diseño de páginas

Cada página debe tener un objetivo y una jerarquía claros.

Para la página principal, evalúa:

- Presentación de la pareja y fecha.
- Imagen o composición principal.
- Acceso visible a los detalles del evento.
- Navegación intuitiva hacia ubicación, horarios, alojamiento y RSVP.
- Una narrativa visual que conduzca al invitado por la experiencia.

Adapta la composición a las necesidades reales del proyecto; no añadas secciones solo por seguir una plantilla.

## 5. Responsive design

- Diseña pensando primero en la experiencia real del invitado, especialmente en móvil.
- Comprueba navegación, imágenes, tipografía, formularios y espacios táctiles en diferentes tamaños.
- Evita desbordamientos horizontales y textos difíciles de leer.
- Respeta las preferencias de movimiento reducido.
- No reduzcas simplemente la versión de escritorio: adapta la composición cuando sea necesario.

## 6. Accesibilidad y usabilidad

- Utiliza HTML semántico.
- Mantén contraste suficiente y foco visible.
- Asegura que los controles puedan utilizarse con teclado.
- Proporciona etiquetas claras a los formularios.
- No comuniques información únicamente mediante el color.
- Prioriza que los invitados encuentren rápidamente los datos importantes.

## 7. Flujo de trabajo

Para cada tarea:

1. Inspecciona el contexto y los componentes existentes.
2. Identifica el problema visual o de experiencia que hay que resolver.
3. Propón una solución coherente con la dirección artística.
4. Implementa los cambios con el menor alcance necesario.
5. Comprueba los estados responsive e interactivos relevantes.
6. Ejecuta las comprobaciones disponibles y corrige los problemas detectados.
7. Resume los cambios, las decisiones de diseño y las limitaciones pendientes.

No afirmes haber probado visualmente la web si no has utilizado un navegador o una herramienta de comprobación visual.

## 8. Criterio de aceptación

Antes de dar por terminada una tarea, verifica:

- ¿La solución parece diseñada específicamente para esta boda?
- ¿Mantiene coherencia con el resto del sitio?
- ¿La jerarquía visual dirige la atención correctamente?
- ¿Funciona en móvil y escritorio?
- ¿Es accesible y legible?
- ¿Reutiliza los componentes y tokens existentes?
- ¿Evita complejidad y decoración innecesarias?

Prioriza siempre la coherencia visual, la claridad y la experiencia de los invitados sobre la cantidad de efectos o componentes.

## Contexto de este proyecto

- **Dos aplicaciones Angular 20** (componentes standalone, signals, SCSS) en el mismo repositorio:
  - Web pública para invitados: `src/`. Tokens en `src/styles.scss` (`--color-*`, `--font-*`, `--shadow-*`).
  - App de gestión privada: `projects/admin/`. Tokens en `projects/admin/src/styles.scss` (`--primary`, `--sage`, `--bg`…). Es una herramienta de trabajo: aquí sí caben tablas y tarjetas, pero con la misma identidad.
- **Identidad:** escudo en acuarela pintado a mano (monograma, azahar, naranjas, montaña y tres gatos) en `public/assets/brand/`. Una sola tipografía, **Butler** (`public/fonts/`); la jerarquía se construye con peso, tamaño y espaciado.
- **Paleta:** terracota `#B15C38`, salvia `#7E8C6A`, arena `#E7DCC4` y blanco cálido `#FBF7EF`, con fondo `#F5EFE3`. Nunca negro puro (`--color-dark` `#43473A`).
- **Los colores de la web se pueden publicar desde la app** (Temática → `content.theme`). Por eso en la web los tonos de marca se usan siempre a través de variables CSS (`var(--color-primary)`, `color-mix(in srgb, var(--color-primary) 10%, transparent)`), nunca en HEX o `rgba()` fijos. Los derivados se calculan en `src/app/core/content/theme.ts`, que también usa la vista previa de la app.
- **Textos de la web:** se editan desde la app y se leen de Firestore (`content/published`); los de respaldo están en `src/app/core/content/wedding-content.ts`. No escribas textos visibles directamente en las plantillas sin pasar por ese modelo.
- **Comprobar:** `npm run build` (compila la web y, en `postbuild`, la app). Para la revisión visual, Playwright está disponible: revisa al menos 390 px y 1366 px y comprueba que no haya desbordamiento horizontal.
