# Modelado 3D · Wicho Nemes — Rediseño integrado

Sección **Modelado 3D** reconstruida con el lenguaje visual del resto del portafolio: fondo oscuro, acentos dorados, mosaico editorial cerrado (bandas de una fila), mobile-first y administrador local.

## Contenido

35 piezas en 4 secciones editoriales:

1. **Esculturas de criaturas** — 8 cabezas esculpidas en digital.
2. **En movimiento** — 6 videos: la serie *Inicio* (educación, negocio, eventos y publicidad), *Varios · Propuesta 1* y *Videogamificación*.
3. **Soy Developer** — 19 piezas de la gráfica de la carrera de videojuegos de la **Universidad Cuauhtémoc, San Luis Potosí** (pósters, banners y piezas de campaña).
4. **Renders personales** — *Mi primer render 3D* y *Render Dragon*.

**Origen del contenido:** inventario y orden tomados del sitio vivo (Google Sites · `wichonemes/modelado-3d`); imágenes descargadas de ese mismo sitio; títulos de los videos verificados en YouTube (canal de Wicho). No se inventó obra nueva.

**Banner:** fotografía de Wicho con los prototipos *milk-o* impresos en 3D. Esa imagen no estaba disponible como archivo suelto en el sitio (se usaba como portada), así que se recortó de una captura del propio sitio y se guarda como `assets/banner-milk-o.jpg`.

## Títulos y descripciones

- Los videos conservan su título real de YouTube (limpieza editorial de mayúsculas).
- Las esculturas no tenían nombre en el sitio original: usan numeración neutral (*Escultura 01*…*08*).
- Las piezas de la campaña Soy Developer llevan títulos tomados del texto visible de cada póster (modelado de negocio, escenas y animación, experiencia laboral, etc.).
- Todo se puede corregir desde el administrador.

## «VER MÁS» del sitio original

El sitio vivo mostraba botones **VER MÁS** bajo las esculturas. No se pudo verificar a dónde llevaban (no hay subpáginas documentadas de ese contenido). En esta versión las esculturas se muestran completas dentro del mosaico. Si Wicho quiere conservar esos enlaces, se pueden añadir después (campo de enlace en el contenido). **Queda como pendiente.**

## Formato nativo (sin recorte)

Cada modelo conserva la proporción real de su archivo. Las imágenes se agrupan en **filas justificadas** (`.story-flow`) con `aspect-ratio` por pieza: los renders verticales o rectangulares se dejan tal como fueron creados, porque esa es su esencia. Los **logos** y las piezas de video sí pueden recortarse: los videos van en una parrilla propia **16:9** (`.story-reel`), separada de las imágenes.

## Cómo abrirla

- Doble clic en `index.html`, o
- Con el servidor local del proyecto: `http://localhost:8765/modelado-3d/` (en la red local, `http://192.168.6.38:8765/modelado-3d/`).
- La imagen de marca (`assets/marca-wicho.png`) y los estilos (`styles.css`) son los mismos del resto de secciones.

## Modo de edición visual

La página ya usa una **barra flotante de áreas** que se pega arriba al hacer scroll y una **barra de progreso** fija abajo, ambas con el color propio de esta área (**azul #68a9ed**). La pestaña activa también se tiñe con ese color.

- Pulsa **⚙ Editar** (abajo a la izquierda) para activar el modo visual. Aparecen lápices **✎** junto a cada texto e imagen.
- **Textos:** toca ✎, escribe y pulsa **Enter** para guardar; **Esc** cancela.
- **Imágenes:** ✎ abre el selector para reemplazarla; **⤢** ofrece **Natural / Cuadrada / Rectángulo** (el rectángulo se ajusta arrastrando); **×** quita la pieza (pide confirmación).
- Al reemplazar una imagen que estaba en **Natural**, la pieza adopta la proporción de la nueva imagen; si estaba **Cuadrada** o en **Rectángulo**, conserva esa forma.
- **＋ Agregar** crea una pieza nueva; **☰ Panel** abre el administrador avanzado de siempre (orden, banner, respaldos); **✓ Listo** sale del modo.
- La **pestaña activa** y la **barra inferior de progreso** usan el color del área.
- Identidad corporativa tiene un editor visual propio, adaptado a su mosaico (cuadrada o rectángulo).


## Administrador «Editar»

- Edita la portada, el relato, los nombres e introducciones de cada sección.
- Piezas: título, ID de YouTube (opcional), historia y cambio de portada; agregar, eliminar y reordenar por arrastre o flechas.
- Las piezas de video muestran el póster de YouTube con ▶ y abren el video; las piezas de imagen se muestran completas y no llevan enlace por defecto.

**Persistencia:** los textos y el orden se guardan en `localStorage`; las imágenes subidas, en `IndexedDB` (claves `wicho-modelado-editor-v1` / `wicho-modelado-images-v1`).
**Respaldo:** «Descargar respaldo» genera `respaldo-modelado-3d-wicho.json` (incluye las imágenes); «Importar respaldo» lo restaura en otro equipo.

> **Importante:** los cambios se guardan **solo en este navegador**. No se publican ni se sincronizan solos con Google Sites ni con otros dispositivos. Si se borran los datos del navegador, se pierden; por eso conviene descargar respaldos con frecuencia.

## Notas y pendientes

- Las esculturas y la gráfica no tenían enlace propio en el sitio original.
- Los títulos genéricos están listos para renombrarse desde el administrador cuando Wicho lo decida.
- Este rediseño no modifica ni publica nada en Google Sites.

## Créditos

Todas las obras son de **Wicho Nemes**. Videos del canal de Wicho: *inicio EDUCACION*, *inicio NEGOCIO*, *inicio EVENTOS*, *inicio PUBLICIDAD*, *VARIOOS PROPUESTA 1*, *VIDEOGAMIFICACION*, *MI PRIMER RENDER 3D* y *RENDER DRAGON*. Gráfica Soy Developer: Universidad Cuauhtémoc, San Luis Potosí.
