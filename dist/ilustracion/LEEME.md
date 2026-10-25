# Ilustración · Wicho Nemes — Rediseño integrado

Sección **Ilustración** reconstruida con el lenguaje visual del resto del portafolio: fondo oscuro, acentos dorados, mosaico editorial cerrado (bandas de una fila), mobile-first y administrador local.

## Contenido

46 piezas en 5 secciones editoriales:

1. **El Popol Vuh** — video *Ilustración Wicho*, la ilustración del juego de pelota, el video *Popol Vhu by Wicho Nemes* y dos estudios (caligrafía y estudio en púrpura).
2. **Fantasía y personajes** — 22 ilustraciones: bosque a lápiz y sus variantes, Nora en dos paletas y personajes del archivo personal.
3. **El Falso profeta** — video del personaje ilustrado.
4. **Productos INNO** — 8 piezas de la marca INNO (papelería, equipaje y estilo de vida).
5. **Retratos y encargos** — la serie de retratos de Paulina, retratos del archivo y la *Familia Ramírez*.

**Origen del contenido:** inventario y orden tomados del sitio vivo (Google Sites · `wichonemes/ilustración`); imágenes descargadas de ese mismo sitio; títulos de los videos verificados en YouTube (canal de Wicho). No se inventó obra nueva.

**Banner:** copia de la ilustración del juego de pelota (`assets/banner-popol.jpg`).

## Títulos y descripciones

- Los tres videos conservan su título real de YouTube.
- El sitio original **no tenía título ni descripción por ilustración**. Por eso la mayoría usa numeración neutral (*Ilustración 11*, *INNO · 03*…). Solo llevan nombre las piezas cuyo texto es visible en la propia obra (Popol Vuh, Nora, INNO, Paulina, Familia Ramírez).
- Todos los títulos y descripciones se pueden corregir en cualquier momento desde el administrador.

## Formato nativo (sin recorte)

Cada ilustración conserva la proporción real de su archivo. La galería no recorta ni fuerza cuadros: las imágenes se agrupan en **filas justificadas** (`.story-flow`) y cada una mantiene su `aspect-ratio`; el texto va **debajo**, sin tapar la obra. Los videos van en una **parrilla propia 16:9** (`.story-reel`), separada de las imágenes.

## Cómo abrirla

- Doble clic en `index.html`, o
- Con el servidor local del proyecto: `http://localhost:8765/ilustracion/` (en la red local, `http://192.168.6.38:8765/ilustracion/`).
- La imagen de marca (`assets/marca-wicho.png`) y los estilos (`styles.css`) son los mismos del resto de secciones.

## Modo de edición visual

La página ya usa una **barra flotante de áreas** que se pega arriba al hacer scroll y una **barra de progreso** fija abajo, ambas con el color propio de esta área (**violeta #9b8aff**). La pestaña activa también se tiñe con ese color.

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
- Las piezas de video muestran el póster de YouTube con ▶ y abren el video; las piezas de imagen se muestran completas y no llevan enlace por defecto (si se les pone un ID de YouTube, se convierten en pieza de video).

**Persistencia:** los textos y el orden se guardan en `localStorage`; las imágenes subidas, en `IndexedDB` (claves `wicho-ilustracion-editor-v1` / `wicho-ilustracion-images-v1`).
**Respaldo:** «Descargar respaldo» genera `respaldo-ilustracion-wicho.json` (incluye las imágenes); «Importar respaldo» lo restaura en otro equipo.

> **Importante:** los cambios se guardan **solo en este navegador**. No se publican ni se sincronizan solos con Google Sites ni con otros dispositivos. Si se borran los datos del navegador, se pierden; por eso conviene descargar respaldos con frecuencia.

## Notas y pendientes

- Las imágenes no tenían enlace propio en el sitio original; se mantienen como piezas de galería.
- El video *El Falso profeta ilustración* no aparecía como reproductor incrustado en el sitio vivo: está integrado como pieza de video con su póster real.
- Los títulos genéricos están listos para renombrarse desde el administrador cuando Wicho lo decida.
- Este rediseño no modifica ni publica nada en Google Sites.

## Créditos

Todas las obras son de **Wicho Nemes**. Videos del canal de Wicho: *ILUSTRACION WICHO*, *POPOL VHU BY WICHO NEMES* y *El Falso profeta ilustración*.
