"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { saveUpload, publicFileUrl } from "@/lib/upload";
import { isLineConfigured, parcelNotifyMessages, pushMessages } from "@/lib/line";

export async function createParcelAction(formData: FormData) {
  const session = await requireStaff();
  if (!session?.staffId) redirect("/");

  const type = String(formData.get("type") || "");
  const doorplate = String(formData.get("doorplate") || "").trim();
  const householdNumber = String(formData.get("householdNumber") || "").trim();
  const photo = formData.get("photo");

  if (type !== "PARCEL" && type !== "MAIL") {
    redirect("/admin/parcels/new?error=" + encodeURIComponent("請勾選包裹或郵件"));
  }
  if (!doorplate || !householdNumber) {
    redirect("/admin/parcels/new?error=" + encodeURIComponent("請選擇門牌並填寫戶號"));
  }

  const household = await prisma.household.findUnique({
    where: {
      doorplate_householdNumber: { doorplate, householdNumber },
    },
    include: { lineBindings: true },
  });

  if (!household) {
    redirect(
      "/admin/parcels/new?error=" +
        encodeURIComponent("找不到此門牌與戶號，請向主委確認住戶名單"),
    );
  }

  let photoPath = "";
  try {
    photoPath = await saveUpload(photo as File);
  } catch (e) {
    const message = e instanceof Error ? e.message : "照片上傳失敗";
    redirect("/admin/parcels/new?error=" + encodeURIComponent(message));
  }

  const parcel = await prisma.parcel.create({
    data: {
      householdId: household.id,
      type,
      photoPath,
      createdById: session.staffId,
    },
  });

  const photoUrl = publicFileUrl(parcel.photoPath);
  const messages = parcelNotifyMessages({
    type: type as "PARCEL" | "MAIL",
    doorplate: household.doorplate,
    householdNumber: household.householdNumber,
    photoUrl,
  });

  if (isLineConfigured()) {
    await Promise.allSettled(
      household.lineBindings.map((b) => pushMessages(b.lineUserId, messages)),
    );
  }

  revalidatePath("/admin/parcels");
  redirect("/admin/parcels?ok=created");
}

export async function claimParcelAction(formData: FormData) {
  const session = await requireStaff();
  if (!session?.staffId) redirect("/");

  const id = String(formData.get("id") || "");
  const q = String(formData.get("q") || "");
  if (!id) redirect("/admin/parcels");

  await prisma.parcel.update({
    where: { id },
    data: {
      status: "CLAIMED",
      claimedAt: new Date(),
      claimedById: session.staffId,
    },
  });

  revalidatePath("/admin/parcels");
  const dest = q
    ? `/admin/parcels?q=${encodeURIComponent(q)}&ok=claimed`
    : "/admin/parcels?ok=claimed";
  redirect(dest);
}

export async function upsertHouseholdAction(formData: FormData) {
  const session = await requireStaff(["CHAIR"]);
  if (!session?.staffId) redirect("/");

  const id = String(formData.get("id") || "");
  const doorplate = String(formData.get("doorplate") || "").trim();
  const householdNumber = String(formData.get("householdNumber") || "").trim();
  const phoneLast3Raw = String(formData.get("phoneLast3") || "").trim();
  const phoneLast3 = phoneLast3Raw.replace(/\D/g, "").slice(-3);
  const residentName = String(formData.get("residentName") || "").trim();
  const note = String(formData.get("note") || "").trim();

  if (!doorplate || !householdNumber) {
    redirect("/chair/households?error=" + encodeURIComponent("門牌與戶號為必填"));
  }
  if (phoneLast3.length !== 3) {
    redirect(
      "/chair/households?error=" +
        encodeURIComponent("電話末三碼需為 3 位數字"),
    );
  }

  const data = {
    doorplate,
    householdNumber,
    phoneLast3,
    residentName: residentName || null,
    note: note || null,
  };

  try {
    if (id) {
      await prisma.household.update({ where: { id }, data });
    } else {
      await prisma.household.create({ data });
    }
  } catch {
    redirect(
      "/chair/households?error=" +
        encodeURIComponent("此門牌與戶號已存在，或資料無法儲存"),
    );
  }

  revalidatePath("/chair/households");
  redirect("/chair/households?ok=saved");
}

export async function deleteHouseholdAction(formData: FormData) {
  const session = await requireStaff(["CHAIR"]);
  if (!session?.staffId) redirect("/");

  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.household.delete({ where: { id } }).catch(() => undefined);
  }
  revalidatePath("/chair/households");
  redirect("/chair/households?ok=deleted");
}

export async function upsertStaffAction(formData: FormData) {
  const session = await requireStaff(["CHAIR"]);
  if (!session?.staffId) redirect("/");

  const bcrypt = (await import("bcryptjs")).default;
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "ADMIN");

  if (!name || !username) {
    redirect("/chair/staff?error=" + encodeURIComponent("姓名與帳號為必填"));
  }
  if (!id && !password) {
    redirect("/chair/staff?error=" + encodeURIComponent("新增管理員需設定密碼"));
  }
  if (role !== "ADMIN" && role !== "CHAIR") {
    redirect("/chair/staff?error=" + encodeURIComponent("角色不正確"));
  }

  try {
    if (id) {
      await prisma.staff.update({
        where: { id },
        data: {
          name,
          username,
          role,
          ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
        },
      });
    } else {
      await prisma.staff.create({
        data: {
          name,
          username,
          role,
          passwordHash: await bcrypt.hash(password, 10),
        },
      });
    }
  } catch {
    redirect("/chair/staff?error=" + encodeURIComponent("帳號已存在，或資料無法儲存"));
  }

  revalidatePath("/chair/staff");
  redirect("/chair/staff?ok=saved");
}

export async function deleteStaffAction(formData: FormData) {
  const session = await requireStaff(["CHAIR"]);
  if (!session?.staffId) redirect("/");

  const id = String(formData.get("id") || "");
  if (id && id !== session.staffId) {
    await prisma.staff.delete({ where: { id } }).catch(() => undefined);
  }
  revalidatePath("/chair/staff");
  redirect("/chair/staff?ok=deleted");
}

export async function setupLineRichMenuAction() {
  const session = await requireStaff(["CHAIR"]);
  if (!session?.staffId) redirect("/");

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    redirect(
      "/chair/line?error=" +
        encodeURIComponent("尚未設定 LINE_CHANNEL_ACCESS_TOKEN"),
    );
  }

  let richMenuId = "";
  try {
    const { setupDefaultRichMenu } = await import("@/lib/line-rich-menu");
    const result = await setupDefaultRichMenu(token);
    richMenuId = result.richMenuId;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "建立圖文選單失敗";
    redirect("/chair/line?error=" + encodeURIComponent(message));
  }

  revalidatePath("/chair/line");
  redirect(`/chair/line?ok=richmenu&id=${encodeURIComponent(richMenuId)}`);
}

export async function clearLineRichMenuAction() {
  const session = await requireStaff(["CHAIR"]);
  if (!session?.staffId) redirect("/");

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    redirect(
      "/chair/line?error=" +
        encodeURIComponent("尚未設定 LINE_CHANNEL_ACCESS_TOKEN"),
    );
  }

  let deleted = 0;
  try {
    const { clearApiRichMenus } = await import("@/lib/line-rich-menu");
    const result = await clearApiRichMenus(token);
    deleted = result.deleted;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "清除圖文選單失敗";
    redirect("/chair/line?error=" + encodeURIComponent(message));
  }

  revalidatePath("/chair/line");
  redirect(`/chair/line?ok=cleared&count=${deleted}`);
}
