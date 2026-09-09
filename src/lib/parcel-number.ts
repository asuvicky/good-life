import { prisma } from "@/lib/db";

/** 找出目前未領取包裹未占用的最小正整數編號（領取後即釋出） */
export async function allocateParcelNumber() {
  const pending = await prisma.parcel.findMany({
    where: { status: "PENDING", parcelNumber: { not: null } },
    select: { parcelNumber: true },
    orderBy: { parcelNumber: "asc" },
  });

  const used = new Set(
    pending
      .map((p) => p.parcelNumber)
      .filter((n): n is number => typeof n === "number"),
  );

  let next = 1;
  while (used.has(next)) {
    next += 1;
  }
  return next;
}

export function formatParcelNumber(n: number | null | undefined) {
  if (n == null) return "—";
  return String(n).padStart(3, "0");
}
