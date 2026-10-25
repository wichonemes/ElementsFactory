# Medios impresos · Wicho Nemes — Rediseño integrado

Sección **Medios impresos** reconstruida con el lenguaje visual del portafolio: fondo oscuro, acentos dorados, portada editorial, mobile-first y administrador local. Aquí el énfasis es la **impresión**: la marca aplicada a la tela, al papel y al objeto, y el taller donde eso sucede.

## Contenido

37 piezas en 4 secciones:

1. **Civil Armory** (15) — campaña *Atendiendo al civil*, presentación de marca, catálogo y fichas de producto (PV&C, Recluta, Sargento, Especial Ops), bufanda, playera camo, retratos de escuadrón y campaña de airsoft.
2. **Artesano Digital** (9) — el manual de marca impreso (estrategia, campos de acción, identificación), la campaña *Haz de tu proyecto un juego* y las aplicaciones del logotipo.
3. **Serigrafía y objeto** (10) — tazas sublimadas, registro de color CMYK, serigrafía textil, playeras de prueba, trazo lineal, taza ilustrada, gorras y transfer.
4. **Taller y tiraje** (3) — la producción real: tazas en proceso, impresión textil y el equipo del taller.

**Origen del contenido:** páginas vivas `medios-impresos` (Civil Armory y Artesano Digital) y las carpetas locales del proyecto:

- `PROYECTOS PERSONALES\civil armory` — pliegos, previsualizaciones de tazas/playeras/gorras y fotografías del taller.
- `PROYECTOS PERSONALES\Artesano Digital` — manual de marca, campaña y aplicaciones.

No se inventó obra nueva. Los dos archivos que no se encontraron en las carpetas (`tazas previsualizacion 10 MAYO-01.png` y `3 playeras previsualizacion ROCKSTAR-03.png`) no se incluyeron; se pueden agregar desde el administrador.

**Banner:** campaña *Atendiendo al civil* (`assets/banner.jpg`).

## Formato nativo (sin recorte)

Cada pieza conserva la proporción real de su archivo. La galería no recorta ni fuerza cuadros: las imágenes se agrupan en **filas justificadas** (`.story-flow`) y cada una mantiene su `aspect-ratio`; el texto va **debajo**, sin tapar la obra. Las piezas horizontales, verticales o cuadradas se respetan tal como fueron creadas.

## Cómo abrirla

- Doble clic en `index.html`, o
- Con el servidor local del proyecto: `http://localhost:8765/impresos/` (en la red local, `http://192.168.6.38:8765/impresos/`).
- Las pestañas superiores permiten pasar a otra área sin volver al menú.

## Modo de edición visual

La página ya usa una **barra flotante de áreas** que se pega arriba al hacer scroll y una **barra de progreso** fija abajo, ambas con el color propio de esta área (**naranja #e99158**). La pestaña activa también se tiñe con ese color.

- Pulsa **⚙ Editar** (abajo a la izquierda) para activar el modo visual. Aparecen lápices **✎** junto a cada texto e imagen.
- **Textos:** toca ✎, escribe y pulsa **Enter** para guardar; **Esc** cancela.
- **Imágenes:** ✎ abre el selector para reemplazarla; **⤢** ofrece **Natural / Cuadrada / Rectángulo** (el rectángulo se ajusta arrastrando); **×** quita la pieza (pide confirmación).
- Al reemplazar una imagen que estaba en **Natural**, la pieza adopta la proporción de la nueva imagen; si estaba **Cuadrada** o en **Rectángulo**, conserva esa forma.
- **＋ Agregar** crea una pieza nueva; **☰ Panel** abre el administrador avanzado de siempre (orden, banner, respaldos); **✓ Listo** sale del modo.
- La **pestaña activa** y la **barra inferior de progreso** usan el color del área.
- Identidad corporativa tiene un editor visual propio, adaptado a su mosaico (cuadrada o rectángulo).


## Administrador «Editar»

- Edita portada, relato, nombres e introducciones de cada sección.
- Piezas: título, historia y cambio de imagen; agregar, eliminar y reordenar por arrastre o flechas.
- Botón flotante **⚙ Editar** (abajo a la izquierda): entra al **modo de edición visual**. El panel avanzado sigue en **☰ Panel**.

**Persistencia:** textos y orden en `localStorage` (`wicho-impresos-editor-v1`); imágenes subidas en `IndexedDB` (`wicho-impresos-images-v1`).
**Respaldo:** «Descargar respaldo» genera `respaldo-impresos-wicho.json` (incluye las imágenes); «Importar respaldo» lo restaura en otro equipo.

> **Importante:** los cambios se guardan **solo en este navegador**. No se publican ni se sincronizan solos con Google Sites ni con otros dispositivos. Descarga respaldos con frecuencia.

## Notas

- Las fotos de producto y de taller provienen del archivo del proyecto; se optimizaron a JPEG para web.
- El orden cuenta una historia: campaña → marca → catálogo → producto → taller.
- Este rediseño no modifica ni publica nada en Google Sites.

## Créditos

Todas las piezas son de **Wicho Nemes**. Marcas: **Civil Armory** y **Artesano Digital**.
