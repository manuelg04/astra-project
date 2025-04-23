import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

const {
  AWS_REGION,
  AWS_S3_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} = process.env;

if (!AWS_REGION || !AWS_S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  throw new Error(
    "S3 – missing AWS credentials or bucket info in environment variables.",
  );
}

/* ------------------------------------------------------------------ */
/*  Instancia única de S3 Client (se comparte gracias al hot-reload)   */
/* ------------------------------------------------------------------ */
declare global {
  // eslint-disable-next-line no-var
  var _s3Client: S3Client | undefined;
}

export const s3 =
  global._s3Client ??
  new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

if (process.env.NODE_ENV !== "production") {
  global._s3Client = s3;
}

/* ------------------------------------------------------------------ */
/*  Función principal: subir una imagen a partir de un Data URL        */
/* ------------------------------------------------------------------ */

/**
 * Sube una imagen codificada como data-URL (base64) al bucket S3
 * y devuelve la URL pública HTTPS resultante.
 *
 * @param dataUrl  Cadena "data:image/png;base64,AAA…" o similar
 * @param folder   Carpeta opcional dentro del bucket  (p. ej. "avatars")
 * @returns        URL https://<bucket>.s3.<region>.amazonaws.com/<key>
 */
export async function uploadImageDataUrl(
  dataUrl: string,
  folder = "uploads",
): Promise<string> {
  /* 1 · Validar & parsear el Data URL -------------------------------- */
  const match = dataUrl.match(
    /^data:(image\/[a-z0-9.+-]+);base64,([a-zA-Z0-9+/=]+)$/i,
  );
  if (!match) throw new Error("Invalid data URL");

  const mimeType = match[1];        // ej. "image/png"
  const base64   = match[2];
  const buffer   = Buffer.from(base64, "base64");

  /* 2 · Derivar extensión y key -------------------------------------- */
  const extension = mimeType.split("/")[1].replace("+xml", ""); // svg+xml -> svg
  const key = `${folder}/${randomUUID()}.${extension}`;

  /* 3 · Subir a S3 --------------------------------------------------- */
  await s3.send(
    new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  /* 4 · Construir URL pública --------------------------------------- */
  return `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}

/* ------------------------------------------------------------------ */
/*  Función genérica para buffers (por si la necesitas más adelante)   */
/* ------------------------------------------------------------------ */
export async function uploadBuffer(
  buffer: Buffer,
  mimeType: string,
  folder = "uploads",
): Promise<string> {
  const extension = mimeType.split("/")[1];
  const key = `${folder}/${randomUUID()}.${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  return `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}