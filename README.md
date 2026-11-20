# Elite Twin Peptides

App web instalable (PWA) con calculadora de reconstitución, biblioteca de péptidos y suplementos, stacks, clientes y viales.

Los datos de los clientes se guardan solo en el teléfono donde se usa la app. Nunca se suben a GitHub.

## Archivos

Todos van sueltos en la raíz del repositorio (no dentro de una carpeta):

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | Página principal |
| `styles.css` | Diseño |
| `app.js` | Lógica de la app |
| `data.js` | Base de datos de péptidos y stacks |
| `sw.js` | Hace que funcione sin internet y se actualice sola |
| `manifest.json` | Nombre, colores e íconos de la app instalada |
| `icon-*.png`, `logo.png` | Logo e íconos |

## Publicar con GitHub Pages

1. Sube todos los archivos a la raíz del repositorio.
2. Ve a **Settings → Pages**.
3. En **Source** elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`, y guarda.
4. Espera uno o dos minutos. La dirección queda así:
   `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`

GitHub Pages funciona con HTTPS, que es lo que hace falta para instalar la app y usarla sin internet.

## Instalar en el teléfono

- **Android (Chrome):** abre la dirección, toca el menú ⋮ y elige **Instalar app**. También puedes ir a **Ajustes** dentro de la app y tocar **Instalar app**.
- **iPhone (Safari):** abre la dirección, toca **Compartir** y luego **Añadir a pantalla de inicio**.

## Actualizar la app

1. En GitHub, entra al repositorio y usa **Add file → Upload files**.
2. Arrastra los archivos nuevos. Los que tengan el mismo nombre se reemplazan.
3. Confirma con **Commit changes**.
4. En el teléfono, abre la app con internet. Si sale el aviso de versión nueva, ciérrala y ábrela otra vez.

No hace falta cambiar nada en `sw.js` al actualizar.

## Respaldo de datos

Los clientes, protocolos y viales viven solo en el teléfono. Si borras los datos del navegador o pierdes el teléfono, se pierden.

- Entra a **Ajustes → Exportar respaldo** al menos una vez al mes. La app te lo recuerda.
- Para pasar los datos a otro teléfono, usa **Importar respaldo** en el teléfono nuevo.

## Problemas comunes

- **Veo una versión vieja:** cierra la app por completo y ábrela de nuevo con internet.
- **No me ofrece instalarla:** confirma que la dirección empieza con `https://` y que `index.html` está en la raíz del repositorio.
- **La página sale en blanco o con error 404:** revisa que Pages esté activado y que los archivos no estén dentro de una subcarpeta.

## Aviso

La app reúne información general y educativa. No es consejo médico ni sustituye la indicación de un profesional de la salud. Muchos de los compuestos que incluye no están aprobados por la FDA para uso humano. Verifica cada dosis y cada cálculo antes de usarlos.
