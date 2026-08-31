import { readFileSync, existsSync } from "fs";
import path from "path";
import { messagingApi } from "@line/bot-sdk";
import { ensureRichMenuImage, setupDefaultRichMenu } from "../src/lib/line-rich-menu";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvFile();
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.error("請先在 .env 設定 LINE_CHANNEL_ACCESS_TOKEN");
    process.exit(1);
  }

  // 預先產生圖片，方便確認
  await ensureRichMenuImage();
  const result = await setupDefaultRichMenu(token);
  console.log("圖文選單已建立並設為預設");
  console.log(`richMenuId: ${result.richMenuId}`);
  console.log(`image: ${path.relative(process.cwd(), result.imagePath)}`);

  // 確認 API 可用
  const client = new messagingApi.MessagingApiClient({
    channelAccessToken: token,
  });
  const current = await client.getDefaultRichMenuId();
  console.log(`目前預設選單：${current.richMenuId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
