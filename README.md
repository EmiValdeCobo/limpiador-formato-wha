# limpio. — Limpiador de texto de WhatsApp

Pega mensajes copiados de WhatsApp y obtén solo el texto: sin fechas, horas, nombres de contacto ni avisos del sistema. Todo ocurre en el navegador; no se envía nada a ningún servidor.

- Next.js (App Router) exportado como sitio estático (`out/`).
- Responsive, con barra de acciones fija en móvil.
- Funciona sin conexión después de la primera visita (service worker) y se puede instalar como app.

## Desarrollo

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm test
```

## Publicar gratis

`pnpm build` genera la carpeta `out/` con HTML estático.

- **Vercel / Netlify / Cloudflare Pages:** importa el repo; build `pnpm build`, carpeta de salida `out`.
- **GitHub Pages:** sube el contenido de `out/` (si se sirve en un subdirectorio, añade `basePath` en `next.config.mjs`).

## Autor

EmiValdeCobo
