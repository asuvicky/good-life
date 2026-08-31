import Link from "next/link";
import { prisma } from "@/lib/db";
import { ClaimCheckbox } from "./claim-checkbox";
import { formatDateTime, parcelTypeLabel } from "@/lib/format";

export default async function ParcelsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ok?: string }>;
}) {
  const { q = "", ok } = await searchParams;
  const query = q.trim();

  const parcels = await prisma.parcel.findMany({
    where: {
      status: "PENDING",
      ...(query
        ? { household: { householdNumber: { contains: query } } }
        : {}),
    },
    include: {
      household: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">未領取包裹</h1>
          <p className="mt-1 text-[var(--muted)]">輸入戶號即可搜尋，領取時勾選確認</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/parcels/history"
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 hover:bg-[var(--bg)]"
          >
            領取紀錄
          </Link>
          <Link
            href="/admin/parcels/new"
            className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-white hover:bg-[var(--brand-2)]"
          >
            新增包裹
          </Link>
        </div>
      </div>

      {ok === "created" && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          已新增，並嘗試通知已綁定的住戶 LINE。
        </p>
      )}
      {ok === "claimed" && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          已標記為領取。
        </p>
      )}

      <form className="mt-6 flex gap-2" action="/admin/parcels" method="get">
        <input
          name="q"
          defaultValue={query}
          placeholder="輸入戶號搜尋"
          className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--brand)]"
        />
        <button className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 hover:bg-[var(--bg)]">
          搜尋
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
        {parcels.length === 0 ? (
          <p className="p-8 text-center text-[var(--muted)]">目前沒有符合條件的未領取包裹</p>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {parcels.map((p) => (
              <article key={p.id} className="grid gap-4 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.photoPath}
                  alt=""
                  className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-[120px]"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--bg)] px-2.5 py-0.5 text-sm">
                      {parcelTypeLabel(p.type)}
                    </span>
                    <span className="font-medium">
                      {p.household.doorplate}　戶號 {p.household.householdNumber}
                    </span>
                    {p.household.residentName && (
                      <span className="text-sm text-[var(--muted)]">
                        {p.household.residentName}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    新增：{formatDateTime(p.createdAt)}　管理員 {p.createdBy.name}
                  </p>
                </div>
                <ClaimCheckbox id={p.id} q={query} />
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
