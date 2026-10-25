# Animación — Wicho Nemes

Sección independiente del portafolio. Ábrela con el servidor local de previsualización (por ejemplo `http://192.168.6.38:8765/animacion/` mientras esté encendido; funciona solo si teléfono y computadora comparten Wi-Fi y no es un enlace público).

## Cambios de esta etapa

- **Mosaico cerrado de piezas en movimiento.** Las 29 animaciones se acomodan en bandas de altura uniforme que alternan anchos (6-3-3 / 3-3-6 / pleno final de 12). El reequilibrio se calcula con `mosaicWidths()` en `animacion.js`: al agregar, eliminar o reordenar piezas, el mosaico se rearma solo y nunca quedan huecos ni filas desalineadas.
- **Fachadas de video (sin cargar 29 reproductores).** Cada tarjeta muestra el póster de YouTube con un botón de reproducción; el click abre la pieza en YouTube (con ↗ superior, igual que en Audiovisual). Solo los dos pósteres que no existen en calidad máxima (`logo fuego`, `Salesiano · Introducción`) usan la versión de respaldo automáticamente.
- **Numeración editorial** 01–29 con el mismo lenguaje de Identidad corporativa y Audiovisual.
- Administrador local completo: arrastre y flechas táctiles, IndexedDB para portadas y respaldo JSON exportable/importable.

## Contenido verificado contra el sitio activo

Títulos, orden, agrupación y enlaces fueron confrontados contra `https://sites.google.com/view/wichonemes/animacion/` capturando el DOM renderizado con herramientas REA (ingeniería inversa) y los títulos reales de cada ID con la API oEmbed de YouTube:

- **29 piezas** en el orden del original: 22 incrustadas + 7 de miniatura, algunas organizadas alrededor de textos separadores del sitio ("Espera un momento en lo que cargan los videos y animaciones").
- **Banner de cabecera**: el still de Artesano Digital que encabeza la página del sitio vivo, descargado a `assets/banner-artesano.jpg`.
- **Identidades y grupos**: las 7 secciones del mosaico siguen el orden del sitio (Marcas, Aulas y gamificación, Carteles y banners, Salud y prevención, Cyber Ninja, Piezas para redes, Proyectos especiales). Los nombres de sección son editoriales (el vivo no agrupa con títulos): Wicho puede renombrarlos en **Editar > Secciones del mosaico**.
- **Enlaces auténticos**: cada pieza apunta a su video en el canal. Los pies del sitio vivo (Facebook, Instagram, TikTok, Adobe, Gmail, WhatsApp, wichonemes@gmail.com) quedan disponibles para el contacto/cierre — la sección destaca por ahora el enlace Contacto del sitio.
- Piezas esperando decisión de Wicho: las leyendas cortas (captions) de algunas piezas son textos editoriales redactados para la estética; corregir en **Editar** si prefiere otros.

## Archivos originales en la computadora

Los videos e imágenes originales de esta etapa están en `Documentos\PROYECTOS PERSONALES` (carpetas `Artesano Digital`, `civil armory`, `CV Y PORTAFOLIO`, `WN photo proyecto`, `popol vuh proyecto` y MP4 sueltos como `history.mp4`, `logo animado.mp4`, `gnp seguros.mp4`). La sección pública usa los embeds de YouTube para no copiar gigabytes; si Wicho quiere reproducción local sin YouTube, basta subir los MP4 a un host propio y cambiar el campo ID por enlace en el administrador.

## Modo de edición visual

La página ya usa una **barra flotante de áreas** que se pega arriba al hacer scroll y una **barra de progreso** fija abajo, ambas con el color propio de esta área (**rosa #e879b8**). La pestaña activa también se tiñe con ese color.

- Pulsa **⚙ Editar** (abajo a la izquierda) para activar el modo visual. Aparecen lápices **✎** junto a cada texto e imagen.
- **Textos:** toca ✎, escribe y pulsa **Enter** para guardar; **Esc** cancela.
- **Imágenes:** ✎ abre el selector para reemplazarla; **⤢** ofrece **Natural / Cuadrada / Rectángulo** (el rectángulo se ajusta arrastrando); **×** quita la pieza (pide confirmación).
- Al reemplazar una imagen que estaba en **Natural**, la pieza adopta la proporción de la nueva imagen; si estaba **Cuadrada** o en **Rectángulo**, conserva esa forma.
- **＋ Agregar** crea una pieza nueva; **☰ Panel** abre el administrador avanzado de siempre (orden, banner, respaldos); **✓ Listo** sale del modo.
- La **pestaña activa** y la **barra inferior de progreso** usan el color del área.
- Identidad corporativa tiene un editor visual propio, adaptado a su mosaico (cuadrada o rectángulo).


## Administrar el contenido

- Pulsa **Editar** abajo a la izquierda: entra al **modo de edición visual** (lápices ✎ sobre textos e imágenes). El panel avanzado sigue en **☰ Panel**.
- **Portada y relato:** textos del banner, introducción y colección; banner superior.
- **Secciones del mosaico:** nombres e introducciones de los 7 recorridos.
- **Editar y ordenar piezas:** título, ID de YouTube, historia, portada propia; reordena arrastrando o con las flechas ↑/↓.
- **Agregar una pieza:** nombre + ID de YouTube + historia + portada opcional (se añade a la última sección; la puedes mover).
- **Descargar respaldo** guarda los datos; **Importar respaldo** los reemplaza en otro dispositivo.

Los cambios se guardan en el navegador donde se hicieron. **No se publican solos en Google Sites ni se sincronizan entre dispositivos** hasta importar el respaldo o desplegar la versión nueva. Las portadas nuevas requieren conexión a internet para cargar (viene de los pósteres de YouTube); con portadas propias subidas al administrador quedan locales en IndexedDB.
