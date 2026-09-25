# Calligraff.js

Micrositio estático multipágina construido con Vite y Tailwind CSS.

## Desarrollo

```bash
npm install
npm run dev
```

Vite mostrará la URL local. Las páginas disponibles son `/`, `/about.html` y
`/demo.html`.

## Build

```bash
npm run build
npm run preview
```

El sitio compilado queda en `dist/`. La configuración usa rutas relativas para
que el mismo build funcione en un dominio propio o bajo `/<repositorio>/` en
GitHub Pages.

## Publicación en GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` compila y publica cada push a
`main`. En GitHub, selecciona **Settings → Pages → Source → GitHub Actions**.

## Tailwind CSS

Tailwind se carga desde `css/style.css`. Puedes usar sus clases directamente en
cualquiera de los archivos HTML; no hace falta mantener una lista manual de
archivos de contenido.
