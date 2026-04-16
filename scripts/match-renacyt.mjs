// ═══════════════════════════════════════════════════════════════════════════════
// MATCH FINESI TEACHERS vs RENACYT 2024 oficial
// Fuente: CONCYTEC via datosabiertos.gob.pe (11,758 investigadores)
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import readline from "node:readline";

const CSV = process.env.TEMP
  ? `${process.env.TEMP.replace(/\\/g, "/")}/renacyt2024.csv`
  : "C:/Users/USUARIO/AppData/Local/Temp/renacyt2024.csv";

// Docentes FINESI desde la BD
const teachers = [
  { id: "d002400", name: "Alain Paul Herrera Urtiaga" },
  { id: "d000090", name: "Alcides Ramos Calcina" },
  { id: "d_772a9dc2e134", name: "Alejandro Apaza Tarqui" },
  { id: "d001874", name: "Angel Javier Quispe Carita" },
  { id: "d000275", name: "Bernabe Canqui Flores" },
  { id: "d000095", name: "Cesar Augusto Lluen Vallejos" },
  { id: "d000054", name: "Charles Ignacio Mendoza Mollocondo" },
  { id: "d000493", name: "Edgar Eloy Carpio Vargas" },
  { id: "d001899", name: "Edgardo Quispe Yapo" },
  { id: "d000032", name: "Elqui Yeye Pari Condori" },
  { id: "d002346", name: "Erardo Espinoza Coaquira" },
  { id: "d000931", name: "Ernesto Nayer Tumi Figueroa" },
  { id: "d002401", name: "Fred Torres Cruz" },
  { id: "d002311", name: "Fredy Gonzalo Copari Romero" },
  { id: "d002083", name: "Fredy Heric Villasante Saravia" },
  { id: "d002448", name: "Gerardino Juvenal Cauna Huanca" },
  { id: "d002347", name: "Jesus Pari Flores" },
  { id: "d000126", name: "Jose Panfilo Tito Lipa" },
  { id: "d000347", name: "Juan Carlos Juarez Vargas" },
  { id: "d000276", name: "Juan Reynaldo Paredes Quispe" },
  { id: "d002076", name: "Leonel Coyla Idme" },
  { id: "d000376", name: "Leonid Aleman Gonzales" },
  { id: "d000523", name: "Maria Maura Salas Pilco" },
  { id: "d000389", name: "Milton Antonio Lopez Cueva" },
  { id: "d002398", name: "Milton Vladimir Mamani Calisaya" },
  { id: "d002342", name: "Oscar Rene Barrientos Huaman" },
  { id: "d002077", name: "Percy Huata Panca" },
  { id: "d002177", name: "Ramiro Pedro Laura Murillo" },
  { id: "d000957", name: "Remo Choquejahua Acero" },
  { id: "d000891", name: "Renan Abelardo Palli Mamani" },
  { id: "d001873", name: "Renzo Apaza Cutipa" },
  { id: "d002001", name: "Roberto Elvis Roque Claros" },
  { id: "d002343", name: "Romel Percy Melgarejo Bolivar" },
  { id: "d000321", name: "Santos Octavio Morillos Valderrama" },
  { id: "d002024", name: "Teresa Paola Alvarez Rozas" },
  { id: "d000513", name: "Vladimiro Ibañez Quispe" },
  { id: "d002348", name: "Yeni Liz Jihuallanca Ccoa" },
];

// ─── Normalización agresiva: minúsculas + sin tildes + ordenar tokens ────────────
function normalize(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

// RENACYT viene como "APELLIDOS,NOMBRES" — junto los dos lados
function normalizeRenacyt(fullCsv) {
  // "PONCE ALVAREZ,SILVIA PATRICIA" → "ponce alvarez silvia patricia"
  const joined = fullCsv.replace(/,/g, " ");
  return normalize(joined);
}

// ─── Índice por tokens ordenados para match exacto ─────────────────────────────
const teacherIndex = new Map();
for (const t of teachers) {
  teacherIndex.set(normalize(t.name), t);
}

// ─── Lectura del CSV ───────────────────────────────────────────────────────────
const matches = [];
const rl = readline.createInterface({ input: fs.createReadStream(CSV, "utf8") });

let headers = null;
let idxCodigo, idxNombre, idxUrl, idxReg, idxCond, idxNivel21, idxGrupo18, idxNivel18, idxIni18, idxFin18, idxDpto;

for await (const line of rl) {
  const parts = line.replace(/^\uFEFF/, "").split(";");
  if (!headers) {
    headers = parts.map((h) => h.trim());
    idxCodigo = headers.indexOf("CODIGO_RENACYT");
    idxNombre = headers.indexOf("INVESTIGADOR");
    idxUrl = headers.indexOf("URL_FICHA_RENACYT");
    idxReg = headers.indexOf("REGLAMENTO");
    idxCond = headers.indexOf("CONDICION_ACTIVIDAD");
    idxNivel21 = headers.indexOf("NIVEL_REGLAMENTO_2021");
    idxGrupo18 = headers.indexOf("GRUPO_REGLAMENTO_2018");
    idxNivel18 = headers.indexOf("NIVEL_REGLAMENTO_2018");
    idxIni18 = headers.indexOf("FECHA_INICIO_VIGENCIA_REGLAMENTO_2018");
    idxFin18 = headers.indexOf("FECHA_FIN_VIGENCIA_REGLAMENTO_2018");
    idxDpto = headers.indexOf("DEPARTAMENTO");
    continue;
  }
  const inv = parts[idxNombre];
  if (!inv) continue;
  const norm = normalizeRenacyt(inv);
  const t = teacherIndex.get(norm);
  if (t) {
    matches.push({
      teacher_id: t.id,
      teacher_name: t.name,
      renacyt_name: inv,
      codigo: parts[idxCodigo],
      reglamento: parts[idxReg]?.trim(),
      condicion: parts[idxCond]?.trim(),
      nivel_2021: parts[idxNivel21]?.trim() || null,
      grupo_2018: parts[idxGrupo18]?.trim() || null,
      nivel_2018: parts[idxNivel18]?.trim() || null,
      ini_2018: parts[idxIni18]?.trim() || null,
      fin_2018: parts[idxFin18]?.trim() || null,
      departamento: parts[idxDpto]?.trim(),
      url: parts[idxUrl],
    });
  }
}

console.log("\n═══════════════════════════════════════════════════════════");
console.log(`FINESI teachers: ${teachers.length}`);
console.log(`RENACYT matches (exact token-set): ${matches.length}`);
console.log("═══════════════════════════════════════════════════════════\n");

for (const m of matches) {
  const nivel = m.nivel_2021 || `${m.grupo_2018}/${m.nivel_2018}`;
  console.log(`✓ ${m.teacher_name}`);
  console.log(`  → ${m.codigo} · ${m.condicion} · Reg.${m.reglamento} · Nivel ${nivel} · ${m.departamento}`);
  console.log(`  → ${m.url}`);
}

// Docentes sin match
const matchedIds = new Set(matches.map((m) => m.teacher_id));
const unmatched = teachers.filter((t) => !matchedIds.has(t.id));
console.log(`\n─── Sin match exacto (${unmatched.length}) ───`);
for (const u of unmatched) console.log(`  ✗ ${u.name}`);

// JSON para siguiente paso
fs.writeFileSync("C:/Users/USUARIO/AppData/Local/Temp/renacyt-matches.json", JSON.stringify(matches, null, 2));
console.log(`\n→ Guardado: C:/Users/USUARIO/AppData/Local/Temp/renacyt-matches.json`);
