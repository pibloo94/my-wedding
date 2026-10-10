# Publicación en GitHub Pages

La web se publica automáticamente con GitHub Actions. No hace falta compilar ni subir nada a mano.

## Cómo funciona

1. Haces **push a la rama `main`**.
2. El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) se ejecuta en GitHub y hace esto:
   - Instala las dependencias con `npm install`.
   - Compila con `npm run build -- --configuration production`. La configuración de producción usa `baseHref: /my-wedding/` (en `angular.json`).
   - Publica la carpeta `dist/wedding-app/browser` con `peaceiris/actions-gh-pages`. Esa acción sube el resultado a la rama `gh-pages`.
3. GitHub Pages sirve la web desde la rama `gh-pages` en https://pibloo94.github.io/my-wedding/.

## Comprobar una publicación

- **Actions** (pestaña del repositorio): el último run de «Deploy to GitHub Pages» debe estar en verde.
- **Settings → Pages**: la fuente debe ser la rama `gh-pages`, carpeta `/ (root)`.
- Abre la web en una ventana privada para evitar la caché (puede tardar uno o dos minutos).

## Antes de hacer push

```bash
npm run build    # si compila en local, compilará en Actions
```

Revisa la web en el móvil (`npm start` y abre la IP del equipo desde el teléfono) cuando cambies estilos o textos largos.

## Si algo falla

| Síntoma | Qué mirar |
|---|---|
| El run de Actions falla | El log del paso «Build production»: suele ser un error de compilación |
| La web no cambia | Caché del navegador; confirma que el run terminó y que Pages usa `gh-pages` |
| Recursos o rutas en 404 | `baseHref` en `angular.json` debe ser `/my-wedding/` |
