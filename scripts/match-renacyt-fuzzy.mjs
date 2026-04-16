// Fuzzy match: busca los 13 docentes sin match exacto por apellido
import fs from "node:fs";
import readline from "node:readline";

const CSV = `${process.env.TEMP.replace(/\\/g, "/")}/renacyt2024.csv`;

const unmatched = [
  "Alcides Ramos Calcina",
  "Cesar Augusto Lluen Vallejos",
  "Erardo Espinoza Coaquira",
  "Fredy Gonzalo Copari Romero",
  "Gerardino Juvenal Cauna Huanca",
  "Jesus Pari Flores",
  "Maria Maura Salas Pilco",
  "Oscar Rene Barrientos Huaman",
  "Remo Choquejahua Acero",
  "Renan Abelardo Palli Mamani",
  "Santos Octavio Morillos Valderrama",
  "Teresa Paola Alvarez Rozas",
  "Yeni Liz Jihuallanca Ccoa",
];

function norm(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z\s]/g, " ").trim().split(/\s+/).filter(Boolean);
}

// Extraer apellidos (primeros 1-2 tokens del lado "apellidos") + nombres
function splitTeacher(name) {
  const tokens = norm(name);
  // Regla simple: últimos 2 tokens = apellidos (formato "Nombres Apellidos")
  const apellidos = tokens.slice(-2).sort().join(" ");
  const nombres = tokens.slice(0, -2).sort().join(" ");
  return { tokens, apellidos, nombres, all: tokens.sort().join(" ") };
}

const rl = readline.createInterface({ input: fs.createReadStream(CSV, "utf8") });
let headers = null;
let idxNom, idxCod, idxNivel, idxDpto, idxUrl, idxCond;
const rows = [];

for await (const line of rl) {
  const parts = line.replace(/^\uFEFF/, "").split(";");
  if (!headers) {
    headers = parts.map((h) => h.trim());
    idxNom = headers.indexOf("INVESTIGADOR");
    idxCod = headers.indexOf("CODIGO_RENACYT");
    idxNivel = headers.indexOf("NIVEL_REGLAMENTO_2021");
    idxDpto = headers.indexOf("DEPARTAMENTO");
    idxUrl = headers.indexOf("URL_FICHA_RENACYT");
    idxCond = headers.indexOf("CONDICION_ACTIVIDAD");
    continue;
  }
  rows.push({
    name: parts[idxNom],
    codigo: parts[idxCod],
    nivel: parts[idxNivel]?.trim(),
    depto: parts[idxDpto]?.trim(),
    url: parts[idxUrl],
    cond: parts[idxCond]?.trim(),
  });
}

console.log(`RENACYT rows loaded: ${rows.length}\n`);

for (const teacher of unmatched) {
  const t = splitTeacher(teacher);
  console.log(`\n🔍 ${teacher}`);
  console.log(`   apellidos buscados: "${t.apellidos}"`);

  // 1) Match por apellidos exactos (token-set)
  const byApellido = rows.filter((r) => {
    if (!r.name) return false;
    const renacytTokens = norm(r.name.replace(/,/g, " "));
    // Los apellidos RENACYT están antes de la coma
    const apellRenacyt = norm(r.name.split(",")[0] || "").sort().join(" ");
    return apellRenacyt === t.apellidos;
  });

  if (byApellido.length > 0) {
    for (const r of byApellido) {
      const fullNorm = norm(r.name.replace(/,/g, " ")).sort().join(" ");
      const teacherAll = t.all;
      const overlap = fullNorm === teacherAll ? "EXACTO" : "PARCIAL";
      console.log(`   → [${overlap}] ${r.name} · ${r.codigo} · Nivel ${r.nivel} · ${r.depto}`);
    }
    continue;
  }

  // 2) Si no hay match por apellidos, buscar por al menos 1 apellido en Puno
  const partial = rows.filter((r) => {
    if (!r.name || r.depto !== "PUNO") return false;
    const apellRenacyt = norm(r.name.split(",")[0] || "");
    const tApellidos = t.apellidos.split(" ");
    return tApellidos.some((a) => apellRenacyt.includes(a));
  }).slice(0, 5);

  if (partial.length > 0) {
    console.log(`   (match por apellido parcial en PUNO):`);
    for (const r of partial) console.log(`     • ${r.name} · ${r.codigo} · Nivel ${r.nivel}`);
  } else {
    console.log(`   ❌ no encontrado en RENACYT`);
  }
}
