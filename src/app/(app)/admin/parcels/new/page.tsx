import { prisma } from "@/lib/db";
import { createParcelAction } from "@/app/actions";
import { DoorplateHouseholdSelect } from "./doorplate-household-select";

export default async function NewParcelPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const households = await prisma.household.findMany({
    select: { doorplate: true, householdNumber: true },
    orderBy: [{ doorplate: "asc" }, { householdNumber: "asc" }],
  });

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">新增包裹</h1>
      <p className="mt-1 text-[var(--muted)]">
        拍照上傳，勾選包裹或郵件，再選擇門牌與戶號
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <form
        action={createParcelAction}
        className="mt-6 space-y-5 rounded-2xl border border-[var(--line)] bg-white p-5"
      >
        <label className="block">
          <span className="mb-1 block text-sm text-[var(--muted)]">包裹照片</span>
          <input
            name="photo"
            type="file"
            accept="image/*"
            capture="environment"
            required
            className="w-full rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)] px-3 py-4"
          />
        </label>

        <fieldset>
          <legend className="mb-2 text-sm text-[var(--muted)]">類型</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-2.5 has-[:checked]:border-[var(--brand)] has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="type"
                value="PARCEL"
                defaultChecked
                className="accent-[var(--brand)]"
              />
              包裹
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-2.5 has-[:checked]:border-[var(--brand)] has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="type"
                value="MAIL"
                className="accent-[var(--brand)]"
              />
              郵件
            </label>
          </div>
        </fieldset>

        <DoorplateHouseholdSelect households={households} />

        <button className="w-full rounded-xl bg-[var(--brand)] py-2.5 font-medium text-white hover:bg-[var(--brand-2)]">
          儲存並通知住戶
        </button>
      </form>
    </div>
  );
}
