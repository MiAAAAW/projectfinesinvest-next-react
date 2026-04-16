import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

/** Extract the R2 key from a public URL */
export function getR2KeyFromUrl(url: string): string | null {
  if (!url.startsWith(R2_PUBLIC_URL)) return null;
  return url.replace(`${R2_PUBLIC_URL}/`, "");
}

/**
 * Genera una URL firmada temporal para descarga/preview desde R2.
 * - Expira en X segundos (default 300s = 5 min)
 * - Puede sobrescribir Content-Disposition para nombre de descarga personalizado
 * - El browser descarga directo de R2 (no pasa por el server)
 */
export async function getPresignedDownloadUrl(
  key: string,
  options?: {
    downloadFilename?: string;
    forceDownload?: boolean;
    expiresIn?: number;
  }
): Promise<string> {
  const { downloadFilename, forceDownload = false, expiresIn = 300 } = options ?? {};

  const contentDisposition = downloadFilename
    ? `${forceDownload ? "attachment" : "inline"}; filename="${downloadFilename}"`
    : undefined;

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ...(contentDisposition && { ResponseContentDisposition: contentDisposition }),
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}
