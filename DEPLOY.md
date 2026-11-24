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
| Object storage | S3-compatible (Railway Bucket, AWS S3, Cloudflare R2…) |
| Dominio | HTTPS obligatorio: el cifrado del navegador necesita contexto seguro |

## 2. Variables de entorno

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `PORT` | no (3000) | Puerto de escucha. |
| `NODE_ENV` | sí (`production`) | Sirve el build estático en lugar de Vite. |
| `DATABASE_URL` | sí | `mysql://usuario:clave@host:3306/base`. |
| `SESSION_SECRET` | sí | Firma la cookie de sesión del CRM y deriva la clave de las notas internas. Cadena aleatoria de 32+ caracteres; si cambia, las notas antiguas dejan de leerse. (Se acepta `MANUS_JWT_SECRET` como nombre antiguo.) |
| `CRM_SETUP_TOKEN` | para el primer acceso | Código para crear el primer administrador en `/admin`. Deja de usarse en cuanto existe uno. |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | sí | Bucket S3-compatible. En Railway, referencias a las variables del bucket. |

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

## 7. Acceso al CRM

El CRM no depende de ningún servicio externo: las cuentas viven en la tabla `users` de MySQL.

1. Define `CRM_SETUP_TOKEN` (cadena aleatoria) en el servicio.
2. Abre `https://vuestro-dominio/admin`: mientras no haya administrador aparece el formulario
   «Crea el primer administrador». Introduce el código, tu email y una contraseña (12+ caracteres).
3. Desde el panel **Equipo** del CRM puedes dar o quitar acceso a otras personas y cambiar tu
   contraseña. Recuerda que para leer los expedientes cada persona necesita además la clave privada.

Si se pierde el acceso de todos los administradores, borra sus filas de `users` en MySQL y repite el
paso 2 con un `CRM_SETUP_TOKEN` nuevo.

## 8. Checklist antes de abrir al público

- [ ] HTTPS activo y `client_max_body_size` ≥ 50 MB en el proxy (si usas uno propio).
- [ ] `SESSION_SECRET` único y guardado en el gestor de secretos.
- [ ] Primer administrador creado; después puedes borrar `CRM_SETUP_TOKEN`.
- [ ] Clave privada JWK fuera del servidor (la usa el navegador del operador, no el backend).
- [ ] Copias de seguridad de MySQL y del bucket de storage.
- [ ] Política de retención aplicada (12 meses para solicitudes no tramitadas).
