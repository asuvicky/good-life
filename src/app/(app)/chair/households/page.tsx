import { prisma } from "@/lib/db";
import { deleteHouseholdAction, upsertHouseholdAction } from "@/app/actions";
import { formatDateTime } from "@/lib/format";

export default async function HouseholdsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; edit?: string }>;
}) {
  const { error, ok, edit } = await searchParams;
  const households = await prisma.household.findMany({
    include: { _count: { select: { lineBindings: true, parcels: true } } },
    orderBy: [{ doorplate: "asc" }, { householdNumber: "asc" }],
  });
  const editing = households.find((h) => h.id === edit);

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <section>
        <h1 className="text-2xl font-semibold">{editing ? "編輯住戶" : "新增住戶"}</h1>
        <p className="mt-1 text-[var(--muted)]">
          住戶需輸入與此處完全相同的門牌與戶號，才能綁定 LINE
        </p>
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {ok && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            已儲存
          </p>
        )}
        <form action={upsertHouseholdAction} className="mt-5 space-y-4 rounded-2xl border border-[var(--line)] bg-white p-5">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">門牌號碼</span>
            <input
              name="doorplate"
              required
              defaultValue={editing?.doorplate ?? ""}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">戶號</span>
            <input
              name="householdNumber"
              required
              defaultValue={editing?.householdNumber ?? ""}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">住戶姓名（選填）</span>
            <input
              name="residentName"
              defaultValue={editing?.residentName ?? ""}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">備註（選填）</span>
            <input
              name="note"
              defaultValue={editing?.note ?? ""}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5"
            />
          </label>
          <button className="w-full rounded-xl bg-[var(--brand)] py-2.5 text-white hover:bg-[var(--brand-2)]">
            {editing ? "更新" : "新增"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold">住戶名單</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[var(--bg)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">門牌</th>
                <th className="px-4 py-3 font-medium">戶號</th>
                <th className="px-4 py-3 font-medium">姓名</th>
                <th className="px-4 py-3 font-medium">LINE</th>
                <th className="px-4 py-3 font-medium">更新</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {households.map((h) => (
                <tr key={h.id} className="border-t border-[var(--line)]">
                  <td className="px-4 py-3">{h.doorplate}</td>
                  <td className="px-4 py-3">{h.householdNumber}</td>
                  <td className="px-4 py-3">{h.residentName || "—"}</td>
                  <td className="px-4 py-3">{h._count.lineBindings} 人</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{formatDateTime(h.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a className="text-[var(--brand)]" href={`/chair/households?edit=${h.id}`}>
                        編輯
                      </a>
                      <form action={deleteHouseholdAction}>
                        <input type="hidden" name="id" value={h.id} />
                        <button className="text-red-600">刪除</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
