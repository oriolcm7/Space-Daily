# Daily Space News — versión gratuita RSS

Web estática para GitHub Pages. Recopila titulares y descripciones desde feeds RSS, los guarda en archivos JSON por fecha y mantiene una hemeroteca. No usa API de pago ni necesita claves.

## Fuentes RSS configuradas
- NASA News Releases
- SpaceNews
- European Spaceflight
- ESA Space News

El script puede omitir una fuente temporalmente inaccesible y deja el error registrado en el JSON de la edición. Los feeds y sus formatos pueden cambiar; revisa Actions si una fuente deja de funcionar. El contenido se conserva enlazado a su fuente original. En esta versión no se generan traducciones ni análisis mediante IA.

## Instalación en el repositorio `oriolcm7/Space-Daily`
1. Descarga el ZIP y descomprímelo en tu ordenador.
2. En GitHub abre `oriolcm7/Space-Daily` → **Add file → Upload files**.
3. Sube todos los archivos y carpetas de esta carpeta, respetando las rutas. Acepta reemplazar `index.html`, `app.js`, `styles.css`, `manifest.webmanifest` e `icon.svg` si te lo pregunta. Deben aparecer también `.github/workflows/daily-news.yml`, `scripts/update_news.py` y la carpeta `editions` con `index.json`.
4. Abre **Actions** en el repositorio. Si GitHub pide habilitar workflows, acepta.
5. En **Actions → Update Daily Space News → Run workflow → Run workflow**, inicia la primera recopilación manual.
6. Espera a que el flujo termine en verde. El script creará `editions/AAAA-MM-DD.json` y actualizará `editions/index.json`; los cambios se guardan automáticamente en el repositorio.
7. Recarga GitHub Pages. La primera publicación puede tardar un par de minutos.

## Actualización diaria
El workflow está programado para las 07:17 de `Europe/Madrid`. GitHub puede retrasar ejecuciones programadas durante periodos de carga; no se garantiza el minuto exacto. También se puede ejecutar manualmente desde Actions.

El workflow requiere permiso `contents: write`, definido en el YAML. Si falla al hacer push, revisa **Settings → Actions → General → Workflow permissions** y permite acceso de lectura y escritura al contenido del repositorio.

## Cómo funciona el archivo
Cada edición queda guardada en `editions/AAAA-MM-DD.json`. Las ediciones anteriores no se sobrescriben. Si se ejecuta más de una vez el mismo día, se actualiza la edición de ese día. La página usa `editions/index.json` para mostrar la hemeroteca.

## Importante
- Esta es una recopilación automática de titulares, no una verificación editorial completa. Comprueba el artículo original antes de confiar en detalles sensibles o técnicos.
- Los feeds RSS pueden contener solo extractos y no siempre incluyen imágenes.
- No se necesita `OPENAI_API_KEY` ni configurar facturación.
