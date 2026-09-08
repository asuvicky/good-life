import { createHmac, timingSafeEqual } from "crypto";
import { messagingApi } from "@line/bot-sdk";
import type { Parcel, Household } from "@prisma/client";
import type { ParcelType } from "@/lib/types";
import { appBaseUrl } from "@/lib/app-url";

export type LineMessage = {
  type: "text";
  text: string;
} | {
  type: "image";
  originalContentUrl: string;
  previewImageUrl: string;
};

function channelSecret() {
  return process.env.LINE_CHANNEL_SECRET || "";
}

function accessToken() {
  return process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
}

export function isLineConfigured() {
  return Boolean(channelSecret() && accessToken());
}

export function verifyLineSignature(body: string, signature: string | null) {
  const secret = channelSecret();
  if (!secret || !signature) return false;
  const hmac = createHmac("sha256", secret).update(body).digest("base64");
  const a = Buffer.from(hmac);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function client() {
  return new messagingApi.MessagingApiClient({
    channelAccessToken: accessToken(),
  });
}

export type LineEvent = {
  type: string;
  source?: { userId?: string; type?: string };
  replyToken?: string;
  message?: { type: string; text?: string };
  postback?: { data?: string };
};

export async function replyText(replyToken: string, text: string) {
  if (!isLineConfigured()) return;
  await client().replyMessage({
    replyToken,
    messages: [{ type: "text", text }],
  });
}

export async function replyWelcome(replyToken: string) {
  if (!isLineConfigured()) return;
  await client().replyMessage({
    replyToken,
    messages: [
      {
        type: "text",
        text: welcomeText(),
        quickReply: welcomeQuickReply(),
      } as never,
    ],
  });
}

export async function replyMessages(
  replyToken: string,
  messages: LineMessage[],
) {
  if (!isLineConfigured()) return;
  await client().replyMessage({ replyToken, messages: messages as never });
}

export async function pushMessages(
  lineUserId: string,
  messages: LineMessage[],
) {
  if (!isLineConfigured()) return;
  await client().pushMessage({
    to: lineUserId,
    messages: messages as never,
  });
}

function typeLabel(type: string) {
  return type === "PARCEL" ? "包裹" : "郵件";
}

export function welcomeText() {
  return [
    "歡迎加入社區官方 LINE。",
    "",
    "請先綁定住戶資料，才能收到包裹／郵件通知。",
    "點下方「綁定」，或直接輸入：綁定",
    "",
    "綁定後可點「我的包裹」開啟網頁查看包裹。",
  ].join("\n");
}

export function welcomeQuickReply() {
  const uri = appBaseUrl();
  return {
    items: [
      {
        type: "action" as const,
        action: { type: "message" as const, label: "綁定", text: "綁定" },
      },
      {
        type: "action" as const,
        action: uri
          ? {
              type: "uri" as const,
              label: "我的包裹",
              uri,
            }
          : {
              type: "message" as const,
              label: "我的包裹",
              text: "我的包裹",
            },
      },
    ],
  };
}

export function parcelNotifyMessages(opts: {
  type: ParcelType;
  doorplate: string;
  householdNumber: string;
  photoUrl?: string;
}): LineMessage[] {
  const kind = typeLabel(opts.type);
  const text = [
    `您有新的${kind}已送達管理室。`,
    `門牌：${opts.doorplate}`,
    `戶號：${opts.householdNumber}`,
    "",
    "請於管理室服務時間前往領取。",
    "點選單「我的包裹」可開啟網頁查看詳情。",
  ].join("\n");

  const messages: LineMessage[] = [{ type: "text", text }];

  if (opts.photoUrl?.startsWith("https://")) {
    messages.push({
      type: "image",
      originalContentUrl: opts.photoUrl,
      previewImageUrl: opts.photoUrl,
    });
  }

  return messages;
}

export function myParcelsText(
  parcels: (Parcel & { household: Household })[],
) {
  if (parcels.length === 0) {
    return "目前沒有尚未領取的包裹或郵件。";
  }

  const lines = [`尚未領取共 ${parcels.length} 件：`, ""];
  parcels.forEach((p, i) => {
    const when = p.createdAt.toLocaleString("zh-TW", { hour12: false });
    lines.push(
      `${i + 1}. ${typeLabel(p.type)}｜${p.household.doorplate} ${p.household.householdNumber}`,
    );
    lines.push(`   送達時間：${when}`);
  });
  lines.push("", "請於管理室服務時間前往領取。");
  return lines.join("\n");
}
