import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { loginResidentAction } from "@/app/resident-actions";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session.staffId) {
    redirect(session.role === "CHAIR" ? "/chair/households" : "/admin/parcels");
  }
  if (session.residentId) {
    redirect("/my/parcels");
  }

  const { error } = await searchParams;
  const errorText =
    error === "invalid"
      ? "帳號或密碼不正確"
      : error === "empty"
        ? "請輸入帳號與密碼"
        : error === "needlogin"
          ? "請先登入後再查看包裹"
          : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-[var(--brand)]">好生活社區</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">我的包裹</h1>
        <p className="mt-2 text-[var(--muted)]">
          住戶登入後可查看尚未領取的包裹與郵件
        </p>

        {errorText && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorText}
          </p>
        )}

        <form action={loginResidentAction} className="mt-6 space-y-4">
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

        <div className="mt-6 flex flex-col gap-3 text-center text-sm">
          <Link
            href="/register"
            className="rounded-xl border border-[var(--brand)] px-4 py-2.5 font-medium text-[var(--brand)] hover:bg-emerald-50"
          >
            註冊
          </Link>
          <Link href="/staff" className="text-[var(--muted)] underline-offset-2 hover:underline">
            管理室後台登入
          </Link>
        </div>
      </div>
    </div>
  );
}
