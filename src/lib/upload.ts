import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { appBaseUrl } from "@/lib/app-url";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function blobEnabled() {
  // Vercel Blob：舊版用 BLOB_READ_WRITE_TOKEN，新版用 OIDC + BLOB_STORE_ID
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
}

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

export async function saveUpload(file: File) {
  if (!file || file.size === 0) {
    throw new Error("請拍照或選擇包裹照片");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("僅能上傳圖片");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("照片請小於 8MB");
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const filename = `${Date.now()}-${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (blobEnabled()) {
    const blob = await put(`parcels/${filename}`, buffer, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  if (isVercelRuntime()) {
    throw new Error(
      "尚未設定 Vercel Blob。請到 Vercel → Storage → 建立 Blob 並連到此專案，然後重新部署。",
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export function publicFileUrl(photoPath: string) {
  if (photoPath.startsWith("https://")) {
    return photoPath;
  }
  const base = appBaseUrl();
  if (!base) return undefined;
  return `${base}${photoPath}`;
}

export function parcelPhotoSrc(photoPath: string) {
  if (photoPath.startsWith("https://")) {
    return photoPath;
  }
  return photoPath;
}

export function isBlobStorageEnabled() {
  return blobEnabled();
}
