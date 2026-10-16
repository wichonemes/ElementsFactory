# Artesano Digital — Plataforma Web & Catálogo Comercial

Plataforma oficial desarrollada para **Artesano Digital**, marca mexicana de diseño, personalización y fabricación de productos mediante Impresión 3D, Corte Láser, Sublimación, Vinil y soluciones inteligentes NFC.

---

## 🌟 Características Principales

1. **Arquitectura de los 3 Mundos:**
   - **Hogar:** Objetos útiles, decoración contemporánea y recuerdos familiares.
   - **Negocios:** Señalética, exhibidores, soportes QR/NFC y *starter packs* por giro.
   - **Eventos Especiales:** Detalles, recuerdos y letreros para bodas, aniversarios y conmemoraciones.
   - *Filtros cruzados por técnica de fabricación (3D, Láser, Sublimación, Vinil, NFC).*

2. **Catálogo & Fichas de Producto Reales:**
   - 30 productos y kits iniciales con códigos reales (`L14`, `T38`, `T6`, `T29`, `S1`, `T16`, `T32`, `T18`, etc.).
   - 22 fotografías originales en alta resolución extraídas directamente del catálogo de la marca.
   - Precios fijos, precios base «*Desde $...*» y opciones «*A cotizar*».
   - Especificaciones completas: materiales, medidas, qué incluye, disponibilidad y cuidados.

3. **Carrito de Cotización Directo por WhatsApp:**
   - Agrega artículos, ajusta cantidades y escribe notas de grabado o personalización.
   - Formulario ligero para el cliente (nombre, fecha requerida, ciudad o C.P.).
   - Generación de mensaje estructurado con formato listo para WhatsApp (`https://wa.me/...`).
   - Botón de respaldo «*Copiar resumen de cotización*» al portapapeles.
   - Aviso claro de «*Total por confirmar*» en artículos personalizados y cálculo de subtotales.

4. **Panel de Administración Privado con Almacenamiento Persistente:**
   - Autenticación real basada en tokens seguros JWT y contraseñas cifradas con `bcrypt`.
   - **Productos:** Crear, editar, duplicar como plantilla, publicar, archivar y eliminar.
   - **Fotografías:** Subida y almacenamiento de imágenes en disco (`public/uploads/`).
   - **Categorías:** Control de visibilidad. *Las categorías vacías permanecen ocultas al público automáticamente.*
   - **Métricas:** Registro de visitas a la web, clics a WhatsApp y productos más consultados.
   - **Configuración:** Número de WhatsApp del negocio, correo, zona de entrega, horarios y notas.

---

## 🚀 Cómo Iniciar la Aplicación

La aplicación se encuentra en:
`C:\Users\OEM\.gemini\antigravity\scratch\artesano-digital`

### Opción 1: Iniciar el servidor unificado (Recomendado)
```bash
cd C:\Users\OEM\.gemini\antigravity\scratch\artesano-digital
node server/index.js
```
Abre en tu navegador:
👉 **http://localhost:5000**

### Opción 2: Modo Desarrollo con Hot-Reload (Vite)
En una terminal:
```bash
node server/index.js
```
En otra terminal:
```bash
pnpm dev
```
Abre en tu navegador:
👉 **http://localhost:3000**

---

## 🔐 Acceso al Panel de Administración

Puedes acceder haciendo clic en el enlace «**Administración**» en la barra superior o en el pie de página, o directamente desde la interfaz.

* **Usuario inicial:** `admin`
* **Contraseña inicial:** `Artesano2026!`

*(Puedes cambiar esta contraseña en cualquier momento dentro de la pestaña **Datos del Negocio** en el panel).*

---

## 📁 Estructura del Proyecto

```text
artesano-digital/
├── dist/                      # Frontend compilado para producción
├── public/
│   └── uploads/               # 22 fotos reales + imágenes subidas por el admin
├── server/
│   ├── data/
│   │   └── db.json            # Base de datos persistente (productos, categorías, métricas, settings)
│   ├── db.js                  # Capa de datos con transacciones atómicas
│   └── index.js               # Servidor Express, JWT, Multer y API REST
├── src/
│   ├── components/
│   │   ├── AdminPanel.jsx     # Panel de administración completo y métricas
│   │   ├── BrandLogo.jsx      # Isotipo geométrico artesanal y logotipo
│   │   ├── FiltersBar.jsx     # Filtros por técnica, mundo y subcategorías
│   │   ├── Footer.jsx         # Pie de página y enlaces institucionales
│   │   ├── Hero.jsx           # Portada principal con fotos auténticas
│   │   ├── Navbar.jsx         # Barra de navegación, búsqueda y carrito
│   │   ├── ProductCard.jsx    # Tarjeta de producto con código y precio
│   │   ├── ProductDetailModal.jsx # Ficha técnica, galería y cotización
│   │   ├── QuoteDrawer.jsx    # Carrito deslizable y generador de WhatsApp
│   │   └── WorldSelector.jsx  # Selector protagonista de los 3 Mundos
│   ├── App.jsx                # Lógica de navegación, filtros y estado global
│   ├── index.css              # Estilos con Tailwind CSS v4 y paleta de marca
│   └── main.jsx               # Punto de entrada de React
├── package.json
└── vite.config.js
```
