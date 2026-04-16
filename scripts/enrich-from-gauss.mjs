// ═══════════════════════════════════════════════════════════════════════════════
// ENRICH TEACHERS FROM GAUSS
// Toma gauss-details.json y:
//   1. Upsert los 44 docentes (crea los que faltan, actualiza los existentes)
//   2. Inserta formations, work_experiences, thesis, distinctions, languages
//
// Reglas PRO:
//   • Dedupe por gauss_id @unique  → idempotente, re-runnable
//   • Skip registros sin campos clave
//   • Fechas inválidas (año > 2050 o < 1940) descartadas
//   • Strings trim + null si vacíos
//   • Para teachers EXISTENTES: solo llenar campos NULL (no pisar overrides manuales)
//   • Match existente por nombre normalizado (unaccent + lowercase)
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import pg from "pg";

const { Client } = pg;

// Cargar .env manualmente (sin dotenv)
const envContent = fs.readFileSync(".env", "utf8");
for (const line of envContent.split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m) process.env[m[1]] = m[2];
}

const DATA = JSON.parse(
  fs.readFileSync("C:/Users/USUARIO/AppData/Local/Temp/gauss-details.json", "utf8")
);

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// ─── Helpers ───────────────────────────────────────────────────────────────────
const t = (s) => (typeof s === "string" ? s.trim() || null : s ?? null);

// URL real: http(s):// + dominio. Filtra "http://", direcciones, emails.
const url = (s) => {
  const v = t(s);
  if (!v) return null;
  return /^https?:\/\/[a-z0-9]/i.test(v) ? v : null;
};

const validYear = (y) => (y && y >= 1940 && y <= 2050 ? y : null);
const validDate = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  const y = dt.getFullYear();
  if (Number.isNaN(y) || y < 1940 || y > 2050) return null;
  return dt.toISOString();
};
const norm = (s) =>
  (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .trim()
    .split(/\s+/)
    .sort()
    .join(" ");

function reorderName(fullName) {
  // Gauss: "Apellido1 Apellido2 Nombre1 Nombre2" (apellidos primero)
  // Nuestro: "Nombre1 Nombre2 Apellido1 Apellido2"
  // Heurística: si llega como "Aleman Gonzales Leonid" y BD tiene "Leonid Aleman Gonzales"
  // Para import de NUEVOS, reordenamos: últimos N-2 tokens son nombres, primeros 2 son apellidos
  const tokens = fullName.trim().split(/\s+/);
  if (tokens.length < 3) return fullName;
  // Asumimos 2 apellidos + N nombres. Pero "Dina Maribel Yana Yucra" viene ya así (con nombres primero).
  // Detectamos si gauss format dando prioridad a `slug`: si slug es "aleman-gonzales-leonid",
  // los 2 apellidos son primeros del slug.
  return fullName; // mantenemos tal cual desde Gauss en campo `name` - es consistente para el portal
}

// ─── 1. Mapeo gauss_slug → teacher_id existente (por nombre) ───────────────────
const { rows: existingTeachers } = await client.query(
  `SELECT id, name FROM teachers WHERE deleted_at IS NULL`
);

const byNorm = new Map();
for (const t of existingTeachers) byNorm.set(norm(t.name), t);

// ─── 2. Upsert de cada docente Gauss ───────────────────────────────────────────
const stats = {
  teachers_matched: 0,
  teachers_created: 0,
  formations: 0,
  work: 0,
  thesis: 0,
  distinctions: 0,
  languages: 0,
  skipped: { formations: 0, work: 0, thesis: 0, distinctions: 0, languages: 0 },
};

await client.query("BEGIN");

try {
  for (const g of DATA) {
    // ⚠️ SKIP estudiantes — el portal Gauss mezcla docentes y alumnos
    if (g.role !== "professor") {
      console.log(`  ⊘ skip (${g.role}): ${g.fullName}`);
      continue;
    }
    const normName = norm(g.fullName);
    let existing = byNorm.get(normName);
    let teacherId;

    // Si existe, update
    if (existing) {
      teacherId = existing.id;
      stats.teachers_matched++;

      // Solo rellenar campos NULL — NO pisar datos manuales
      await client.query(
        `UPDATE teachers SET
           bio              = COALESCE(NULLIF(bio,''), $2),
           academic_title   = COALESCE(NULLIF(academic_title,''), $3),
           cti_vitae_url    = COALESCE(NULLIF(cti_vitae_url,''), $4),
           personal_website = COALESCE(NULLIF(personal_website,''), $5),
           research_gate    = COALESCE(NULLIF(research_gate,''), $6),
           google_scholar   = COALESCE(NULLIF(google_scholar,''), $7),
           linkedin         = COALESCE(NULLIF(linkedin,''), $8),
           orcid            = COALESCE(NULLIF(orcid,''), $9),
           hindex           = COALESCE(hindex, $10),
           gauss_id         = COALESCE(gauss_id, $11),
           gauss_slug       = COALESCE(gauss_slug, $12),
           member_since     = COALESCE(member_since, $13),
           updated_at       = NOW()
         WHERE id = $1`,
        [
          teacherId,
          t(g.bio),
          t(g.academicTitle),
          url(g.ctiVitaeUrl),
          url(g.personalWebsite),
          url(g.researchGateUrl),
          url(g.googleScholarUrl),
          url(g.linkedinUrl),
          t(g.orcidId), // ORCID es un ID, no URL
          g.hindex ?? null,
          t(g.id),
          t(g.slug),
          validDate(g.memberSince),
        ]
      );
    } else {
      // Crear nuevo
      teacherId = "d_" + Math.random().toString(36).slice(2, 14);
      stats.teachers_created++;

      await client.query(
        `INSERT INTO teachers (
           id, name, bio, academic_title, cti_vitae_url, personal_website,
           research_gate, google_scholar, linkedin, orcid, hindex,
           gauss_id, gauss_slug, member_since, published, "order",
           created_at, updated_at
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true,999,NOW(),NOW()
         )`,
        [
          teacherId,
          g.fullName,
          t(g.bio),
          t(g.academicTitle),
          url(g.ctiVitaeUrl),
          url(g.personalWebsite),
          url(g.researchGateUrl),
          url(g.googleScholarUrl),
          url(g.linkedinUrl),
          t(g.orcidId),
          g.hindex ?? null,
          t(g.id),
          t(g.slug),
          validDate(g.memberSince),
        ]
      );
    }

    // ─── Formations ──────────────────────────────────────────────────────────
    for (const f of g.academicFormations ?? []) {
      if (!t(f.degreeName)) {
        stats.skipped.formations++;
        continue;
      }
      await client.query(
        `INSERT INTO teacher_formations (
           id, teacher_id, degree_type, degree_name, institution, country,
           start_year, graduation_year, thesis_title, thesis_advisor, distinction,
           display_order, gauss_id, created_at, updated_at
         ) VALUES (
           'tf_'||substr(md5(random()::text),1,12),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW()
         )
         ON CONFLICT (gauss_id) DO UPDATE SET
           teacher_id      = EXCLUDED.teacher_id,
           degree_type     = EXCLUDED.degree_type,
           degree_name     = EXCLUDED.degree_name,
           institution     = EXCLUDED.institution,
           country         = EXCLUDED.country,
           start_year      = EXCLUDED.start_year,
           graduation_year = EXCLUDED.graduation_year,
           thesis_title    = EXCLUDED.thesis_title,
           thesis_advisor  = EXCLUDED.thesis_advisor,
           distinction     = EXCLUDED.distinction,
           display_order   = EXCLUDED.display_order,
           updated_at      = NOW()`,
        [
          teacherId,
          t(f.degreeType),
          t(f.degreeName),
          t(f.institution),
          t(f.country),
          validYear(f.startYear),
          validYear(f.graduationYear),
          t(f.thesisTitle),
          t(f.thesisAdvisor),
          t(f.distinction),
          f.displayOrder ?? 0,
          t(f.id),
        ]
      );
      stats.formations++;
    }

    // ─── Work experiences ─────────────────────────────────────────────────────
    for (const w of g.workExperiences ?? []) {
      if (!t(w.institution)) {
        stats.skipped.work++;
        continue;
      }
      await client.query(
        `INSERT INTO teacher_work_experiences (
           id, teacher_id, experience_type, institution, position, department,
           start_date, end_date, is_current, is_primary, description, country, city,
           display_order, gauss_id, created_at, updated_at
         ) VALUES (
           'tw_'||substr(md5(random()::text),1,12),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW()
         )
         ON CONFLICT (gauss_id) DO UPDATE SET
           teacher_id      = EXCLUDED.teacher_id,
           experience_type = EXCLUDED.experience_type,
           institution     = EXCLUDED.institution,
           position        = EXCLUDED.position,
           department      = EXCLUDED.department,
           start_date      = EXCLUDED.start_date,
           end_date        = EXCLUDED.end_date,
           is_current      = EXCLUDED.is_current,
           is_primary      = EXCLUDED.is_primary,
           description     = EXCLUDED.description,
           country         = EXCLUDED.country,
           city            = EXCLUDED.city,
           display_order   = EXCLUDED.display_order,
           updated_at      = NOW()`,
        [
          teacherId,
          t(w.experienceType),
          t(w.institution),
          t(w.position),
          t(w.department),
          validDate(w.startDate),
          validDate(w.endDate),
          !validDate(w.endDate) || w.isCurrent === true,
          w.isPrimary === true,
          t(w.description),
          t(w.country),
          t(w.city),
          w.displayOrder ?? 0,
          t(w.id),
        ]
      );
      stats.work++;
    }

    // ─── Thesis supervisions ──────────────────────────────────────────────────
    for (const s of g.thesisSupervisions ?? []) {
      if (!t(s.thesisTitle)) {
        stats.skipped.thesis++;
        continue;
      }
      await client.query(
        `INSERT INTO teacher_thesis_supervisions (
           id, teacher_id, thesis_title, student_name, thesis_type, role,
           university, acceptance_date, repository_url, display_order, gauss_id,
           created_at, updated_at
         ) VALUES (
           'tts_'||substr(md5(random()::text),1,12),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW()
         )
         ON CONFLICT (gauss_id) DO UPDATE SET
           teacher_id      = EXCLUDED.teacher_id,
           thesis_title    = EXCLUDED.thesis_title,
           student_name    = EXCLUDED.student_name,
           thesis_type     = EXCLUDED.thesis_type,
           role            = EXCLUDED.role,
           university      = EXCLUDED.university,
           acceptance_date = EXCLUDED.acceptance_date,
           repository_url  = EXCLUDED.repository_url,
           display_order   = EXCLUDED.display_order,
           updated_at      = NOW()`,
        [
          teacherId,
          t(s.thesisTitle),
          t(s.studentName),
          t(s.thesisType),
          t(s.role),
          t(s.university),
          validDate(s.acceptanceDate),
          url(s.repositoryUrl),
          s.displayOrder ?? 0,
          t(s.id),
        ]
      );
      stats.thesis++;
    }

    // ─── Distinctions ─────────────────────────────────────────────────────────
    for (const d of g.distinctions ?? []) {
      if (!t(d.name)) {
        stats.skipped.distinctions++;
        continue;
      }
      await client.query(
        `INSERT INTO teacher_distinctions (
           id, teacher_id, distinction_type, name, granting_institution, description,
           award_date, award_year, country, url, display_order, gauss_id,
           created_at, updated_at
         ) VALUES (
           'td_'||substr(md5(random()::text),1,12),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW()
         )
         ON CONFLICT (gauss_id) DO UPDATE SET
           teacher_id           = EXCLUDED.teacher_id,
           distinction_type     = EXCLUDED.distinction_type,
           name                 = EXCLUDED.name,
           granting_institution = EXCLUDED.granting_institution,
           description          = EXCLUDED.description,
           award_date           = EXCLUDED.award_date,
           award_year           = EXCLUDED.award_year,
           country              = EXCLUDED.country,
           url                  = EXCLUDED.url,
           display_order        = EXCLUDED.display_order,
           updated_at           = NOW()`,
        [
          teacherId,
          t(d.distinctionType),
          t(d.name),
          t(d.grantingInstitution),
          t(d.description),
          validDate(d.awardDate),
          validYear(d.awardYear),
          t(d.country),
          url(d.url),
          d.displayOrder ?? 0,
          t(d.id),
        ]
      );
      stats.distinctions++;
    }

    // ─── Language skills ──────────────────────────────────────────────────────
    for (const l of g.languageSkills ?? []) {
      if (!t(l.language)) {
        stats.skipped.languages++;
        continue;
      }
      await client.query(
        `INSERT INTO teacher_language_skills (
           id, teacher_id, language, reading_level, writing_level, speaking_level,
           listening_level, is_native, certification, certification_score,
           certification_year, display_order, gauss_id, created_at, updated_at
         ) VALUES (
           'tl_'||substr(md5(random()::text),1,12),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW()
         )
         ON CONFLICT (gauss_id) DO UPDATE SET
           teacher_id          = EXCLUDED.teacher_id,
           language            = EXCLUDED.language,
           reading_level       = EXCLUDED.reading_level,
           writing_level       = EXCLUDED.writing_level,
           speaking_level      = EXCLUDED.speaking_level,
           listening_level     = EXCLUDED.listening_level,
           is_native           = EXCLUDED.is_native,
           certification       = EXCLUDED.certification,
           certification_score = EXCLUDED.certification_score,
           certification_year  = EXCLUDED.certification_year,
           display_order       = EXCLUDED.display_order,
           updated_at          = NOW()`,
        [
          teacherId,
          t(l.language),
          t(l.readingLevel),
          t(l.writingLevel),
          t(l.speakingLevel),
          t(l.listeningLevel),
          l.isNative === true,
          t(l.certification),
          t(l.certificationScore),
          validYear(l.certificationYear),
          l.displayOrder ?? 0,
          t(l.id),
        ]
      );
      stats.languages++;
    }
  }

  await client.query("COMMIT");
} catch (err) {
  await client.query("ROLLBACK");
  console.error("❌ ERROR:", err.message);
  throw err;
}

console.log("\n═══════════════════════════════════════════════");
console.log("ENRIQUECIMIENTO COMPLETO");
console.log("═══════════════════════════════════════════════");
console.log(`  Teachers matcheados (updated): ${stats.teachers_matched}`);
console.log(`  Teachers creados (nuevos):     ${stats.teachers_created}`);
console.log(`  Formations insertadas:          ${stats.formations}   (skip: ${stats.skipped.formations})`);
console.log(`  Work experiences insertadas:    ${stats.work}   (skip: ${stats.skipped.work})`);
console.log(`  Tesis supervisadas insertadas:  ${stats.thesis}   (skip: ${stats.skipped.thesis})`);
console.log(`  Distinciones insertadas:        ${stats.distinctions}   (skip: ${stats.skipped.distinctions})`);
console.log(`  Idiomas insertados:             ${stats.languages}   (skip: ${stats.skipped.languages})`);

await client.end();
