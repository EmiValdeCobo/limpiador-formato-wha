# limpio. — Limpiador de formato de WhatsApp

Pega mensajes copiados de WhatsApp y obtén solo el texto: sin fechas, horas, nombres de contacto ni avisos del sistema.
Todo ocurre en tu navegador; no se envía nada a ningún servidor.

**Antes**

```
[10:32, 14/3/2024] Juan Pérez: ¿Llegas a las 6?
[10:33, 14/3/2024] Ana: Sí, voy saliendo
```

**Después**

```
¿Llegas a las 6?
Sí, voy saliendo
```

## Características

- Reconoce los formatos de WhatsApp Web, iOS, Android y escritorio (`[hora, fecha]` y `fecha, hora -`), en 12 h y 24 h.
- Quita avisos del sistema (cifrado, cambios de grupo, mensajes temporales…), en español e inglés.
- Responsive: en el móvil, los botones Limpiar y Copiar quedan fijos abajo.
- Funciona sin conexión después de la primera visita y se puede instalar como app.
- Sitio estático y ligero (~105 kB al cargar). Atajo: `Ctrl + Enter` limpia.

## Tecnologías

Next.js 15 (App Router, exportación estática) · React 19 · CSS Modules · IBM Plex con `next/font`.

## Desarrollo

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm test     # pruebas del limpiador
pnpm build    # genera out/
pnpm start    # sirve out/ localmente
```

También funciona con `npm`.

## Estructura

```
app/
  layout.jsx         fuentes, metadatos y registro del service worker
  page.jsx           interfaz
  page.module.css    estilos
lib/
  cleanWhatsAppText.js   lógica de limpieza
public/
  sw.js, manifest.webmanifest, icon.svg
tests/
  cleanWhatsAppText.test.js
```

## Publicar gratis

`pnpm build` genera la carpeta `out/`.

- **Vercel / Netlify / Cloudflare Pages:** importa el repositorio. Comando de build: `pnpm build`. Carpeta de salida: `out`.
- **GitHub Pages:** publica el contenido de `out/`. Como se sirve en `/limpiador-formato-wha`, añade `basePath: '/limpiador-formato-wha'` en `next.config.mjs`.

## Licencia

MIT © [EmiValdeCobo](https://github.com/EmiValdeCobo)
