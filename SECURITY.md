# Seguridad y puesta en marcha

Esta web recoge datos de identificación, SSN, cuentas bancarias y documentos de identidad. El diseño
garantiza que el texto plano **nunca** salga del navegador del solicitante ni se almacene en el
servidor. Este documento describe el circuito completo, el acceso al CRM y las obligaciones
operativas.

## 1. Cómo viaja un expediente

1. El solicitante rellena los cuatro pasos y adjunta los documentos.
2. Al pulsar «Enviar solicitud», el navegador genera una clave **AES-256-GCM** efímera para esa
   solicitud.
3. El JSON completo (datos + documentos en base64) se cifra con esa clave. Un resumen reducido
   (negocio, titular, email, volumen y número de documentos) se cifra por separado con la misma clave
   y un IV propio.
4. La clave AES se envuelve con la clave pública **RSA-OAEP-256 de 4096 bits** publicada en
   `client/src/config/site.ts`.
5. Solo sale del dispositivo el sobre cifrado:
   `{ version, alg, reference, createdAt, wrappedKey, iv, ciphertext, meta, summary }`.
6. `POST /api/submissions` valida el sobre, lo guarda en object storage y registra el índice.

La clave privada no existe en el servidor ni en el repositorio. Sin ella, el sobre es opaco incluso si
alguien accede al storage o a la base de datos.

## 2. Qué se guarda en el servidor

| Dónde | Contenido |
| --- | --- |
| Object storage (`leads/DP-….json`) | Sobre cifrado completo: datos y documentos. Es el único lugar donde viven los documentos originales. |
| Tabla `leads` | Referencia, estado, clave de storage, tamaño, número de documentos, IV y ciphertext del resumen, notas cifradas y fechas. Nunca datos en claro. |
| Tabla `leadEvents` | Historial de acciones (recibido, cambio de estado, nota, archivado) con email del operador. |
| Tabla `users` | Usuarios del CRM con su rol. |

El resumen cifrado permite pintar la bandeja sin descargar cada sobre; se descifra en el navegador del
operador con la misma clave privada.

## 3. Acceso al CRM

- **Autenticación**: sesión de Manus (cookie `webdev_app_session`, `HttpOnly`, `SameSite=None`,
  `Secure`). El servidor valida la firma y carga el usuario.
- **Autorización**: solo el rol `admin`. El **primer usuario que inicia sesión se convierte en
  administrador** (bootstrap); después, un usuario sin rol admin recibe 403 y no ve expedientes.
- **CSRF**: todas las escrituras exigen la cabecera `x-crm-request`; el cliente la envía siempre. Las
  respuestas del CRM van con `Cache-Control: no-store`.
- **Rate limit**: 12 envíos por hora e IP en el endpoint público; límite de cuerpo de 70 MB.
- **Clave privada**: se carga en `/admin`, se guarda en `sessionStorage` y se valida contra la clave
  pública configurada (huella SHA-256 del módulo). Nunca se envía al servidor ni se escribe en disco.
- **Notas internas**: se cifran en el servidor con AES-256-GCM usando una clave derivada por HKDF del
  secreto de sesión del proyecto. Si se rota ese secreto, las notas antiguas dejan de poder leerse;
  conviene exportarlas antes de rotarlo.

## 4. Claves

### Generar tu propio par

```bash
node scripts/generate-keys.mjs
```

Crea `keys/public-key.jwk.json` (se pega en `site.ts`) y `keys/private-key.jwk.json` (se guarda
offline; la carpeta `keys/` está en `.gitignore`). Si cambias de clave, los sobres anteriores dejan de
poder descifrarse: conserva la privada antigua mientras queden expedientes pendientes.

### Descifrar un expediente fuera del CRM

```bash
node scripts/decrypt-submission.mjs expediente.enc.json keys/private-key.jwk.json
```

Genera `decrypted/<referencia>/expediente.json` y `decrypted/<referencia>/documentos/` con los
archivos originales.

## 5. Retención y archivado

- El botón **Archivar** del CRM aplica un borrado lógico: el expediente sale de la bandeja y pasa al
  filtro «Archivadas». El sobre cifrado se conserva porque el runtime de la plataforma no permite
  borrar objetos físicamente; la purga definitiva se hace desde el panel de operador del proyecto.
- La política publicada propone **12 meses** para solicitudes no tramitadas. Define el plazo, anótalo
  y purga los sobres y las filas correspondientes al cumplirlo.
- La base de datos es compartida entre desarrollo y producción: cualquier prueba con datos reales
  afecta a producción.

## 6. Buenas prácticas operativas

- Sirve la web siempre por **HTTPS**; el cifrado en el navegador necesita un contexto seguro
  (`crypto.subtle` no existe en `http://` salvo en `localhost`).
- Guarda la clave privada en un gestor de secretos o en un dispositivo offline, con copia de
  respaldo. Si se pierde, los expedientes son irrecuperables.
- Limita quién tiene rol admin y revisa el historial de accesos.
- No reenvíes sobres cifrados por canales abiertos ni pidas a un cliente SSN o documentos por email
  sin cifrar.
- Borra los archivos descifrados y los ZIP exportados cuando el expediente esté cerrado.

## 7. Límites que conviene tener presentes

El cifrado protege el tránsito y el almacenamiento, pero **no sustituye** las obligaciones de
cumplimiento de quien recoge SSN, cuentas bancarias y documentos de identidad: base jurídica, registro
de actividades de tratamiento, contrato con el procesador, evaluación de impacto y procedimiento de
brechas. Si en algún momento quieres reducir esa exposición, la alternativa habitual es que esta web
recoja solo los pasos 1 y 4 y derive el KYC y los datos bancarios al formulario alojado del procesador;
el diseño de los pasos 2 y 3 permite desactivarlos sin rehacer la página.
