import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { appBaseUrl } from "@/lib/app-url";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN || undefined;
}

function blobEnabled() {
  return Boolean(blobToken() || process.env.BLOB_STORE_ID);
}

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

function blobAccess(): "public" | "private" {
  return process.env.BLOB_ACCESS === "private" ? "private" : "public";
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
    try {
      const options: {
        access: "public" | "private";
        contentType: string;
        addRandomSuffix: boolean;
        token?: string;
      } = {
        access: blobAccess(),
        contentType: file.type || "image/jpeg",
        addRandomSuffix: false,
      };

      // 明確傳入 token，避免 Serverless 上讀不到 env 時失敗
      if (blobToken()) {
        options.token = blobToken();
      }

      const blob = await put(`parcels/${filename}`, buffer, options);
      return blob.url;
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "未知錯誤";
      throw new Error(
        `Vercel Blob 上傳失敗：${detail}。若 Blob 是 Private，請改建成 Public，或在環境變數設 BLOB_ACCESS=private（LINE 推播照片需要 Public）。`,
      );
    }
  }

  if (isVercelRuntime()) {
    throw new Error(
      "尚未讀到 Blob 設定。請確認 Production 有 BLOB_READ_WRITE_TOKEN，並 Redeploy。",
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
