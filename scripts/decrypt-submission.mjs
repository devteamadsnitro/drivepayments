#!/usr/bin/env node
/**
 * Descifra un expediente recibido desde la web de alta.
 *
 * Uso:
 *   node scripts/decrypt-submission.mjs <sobre.enc.json> <private-key.jwk.json> [carpeta-salida]
 *
 * El sobre contiene la clave AES envuelta con RSA-OAEP y el payload cifrado con
 * AES-256-GCM. Este script la desenvuelve, descifra el JSON y vuelca los documentos
 * adjuntos como archivos individuales.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";
import path from "node:path";

const [envelopePath, privateKeyPath, outDirArg] = process.argv.slice(2);

if (!envelopePath || !privateKeyPath) {
  console.error(
    "Uso: node scripts/decrypt-submission.mjs <sobre.enc.json> <private-key.jwk.json> [carpeta-salida]",
  );
  process.exit(1);
}

const envelope = JSON.parse(readFileSync(envelopePath, "utf8"));
const privateJwk = JSON.parse(readFileSync(privateKeyPath, "utf8"));

if (envelope.version !== 1 || envelope.alg !== "RSA-OAEP-256+A256GCM") {
  console.error(`Sobre no soportado: version=${envelope.version} alg=${envelope.alg}`);
  process.exit(1);
}

const fromBase64 = (value) => new Uint8Array(Buffer.from(value, "base64"));

const privateKey = await crypto.subtle.importKey(
  "jwk",
  privateJwk,
  { name: "RSA-OAEP", hash: "SHA-256" },
  false,
  ["decrypt"],
);

const rawAesKey = await crypto.subtle.decrypt(
  { name: "RSA-OAEP" },
  privateKey,
  fromBase64(envelope.wrappedKey),
);

const aesKey = await crypto.subtle.importKey("raw", rawAesKey, { name: "AES-GCM" }, false, [
  "decrypt",
]);

let plaintext;
try {
  plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(envelope.iv) },
    aesKey,
    fromBase64(envelope.ciphertext),
  );
} catch {
  console.error(
    "No se pudo descifrar. La clave privada no corresponde a este sobre o los datos están corruptos.",
  );
  process.exit(1);
}

const payload = JSON.parse(new TextDecoder().decode(plaintext));
const reference = payload.reference ?? envelope.reference ?? "expediente";
const outDir = path.resolve(outDirArg ?? `decrypted/${reference}`);
const docsDir = path.join(outDir, "documentos");

mkdirSync(docsDir, { recursive: true });

const documents = payload.documents ?? [];
payload.documents = documents.map((doc) => {
  const safeName = `${doc.slot}-${doc.name}`.replace(/[^\w.\-]+/g, "_");
  const target = path.join(docsDir, safeName);
  writeFileSync(target, Buffer.from(doc.dataBase64, "base64"));
  const { dataBase64, ...meta } = doc;
  return { ...meta, file: path.relative(outDir, target) };
});

const jsonPath = path.join(outDir, "expediente.json");
writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

console.log(`\nExpediente ${reference} descifrado.`);
console.log(`Datos:     ${jsonPath}`);
console.log(`Documentos: ${docsDir} (${documents.length})`);
console.log(
  `Titulares: ${payload.owners?.length ?? 0} · Volumen mensual: ${payload.processing?.monthlyVolumeUsd ?? "—"} USD\n`,
);
