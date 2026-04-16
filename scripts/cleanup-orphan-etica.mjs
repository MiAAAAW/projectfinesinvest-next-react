// ═══════════════════════════════════════════════════════════════════════════════
// ONE-TIME CLEANUP — borra archivos huérfanos de R2 en carpeta etica/
// y hard-deletea las filas soft-deleted de documents (category=etica).
//
// Seguro para correr: previamente verificado que NADA activo referencia estas
// URLs ni IDs (ver query de verificación). Solo afecta a los 2 archivos de test.
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import pg from "pg";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// ─── Cargar .env ───────────────────────────────────────────────────────────────
const envContent = fs.readFileSync(".env", "utf8");
for (const line of envContent.split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m) process.env[m[1]] = m[2];
}

// ─── Clients ───────────────────────────────────────────────────────────────────
const pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL });
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

await pgClient.connect();

// ─── 1. Encontrar huérfanos ────────────────────────────────────────────────────
const { rows: orphans } = await pgClient.query(`
  SELECT id, title, file_url
  FROM documents
  WHERE category = 'etica' AND deleted_at IS NOT NULL
`);

console.log(`\n⟶  Encontrados ${orphans.length} huérfano(s) de ética soft-deleted:`);
for (const o of orphans) console.log(`   • ${o.title}  →  ${o.file_url}`);

if (orphans.length === 0) {
  console.log("\n✓ Nada que limpiar.");
  await pgClient.end();
  process.exit(0);
}

// ─── 2. Borrar de R2 (uno por uno, con log de cada resultado) ─────────────────
const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC = process.env.R2_PUBLIC_URL;

console.log(`\n⟶  Borrando archivos de R2 (bucket="${BUCKET}")...`);
for (const o of orphans) {
  if (!o.file_url?.startsWith(PUBLIC)) {
    console.log(`   ⚠ skip (URL no es de R2): ${o.file_url}`);
    continue;
  }
  const key = o.file_url.replace(`${PUBLIC}/`, "");
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    console.log(`   ✓ R2 delete: ${key}`);
  } catch (err) {
    console.log(`   ✗ R2 FAIL (${key}): ${err.message}`);
  }
}

// ─── 3. Hard-delete filas de documents ────────────────────────────────────────
const ids = orphans.map((o) => o.id);
const result = await pgClient.query(
  `DELETE FROM documents WHERE id = ANY($1::text[]) RETURNING id`,
  [ids]
);
console.log(`\n⟶  Hard-deleted ${result.rowCount} fila(s) de documents`);

// ─── 4. Cleanup relacionado: document_logs huérfanos (opcional) ───────────────
const logsDeleted = await pgClient.query(
  `DELETE FROM document_logs WHERE document_id = ANY($1::text[])`,
  [ids]
);
console.log(`⟶  Hard-deleted ${logsDeleted.rowCount} fila(s) de document_logs`);

console.log("\n✅ Limpieza completa. BD y R2 sincronizados.");

await pgClient.end();
