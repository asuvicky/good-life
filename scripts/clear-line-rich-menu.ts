/**
 * 清除 Messaging API 圖文選單（改由 OA Manager 管理）
 * 用法：npx tsx scripts/clear-line-rich-menu.ts <CHANNEL_ACCESS_TOKEN>
 */
import { messagingApi } from "@line/bot-sdk";

async function main() {
  const token =
    process.argv[2] || process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  if (!token || token.length < 20) {
    console.error(
      "請提供完整 Channel Access Token：\nnpx tsx scripts/clear-line-rich-menu.ts 你的token",
    );
    process.exit(1);
  }

  const client = new messagingApi.MessagingApiClient({
    channelAccessToken: token,
  });

  try {
    await client.cancelDefaultRichMenu();
    console.log("已取消預設圖文選單");
  } catch (e) {
    console.log("取消預設選單：", e instanceof Error ? e.message : e);
  }

  const existing = await client.getRichMenuList();
  const menus = existing.richmenus ?? [];
  console.log(`目前 API 選單數量：${menus.length}`);
  for (const menu of menus) {
    console.log(`- 刪除 ${menu.name} (${menu.richMenuId})`);
    await client.deleteRichMenu(menu.richMenuId);
  }
  console.log("完成。請到 LINE Official Account Manager 確認選單已發布，並用手機重新開啟聊天室。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
