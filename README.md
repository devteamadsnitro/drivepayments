# DrivePayments · Alta de comercios y CRM

Formulario público de alta de comercios en cuatro pasos, con panel de documentos, validaciones con
máscaras y cifrado en el navegador, más un CRM interno para consultar los expedientes recibidos.

- **Web pública** (`/`): React 19, Vite 7, Tailwind CSS v4 y wouter. El solicitante rellena sus datos
  y adjunta documentos; nada sale del navegador en texto plano.
- **API** (`/api`): Express. Recibe el sobre cifrado, lo guarda en object storage y mantiene un índice
  en MySQL con la referencia, el estado, el tamaño, el número de documentos y un resumen cifrado.
- **CRM** (`/admin`): listado y detalle de expedientes. El operador desbloquea su clave privada JWK en
  el navegador para descifrar datos, documentos y resumen; el servidor nunca la recibe.

## Puesta en marcha

```bash
pnpm install
pnpm dev            # Express + Vite middleware en http://localhost:3000
pnpm check          # comprobación de tipos
pnpm build          # cliente en dist/public + servidor en dist/index.js
pnpm start          # servidor de producción (NODE_ENV=production)
```

`pnpm dev` y `pnpm start` necesitan `DATABASE_URL` (MySQL gestionada del proyecto). El resto de
variables las inyecta la plataforma: `MANUS_API_URL`/`MANUS_API_KEY` para storage, el secreto de
sesión para firmar cookies y las credenciales OAuth para el login Manus.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `client/src/pages/Apply.tsx` | Orquestador del formulario: estado, validación por paso, envío y layout. |
| `client/src/components/form/` | Stepper, los cuatro pasos, panel de documentos, cheque de ejemplo y pantalla de éxito. |
| `client/src/pages/Admin.tsx` | CRM: login, desbloqueo con la clave privada, bandeja, filtros y detalle. |
| `client/src/components/crm/` | Panel de expediente (pestañas, documentos, notas, actividad) y componentes de UI. |
| `client/src/lib/crm/crypto.ts` | Desbloqueo con JWK y descifrado de sobre y resumen en el navegador. |
| `client/src/lib/crm/export.ts` | Exportación ZIP del expediente descifrado. |
| `client/src/lib/validation.ts` | Validaciones por paso, máscaras de SSN, Tax ID y routing (checksum ABA). |
| `client/src/lib/crypto.ts` | Cifrado híbrido AES-256-GCM + RSA-OAEP-256. |
| `client/src/lib/submission.ts` | Payload, referencia `DP-…`, resumen cifrado y POST a `/api/submissions`. |
| `client/src/config/site.ts` | **Único archivo a personalizar en la web**: marca, contacto, endpoint, clave pública y límites. |
| `server/crm/routes.ts` | API pública de envío y endpoints internos del CRM. |
| `server/crm/store.ts` | Consultas Drizzle de expedientes, eventos y contadores. |
| `server/crm/security.ts` | Cifrado de notas, IP del cliente y rate limit. |
| `server/storage.ts` | Subida a object storage y URLs firmadas de descarga. |
| `drizzle/schema.ts` | Tablas `leads` y `leadEvents`. |
| `scripts/` | Generación de claves, descifrado de sobres y verificación criptográfica. |

## Flujo de un expediente

1. El navegador cifra datos y documentos con AES-256-GCM y envuelve la clave con la pública RSA de
   4096 bits. El sobre incluye un `summary` cifrado (negocio, titular, email, volumen y número de
   documentos) para poder listar sin descargar el archivo.
2. `POST /api/submissions` valida el sobre, aplica un límite de 70 MB y un rate limit de 12 envíos por
   hora e IP, guarda el JSON en object storage (`leads/DP-…json`) e inserta la fila en `leads`.
3. La respuesta devuelve la referencia (`DP-2611-XXXX`) que ve el solicitante.
4. El CRM lee el índice, descarga el sobre con una URL firmada y lo descifra en el navegador del
   operador.

## Acceso al CRM

`/admin` exige sesión de Manus. El **primer usuario autenticado se convierte en administrador**; a
partir de ahí solo los usuarios con rol `admin` entran. El administrador debe cargar su clave privada
(`private-key.jwk.json`) en la pantalla de desbloqueo: se guarda en `sessionStorage`, se valida contra
la clave pública publicada y nunca se envía al servidor. Desde el panel se puede buscar y filtrar,
cambiar el estado, escribir notas internas cifradas, previsualizar o descargar documentos, exportar el
expediente en ZIP y archivar solicitudes.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Conexión MySQL (la proporciona la plataforma). |
| `MANUS_API_URL`, `MANUS_API_KEY` | Object storage y servicios de la plataforma. |
| `MANUS_JWT_SECRET` / secreto de sesión | Firma de la cookie `webdev_app_session` y clave de las notas internas. |
| `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID` | Login Manus del CRM. |

## Rutas

`/` formulario · `/privacidad` política de privacidad · `/admin` CRM · `/404` página no encontrada ·
`/api/health` healthcheck del contenedor.

## Despliegue

El proyecto se publica como contenedor: `Dockerfile` instala dependencias, ejecuta `pnpm build` y
arranca `node dist/index.js` escuchando en `PORT` (3000 por defecto). El healthcheck es
`/api/health`. La base de datos es compartida entre desarrollo y producción: los datos de prueba deben
eliminarse.

## Cumplimiento

Los pasos 2 y 3 recogen SSN, documento de identidad y cuenta bancaria. Si no se quiere asumir ese
tratamiento, la alternativa es limitar la captación a los pasos 1 y 4 y derivar titulares y banco al
formulario seguro del procesador. El detalle del modelo de seguridad está en `SECURITY.md`.
