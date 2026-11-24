#!/usr/bin/env node
/**
 * Genera el par de claves que cifra las solicitudes de alta.
 *
 * Uso:
 *   node scripts/generate-keys.mjs
 *
 * Escribe:
 *   keys/public-key.jwk.json   → se pega en client/src/config/site.ts (publicKeyJwk)
 *   keys/private-key.jwk.json  → NUNCA se publica ni se sube al repositorio
 *
 * Guarda la clave privada offline (USB, gestor de secretos) y bórrala del equipo
 * de trabajo cuando termines de configurar el descifrado.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";
import path from "node:path";

const keysDir = path.resolve(process.cwd(), "keys");
const publicPath = path.join(keysDir, "public-key.jwk.json");
const privatePath = path.join(keysDir, "private-key.jwk.json");

if (existsSync(privatePath)) {
  console.error(
    `\nYa existe una clave privada en ${privatePath}.\n` +
      "Si la sobrescribes, todas las solicitudes cifradas con la clave anterior quedarán ilegibles.\n" +
      "Mueve o renombra ese archivo antes de volver a ejecutar este script.\n",
  );
  process.exit(1);
}

const { publicKey, privateKey } = await crypto.subtle.generateKey(
  {
    name: "RSA-OAEP",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  },
  true,
  ["encrypt", "decrypt"],
);

const publicJwk = await crypto.subtle.exportKey("jwk", publicKey);
const privateJwk = await crypto.subtle.exportKey("jwk", privateKey);

const publicOnly = {
  kty: publicJwk.kty,
  n: publicJwk.n,
  e: publicJwk.e,
  alg: "RSA-OAEP-256",
  ext: true,
  key_ops: ["encrypt"],
};

mkdirSync(keysDir, { recursive: true });
writeFileSync(publicPath, JSON.stringify(publicOnly, null, 2));
writeFileSync(privatePath, JSON.stringify(privateJwk, null, 2));

console.log("\nPar de claves generado (RSA-OAEP 4096 bits, SHA-256).\n");
console.log(`Clave pública:  ${publicPath}`);
console.log(`Clave privada:  ${privatePath}\n`);
console.log("1. Pega el contenido de public-key.jwk.json en client/src/config/site.ts → submission.publicKeyJwk");
console.log("2. Guarda private-key.jwk.json fuera del repositorio (nunca en git).");
console.log("3. Descifra cada expediente con: node scripts/decrypt-submission.mjs <sobre.json> keys/private-key.jwk.json\n");
