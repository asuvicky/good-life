import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  isLineConfigured,
  myParcelsText,
  replyMessages,
  replyText,
  replyWelcome,
  verifyLineSignature,
  type LineEvent,
} from "@/lib/line";

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
      "請輸入「綁定」開始綁定住戶，或輸入「我的包裹」查看尚未領取清單。",
    );
    return;
  }

  const normalized = text.replace(/\s+/g, "");
  if (["綁定", "bind", "開始綁定"].includes(normalized.toLowerCase())) {
    await prisma.lineConversation.upsert({
      where: { lineUserId: userId },
      update: { step: "await_doorplate", doorplate: null },
      create: { lineUserId: userId, step: "await_doorplate" },
    });
    await replyText(
      replyToken,
      "請輸入門牌號碼（需與主委登錄的資料完全相同，例如：1號）。",
    );
    return;
  }

  if (["我的包裹", "包裹", "未領取"].includes(normalized)) {
    await sendMyParcels(userId, replyToken);
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
    const doorplate = convo.doorplate || "";
    const household = await prisma.household.findUnique({
      where: {
        doorplate_householdNumber: {
          doorplate,
          householdNumber: text,
        },
      },
    });

    if (!household) {
      await prisma.lineConversation.update({
        where: { lineUserId: userId },
        data: { step: "idle", doorplate: null },
      });
      await replyText(
        replyToken,
        `找不到門牌「${doorplate}」、戶號「${text}」的住戶資料。請向主委確認名單後，再輸入「綁定」。`,
      );
      return;
    }

    await prisma.lineBinding.upsert({
      where: { lineUserId: userId },
      update: { householdId: household.id },
      create: { lineUserId: userId, householdId: household.id },
    });
    await prisma.lineConversation.update({
      where: { lineUserId: userId },
      data: { step: "idle", doorplate: null },
    });
    await replyText(
      replyToken,
      `綁定成功：${household.doorplate}／戶號 ${household.householdNumber}${household.residentName ? `（${household.residentName}）` : ""}。\n之後有新包裹或郵件會通知您。`,
    );
    return;
  }

  await replyText(
    replyToken,
    "可用指令：\n・綁定　綁定門牌與戶號\n・我的包裹　查看尚未領取的包裹",
  );
}

async function sendMyParcels(lineUserId: string, replyToken: string) {
  const binding = await prisma.lineBinding.findUnique({
    where: { lineUserId },
    include: {
      household: {
        include: {
          parcels: {
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
            include: { household: true },
          },
        },
      },
    },
  });

  if (!binding) {
    await replyText(
      replyToken,
      "尚未綁定住戶。請先輸入「綁定」，並填入主委登錄的門牌與戶號。",
    );
    return;
  }

  await replyMessages(replyToken, [
    { type: "text", text: myParcelsText(binding.household.parcels) },
  ]);
}
