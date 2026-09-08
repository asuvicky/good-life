import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");

  if (!username || !password) {
    return NextResponse.redirect(new URL("/staff?error=empty", request.url), 303);
  }

  const staff = await prisma.staff.findUnique({ where: { username } });
  if (!staff || !(await bcrypt.compare(password, staff.passwordHash))) {
    return NextResponse.redirect(new URL("/staff?error=invalid", request.url), 303);
  }

  const session = await getSession();
  session.residentId = undefined;
  session.residentUsername = undefined;
  session.householdId = undefined;
  session.staffId = staff.id;
  session.name = staff.name;
  session.username = staff.username;
  session.role = staff.role;
  await session.save();

  const dest = staff.role === "CHAIR" ? "/chair/households" : "/admin/parcels";
  return NextResponse.redirect(new URL(dest, request.url), 303);
}
