import { access, mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { appBaseUrl } from "@/lib/app-url";
import { isBlobStorageEnabled } from "@/lib/upload";
import { messagingApi } from "@line/bot-sdk";

const WIDTH = 2500;
const HEIGHT = 843;

export function richMenuImagePath() {
  return path.join(process.cwd(), "public", "line", "rich-menu.png");
}

export async function ensureRichMenuImage() {
  const outPath = richMenuImagePath();
  try {
    await access(outPath);
    return outPath;
  } catch {
    // generate below
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="1250" height="${HEIGHT}" fill="#0f6b57"/>
  <rect x="1250" width="1250" height="${HEIGHT}" fill="#14856c"/>
  <line x1="1250" y1="60" x2="1250" y2="${HEIGHT - 60}" stroke="#ffffff" stroke-opacity="0.25" stroke-width="4"/>
  <text x="625" y="380" text-anchor="middle" fill="#ffffff" font-size="96" font-family="Microsoft JhengHei, Noto Sans TC, Arial, sans-serif" font-weight="700">綁定</text>
  <text x="625" y="500" text-anchor="middle" fill="#d7e3dc" font-size="42" font-family="Microsoft JhengHei, Noto Sans TC, Arial, sans-serif">門牌／戶號／末三碼</text>
  <text x="1875" y="380" text-anchor="middle" fill="#ffffff" font-size="96" font-family="Microsoft JhengHei, Noto Sans TC, Arial, sans-serif" font-weight="700">我的包裹</text>
  <text x="1875" y="500" text-anchor="middle" fill="#d7e3dc" font-size="42" font-family="Microsoft JhengHei, Noto Sans TC, Arial, sans-serif">開啟網頁查看</text>
</svg>`;

  await mkdir(path.dirname(outPath), { recursive: true });
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(outPath, buffer);
  return outPath;
}

export async function setupDefaultRichMenu(accessToken: string) {
  const { readFile } = await import("fs/promises");
  const imagePath = await ensureRichMenuImage();
  const image = await readFile(imagePath);

  const client = new messagingApi.MessagingApiClient({
    channelAccessToken: accessToken,
  });
  const blobClient = new messagingApi.MessagingApiBlobClient({
    channelAccessToken: accessToken,
  });

  const existing = await client.getRichMenuList();
  for (const menu of existing.richmenus ?? []) {
    if (menu.name === "好生活社區主選單") {
      await client.deleteRichMenu(menu.richMenuId);
    }
  }

  const portal = appBaseUrl() || "https://good-life-rouge.vercel.app";

  const { richMenuId } = await client.createRichMenu({
    size: { width: WIDTH, height: HEIGHT },
    selected: true,
    name: "好生活社區主選單",
    chatBarText: "功能選單",
    areas: [
      {
        bounds: { x: 0, y: 0, width: 1250, height: HEIGHT },
        action: { type: "message", label: "綁定", text: "綁定" },
      },
      {
        bounds: { x: 1250, y: 0, width: 1250, height: HEIGHT },
        action: {
          type: "uri",
          label: "我的包裹",
          uri: portal,
        },
      },
    ],
  });

  await blobClient.setRichMenuImage(
    richMenuId,
    new Blob([new Uint8Array(image)], { type: "image/png" }),
  );
  await client.setDefaultRichMenu(richMenuId);

  return { richMenuId, imagePath };
}

export function getLineSetupStatus() {
  const secret = Boolean(process.env.LINE_CHANNEL_SECRET);
  const token = Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN);
  const baseUrl = appBaseUrl() || null;
  const https = Boolean(baseUrl?.startsWith("https://"));
  const database = Boolean(
    process.env.DATABASE_URL?.startsWith("postgresql://") ||
      process.env.DATABASE_URL?.startsWith("postgres://"),
  );

  return {
    secret,
    token,
    baseUrl,
    https,
    configured: secret && token,
    webhookUrl: baseUrl ? `${baseUrl}/api/line/webhook` : null,
    readyForPhotos: https && isBlobStorageEnabled(),
    database,
    blob: isBlobStorageEnabled(),
    vercel: Boolean(process.env.VERCEL),
  };
}
