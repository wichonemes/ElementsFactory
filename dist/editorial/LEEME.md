# Diseño editorial · Wicho Nemes — Rediseño integrado

Sección **Diseño editorial** reconstruida con el lenguaje del portafolio (oscuro y dorado), pero con carácter propio: tipografía serif, folios, reglas de libro y una lectura por páginas. El énfasis está en lo editorial: **la letra, el alfabeto y la publicación**.

## Contenido

49 piezas en 3 secciones:

1. **Especímenes** (15) — pruebas tipográficas en pantalla (monoespaciada, mayúsculas, *Baby Boomer*, *Boomer*, versión magenta) y las primeras construcciones de letras sobre cuadrícula.
2. **Alfabeto construido** (24) — veinticuatro letras de madera cortadas, unidas y fotografiadas: el alfabeto como objeto y como sistema.
3. **Publicaciones** (10) — el sistema **Popol Vuh** aplicado a carteles, portada de libro (*14*), pliego de *Comunidad*, selección de *Libros*, *Mooby Dick*, *Sin novedad en el frente*, ilustración de souvenirs y banda editorial.

**Origen del contenido:**

- La galería viva de `diseño-editorial` (tipografía experimental y alfabeto de madera): 56 imágenes descargadas y **curadas** a 39 piezas; se descartaron duplicados y variantes repetidas.
- `PROYECTOS PERSONALES\popol vuh proyecto` para las publicaciones (pliegos, carteles y portada).

No se inventó obra nueva. Los títulos genéricos (*Letra 01…24*) son neutrales porque el sitio original no nombraba cada letra; se pueden renombrar desde el administrador.

**Banner:** especimen monoespaciado (`assets/banner.jpg`). La fuente serif es **Fraunces** (Google Fonts) y se carga solo en esta sección.

## Formato nativo (sin recorte)

Cada pieza conserva la proporción real de su archivo. Las imágenes se agrupan en **filas justificadas** y cada una mantiene su `aspect-ratio`; el pie de foto va debajo, con número y categoría, sin tapar la letra ni el pliego. Las verticales del alfabeto y los pliegos horizontales se respetan tal como fueron creados.

## Cómo abrirla

- Doble clic en `index.html`, o
- Con el servidor local: `http://localhost:8765/editorial/` (red local: `http://192.168.6.38:8765/editorial/`).
- Las pestañas superiores permiten pasar a otra área sin volver al menú.

## Modo de edición visual

La página ya usa una **barra flotante de áreas** que se pega arriba al hacer scroll y una **barra de progreso** fija abajo, ambas con el color propio de esta área (**rojo #e5675f**). La pestaña activa también se tiñe con ese color.

- Pulsa **⚙ Editar** (abajo a la izquierda) para activar el modo visual. Aparecen lápices **✎** junto a cada texto e imagen.
- **Textos:** toca ✎, escribe y pulsa **Enter** para guardar; **Esc** cancela.
- **Imágenes:** ✎ abre el selector para reemplazarla; **⤢** ofrece **Natural / Cuadrada / Rectángulo** (el rectángulo se ajusta arrastrando); **×** quita la pieza (pide confirmación).
- Al reemplazar una imagen que estaba en **Natural**, la pieza adopta la proporción de la nueva imagen; si estaba **Cuadrada** o en **Rectángulo**, conserva esa forma.
- **＋ Agregar** crea una pieza nueva; **☰ Panel** abre el administrador avanzado de siempre (orden, banner, respaldos); **✓ Listo** sale del modo.
- La **pestaña activa** y la **barra inferior de progreso** usan el color del área.
- Identidad corporativa tiene un editor visual propio, adaptado a su mosaico (cuadrada o rectángulo).


## Administrador «Editar»

- Edita portada, relato, nombres e introducciones de cada sección.
- Piezas: título, historia e imagen; agregar, eliminar y reordenar por arrastre o flechas.

**Persistencia:** `localStorage` (`wicho-editorial-editor-v1`) e `IndexedDB` (`wicho-editorial-images-v1`).
**Respaldo:** `respaldo-editorial-wicho.json` mediante «Descargar respaldo»; se restaura con «Importar respaldo».

> **Importante:** los cambios se guardan **solo en este navegador**. No se publican ni se sincronizan solos con Google Sites ni con otros dispositivos.

## Notas

- Si no hay conexión, el texto sigue funcionando con la tipografía de respaldo (Georgia).
- El orden propone un recorrido: primero la letra suelta, luego el alfabeto, al final la página impresa.
- Este rediseño no modifica ni publica nada en Google Sites.

## Créditos

Tipografía, alfabeto construido y publicaciones: **Wicho Nemes**. Proyecto Popol Vuh: piezas editoriales del archivo de Wicho.
