# Publicación en Render + Supabase

La aplicación conserva React y Express. El modo local mantiene `server/data/db.json`. Cuando se configura `DATABASE_URL`, usa Postgres; en producción no permite guardar datos en el disco temporal de Render.

## Configuración

1. Crear un proyecto Supabase Free. Mantener desactivada la exposición automática de tablas. El esquema `artisan_private` no se expone por la API pública.
2. Cambiar la contraseña predeterminada desde el administrador local. La importación y el servidor rechazan el valor de demostración.
3. Configurar las variables de `.env.example` en un entorno privado local. Obtener `DATABASE_URL` desde Connect > Session pooler; usar el certificado de CA del proyecto si la conexión lo requiere. No desactivar la verificación TLS.
4. Ejecutar `node scripts/import-cloud.mjs server/data/db.json` localmente. Importa todos los datos una sola vez y se niega a sobrescribir una base que ya tenga contenido. No subir `db.json` al repositorio ni a una carpeta pública.
5. Ejecutar `node scripts/setup-storage.mjs`. El bucket `catalog` contiene solamente imágenes públicas; las escrituras usan la clave del servidor. Los respaldos se conservan en el esquema privado de Postgres.
6. Subir una copia limpia del código y los archivos públicos necesarios a un repositorio privado de GitHub. Excluir `.env`, datos, respaldos, material de trabajo y dependencias.
7. Crear el servicio Render usando `render.yaml`, plan **Free**. Configurar sus variables privadas; `JWT_SECRET` se genera al usar el Blueprint. Para creación manual, generar un secreto aleatorio de al menos 32 caracteres.
8. Comprobar el enlace público: catálogo, paquetes, login, edición, carga de fotos, métricas y respaldos. Reiniciar el servicio y verificar que el cambio y la imagen persisten.

## Funcionamiento y límites

- Los cambios de cada petición se guardan en una transacción antes de responder. Un bloqueo de revisión evita actualizaciones perdidas incluso durante un despliegue superpuesto. Se conserva una caché por revisión para no descargar toda la base en cada visita.
- Las nuevas imágenes se convierten a WebP y se guardan en Supabase Storage. Las imágenes anteriores incluidas en `public/uploads` se sirven con el código y sobreviven a los reinicios.
- Los últimos 20 respaldos manuales se guardan en Postgres. La restauración crea primero un respaldo preventivo. Conviene descargar copias fuera del proveedor; el plan gratuito no sustituye una estrategia de recuperación.
- El esquema conserva el formato existente por colecciones JSON para limitar cambios a las reglas comerciales. Es apropiado para una tienda pequeña; requiere normalización y revisión de capacidad si crecen mucho los datos o la concurrencia. Las operaciones se serializan para mantener integridad.
- Render Free se suspende tras 15 minutos sin tráfico y puede tardar aproximadamente un minuto en despertar. Supabase Free puede pausar proyectos inactivos. Hay cuotas de almacenamiento y transferencia; no se habilitan planes de pago automáticamente mediante este archivo.

## Verificación local

`pnpm test:hosting` ejecuta pruebas con Postgres embebido, sin tocar el catálogo real ni conectarse a cuentas externas. `pnpm build` genera el frontend. Estas pruebas no sustituyen la comprobación del despliegue real, TLS, Storage y cuotas del proveedor.
