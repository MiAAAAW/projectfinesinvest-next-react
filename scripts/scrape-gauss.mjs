// ═══════════════════════════════════════════════════════════════════════════════
// SCRAPE GAUSS (investiga.finesi.edu.pe)
// Descarga los 44 perfiles completos de docentes FINESI vía API pública.
// Guarda:
//   - gauss-list.json  → resumen de la lista
//   - gauss-details.json → array con los 44 perfiles completos
//   - gauss-summary.md → resumen legible de la cobertura de campos
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";

const BASE = "https://iicc.edu.pe/gauss/api";
const OUT_DIR = process.env.TEMP?.replace(/\\/g, "/") ?? "C:/Users/USUARIO/AppData/Local/Temp";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  Referer: "https://investiga.finesi.edu.pe/",
};

async function get(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// ─── 1. Lista ──────────────────────────────────────────────────────────────────
console.log("→ Fetching researchers list...");
const list = await get(`${BASE}/public/researchers?size=200`);
fs.writeFileSync(path.join(OUT_DIR, "gauss-list.json"), JSON.stringify(list, null, 2));
console.log(`  ✓ ${list.totalElements} researchers total`);

// ─── 2. Detalle de cada uno (paralelo limitado) ────────────────────────────────
console.log("\n→ Fetching detailed profiles (batches of 5)...");
const details = [];
for (let i = 0; i < list.content.length; i += 5) {
  const batch = list.content.slice(i, i + 5);
  const results = await Promise.allSettled(
    batch.map((r) => get(`${BASE}/public/researchers/${r.slug}`))
  );
  for (let j = 0; j < results.length; j++) {
    const r = results[j];
    if (r.status === "fulfilled") {
      details.push(r.value);
      console.log(`  ✓ ${batch[j].slug}`);
    } else {
      console.log(`  ✗ ${batch[j].slug}: ${r.reason.message}`);
    }
  }
}

fs.writeFileSync(path.join(OUT_DIR, "gauss-details.json"), JSON.stringify(details, null, 2));
console.log(`\n✓ Saved ${details.length} detailed profiles`);

// ─── 3. Análisis de cobertura de campos ────────────────────────────────────────
const coverage = {};
const arrayCoverage = {};

function walk(obj, prefix = "") {
  for (const [key, val] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (val === null || val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
      continue;
    }
    coverage[full] = (coverage[full] || 0) + 1;
    if (Array.isArray(val)) {
      arrayCoverage[full] = Math.max(arrayCoverage[full] || 0, val.length);
    }
  }
}

for (const d of details) walk(d);

console.log("\n═══════════════════════════════════════════════");
console.log("COBERTURA DE CAMPOS (sobre 44 docentes)");
console.log("═══════════════════════════════════════════════");
const sorted = Object.entries(coverage).sort((a, b) => b[1] - a[1]);
for (const [field, count] of sorted) {
  const max = arrayCoverage[field];
  const suffix = max !== undefined ? `  [array max=${max}]` : "";
  console.log(`  ${count.toString().padStart(3)}/44  ${field}${suffix}`);
}

// ─── 4. Markdown summary ───────────────────────────────────────────────────────
let md = "# GAUSS scraping — resumen\n\n";
md += `**Total perfiles**: ${details.length}\n\n`;
md += `## Cobertura de campos\n\n| Campo | Cobertura | Notas |\n|---|---|---|\n`;
for (const [field, count] of sorted) {
  const max = arrayCoverage[field];
  const notes = max !== undefined ? `array max ${max}` : "";
  md += `| \`${field}\` | ${count}/44 | ${notes} |\n`;
}

// Sample teacher with maximum data
const richest = details
  .map((d) => ({ d, score: Object.keys(d).filter((k) => d[k] && (!Array.isArray(d[k]) || d[k].length > 0)).length }))
  .sort((a, b) => b.score - a.score)[0];

md += `\n## Ejemplo más rico: **${richest.d.fullName}** (${richest.score} campos con data)\n\n`;
md += "```json\n" + JSON.stringify(richest.d, null, 2).slice(0, 6000) + "\n...\n```\n";

fs.writeFileSync(path.join(OUT_DIR, "gauss-summary.md"), md);
console.log(`\n→ ${OUT_DIR}/gauss-summary.md`);
console.log(`→ ${OUT_DIR}/gauss-details.json`);
console.log(`→ ${OUT_DIR}/gauss-list.json`);
