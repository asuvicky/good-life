import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const WIDTH = 2500;
const HEIGHT = 843;

async function main() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="1250" height="${HEIGHT}" fill="#0f6b57"/>
  <rect x="1250" width="1250" height="${HEIGHT}" fill="#14856c"/>
  <line x1="1250" y1="60" x2="1250" y2="${HEIGHT - 60}" stroke="#ffffff" stroke-opacity="0.25" stroke-width="4"/>
  <text x="625" y="380" text-anchor="middle" fill="#ffffff" font-size="96" font-family="Microsoft JhengHei, Noto Sans TC, Arial, sans-serif" font-weight="700">綁定</text>
  <text x="625" y="500" text-anchor="middle" fill="#d7e3dc" font-size="42" font-family="Microsoft JhengHei, Noto Sans TC, Arial, sans-serif">門牌與戶號</text>
  <text x="1875" y="380" text-anchor="middle" fill="#ffffff" font-size="96" font-family="Microsoft JhengHei, Noto Sans TC, Arial, sans-serif" font-weight="700">我的包裹</text>
  <text x="1875" y="500" text-anchor="middle" fill="#d7e3dc" font-size="42" font-family="Microsoft JhengHei, Noto Sans TC, Arial, sans-serif">未領取清單</text>
</svg>`;

  const outDir = path.join(process.cwd(), "public", "line");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "rich-menu.png");
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`已產生圖文選單圖片：${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
