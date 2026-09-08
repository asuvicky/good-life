import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireResident } from "@/lib/auth";
import { logoutResidentAction } from "@/app/resident-actions";
import { formatDateTime, parcelTypeLabel } from "@/lib/format";
import { parcelPhotoSrc } from "@/lib/upload";

export default async function MyParcelsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const session = await requireResident();
  if (!session?.householdId) {
    redirect("/?error=needlogin");
  }

  const { ok } = await searchParams;
  const household = await prisma.household.findUnique({
    where: { id: session.householdId },
  });

  const parcels = await prisma.parcel.findMany({
    where: { householdId: session.householdId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--brand)]">好生活社區</p>
          <h1 className="mt-1 text-2xl font-semibold">我的包裹</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {household
              ? `${household.doorplate}　戶號 ${household.householdNumber}`
              : ""}
            {session.residentUsername ? `　帳號 ${session.residentUsername}` : ""}
          </p>
        </div>
        <form action={logoutResidentAction}>
          <button className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm hover:bg-[var(--bg)]">
            登出
          </button>
        </form>
      </div>

      {ok === "registered" && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          註冊成功，以下為目前尚未領取的包裹。
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
        {parcels.length === 0 ? (
          <p className="p-8 text-center text-[var(--muted)]">
            目前沒有尚未領取的包裹或郵件
          </p>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {parcels.map((p) => (
              <article
                key={p.id}
                className="grid gap-4 p-4 sm:grid-cols-[120px_1fr] sm:items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={parcelPhotoSrc(p.photoPath)}
                  alt=""
                  className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-[120px]"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--bg)] px-2.5 py-0.5 text-sm">
                      {parcelTypeLabel(p.type)}
                    </span>
                    <span className="text-sm text-[var(--muted)]">尚未領取</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    送達時間：{formatDateTime(p.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    請於管委會服務時間前往領取
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
