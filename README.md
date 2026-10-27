# Space Daily — prototipo web

Esta es una primera versión estática y adaptable a móvil de Space Daily.

## Qué incluye
- Diseño híbrido entre revista y panel de control.
- Portada con noticias de demostración.
- Filtros por categoría y búsqueda.
- Ventana de lectura para cada análisis.
- Concepto técnico del día desplegable.
- Alternancia de tema claro/oscuro.
- Manifest e icono para preparar la instalación como aplicación web.

## Importante
Las noticias y explicaciones de las tarjetas son contenido de demostración. No son noticias actuales verificadas ni se actualizan automáticamente. Antes de publicar para otras personas, sustituye ese contenido por ediciones revisadas con fechas y enlaces a fuentes originales.

## Publicación gratuita con GitHub Pages
1. Crea o inicia sesión en https://github.com
2. Crea un repositorio llamado `space-daily`. Para esta primera versión, configura el repositorio como **Public**.
3. Sube todos los archivos de esta carpeta a la raíz del repositorio: `index.html`, `styles.css`, `app.js`, `manifest.webmanifest` e `icon.svg`.
4. En el repositorio, abre **Settings → Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**, elige `main` y `/ (root)`, y guarda.
6. Espera a que termine la publicación. GitHub mostrará una URL similar a `https://TU-USUARIO.github.io/space-daily/`.
7. Abre la URL en Safari en el iPhone → botón Compartir → **Añadir a pantalla de inicio**.

La URL exacta dependerá de tu nombre de usuario de GitHub. No está publicada todavía.

## Dominio propio
Más adelante puedes comprar un dominio y configurarlo desde **Settings → Pages → Custom domain**. Después configura los registros DNS que indique GitHub y activa HTTPS cuando esté disponible.

## Cómo funciona la actualización
Esta versión es estática. Para que publique noticias automáticamente hará falta añadir:
- Una fuente fiable de noticias (por ejemplo, feeds RSS de agencias y medios).
- Un proceso programado para recopilar y deduplicar noticias.
- Una etapa de generación y verificación editorial.
- Un lugar donde guardar las ediciones (por ejemplo, archivos JSON en el repositorio o una base de datos).
- Un programador diario y un despliegue automático.

No guardes claves API en `app.js` ni en archivos públicos. Los secretos deben permanecer en el servidor o en los ajustes seguros del servicio que ejecute el proceso.
