// Direct R2 delete for the 2 known orphan keys
import fs from "node:fs";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Parser robusto del .env
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

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const keys = [
  "etica/1776068094673-One-Pager_AurumCore_v2-Eng.pdf",
  "etica/1776069225658-Bases_Convocatoria.pdf",
];

for (const key of keys) {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }));
    console.log(`✓ Deleted: ${key}`);
  } catch (err) {
    console.log(`✗ Failed ${key}: ${err.message}`);
  }
}
