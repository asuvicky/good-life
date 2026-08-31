import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { isBlobStorageEnabled } from "@/lib/upload";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireStaff();
  if (!session?.staffId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    vercel: Boolean(process.env.VERCEL),
    blobStoreId: Boolean(process.env.BLOB_STORE_ID),
    blobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    blobEnabled: isBlobStorageEnabled(),
    blobAccess: process.env.BLOB_ACCESS === "private" ? "private" : "public",
    appBaseUrl: process.env.APP_BASE_URL || process.env.VERCEL_URL || null,
  });
}
