import { prisma } from "@/lib/db";
import { NewParcelForm } from "./new-parcel-form";
import {
  allocateParcelNumber,
  formatParcelNumber,
} from "@/lib/parcel-number";

export default async function NewParcelPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [households, nextNumber] = await Promise.all([
    prisma.household.findMany({
      select: { doorplate: true, householdNumber: true },
      orderBy: [{ doorplate: "asc" }, { householdNumber: "asc" }],
    }),
    allocateParcelNumber(),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">新增包裹</h1>
      <p className="mt-1 text-[var(--muted)]">
        拍照上傳，勾選包裹或郵件，再選擇門牌與戶號；編號會自動產生，領取後釋出可再使用
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <NewParcelForm
        households={households}
        nextNumberLabel={formatParcelNumber(nextNumber)}
      />
    </div>
  );
}
