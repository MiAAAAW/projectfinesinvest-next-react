// ═══════════════════════════════════════════════════════════════════════════════
// TEACHERS AVATARS · Bulk upload de fotos locales → R2 + UPDATE teachers.avatar_url
//
// Uso:   node scripts/teachers-avatars-bulk-upload.mjs --dry   (preview sin subir)
//        node scripts/teachers-avatars-bulk-upload.mjs         (sube y actualiza BD)
//
// Requiere: .env con R2_* + DATABASE_URL
// Lee: C:\Users\USUARIO\Desktop\researchfinesi\fotos_docentes_FINESI\*.{jpeg,jpg,png}
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import pg from "pg";

// ── Parse .env manual ─────────────────────────────────────────────────────────
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
const LOCAL_DIR = String.raw`C:\Users\USUARIO\Desktop\researchfinesi\fotos_docentes_FINESI`;
const R2_PREFIX = "docentes";
const DRY_RUN = process.argv.includes("--dry");

const CONTENT_TYPE = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
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
function slugify(str) {
  return str
    .replace(/\u251C\u00E6/g, "N") // mojibake legacy de Ñ en filenames del lote
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "n")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function sortedTokens(slug) {
  return slug.split("-").filter(Boolean).sort().join("-");
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Core ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n━━━ Teachers avatars bulk upload ${DRY_RUN ? "(DRY RUN)" : ""} ━━━\n`);

  if (!fs.existsSync(LOCAL_DIR)) {
    throw new Error(`Carpeta no encontrada: ${LOCAL_DIR}`);
  }

  // 1. Leer archivos locales — `encoding: 'buffer'` para recuperar UTF-8 real de Win32
  // (Node default en Windows devuelve el filename con Ñ mal codificada como latin1)
  const files = fs
    .readdirSync(LOCAL_DIR, { encoding: "buffer" })
    .map((b) => b.toString("utf8"))
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort();
  console.log(`▸ ${files.length} fotos en disco`);

  // 2. Cargar todos los teachers
  const { rows: teachers } = await pool.query(
    `SELECT id, name, gauss_slug FROM teachers WHERE deleted_at IS NULL`
  );
  console.log(`▸ ${teachers.length} teachers en BD\n`);

  // Index para match por sortedTokens (para los sin gauss_slug)
  const byNameTokens = new Map();
  for (const t of teachers) {
    const key = sortedTokens(slugify(t.name));
    byNameTokens.set(key, t);
  }

  // 3. Procesar cada foto
  const uploaded = [];
  const orphans = [];
  const matchedIds = new Set();

  for (const filename of files) {
    const ext = path.extname(filename).slice(1).toLowerCase().replace("jpeg", "jpeg");
    const baseNoExt = filename.replace(/\.(jpe?g|png)$/i, "");
    const fotoSlug = slugify(baseNoExt);

    // Match attempt 1: exact gauss_slug
    let teacher = teachers.find((t) => t.gauss_slug === fotoSlug);
    let matchType = "exact";

    // Match attempt 2: prefix (gauss_slug con sufijo hash)
    if (!teacher) {
      teacher = teachers.find(
        (t) => t.gauss_slug && t.gauss_slug.startsWith(fotoSlug + "-")
      );
      matchType = "prefix";
    }

    // Match attempt 3: tokens (teachers sin gauss_slug)
    if (!teacher) {
      const t = byNameTokens.get(sortedTokens(fotoSlug));
      if (t && !t.gauss_slug) {
        teacher = t;
        matchType = "name-tokens";
      }
    }

    if (!teacher) {
      orphans.push(filename);
      console.log(`  ✗ HUÉRFANA: ${filename}`);
      continue;
    }

    if (matchedIds.has(teacher.id)) {
      console.log(`  ⚠ DUPLICADO: ${filename} ya matcheó con ${teacher.name}`);
      continue;
    }
    matchedIds.add(teacher.id);

    // Key canónico: slug del filename (limpio, sin hashes)
    const normalizedExt = ext === "jpeg" ? "jpeg" : ext;
    const key = `${R2_PREFIX}/${fotoSlug}.${normalizedExt}`;
    const url = `${env.R2_PUBLIC_URL}/${key}`;
    const filePath = path.join(LOCAL_DIR, filename);
    const buffer = fs.readFileSync(filePath);
    const sizeLabel = formatSize(buffer.length);

    if (DRY_RUN) {
      console.log(
        `  ✓ [dry] ${filename} → ${teacher.name} [${matchType}] · ${sizeLabel}`
      );
      console.log(`         key: ${key}`);
      uploaded.push({ teacher, key, url, filename, sizeLabel, matchType });
      continue;
    }

    // Subir a R2
    await s3.send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: CONTENT_TYPE[normalizedExt] || "application/octet-stream",
        CacheControl: "public, max-age=86400",
      })
    );

    // UPDATE DB
    await pool.query(
      `UPDATE teachers SET avatar_url = $1, updated_at = NOW() WHERE id = $2`,
      [url, teacher.id]
    );

    console.log(
      `  ✓ ${filename} → ${teacher.name} [${matchType}] · ${sizeLabel}`
    );
    uploaded.push({ teacher, key, url, filename, sizeLabel, matchType });
  }

  // 4. Reporte
  console.log(`\n━━━ Resumen ━━━`);
  console.log(`  ${DRY_RUN ? "Hubieran subido" : "Subidas"}: ${uploaded.length}`);
  console.log(`  Huérfanas (sin match en BD): ${orphans.length}`);

  if (orphans.length) {
    console.log(`\n  Fotos huérfanas:`);
    for (const o of orphans) console.log(`    · ${o}`);
  }

  // Docentes sin foto
  const noPhoto = teachers.filter((t) => !matchedIds.has(t.id));
  console.log(`\n  Docentes sin foto asignada: ${noPhoto.length}`);
  for (const t of noPhoto) {
    console.log(`    · ${t.name} (${t.id})`);
  }

  // Breakdown de match types
  const byType = uploaded.reduce((acc, u) => {
    acc[u.matchType] = (acc[u.matchType] || 0) + 1;
    return acc;
  }, {});
  console.log(`\n  Match breakdown:`, byType);
}

try {
  await main();
} catch (err) {
  console.error(`\n✗ Error: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
} finally {
  await pool.end();
}
