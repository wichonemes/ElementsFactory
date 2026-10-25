# Audiovisual — Wicho Nemes

Sección independiente del portafolio. Abre `index.html` desde un servidor local para usar la vista y el administrador (por ejemplo `http://192.168.6.38:8765/audiovisual/` mientras el servidor de previsualización esté encendido; el enlace solo funciona con teléfono y computadora en el mismo Wi-Fi y no es un enlace público).

## Cambios de esta etapa

- **Mosaico cerrado.** Las series se acomodan en bandas de altura uniforme que alternan piezas panorámicas y cuadradas (6-3-3 / 3-3-6). La geometría se calcula con `mosaicWidths()` en `audiovisual.js`, así que el mosaico se reequilibra solo al agregar, editar, eliminar o reordenar series: nunca quedan huecos ni filas desalineadas.
- **Numeración editorial.** Cada tarjeta lleva su número de pliego (01, 02, …) junto a la categoría, en el estilo del mosaico de Identidad corporativa.
- **Responsive verificado** en escritorio (1440 px), tablet (≤800 px) y móvil (390 px): en pantallas angostas las panorámicas ocupan todo el ancho y las cuadradas van en pares.
- Administrador local con arrastre y flechas de reordenamiento, IndexedDB para imágenes y respaldo JSON con las fotos incluidas (heredado de la sección Identidad Corporativa).

## Contenido verificado contra el sitio activo

Títulos, imágenes, orden y enlaces fueron confrontados contra `https://sites.google.com/view/wichonemes/audiovisual/` capturando el DOM renderizado (ingeniería inversa con herramientas REA, evidencia de runtime):

- Series del mosaico en el orden del original: Airsoft (gotcha), Kung Fu, Béisbol, Golf, Atletismo, Música, Sesiones, Festividades. Los enlaces "ver galería" apuntan a las páginas correspondientes de Google Sites. La tarjeta de Festividades conserva el enlace a Béisbol tal como aparece en el sitio vivo; Wicho puede corregirlo desde **Editar > Editar y ordenar series**.
- Videos: los dos ID de YouTube (`cDeONqHZcug` – Coco Ruiz y `eQw2PF_l5N0` – Fotografía) coinciden con los embebidos del sitio original.
- Pendiente detectado: el menú del sitio activo incluye también **Casual** (`/audiovisual/casual`) sin tarjeta en la página principal. No se invitó al mosaico porque no hay imagen ni crédito verificable; Wicho puede agregarlo en **Editar > Agregar una serie** cuando decida su portada.

## Modo de edición visual

La página ya usa una **barra flotante de áreas** que se pega arriba al hacer scroll y una **barra de progreso** fija abajo, ambas con el color propio de esta área (**cian #58c5d4**). La pestaña activa también se tiñe con ese color.

- Pulsa **⚙ Editar** (abajo a la izquierda) para activar el modo visual. Aparecen lápices **✎** junto a cada texto e imagen.
- **Textos:** toca ✎, escribe y pulsa **Enter** para guardar; **Esc** cancela.
- **Imágenes:** ✎ abre el selector para reemplazarla; **⤢** ofrece **Natural / Cuadrada / Rectángulo** (el rectángulo se ajusta arrastrando); **×** quita la pieza (pide confirmación).
- Al reemplazar una imagen que estaba en **Natural**, la pieza adopta la proporción de la nueva imagen; si estaba **Cuadrada** o en **Rectángulo**, conserva esa forma.
- **＋ Agregar** crea una pieza nueva; **☰ Panel** abre el administrador avanzado de siempre (orden, banner, respaldos); **✓ Listo** sale del modo.
- La **pestaña activa** y la **barra inferior de progreso** usan el color del área.
- En la fila de videos, los lápices editan el **título y la descripción** de cada video.
- La tarjeta **Fotografía · WN Photo** al final de la página abre la sección de Fotografía.


## Administrar el contenido

- Pulsa **Editar** abajo a la izquierda: entra al **modo de edición visual** (lápices ✎ sobre textos e imágenes). El panel avanzado sigue en **☰ Panel**.
- **Portada y relato:** textos del banner y la introducción, y el banner superior.
- **Secciones del mosaico:** nombres e introducciones de los recorridos (Acción y disciplina / Rostros y encuentros).
- **Editar y ordenar series:** título, categoría, relato, enlace, foto; reordena arrastrando o con las flechas ↑/↓. Al guardar cambios el mosaico se rearma solo.
- **Agregar una serie:** añade una tarjeta al final con portada e historia.
- **Videos:** título, descripción e ID de YouTube.
- **Descargar respaldo** guarda textos e imágenes en un JSON portable; **Importar respaldo** lo reemplaza todo en otro navegador/dispositivo.

Los cambios se guardan en el navegador donde se hicieron. No se publican solos en Google Sites ni se sincronizan entre dispositivos: hay que importar el respaldo o desplegar la versión nueva. Para publicar esta sección se requiere hostearla en un servicio web o reconstruir sus elementos en Google Sites.
