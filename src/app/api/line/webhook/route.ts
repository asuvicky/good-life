import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  isLineConfigured,
  replyMessages,
  replyText,
  replyWelcome,
  verifyLineSignature,
  type LineEvent,
} from "@/lib/line";
import { appBaseUrl } from "@/lib/app-url";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, webhook: true });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!isLineConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!verifyLineSignature(body, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as { events?: LineEvent[] };
  const events = payload.events ?? [];

  await Promise.all(events.map((event) => handleEvent(event)));
  return NextResponse.json({ ok: true });
}

function portalUrl() {
  return appBaseUrl() || "https://good-life-rouge.vercel.app";
}

async function handleEvent(event: LineEvent) {
  const userId = event.source?.userId;
  const replyToken = event.replyToken;
  if (!userId || !replyToken) return;

  if (event.type === "follow") {
    await replyWelcome(replyToken);
    return;
  }

  const text =
    event.type === "message" && event.message?.type === "text"
      ? (event.message.text || "").trim()
      : event.type === "postback"
        ? (event.postback?.data || "").trim()
        : "";

  if (!text) {
    await replyText(
      replyToken,
      "請輸入「綁定」開始綁定住戶，或點選單「我的包裹」開啟網頁查看包裹。",
    );
    return;
  }

  const normalized = text.replace(/\s+/g, "");
  if (["綁定", "bind", "開始綁定"].includes(normalized.toLowerCase())) {
    await prisma.lineConversation.upsert({
      where: { lineUserId: userId },
      update: {
        step: "await_doorplate",
        doorplate: null,
        householdNumber: null,
      },
      create: { lineUserId: userId, step: "await_doorplate" },
    });
    await replyText(
      replyToken,
      "請輸入門牌號碼（例如：407、409、411）",
    );
    return;
  }

  if (["我的包裹", "包裹", "未領取"].includes(normalized)) {
    await replyMessages(replyToken, [
      {
        type: "text",
        text: `請由此開啟網頁查看／註冊帳號：\n${portalUrl()}`,
      },
    ]);
    return;
  }

  const convo = await prisma.lineConversation.findUnique({
    where: { lineUserId: userId },
  });

  if (convo?.step === "await_doorplate") {
    await prisma.lineConversation.update({
      where: { lineUserId: userId },
      data: { step: "await_household", doorplate: text },
    });
    await replyText(replyToken, `門牌「${text}」已記錄。請接著輸入戶號。`);
    return;
  }

  if (convo?.step === "await_household") {
    await prisma.lineConversation.update({
      where: { lineUserId: userId },
      data: { step: "await_phone_last3", householdNumber: text },
    });
    await replyText(replyToken, "請輸入電話末三碼。");
    return;
  }

  if (convo?.step === "await_phone_last3") {
    const doorplate = convo.doorplate || "";
    const householdNumber = convo.householdNumber || "";
    const phoneLast3 = text.replace(/\D/g, "").slice(-3);

    if (phoneLast3.length !== 3) {
      await replyText(replyToken, "電話末三碼需為 3 位數字，請重新輸入。");
      return;
    }

    const household = await prisma.household.findUnique({
      where: {
        doorplate_householdNumber: {
          doorplate,
          householdNumber,
        },
      },
    });

    await prisma.lineConversation.update({
      where: { lineUserId: userId },
      data: { step: "idle", doorplate: null, householdNumber: null },
    });

    if (!household) {
      await replyText(
        replyToken,
        `找不到門牌「${doorplate}」、戶號「${householdNumber}」的住戶資料。請向主委確認名單後，再輸入「綁定」。`,
      );
      return;
    }

    if (household.phoneLast3 !== phoneLast3) {
      await replyText(
        replyToken,
        "電話末三碼與住戶資料不符，請確認後再輸入「綁定」。",
      );
      return;
    }

    await prisma.lineBinding.upsert({
      where: { lineUserId: userId },
      update: { householdId: household.id },
      create: { lineUserId: userId, householdId: household.id },
    });

    await replyText(
      replyToken,
      [
        `綁定成功：${household.doorplate}／戶號 ${household.householdNumber}${household.residentName ? `（${household.residentName}）` : ""}。`,
        "之後有新包裹或郵件會通知您。",
        "",
        `查看包裹請點選單「我的包裹」，或開啟：${portalUrl()}`,
      ].join("\n"),
    );
    return;
  }

  await replyText(
    replyToken,
    "可用指令：\n・綁定　綁定門牌、戶號與電話末三碼\n・點選單「我的包裹」開啟網頁查看包裹",
  );
}
