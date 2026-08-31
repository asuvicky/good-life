import Link from "next/link";
import { getSession } from "@/lib/auth";
import { roleLabel } from "@/lib/format";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isChair = session.role === "CHAIR";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={isChair ? "/chair/households" : "/admin/parcels"} className="font-semibold tracking-wide text-[var(--brand)]">
            好生活社區
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <Link className="rounded-lg px-3 py-2 hover:bg-[var(--bg)]" href="/admin/parcels">
              包裹管理
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-[var(--bg)]" href="/admin/parcels/new">
              新增包裹
            </Link>
            {isChair && (
              <>
                <Link className="rounded-lg px-3 py-2 hover:bg-[var(--bg)]" href="/chair/households">
                  住戶名單
                </Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-[var(--bg)]" href="/chair/staff">
                  管理員名單
                </Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-[var(--bg)]" href="/chair/line">
                  LINE 設定
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden text-right sm:block">
              <div className="font-medium">{session.name}</div>
              <div className="text-xs text-[var(--muted)]">
                {session.role ? roleLabel(session.role) : ""}
              </div>
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="rounded-lg border border-[var(--line)] px-3 py-1.5 hover:bg-[var(--bg)]">
                登出
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
