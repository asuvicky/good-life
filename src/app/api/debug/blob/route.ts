import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { appBaseUrl } from "@/lib/app-url";
import { isBlobStorageEnabled } from "@/lib/upload";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireStaff();
  if (!session?.staffId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN || "";
  const storeId = process.env.BLOB_STORE_ID || "";

  return NextResponse.json({
    vercel: Boolean(process.env.VERCEL),
    blobStoreId: Boolean(storeId),
    blobToken: Boolean(token),
    blobTokenLooksValid: token.startsWith("vercel_blob_rw_"),
    oidcToken: Boolean(process.env.VERCEL_OIDC_TOKEN),
    blobEnabled: isBlobStorageEnabled(),
    blobAccess: process.env.BLOB_ACCESS === "private" ? "private" : "public",
    resolvedAppBaseUrl: appBaseUrl() || null,
    vercelUrl: process.env.VERCEL_URL || null,
    hint:
      !token && storeId
        ? "目前只有 BLOB_STORE_ID（OIDC）。若上傳仍失敗，請到 Blob Store → Settings 複製 Read-Write Token，設成 Production 的 BLOB_READ_WRITE_TOKEN 後 Redeploy。"
        : null,
  });
}
