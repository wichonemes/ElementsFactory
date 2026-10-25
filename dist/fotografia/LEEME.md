# Fotografía · Wicho Nemes — Rediseño integrado

Sección **Fotografía** construida como una hoja de contactos: negro, luz y pie de foto mínimo. Se organiza en **tres bloques** —Sesiones, Eventos especiales y Mirada— con categorías visibles en cada pieza.

## Contenido

36 imágenes en 3 secciones:

1. **Sesiones** (16) — retrato en cuatro series: floral, jardín, patio y exterior (lago), más una sesión de grupo.
2. **Eventos especiales** (10) — grupos en caminata, festividad (cumpleaños), movimiento urbano, evento nocturno, noche entre amigos y airsoft (deporte · airsoft).
3. **Mirada** (10) — paisaje (lago y ciudad, mochilero, montaña), arquitectura (ruina, arco de piedra, mercado), macrofotografía, nocturna, blanco y negro y alta velocidad.

**Categorías incluidas:** retrato, grupo, exterior, grupos, festividad, evento, deporte · airsoft, paisaje, arquitectura, macrofotografía, nocturna, blanco y negro y alta velocidad.

**Origen del contenido:**

- Galería viva `audiovisual/sesiones-de-fotos`: 110 imágenes descargadas y **curadas** a 28 (se descartaron duplicados, logos y portadas de marca).
- `PROYECTOS PERSONALES\WN photo proyecto\FOTO` — airsoft, celebración, grupo, movimiento, macro, nocturna, mercado y evento.
- **Blanco y negro:** `ft-16` y `ft-17` son conversiones a escala de grises de fotografías existentes (`ft-09` y `ft-07`), hechas para completar la categoría sin inventar imágenes.

No se inventó contenido. No se usaron los logos ni las portadas de WN Photo como piezas de galería.

**Banner:** sesión en el lago (`assets/banner.jpg`).

## Formato nativo (sin recorte)

Cada imagen conserva la proporción real de su archivo. La galería usa **filas justificadas** (`.story-flow`) con `aspect-ratio` por pieza: verticales, horizontales y cuadradas se ven completas, sin recorte ni deformación. El pie de foto va debajo, sobre fondo negro, con número y categoría.

## Cómo abrirla

- Doble clic en `index.html`, o
- Con el servidor local: `http://localhost:8765/fotografia/` (red local: `http://192.168.6.38:8765/fotografia/`).
- Las pestañas superiores permiten pasar a otra área sin volver al menú.

## Modo de edición visual

La página ya usa una **barra flotante de áreas** que se pega arriba al hacer scroll y una **barra de progreso** fija abajo, ambas con el color propio de esta área (**cian #58c5d4**). La pestaña activa también se tiñe con ese color.

- Pulsa **⚙ Editar** (abajo a la izquierda) para activar el modo visual. Aparecen lápices **✎** junto a cada texto e imagen.
- **Textos:** toca ✎, escribe y pulsa **Enter** para guardar; **Esc** cancela.
- **Imágenes:** ✎ abre el selector para reemplazarla; **⤢** ofrece **Natural / Cuadrada / Rectángulo** (el rectángulo se ajusta arrastrando); **×** quita la pieza (pide confirmación).
- Al reemplazar una imagen que estaba en **Natural**, la pieza adopta la proporción de la nueva imagen; si estaba **Cuadrada** o en **Rectángulo**, conserva esa forma.
- **＋ Agregar** crea una pieza nueva; **☰ Panel** abre el administrador avanzado de siempre (orden, banner, respaldos); **✓ Listo** sale del modo.
- La **pestaña activa** y la **barra inferior de progreso** usan el color del área.
- Esta sección se abre desde la **tarjeta final de Audiovisual**; su pestaña activa es **Audiovisual** (cian), igual que su barra de progreso.


## Administrador «Editar»

- Edita portada, relato, nombres e introducciones de cada serie.
- Imágenes: título, historia e imagen; agregar, eliminar y reordenar por arrastre o flechas.

**Persistencia:** `localStorage` (`wicho-fotografia-editor-v1`) e `IndexedDB` (`wicho-fotografia-images-v1`).
**Respaldo:** `respaldo-fotografia-wicho.json` mediante «Descargar respaldo».

> **Importante:** los cambios se guardan **solo en este navegador**. No se publican ni se sincronizan solos con Google Sites ni con otros dispositivos.

## Notas y pendientes

- **Grupos musicales** y **deportes de cancha** no tenían material en el archivo revisado; si se agregan fotos, se pueden sumar como piezas nuevas y etiquetarlas con esas categorías.
- Las series de sesión provienen de la galería pública; si existe una selección favorita de Wicho, se puede reordenar desde el administrador.
- Este rediseño no modifica ni publica nada en Google Sites.

## Créditos

Todas las fotografías son de **Wicho Nemes** (WN Photo).
