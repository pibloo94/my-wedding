---
name: frontend-performance
description: Audita y mejora el rendimiento, las imágenes, los metadatos y el SEO técnico de la web de boda. Usar para problemas de velocidad o visibilidad.
---

# Frontend Performance

1. Mide o inspecciona antes de optimizar.
2. Prioriza las imágenes principales, los recursos bloqueantes y el JavaScript innecesario.
3. Utiliza formatos, dimensiones y carga de imágenes adecuados al stack existente.
4. Evita lazy loading en recursos críticos que deban aparecer inmediatamente.
5. Comprueba metadatos, títulos, descripciones, URLs y directivas de indexación.
6. Mantén el comportamiento responsive y la calidad visual.
7. No añadas herramientas de analítica ni cookies sin una necesidad justificada y aprobación.
8. Verifica los resultados con las herramientas disponibles.

No inventes métricas de rendimiento. Distingue entre problemas observados, hipótesis y mejoras medidas.

## Contexto de este proyecto

- **Dónde mirar**
  - Web pública: `src/index.html` (metadatos y precargas) y `src/styles.scss`.
  - Imágenes: `public/assets/brand/`.
  - Tipografías: `public/fonts/`, Butler en woff2.
  - Límites de tamaño (budgets): `angular.json`. `hero.scss` ya los supera de antes.
- **Medir**
  - `npm run build` imprime el tamaño de cada paquete JS y CSS de las dos apps.
  - Para tiempos de carga, usa Playwright o Lighthouse contra el build servido localmente (`dist/wedding-app/browser` bajo `/my-wedding/`).
  - Indica siempre qué se midió y cómo.
- **Imágenes**
  - Las ilustraciones son acuarelas en WebP.
  - `crest.png` (~1,5 MB) es el original del que `scripts/process_assets.py` genera `crest.webp` y `crest-shield.webp`. No se usa en la página y no se borra: se necesita para regenerar esas imágenes.
  - La imagen para compartir (`og:image` y `twitter:image`, en `src/index.html`) es `og-image.jpg`, de 1200×630.
  - El escudo de la portada ya lleva `width`/`height` y `fetchpriority="high"`: no lo cargues en diferido.
- **Contenido dinámico**
  - Los textos y colores publicados llegan de Firestore (REST) después de cargar. Mientras tanto se pintan los de respaldo (`wedding-content.ts`).
  - Cualquier optimización debe mantener ese respaldo para que la web funcione si Firebase no responde.
- **Indexación**
  - La web está tras una contraseña de cortesía (`password-gate`). Si debe o no aparecer en buscadores es decisión de los novios: pregunta antes de añadir o quitar `robots`.
  - La app de gestión (`/admin/`) ya lleva `noindex, nofollow` y no debe indexarse nunca.
- **Privacidad:** no añadas analítica, píxeles ni cookies de terceros sin aprobación explícita. Los invitados no han dado su consentimiento para ello.
