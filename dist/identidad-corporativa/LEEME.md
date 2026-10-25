# Identidad corporativa — Wicho Nemes

Sección del mosaico de marcas. Abre `index.html` con el servidor local de previsualización: `http://localhost:8765/identidad-corporativa/`.

## Contenido

- Mosaico de proyectos de identidad; cada tarjeta muestra el logo o arte, el nombre y el enlace al proyecto.
- Banner, títulos e introducción propios.
- El mosaico alterna piezas cuadradas y rectangulares; el orden se puede cambiar desde el panel.

## Modo de edición visual

- Pulsa **⚙ Editar** (abajo a la izquierda) para entrar al modo visual. El área usa el **dorado #e8b84f**.
- Lápices **✎** junto a los textos, el banner, los nombres de proyecto y las imágenes.
- **Textos:** toca ✎, escribe y pulsa **Enter**; **Esc** cancela.
- **Imágenes de proyecto:** ✎ reemplaza la imagen; **⤢** abre **Cuadrada / Rectángulo** con vista previa; **×** quita el proyecto (pide confirmación).
- **＋ Agregar** suma un proyecto con nombre, enlace, logo y forma al final del mosaico.
- **☰ Panel** conserva el administrador avanzado (reordenar arrastrando, banner, respaldos); **✓ Listo** sale del modo.
- La pestaña activa y la barra de progreso usan el dorado del área.

## Persistencia

- Textos y orden en `localStorage` (clave `wicho-identidad-editor-v1`); imágenes en IndexedDB (`wicho-identidad-images-v1`).
- **Descargar respaldo** genera `respaldo-identidad-wicho.json` con las imágenes incluidas; **Importar respaldo** lo restaura en otro equipo.
- Los cambios se guardan solo en este navegador: no se publican ni se sincronizan solos.

## Nota

Este rediseño no modifica ni publica nada en Google Sites.
