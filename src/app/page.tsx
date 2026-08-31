import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session.staffId) {
    redirect(session.role === "CHAIR" ? "/chair/households" : "/admin/parcels");
  }

  const { error } = await searchParams;
  const errorText =
    error === "invalid"
      ? "帳號或密碼不正確"
      : error === "empty"
        ? "請輸入帳號與密碼"
        : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-[var(--brand)]">社區管委會後台</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">好生活社區</h1>
        <p className="mt-2 text-[var(--muted)]">包裹與郵件通知系統</p>

        {errorText && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorText}
          </p>
        )}

        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">帳號</span>
            <input
              name="username"
              autoComplete="username"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">密碼</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <button className="w-full rounded-xl bg-[var(--brand)] py-2.5 font-medium text-white hover:bg-[var(--brand-2)]">
            登入
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-[var(--bg)] p-4 text-sm text-[var(--muted)]">
          <p>預設帳號（請於正式上線後立即更改）</p>
          <p className="mt-1">主委：chair / chair123</p>
          <p>管理員：admin / admin123</p>
        </div>
      </div>
    </div>
  );
}
