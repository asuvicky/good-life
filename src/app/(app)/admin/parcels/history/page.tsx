import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDateTime, parcelTypeLabel } from "@/lib/format";
import { formatParcelNumber } from "@/lib/parcel-number";

export default async function ParcelHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const queryAsNumber = Number.parseInt(query, 10);

  const parcels = await prisma.parcel.findMany({
    where: {
      status: "CLAIMED",
      ...(query
        ? {
            OR: [
              { household: { householdNumber: { contains: query } } },
              ...(Number.isFinite(queryAsNumber)
                ? [{ parcelNumber: queryAsNumber }]
                : []),
            ],
          }
        : {}),
    },
    include: {
      household: true,
      createdBy: true,
      claimedBy: true,
    },
    orderBy: { claimedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">領取紀錄</h1>
          <p className="mt-1 text-[var(--muted)]">
            每筆皆記錄編號、新增／領取時間與處理的管理員（編號領取後可再分配給新包裹）
          </p>
        </div>
        <Link
          href="/admin/parcels"
          className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 hover:bg-[var(--bg)]"
        >
          回到未領取
        </Link>
      </div>

      <form className="mt-6 flex gap-2" action="/admin/parcels/history" method="get">
        <input
          name="q"
          defaultValue={query}
          placeholder="輸入戶號或包裹編號搜尋"
          className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--brand)]"
        />
        <button className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 hover:bg-[var(--bg)]">
          搜尋
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
        {parcels.length === 0 ? (
          <p className="p-8 text-center text-[var(--muted)]">尚無領取紀錄</p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[var(--bg)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">編號</th>
                <th className="px-4 py-3 font-medium">類型</th>
                <th className="px-4 py-3 font-medium">住戶</th>
                <th className="px-4 py-3 font-medium">新增</th>
                <th className="px-4 py-3 font-medium">領取</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((p) => (
                <tr key={p.id} className="border-t border-[var(--line)]">
                  <td className="px-4 py-3 font-semibold">
                    {formatParcelNumber(p.parcelNumber)}
                  </td>
                  <td className="px-4 py-3">{parcelTypeLabel(p.type)}</td>
                  <td className="px-4 py-3">
                    {p.household.doorplate}　戶號 {p.household.householdNumber}
                  </td>
                  <td className="px-4 py-3">
                    {formatDateTime(p.createdAt)}
                    <div className="text-[var(--muted)]">{p.createdBy.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    {p.claimedAt ? formatDateTime(p.claimedAt) : "—"}
                    <div className="text-[var(--muted)]">{p.claimedBy?.name ?? "—"}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
