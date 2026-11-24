/**
 * Comprobación del cifrado de extremo a extremo.
 *
 * Uso:
 *   npx tsx scripts/verify-crypto.ts /tmp/sobre.json
 *   node scripts/decrypt-submission.mjs /tmp/sobre.json keys/private-key.jwk.json /tmp/descifrado
 *
 * Genera un sobre cifrado real con la clave pública publicada en la web y lo deja
 * listo para descifrarlo con la clave privada correspondiente.
 */
import { writeFileSync } from "node:fs";
import { encryptApplication } from "../client/src/lib/crypto";

const target = process.argv[2] ?? "/tmp/sobre.json";

const payload = {
  reference: "AN-2611-TEST",
  submittedAt: new Date().toISOString(),
  business: {
    legalName: "Northwind Digital LLC",
    dbaName: "Northwind Store",
    taxId: "12-3456789",
    businessEmail: "ops@northwind.test",
  },
  owners: [
    {
      firstName: "Daniel",
      lastName: "Prueba",
      ssn: "000-00-0000",
      ownershipPct: "100",
    },
  ],
  bank: { routingNumber: "121000248", bankName: "First National Bank", accountNumber: "000123456789" },
  documents: [
    {
      slot: "voided_check",
      name: "cheque.pdf",
      type: "application/pdf",
      size: 12,
      lastModified: Date.now(),
      dataBase64: Buffer.from("PDF de prueba").toString("base64"),
    },
  ],
};

const envelope = await encryptApplication(payload, {
  reference: "AN-2611-TEST",
  documents: 1,
  totalBytes: 12,
});

writeFileSync(target, JSON.stringify(envelope, null, 2));

console.log(`Sobre cifrado escrito en ${target}`);
console.log(`Algoritmo: ${envelope.alg}`);
console.log(`Longitud del ciphertext (base64): ${envelope.ciphertext.length} caracteres`);
console.log(`Clave envuelta (base64): ${envelope.wrappedKey.length} caracteres`);
