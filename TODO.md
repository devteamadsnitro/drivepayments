# TODO — Alta de comercios DrivePayments

## 1. Cabecera de marca y entrada al formulario
- [x] Logotipo DrivePayments a la izquierda y datos de contacto (email, teléfono/Telegram, horario) a la derecha.
- [x] Entradilla breve que explica el proceso de alta, el tiempo estimado y la revisión posterior.
- [x] Ninguna marca de terceros en la página; la web es de DrivePayments.

## 2. Formulario multipaso con barra de progreso
- [x] Barra de progreso superior con los 4 pasos, estado actual, completados y porcentaje.
- [x] Navegación Atrás / Continuar, transiciones entre pasos y conservación de lo introducido al retroceder.
- [x] Bloqueo del avance mientras el paso tenga errores, con foco en el primer campo inválido.

## 3. Paso 1 — Información del negocio
- [x] Tipo de titularidad (desplegable), razón social, nombre comercial (DBA), teléfono con prefijo de país, email del negocio, método de contacto preferido (Phone/Telegram/WhatsApp), Tax ID/EIN.
- [x] Tipo de local (Office/Retail/Online…), años y meses de antigüedad, web (permitir añadir varias), descripción del negocio, tipo de negocio (buscador).
- [x] País, dirección legal, ciudad, estado, Zip; ¿dirección DBA igual que la legal? (Sí/No) con campos DBA condicionales; años y meses en la ubicación actual.

## 4. Paso 2 — Información personal de los titulares
- [x] Nombre, apellidos, ¿dirección personal igual que negocio/DBA? (No/Igual legal/Igual DBA), país, dirección, ciudad, estado, Zip, años y meses en residencia actual.
- [x] Tipo de documento, número de documento, SSN, fecha de nacimiento, teléfono personal, email personal, % de propiedad.
- [x] Botón «+ Añadir titular» que replica el bloque completo, con eliminación y control del total de propiedad.

## 5. Paso 3 — Datos bancarios del negocio
- [x] Routing Number de 9 dígitos, nombre del banco y número de cuenta.
- [x] Imagen de cheque de ejemplo que señala dónde está cada número.

## 6. Paso 4 — Información de procesamiento
- [x] Método(s) solicitados (Tarjetas/ACH/Ambos), ¿aceptas tarjeta ya? (Sí/No) y con qué procesador.
- [x] Volumen mensual USD obligatorio, transacción media y transacción más alta.
- [x] Cómo procesar (Online/Presencial/Teléfono, casillas múltiples), interés en protección de fraude/chargebacks, necesidad de eChecks/ACH, alta en RDR u otro programa de chargebacks.

## 7. Panel lateral de documentos
- [x] Zona de arrastrar y soltar disponible en los cuatro pasos, junto con la lista de documentos requeridos: carné de conducir, cheque anulado o carta del banco, escritura de constitución, extracto bancario, extracto de procesamiento (solo si hay historial), acuerdo de fulfillment y extractos adicionales de procesamiento y banco.
- [x] Estados de carga, validación de tipo y tamaño, recuento de documentos y eliminación de archivos.

## 8. Validaciones
- [x] Campos obligatorios marcados y validados; email con formato válido.
- [x] Máscaras de teléfono, Tax ID, SSN y routing; mensajes de error claros bajo cada campo.

## 9. Envío seguro
- [x] Consentimiento obligatorio con enlace a la política de privacidad antes de enviar.
- [x] Cifrado en el navegador (AES-256-GCM con clave envuelta por RSA-OAEP) de datos y documentos antes de salir del dispositivo.
- [x] Envío HTTPS a un endpoint configurable y alternativa de descarga cifrada cuando no hay endpoint.
- [x] Pantalla de confirmación con referencia de expediente y siguiente paso.

## 10. Calidad de entrega
- [x] Diseño responsive de móvil a escritorio y navegación por teclado con foco visible.
- [x] Avisos visibles de seguridad y tratamiento de datos sensibles.
- [x] Política de privacidad publicada en su propia ruta y enlazada desde el formulario y el pie.
- [x] `manus-routes.json`, metadatos, favicon y logotipo del proyecto configurados.
- [x] Sin errores de tipos (`pnpm check`) y build de producción correcto.

## 11. CRM interno de expedientes
- [x] Cada solicitud se guarda como sobre cifrado en object storage y fila índice en MySQL (referencia, estado, tamaño, documentos, resumen y notas cifradas); nunca hay datos en texto plano en el servidor.
- [x] `POST /api/submissions` valida el sobre, limita el cuerpo a 70 MB y aplica un rate limit de 12 envíos por hora e IP.
- [x] Acceso a `/admin` con sesión de Manus y rol `admin`; el primer usuario autenticado se convierte en administrador y el resto recibe 403.
- [x] Bandeja con búsqueda, filtros por estado y contadores; el resumen se descifra en el navegador del operador.
- [x] Detalle por pestañas (negocio, titulares, banco, procesamiento, documentos, actividad) con máscaras de SSN y número de cuenta.
- [x] Previsualización y descarga de documentos y exportación ZIP del expediente completo.
- [x] Notas internas cifradas, cambio de estado e historial de acciones con autor y fecha.
- [x] Archivado lógico que oculta el expediente de la bandeja y conserva el sobre cifrado según la política de retención.
- [x] Desbloqueo con la clave privada JWK en el navegador (sessionStorage, validada contra la clave pública; nunca se envía al servidor).
- [x] Despliegue como contenedor con `Dockerfile`, healthcheck `/api/health` y build de producción verificado.
