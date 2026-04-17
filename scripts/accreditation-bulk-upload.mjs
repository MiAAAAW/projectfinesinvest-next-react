// ═══════════════════════════════════════════════════════════════════════════════
// ACCREDITATION · Bulk upload de PDFs locales → R2 + tabla documents
//
// Uso:   node scripts/accreditation-bulk-upload.mjs E22.1
//        node scripts/accreditation-bulk-upload.mjs all    (todos los mapeados)
//
// Requiere: .env con R2_* + DATABASE_URL
// Lee: researchfinesi/<folder>/*.pdf
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import pg from "pg";

// ── Parse .env manual (evita problemas de hoisting de dotenv) ─────────────────
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

// ── Config ────────────────────────────────────────────────────────────────────
const LOCAL_ROOT = String.raw`C:\Users\USUARIO\Desktop\researchfinesi`;

// Mapa: código de sub-evidencia en BD → ruta relativa en disco
// (las carpetas E22 usan prefijo "Estandar XX.X"; E23/E24 usan "EXX.X")
const FOLDER_MAP = {
  // --- E22 ---
  "E22.1":  "1 Estandar 22/Estandar 22.1 Marco normativo",
  "E22.2":  "1 Estandar 22/Estandar 22.2 Coordinacion investigacion",
  "E22.3":  "1 Estandar 22/Estandar 22.3 Plan trabajo",
  "E22.4":  "1 Estandar 22/Estandar 22.4 Lineas investigacion",
  "E22.5":  "1 Estandar 22/Estandar 22.5 Informe evaluacion",
  "E22.6":  "1 Estandar 22/Estandar 22.6 Informe Seminario",
  "E22.7":  "1 Estandar 22/Estandar 22.7 Informe sub dirección",
  "E22.8":  "1 Estandar 22/Estandar 22.8 RD aprobacion sub lineas",
  "E22.9":  "1 Estandar 22/Estandar 22.9 Catalogo publicaciones",
  "E22.10": "1 Estandar 22/Estandar 22.10 Indicador",
  "E22.11": "1 Estandar 22/Estandar 22.11 Plan mejora",
  // --- E23 ---
  "E23.1": "2 Estandar 23/E23.1 Marco normativo",
  "E23.2": "2 Estandar 23/E23.2 RD coordinacion investigacion",
  "E23.3": "2 Estandar 23/E23.3 Plan trabajo coordinacion",
  "E23.4": "2 Estandar 23/E23.4 Lineas investigacion",
  "E23.5": "2 Estandar 23/E23.5 Informe investigacion",
  "E23.6": "2 Estandar 23/E23.6 Registro sustentaciones",
  "E23.7": "2 Estandar 23/E23.7 Concurso investigacion formativa",
  "E23.8": "2 Estandar 23/E23.8 Indicador",
  "E23.9": "2 Estandar 23/E23.9 Plan mejora",
  // --- E24 ---
  "E24.1":  "3 Estandar 24/E24.1 Marco normativo",
  "E24.2":  "3 Estandar 24/E24.2 RD coordinacion investigacion",
  "E24.3":  "3 Estandar 24/E24.3 Plan trabajo coordinacion",
  "E24.4":  "3 Estandar 24/E24.4 Lineas de investigacion",
  "E24.5":  "3 Estandar 24/E24.5 Informe de investigacion",
  "E24.6":  "3 Estandar 24/E24.6 Registro publicaciones docentes",
  "E24.7":  "3 Estandar 24/E24.7 Catalogo publicaciones",
  "E24.8":  "3 Estandar 24/E24.8 Informe incorporacion Silabos",
  "E24.9":  "3 Estandar 24/E24.9 Indicador",
  "E24.10": "3 Estandar 24/E24.10 Plan de mejora",
};

// ── Clientes ──────────────────────────────────────────────────────────────────
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  // cuid simple (suficiente para esta inserción directa)
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// ── Core: sube una carpeta ────────────────────────────────────────────────────
async function uploadFolder(code) {
  const rel = FOLDER_MAP[code];
  if (!rel) throw new Error(`Código ${code} no está en FOLDER_MAP`);

  // 1) Encontrar la sub-evidencia en BD
  const { rows: seRows } = await pool.query(
    `SELECT id FROM accreditation_sub_evidences
     WHERE code = $1 AND deleted_at IS NULL LIMIT 1`,
    [code]
  );
  if (seRows.length === 0) {
    throw new Error(`Sub-evidencia ${code} no existe en BD`);
  }
  const subEvidenceId = seRows[0].id;

  // 2) Listar PDFs en disco
  const absPath = path.join(LOCAL_ROOT, rel);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Carpeta no encontrada: ${absPath}`);
  }
  const files = fs
    .readdirSync(absPath)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();

  console.log(`\n▸ ${code} — ${files.length} PDFs`);
  console.log(`  ${absPath}`);

  // 3) Saltar los que ya existen (match por título exacto del archivo)
  const { rows: existingRows } = await pool.query(
    `SELECT title FROM documents
     WHERE sub_evidence_id = $1 AND category = 'acreditacion' AND deleted_at IS NULL`,
    [subEvidenceId]
  );
  const existingTitles = new Set(existingRows.map((r) => r.title));

  // 4) Subir cada uno
  let uploaded = 0;
  let skipped = 0;
  for (const fileName of files) {
    const title = fileName.replace(/\.pdf$/i, "");

    if (existingTitles.has(title)) {
      console.log(`  · skip (ya existe): ${title}`);
      skipped++;
      continue;
    }

    const filePath = path.join(absPath, fileName);
    const buffer = fs.readFileSync(filePath);
    const sizeLabel = formatSize(buffer.length);

    const key = `acreditacion/${code}/${Date.now()}-${safeKeyPart(fileName)}.pdf`;

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
        (id, title, file_url, file_type, file_size, category, sub_evidence_id,
         downloads, published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, true, NOW(), NOW())`,
      [cuid(), title, url, "pdf", sizeLabel, "acreditacion", subEvidenceId]
    );

    console.log(`  ✓ ${title} (${sizeLabel})`);
    uploaded++;
  }

  console.log(`  → ${uploaded} subidos · ${skipped} omitidos`);
  return { uploaded, skipped };
}

// ── Entrypoint ────────────────────────────────────────────────────────────────
const arg = process.argv[2];
if (!arg) {
  console.error("Uso: node scripts/accreditation-bulk-upload.mjs <E22.1 | all>");
  process.exit(1);
}

const targets = arg === "all" ? Object.keys(FOLDER_MAP) : [arg];

try {
  let totalUp = 0, totalSk = 0;
  for (const code of targets) {
    const { uploaded, skipped } = await uploadFolder(code);
    totalUp += uploaded;
    totalSk += skipped;
  }
  console.log(`\n━━━ Total: ${totalUp} subidos · ${totalSk} omitidos ━━━`);
} catch (err) {
  console.error(`\n✗ Error: ${err.message}`);
  process.exit(1);
} finally {
  await pool.end();
}
