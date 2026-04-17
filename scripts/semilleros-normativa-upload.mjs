// ═══════════════════════════════════════════════════════════════════════════════
// SEMILLEROS · NORMATIVA — upload local → R2 + tabla documents
// category="semilleros-normativa"
// Folder R2: semilleros-normativa/
//
// Uso: node scripts/semilleros-normativa-upload.mjs
// Lee: researchfinesi/Semilleros FINESI/*.pdf
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import pg from "pg";

const env = {};
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  let v = t.slice(eq + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  env[k] = v;
}

const LOCAL_FOLDER = String.raw`C:\Users\USUARIO\Desktop\researchfinesi\Semilleros FINESI`;
const CATEGORY = "semilleros-normativa";
const R2_FOLDER = "semilleros-normativa";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function safeKeyPart(s) {
  return s
    .replace(/\.[^/.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 120);
}

function cuid() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 14);
}

// "1 RR 1843-2024-R-UNA semilleros" → "RR 1843-2024-R-UNA semilleros"
function parseTitle(fileName) {
  return fileName.replace(/\.pdf$/i, "").replace(/^\d+\s+/, "").trim();
}

async function main() {
  if (!fs.existsSync(LOCAL_FOLDER)) {
    throw new Error(`Carpeta no encontrada: ${LOCAL_FOLDER}`);
  }

  const files = fs
    .readdirSync(LOCAL_FOLDER)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();

  console.log(`\n▸ Semilleros · Normativa — ${files.length} PDFs`);
  console.log(`  ${LOCAL_FOLDER}`);

  const { rows: existingRows } = await pool.query(
    `SELECT title FROM documents WHERE category = $1 AND deleted_at IS NULL`,
    [CATEGORY]
  );
  const existingTitles = new Set(existingRows.map((r) => r.title));

  let uploaded = 0;
  let skipped = 0;
  for (const fileName of files) {
    const title = parseTitle(fileName);

    if (existingTitles.has(title)) {
      console.log(`  · skip (ya existe): ${title}`);
      skipped++;
      continue;
    }

    const filePath = path.join(LOCAL_FOLDER, fileName);
    const buffer = fs.readFileSync(filePath);
    const sizeLabel = formatSize(buffer.length);

    const key = `${R2_FOLDER}/${Date.now()}-${safeKeyPart(fileName)}.pdf`;

    await s3.send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: "application/pdf",
      })
    );
    const url = `${env.R2_PUBLIC_URL}/${key}`;

    await pool.query(
      `INSERT INTO documents
        (id, title, file_url, file_type, file_size, category,
         downloads, published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 0, true, NOW(), NOW())`,
      [cuid(), title, url, "pdf", sizeLabel, CATEGORY]
    );

    console.log(`  ✓ ${title} (${sizeLabel})`);
    uploaded++;
  }

  console.log(`\n━━━ ${uploaded} subidos · ${skipped} omitidos ━━━`);
}

try {
  await main();
} catch (err) {
  console.error(`\n✗ Error: ${err.message}`);
  process.exit(1);
} finally {
  await pool.end();
}
