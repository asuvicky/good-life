"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function registerResidentAction(formData: FormData) {
  const doorplate = String(formData.get("doorplate") || "").trim();
  const householdNumber = String(formData.get("householdNumber") || "").trim();
  const phoneLast3 = String(formData.get("phoneLast3") || "")
    .replace(/\D/g, "")
    .slice(-3);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const password2 = String(formData.get("password2") || "");

  if (!doorplate || !householdNumber || !username || !password) {
    redirect("/register?error=" + encodeURIComponent("請完整填寫所有必填欄位"));
  }
  if (phoneLast3.length !== 3) {
    redirect("/register?error=" + encodeURIComponent("電話末三碼需為 3 位數字"));
  }
  if (password.length < 6) {
    redirect("/register?error=" + encodeURIComponent("密碼至少 6 個字元"));
  }
  if (password !== password2) {
    redirect("/register?error=" + encodeURIComponent("兩次密碼不一致"));
  }

  const household = await prisma.household.findUnique({
    where: {
      doorplate_householdNumber: { doorplate, householdNumber },
    },
  });

  if (!household || household.phoneLast3 !== phoneLast3) {
    redirect(
      "/register?error=" +
        encodeURIComponent("住戶資料不符，請確認門牌、戶號與電話末三碼"),
    );
  }

  const exists = await prisma.resident.findUnique({ where: { username } });
  if (exists) {
    redirect("/register?error=" + encodeURIComponent("此帳號已被使用，請換一個"));
  }

  const resident = await prisma.resident.create({
    data: {
      username,
      passwordHash: await bcrypt.hash(password, 10),
      householdId: household.id,
    },
  });

  const session = await getSession();
  session.staffId = undefined;
  session.name = undefined;
  session.username = undefined;
  session.role = undefined;
  session.residentId = resident.id;
  session.residentUsername = resident.username;
  session.householdId = household.id;
  await session.save();

  redirect("/my/parcels?ok=registered");
}

export async function loginResidentAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    redirect("/?error=empty");
  }

  const resident = await prisma.resident.findUnique({ where: { username } });
  if (!resident || !(await bcrypt.compare(password, resident.passwordHash))) {
    redirect("/?error=invalid");
  }

  const session = await getSession();
  session.staffId = undefined;
  session.name = undefined;
  session.username = undefined;
  session.role = undefined;
  session.residentId = resident.id;
  session.residentUsername = resident.username;
  session.householdId = resident.householdId;
  await session.save();

  redirect("/my/parcels");
}

export async function logoutResidentAction() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
