# Despliegue en vuestro dominio

La web pública y el CRM son **una sola aplicación Node**: el mismo servidor sirve `/` (formulario),
`/api/*` (recepción cifrada) y `/admin` (CRM). No se despliegan por separado; un único contenedor
atiende las dos cosas.

## 1. Requisitos

| Pieza | Mínimo |
| --- | --- |
| Node.js | 22 |
| pnpm | 10.18 |
| MySQL | 8.0 |
| Object storage | S3-compatible (o el storage de Manus) |
| Dominio | HTTPS obligatorio: el cifrado del navegador necesita contexto seguro |

## 2. Variables de entorno

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `PORT` | no (3000) | Puerto de escucha. |
| `NODE_ENV` | sí (`production`) | Sirve el build estático en lugar de Vite. |
| `DATABASE_URL` | sí | `mysql://usuario:clave@host:3306/base`. |
| `MANUS_JWT_SECRET` | sí | Firma la cookie de sesión y deriva la clave de las notas internas. Cadena larga y aleatoria; si cambia, las notas antiguas dejan de leerse. |
| `MANUS_PROJECT_ID` | para el CRM | Identificador de la app OAuth. |
| `MANUS_OAUTH_PORTAL_URL` | para el CRM | Portal de login (`https://manus.ai` o el que corresponda). |
| `MANUS_OAUTH_API_URL` | para el CRM | API de intercambio de token. |
| `MANUS_API_URL`, `MANUS_API_KEY` | para el storage | Endpoint y credencial de object storage. |
| `OWNER_OPEN_ID` | no | Fuerza el `openId` del propietario; el CRM usa la columna `role`. |

Copia `.env.example` y rellénalo. Nunca subas `.env` al repositorio.

## 3. Base de datos

```bash
pnpm db:migrate          # migraciones Drizzle (requiere dependencias de desarrollo)
# o, en una base vacía, sin instalar nada:
mysql -h HOST -u USER -p BASE < schema.sql
```

Después del primer login en `/admin`, ese usuario se convierte en administrador automáticamente.

## 4. Build y arranque

```bash
pnpm install --frozen-lockfile
pnpm build               # cliente en dist/public + servidor en dist/index.js
NODE_ENV=production PORT=3000 node dist/index.js
```

Healthcheck: `GET /api/health` → `200 {"status":"ok"}`.

## 5. Docker

```bash
docker build -t drivepayments .
docker run -d --name drivepayments -p 3000:3000 --env-file .env drivepayments
```

El `Dockerfile` instala dependencias, compila y arranca `node dist/index.js`. El healthcheck del
contenedor debe apuntar a `/api/health`.

## 6. Nginx + HTTPS

```nginx
server {
  listen 443 ssl http2;
  server_name alta.vuestrodominio.com;
  client_max_body_size 80m;          # los sobres pueden llegar a 70 MB

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Certificado con `certbot --nginx -d alta.vuestrodominio.com`.

## 7. Dependencias de la plataforma Manus

Tres piezas del código están escritas contra servicios de Manus. En vuestro dominio hay que decidir
qué hacer con ellas:

1. **Login del CRM** (`/admin`): usa Manus OAuth con `redirectUri = https://vuestro-dominio/api/oauth/callback`.
   Funciona si la app OAuth acepta ese dominio; si no, hay que sustituirlo por vuestro proveedor
   (Google Workspace, email+contraseña, etc.). La web pública no necesita login.
2. **Object storage** (`server/storage.ts`): usa el endpoint de Forge con `MANUS_API_KEY`. Para
   vuestro dominio lo natural es sustituirlo por S3 (AWS, Cloudflare R2, Backblaze) cambiando solo
   ese módulo.
3. **MySQL**: cualquiera vale; solo hay que apuntar `DATABASE_URL`.

Si quieres, preparo la variante con login propio (Google o email+contraseña) y storage S3 para que el
CRM funcione sin depender de Manus.

## 8. Checklist antes de abrir al público

- [ ] HTTPS activo y `client_max_body_size` ≥ 80 MB en el proxy.
- [ ] `MANUS_JWT_SECRET` único y guardado en el gestor de secretos.
- [ ] Clave privada JWK fuera del servidor (la usa el navegador del operador, no el backend).
- [ ] Copias de seguridad de MySQL y del bucket de storage.
- [ ] Política de retención aplicada (12 meses para solicitudes no tramitadas).
- [ ] Un solo administrador de confianza; el resto de cuentas, sin rol.
