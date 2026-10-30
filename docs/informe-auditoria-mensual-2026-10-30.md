# Informe de Auditoría Mensual — Artesano Digital

**Fecha:** 30 de octubre de 2026
**Alcance:** Catálogo público + panel administrativo + servidor de producción (Vercel) + costeo de recetas + almacén + pedidos + flujos de compra y servicios.
**Periodo auditado:** Estado de datos vigente al cierre de la auditoría (30/10/2026).
**Método:** Revisión automatizada sobre `server/data/db.json` (75 productos, 180 insumos, 17 paquetes, 9 pedidos) cruzada con las fuentes de verdad compartidas (`shared/costing.js`) y las validaciones del panel.

---

## 1. Resumen ejecutivo

| Indicador | Resultado |
|---|---|
| Productos publicados | 75 |
| Productos en borrador | 0 |
| Productos sin foto / receta / costo / SKU / descripción | **0 / 0 / 0 / 0 / 0** |
| Categorías o áreas con referencias inexistentes | **0** |
| Insumos de receta con material inexistente (bloqueantes) | **0** (eran 9) |
| Paquetes sin componentes definidos | **0** (eran 7) |
| Costos guardados desviados de la receta (>15%) | **0** (eran 2) |
| Productos con margen real < 20% | **0** (eran 2) |
| Productos vendidos por debajo del costo | **0** |
| Pedidos con anticipo < 50% en producción / montos inconsistentes | **0** |

**Costo de adquisición y rentabilidad post-auditoría:**

- Costo promedio ponderado (margen bruto real): **50.66%** (antes de este ciclo: 49.43%).
- Objetivo interno de margen neto (después comisión de tarjeta/terminal 4.1%): **≥ 40%**.
- Desviación detectada y corregida en este ciclo: **Fotobotón acrílico con imán** (margen real 8.49%) y **Taza personalizada con logotipo o nombre** (margen real 13.4%). Se ajustaron precios a los niveles de costo objetivo (MXN 65 y MXN 115 respectivamente) y el margen promedio salió a **50.66%**, con todos los productos operando por encima del umbral saludable.

**Conclusión del ciclo:** el catálogo quedó sin errores críticos de datos, los costos se reconciliaron con la receta como fuente única de verdad y el flujo de producción ya no se bloquea por renglones presupuestarios previos.

---

## 2. Errores críticos encontrados y corregidos

### 2.1 Recetas de manufactura con insumos inexistentes (crítico — bloqueante de producción)

**Hallazgo:** 9 renglones de receta apuntaban a identificadores de almacén que no existían, por lo que el descuento de insumos nunca se ejecutaba y el pedido no podía avanzar a producción.

| Producto | Renglón afectado | Corrección |
|---|---|---|
| Lámpara de mesa moderna | Cajas Kraft Rígida 20x15x8 cm + Poliburbuja (15) | Re-vinculado a `mat-cajas-kraft-mediana` ($16) |
| 7× De Dibujo a Figura 3D Real | Filamento PLA Multicolor Grado Artístico (PrintLab / 3D Market) (0.5 $/g) | Re-vinculado a `mat-pla-blanco` (PLA blanco base) |
| 7× De Dibujo a Figura 3D Real | Cajas Kraft Rígida Acolchada con Viruta y Etiqueta de Colección (18) | Re-vinculado a `mat-cajas-kraft-mediana` |
| Clicker Mecánico Antiestrés | Filamento PLA Verde Olivo Mate y Crema Taller (0.5 $/g) | Re-vinculado a `mat-pla-olivo` (PLA Verde Olivo) |
| Clicker Mecánico Antiestrés | Bolsa Kraft con Ventana y Etiqueta Térmica (3.5) | Re-vinculado a `mat-bolsas-kraft-ventana` |

**Impacto:** el taller no podía fabricar esos productos porque el descuento de almacén fallaba en la validación previa.

**Corrección aplicada:** re-vinculación a los materiales reales + normalización de costos.

### 2.2 Costos desviados de la receta (crítico — subcosto)

**Hallazgo:** 2 productos con costo guardado desviado más de 15% respecto al cálculo automático desde la receta (`Leopardo Bobble Head` 42.50 vs 69.07; `Zorrito Articulado Flexible` 24.80 vs 38.49).

**Corrección:** reconciliación mediante `repairProductCosts` (fuente única `shared/costing.js`).

### 2.3 Precios con margen insostenible (crítico — rentabilidad)

| Producto | Precio | Costo | Margen | Precio corregido | Margen corregido |
|---|---:|---:|---:|---:|---:|
| Fotobotón acrílico con imán | 39 | 35.69 | 8.49% | **65** | **40.9%** |
| Taza personalizada con logotipo o nombre | 72 | 62.35 | 13.4% | **115** | **41.7%** |

Con la comisión de tarjeta/terminal (4.1%) el margen neto real quedó por debajo del objetivo del 40% en ambos casos. Se actualizaron los precios de venta.

### 2.4 Paquetes y combos sin componentes (alto — experiencia de compra)

7 paquetes quedaron sin piezas incluidas, por lo que la tarjeta pública no mostraba contenido.

**Corrección:** se definieron los componentes incluidos en `includedItems` para:
`Paquete Zorrito Colección`, `Starter Pack GYM y Centros Deportivos`, `Starter Pack Barbería y Salón de Belleza`, `Starter Pack Joyería y Boutique`, `Set Suite Nupcial Novia & Novio (6 piezas)`, `Set de Bienvenida & Ceremonia Nupcial`, `Kit Anticruda en Manta con Llaveros de Madera`.

### 2.5 Categoría y áreas inválidas (alto — navegación y filtros)

- Categoría inexistente `oficina-accesorios` → reasignada a `hogar-estudio`.
- Worlds/áreas con referencias inválidas (`juguetes`, `juegos`, `oficina`) → limpiadas de los productos afectados.

---

## 3. Hallazgos por módulo

### 3.1 Catálogo público — información de productos

| Dimensión | Estado |
|---|---|
| Nombre, SKU, categoría, foto, descripción corta | Completo (0 faltantes) |
| Técnicas declaradas | Completo (3D, láser, sublimación, impresión láser/tinta, vinil, NFC) |
| Recetas vinculadas al almacén | Completo post-corrección |
| Paquetes / combos | 17 con componentes; ya verificadas contra precio de venta |

**Recomendación de proceso:** los productos de tipo personalizable deben nacer como `draft` y pasar por el checklist de publicación (nombre, categoría, foto real, receta, costo, precio).

### 3.2 Costeo de recetas y producción

- Fuente única: `shared/costing.js` (`computeRecipeCost`, `buildRecipeFromProduct`, `repairProductCosts`, `auditProductCost`).
- Parámetros de taller: IVA 16%, comisión tarjeta/terminal 4.1% configurable, merma por insumo, reserva por fallas, desperdicio de fibra (15%).
- Post-auditoría: **0 productos con costo inconsistente**, **0 sin costo calculable**, **0 con margen negativo**.

**Hallazgo menor (higiene de datos):** 161 insumos del almacén registran la unidad compuesta (p. ej. `bobina (1 kg)`) sin el campo explícito `packageQuantity`/`packageMeasurement`. El motor de costeo ya infiere la conversión, pero se recomienda normalizar los datos maestros para trazabilidad y reportes.

### 3.3 Almacén y compra (descuentos)

- Si un insumo de la receta no existe → no se descuenta nada (regla conservada) y se informa.
- Tras este ciclo: los renglones presupuestarios generados por lotes (fórmulas agregadas de materiales, empaques, consumibles) se registran como `estimated` y **no bloquean la producción**; los insumos reales sí descontan stock.
- Reserva por fallas (3%) y merma por insumo ya integradas en el costo.

### 3.4 Pedidos

- Flujo: Pedidos → Trabajando → Ventas del mes; solo avance con 50% de anticipo.
- Auditoría: **0 pedidos** con anticipo insuficiente en estado de producción ni montos inconsistentes.

### 3.5 Servicios y paquetes/combos

- Servicios (diseño, publicidad, manufactura industrial, patch bars) viven en el mundo de `servicios` / `paquetes-servicios`.
- Post-auditoría: 0 paquetes con precio ≥ suma de componentes (sin errores de margen de combo detectados).

---

## 4. Mejoras de flujo de trabajo aplicadas en este ciclo

1. **Nueva sección "Borradores" en el panel administrativo** (vía `src/components/AdminPanel.jsx`):
   - Navegación propia con contador de borradores activos.
   - Sub-chips táctiles (móvil) y sidebar (escritorio).
   - Acceso rápido desde el catálogo ("Borradores" con contador).
   - Banner explícito de la vista: solo se listan productos con estado `Borrador`.
   - Desde cualquier producto se puede alternar entre Publicado y Borrador.
2. **Panel de control ampliado con tareas avanzadas** (`adminHealth.advancedTasks`):
   - Recetas con insumos inválidos.
   - Paquetes sin componentes.
   - Áreas con referencias inválidas.
3. **Recetas:** los renglones presupuestarios ya no impiden la fabricación; solo los insumos reales sin material válido lo hacen.

---

## 5. Procesos óptimos recomendados (roadmap)

| Prioridad | Proceso | Acción sugerida |
|---|---|---|
| P0 | Alta y edición de productos | Checklist de publicación ya existente; reforzar que el 50% de anticipo sea obligatorio en la UI de pedidos. |
| P0 | Costeo a pequeña y gran escala | Centralizar parámetros en `DEFAULT_WORKSHOP_PARAMS` + ajuste por producto; generar reporte mensual de margen por técnica. |
| P1 | Almacén | Normalizar `packageQuantity`/`packageMeasurement` en los 180 insumos para reportes y auditorías limpias. |
| P1 | Paquetes | Registrar componentes enlazados a SKUs cuando existan (integrar `includedItems` con catálogo de productos). |
| P2 | UX edición | Vista de "borradores" con acciones directas de publicar/editar/eliminar; notificación de "faltantes" al guardar. |
| P2 | Organización admin | Agrupar por áreas con subgrupos (materia prima directa, complementarios, intangibles, microinsumos, acabados, indirectos, empaques, producción/maquila). |
| P3 | Servicios | Definir catálogo de servicios por separado del catálogo de productos (actualmente 2 registros en servicios). |

---

## 6. Resultado de esta auditoría mensual (cierre)

- **Errores críticos corregidos:** 2 precios, 2 costos, 9 renglones de receta, 7 paquetes, 1 categoría/área.
- **Errores de flujo corregidos:** bloqueo de producción por renglones presupuestarios; visión de borradores en admin.
- **Salud del catálogo post-fix:** 100% en fotos, recetas, costos, SKU y descripciones; 75/75 productos publicados.
- **Salud financiera:** margen promedio 50.66%; 0 productos por debajo del umbral saludable.
- **Verificación:** `npm run build:vite` y `npm run test:hosting` (13/13) en verde.

---

## 7. Pendientes sugeridos para el próximo ciclo

1. Completar `customizationOptions` y `availability` en los productos personalizables restantes (15 detectados en revisión previa).
2. Normalizar unidades/paquetes en el almacén.
3. Vincular paquetes a SKUs de productos reales.
4. Registrar el borrador inicial del nuevo flujo de pedidos con anticipo 50% en el libro.
5. Publicar informe mensual en `docs/`.

---

**Firma de auditoría:** revisión automática de datos + validaciones en código, con verificación de extremo a extremo (build y pruebas de hosting) al cierre del ciclo.

---

_Documento generado por el proceso de auditoría mensual automatizada del sitio Artesano Digital._
