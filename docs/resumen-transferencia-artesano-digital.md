# Artesano Digital · Documento Maestro de Transferencia de Proyecto
**Fecha de generación:** 17 de octubre de 2026  
**Proyecto:** Artesano Digital (E-commerce y Panel de Administración de Taller Bajo Demanda)  
**Repositorios:**
* Producción (Render): `https://github.com/wichonemes/artesano.git` (Rama `main`)
* Respaldo / Código: `https://github.com/wichonemes/ElementsFactory.git` (Rama `main`)

---

## 1. Visión y Objetivos del Proyecto
* **Giro del negocio:** Taller de manufactura digital y diseño artesanal que comercializa productos fabricados bajo demanda mediante **Impresión 3D (FDM)**, **Corte y Grabado Láser**, y **Sublimación/Vinil**.
* **Objetivo de Catálogo:** Disponer de una tienda en línea y panel de administración donde cada producto cuente con:
  1. Identidad morfológica 100% fiel al archivo 3D real de producción (modelos confirmados de MakerWorld o diseños propios).
  2. Galería fotográfica estandarizada de 4 vistas obligatorias por producto.
  3. Estándar de fondo blanco puro (`#FFFFFF`) continuo sin recuadros sucios ni bordes de recorte.
  4. Ficha técnica de taller con cálculo de escandallo (materiales directos/indirectos), margen de utilidad, precio de venta, embalaje y tiempos de taller.
  5. Pestaña de trazabilidad para repositorios externos (MakerWorld, Printables, Thingiverse, nube) y rutas de archivos locales en la computadora del taller (`.3mf`, `.stl`).

---

## 2. Estándar Oficial de Catálogo (Regla de Oro de las 4 Vistas)
Institucionalizado en `docs/estandar-imagenes-catalogo.md` y en las reglas de sistema (`C:\Users\OEM\.gemini\config\rules\estandar-imagenes-catalogo.md`).

### Secuencia Obligatoria de Presentación
1. **Vista 1 · En Contexto (Lifestyle):**  
   * Muestra el producto en un ambiente realista de uso (escritorio, recibidor, cafetería, sala, etc.).  
   * El producto es el protagonista absoluto; conserva su geometría, color, proporción y textura. La decoración es secundaria y desenfocada (bokeh) para no dar a entender que se incluyen artículos adicionales.
2. **Vista 2 · Fondo Blanco Puro (`#FFFFFF` - Ancla de Verdad):**  
   * Fotografía de producto comercial completa, centrada y sin recortes.  
   * Iluminación de estudio uniforme con sombra de contacto suave.  
   * Fondo RGB exactamente en `(255, 255, 255)` continuo para fundirse invisiblemente con la interfaz web.  
   * **Regla estricta:** Es la primera que se define y sirve de referencia morfológica obligatoria para las otras tres vistas.
3. **Vista 3 · Detalle (Recorte Directo 100%):**  
   * Acercamiento mediante recorte real (crop) de la Vista 2 y ampliado.  
   * Enfocado en textura de capas de impresión FDM, veta de madera, ensamble mecánico o relieve.  
   * **Cero redibujos ni alucinaciones de IA:** Debe ser exactamente la misma toma recortada.
4. **Vista 4 · Tamaño y Medidas:**  
   * Muestra el producto con cotas técnicas legibles en español (altura, ancho, profundidad).  
   * Incluye una tarjeta de referencia estándar ($8{,}6 \times 5{,}4\text{ cm}$) a escala real.  
   * Incluye la leyenda reglamentaria: *«Referencia de tamaño · No incluido»*.

---

## 3. Catálogo de Modelos MakerWorld: Aprobados vs. Propuestos

### Modelos Aprobados y Generados (7 Productos Clave)

| Código | Producto | Modelo MakerWorld / Creador | Tiempos de Fabricación | Estado de las 4 Vistas |
| :--- | :--- | :--- | :--- | :--- |
| **T38** | Lámpara de Mesa Moderna | MakerWorld #1804162 por **Mesmar** | 7h 30m máquina + 20m ensamble | **100% Aprobada** (Estándar de Oro en producción) |
| **Tarjetero** | Soporte Minimalista de Tarjetas | MakerWorld #1067062 por **CrazyModding** | 1h 45m máquina + 5m post-proceso | **100% Aprobado** (Lámina completa) |
| **T35** | Cute Fox Figura & Llavero | MakerWorld #2387852 por **MrGravity** | 2h 15m máquina + 10m post-proceso | **100% Generada** (Pendiente visto bueno final de V1) |
| **T20** | Chapita Huesito Mascota | MakerWorld #3138490 por **Ryno_man** | 25m máquina + 5m post-proceso | **100% Generada** (Pendiente visto bueno final de V1) |
| **T1** | Llavero Nombre Personalizado Bicolor | MakerWorld #1759237 por **Haledesigns3d** | 35m máquina + 5m post-proceso | **100% Generada** (Pendiente visto bueno final de V1) |
| **T16 / T33** | Cartel Mostrador QR & NFC | MakerWorld #2401859 por **PhantomCommit** | 1h 30m máquina + 10m post-proceso | **100% Generada** (Pendiente visto bueno final de V1) |
| **T10** | Soporte Smartphone Print-in-Place | MakerWorld #1087279 por **mgm86** | 55m máquina + 5m post-proceso | **100% Generada** (Pendiente visto bueno final de V1) |

### Modelos Propuestos / En Catálogo para Siguiente Fase
* **T37 · Organizador Modular de Escritorio:** MakerWorld #2087519 por *Meyui* (5h 30m máquina + 15m ensamble).
* **T12 · Sujetacables Minimalista Facetado:** MakerWorld #1810947 por *m@* (50m máquina + 5m acabado).
* **T6 · Maceta Espiral Geométrica:** Compatible con MakerWorld / Printables (3h 45m máquina + 10m acabado).
* **T29 · Bandeja Vaciabolsillos Ovalada:** Diseño propio Artesano Digital (3h 15m máquina + 10m acabado).

---

## 4. Prompts Oficiales Utilizados para las Vistas Generadas

### Prompt Maestro de Dirección de Arte (Vista 1 Lifestyle - Contexto)
* **T38 (Lámpara Mesmar encendida):**  
  > *"Fotografía editorial lifestyle de lámpara moderna en forma de 'C' continua de madera doblada en 90° con pantalla cónica difusora hacia abajo montada sobre escritorio de madera natural. La lámpara está encendida emitiendo luz cálida difusa (2700K) exclusivamente hacia la mesa. Fondo desenfocado con pared marfil y libro cerrado. Formato 1:1, iluminación natural cálida, sin textos ni marcas de agua."*
* **T35 (Cute Fox & Llavero en repisa nórdica):**  
  > *"Fotografía publicitaria editorial 1:1 en primer plano de dos figuras de zorrito tierno impresas en 3D en PLA naranja cálido y blanco marfil (figura 70 mm y mini llavero 35 mm con argolla metálica), posados sobre repisa flotante de roble claro en interior escandinavo limpio. Al fondo suavemente desenfocada una pequeña planta suculenta en maceta de cerámica y luz natural suave de mañana."*
* **T20 (Chapita Huesito en collar de perro):**  
  > *"Fotografía editorial 1:1 con profundidad de campo f/2.8 enfocada en primer plano en la chapita identificadora de huesito en PLA blanco con borde y letras en relieve negro ('MAX' y teléfono) unida con argolla metálica al collar de un perro Golden Retriever descansando sereno en piso de madera clara con luz lateral suave."*
* **T1 (Llavero Nombre en bandeja vaciabolsillos):**  
  > *"Fotografía editorial 1:1 de llavero rectangular bicolor 'ARTESANO' en PLA negro mate y relieve blanco marfil, con argolla metálica y llaves reales, reposando con naturalidad sobre bandeja vaciabolsillos en consola de recibidor moderno de roble claro con luz natural de día."*
* **T16 / T33 (Cartel QR & NFC en mostrador de cafetería):**  
  > *"Fotografía editorial 1:1 de mini cartel exhibidor impreso en 3D (marco negro mate inclinado con placa frontal blanca, icono NFC contactless y código QR nítido), ubicado en el mostrador de madera de una cafetería de especialidad con taza de café humeante desenfocada en bokeh."*
* **T10 (Soporte Smartphone en escritorio):**  
  > *"Fotografía editorial 1:1 del soporte articulado ultra compacto print-in-place en PLA verde olivo mate, desplegado en escritorio de trabajo de roble claro sosteniendo un smartphone en ángulo 3/4 con libreta y teclado sobrios desenfocados."*

### Prompts de Vista 2 (Fondo Blanco Puro)
* Todos especifican: Perspectiva 3/4 centrada, formato 1:1, fondo blanco puro (`#FFFFFF`), sombra de contacto suave en la base, luz de estudio difusa sin brillos plásticos artificiales y textura de capas FDM visible de cerca.

---

## 5. Cambios Realizados en el Código y Nuevas Funcionalidades

### A. Corrección Crítica en `src/components/AdminPanel.jsx`
* **Error resuelto:** Al hacer clic en la pestaña *«4. Precios, Margen & Descuentos»*, la pantalla se quedaba en blanco debido a un `ReferenceError: FileSpreadsheet is not defined` (el icono no estaba importado en `lucide-react`).
* **Solución:** Se importó `FileSpreadsheet` y se añadieron salvaguardas de navegación segura en el cálculo de recetas y desglose de SKU para evitar fallos cuando faltan datos de costos.

### B. Creación de la Pestaña 5: «Repositorio & Fabricación»
Se añadió al modal de edición de productos la pestaña **5. Repositorio & Fabricación** (`editorActiveTab === 'repo'`):
1. **Repositorio Web:** Campo de URL (MakerWorld u otro) con botón interactivo de apertura externa (`Probar Enlace`), botón para copiar al portapapeles, ID de modelo, diseñador original y selector de licencia comercial.
2. **Archivos Locales en PC:** Ruta completa del archivo (`.3mf`, `.stl`, `.step`) en el disco duro del taller con botón para copiar la ruta al explorador de Windows o Bambu Studio, más notas técnicas de rebanado (boquilla, relleno, soportes).
3. **Tiempos de Fabricación:**
   * Horas y minutos de uso de máquina.
   * Minutos de post-procesado y ensamble manual.
   * Cálculo automático del tiempo total de taller (`⏱️ Xh Ym`).
   * Selector y campo personalizado de promesa de entrega al cliente (`1 a 2 días`, `2 a 4 días hábiles`).
4. **Enlaces adicionales dinámicos:** Lista editable para adjuntar enlaces a videos de ensamble o fichas técnicas.
5. **Navegación UX:** Botón de avance desde la pestaña 4 hacia la 5 (`Continuar a: 5. Repositorio & Fabricación ➡️`).

### C. Visibilidad en el Listado de Productos
En la tabla de escritorio, en las tarjetas táctiles para móviles y en la cuadrícula de productos, ahora se muestran distintivos compactos:
* Badge con el tiempo total de taller estimado (ej. `⏱️ 2h 15m`).
* Botón interactivo para abrir el enlace de MakerWorld en una pestaña nueva (ej. `🌐 MW #1804162`).
* Distintivo `💻 PC` si el producto tiene registrada su ruta de archivo local.

### D. Enriquecimiento de Base de Datos
* Se procesaron los **57 productos** del catálogo en `server/data/db.json` y `server/db.js`, asignando tiempos de manufactura estimados coherentes y mapeando los enlaces de MakerWorld reales para los productos de impresión 3D.

---

## 6. Archivos y Rutas del Proyecto

### Archivos de Código
* `src/components/AdminPanel.jsx`: Componente maestro del panel de administración (gestión de productos, escandallo, pestañas 1 a 5, fotos y SKU).
* `src/App.jsx`: Interfaz de la tienda y catálogo público para clientes.
* `server/index.js`: Servidor API Express (endpoints de productos, autenticación, settings y taller).
* `server/db.js`: Capa de persistencia y base de datos con `initialProducts` sincronizado.
* `server/data/db.json`: Base de datos JSON activa con los 57 productos enriquecidos.
* `dist/`: Carpeta con el bundle precompilado listo para producción en Render.

### Reglas y Documentación
* `C:\Users\OEM\.gemini\config\rules\estandar-imagenes-catalogo.md`: Regla global del estándar de 4 imágenes.
* `C:\Users\OEM\.gemini\config\rules\idioma-espanol.md`: Regla de respuesta en español de México.
* `docs/estandar-imagenes-catalogo.md`: Copia versionada en el repositorio del estándar fotográfico.
* `docs/resumen-transferencia-artesano-digital.md`: Este documento maestro.

### Láminas y Archivos de Imágenes Generadas
Ubicación en disco: `C:\Users\OEM\.gemini\antigravity\brain\05377439-c343-40ff-84b3-b5985838fb3d\`
* **Tablero Maestro (7 modelos x 4 vistas):** `catalogo_maestro_7_productos_4_vistas.jpg`
* **Láminas individuales de 4 vistas (1000px, `#FFFFFF` puro):**
  * T38 (Lámpara): `t38_galeria_4_vistas_oficial.jpg`
  * Tarjetero: `tarjetero_galeria_4_vistas_oficial.jpg`
  * T35 (Zorrito): `t35_galeria_4_vistas_oficial.jpg`
  * T20 (Chapita): `t20_galeria_4_vistas_oficial.jpg`
  * T1 (Llavero): `t1_galeria_4_vistas_oficial.jpg`
  * T16/T33 (Cartel QR/NFC): `t16_t33_galeria_4_vistas_oficial.jpg`
  * T10 (Soporte Smartphone): `t10_galeria_4_vistas_oficial.jpg`
* **Vistas 1 (Lifestyle en contexto recién generadas):**
  * T35: `t35_vista1_lifestyle_1792267330828.jpg`
  * T20: `t20_vista1_lifestyle_1792267379172.jpg`
  * T1: `t1_vista1_lifestyle_v2_1792267390449.jpg`
  * T16: `t16_vista1_lifestyle_1792267450592.jpg`
  * T10: `t10_vista1_lifestyle_v2_1792267466128.jpg`

---

## 7. Problemas Detectados y Soluciones Aplicadas
1. **Desviación de modelos en imágenes generadas por IA:**  
   * *Causa:* La IA generaba modelos genéricos que no coincidían con los archivos de impresión 3D de MakerWorld.  
   * *Solución:* Se adoptó la **Imagen 2 (Fondo Blanco)** como ancla visual obligatoria basada en la geometría real de MakerWorld, y la Imagen 1 se genera a partir de ella.
2. **Recuadros de recorte visibles (Fondo grisáceo):**  
   * *Causa:* Las imágenes generadas tenían fondos de tono RGB 232-248, dejando recuadros visibles sobre el fondo blanco del catálogo.  
   * *Solución:* Algoritmo de remapeo de niveles (curva de punto blanco en 230-235) para garantizar `#FFFFFF` puro conservando las sombras de contacto suaves.
3. **Crash de pantalla en blanco en pestaña de precios:**  
   * *Causa:* Falta de importación de `FileSpreadsheet`.  
   * *Solución:* Importación agregada y guardas de navegación segura en `src/components/AdminPanel.jsx`.
4. **Agotamiento de cuota de API de imágenes (Error 429):**  
   * *Solución:* Temporizador automático para esperar el reseteo horario y generación secuencial por lotes.

---

## 8. Punto Actual y Siguientes Pasos Inmediatos

### Dónde nos quedamos exactamente
* El panel de administración tiene publicada la Pestaña 5 con gestión de repositorios y tiempos de taller en Render y GitHub.
* Las láminas oficiales de 4 vistas de los 7 productos están generadas con fondos blancos `#FFFFFF` puros y Vistas 1 en contexto.
* El [Tablero Maestro Consolidado](file:///C:/Users/OEM/.gemini/antigravity/brain/05377439-c343-40ff-84b3-b5985838fb3d/catalogo_maestro_7_productos_4_vistas.jpg) está listo para revisión visual.

### Siguientes Pasos al Iniciar la Nueva Conversación
1. **Aprobación de Vistas 1 restantes:** Revisar las nuevas tomas de contexto de T35, T20, T1, T16 y T10 para dar el visto bueno final.
2. **Carga en Galería de Producción:** Copiar las imágenes aprobadas a la carpeta pública (`/uploads/` o almacenamiento en nube) y asignarlas a los campos `primaryImage`, `gallery` (`[0, 1, 2, 3]`), `whiteBgImage`, `detailImage` y `measureImage` de cada producto en la base de datos.
3. **Continuar con la Segunda Tanda de Productos:** Generar las 4 vistas para los siguientes modelos MakerWorld pendientes:
   * T37 (Organizador Modular #2087519)
   * T12 (Sujetacables Facetado #1810947)
   * T6 (Maceta Espiral) y T29 (Bandeja Ovalada)
4. **Verificación de Enlaces Locales:** Permitir al usuario ingresar las rutas locales definitivas de su PC en la Pestaña 5 para cada archivo `.3mf` que tenga descargado.
