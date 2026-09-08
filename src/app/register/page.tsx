import Link from "next/link";
import { registerResidentAction } from "@/app/resident-actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-[var(--brand)]">好生活社區</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">住戶註冊</h1>
        <p className="mt-2 text-[var(--muted)]">
          請輸入主委登錄的住戶資料，並自行設定帳號密碼
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={registerResidentAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">門牌號碼</span>
            <input
              name="doorplate"
              required
              placeholder="例如：407"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">戶號</span>
            <input
              name="householdNumber"
              required
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">電話末三碼</span>
            <input
              name="phoneLast3"
              required
              inputMode="numeric"
              maxLength={3}
              pattern="[0-9]{3}"
              placeholder="例如：123"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">設定帳號</span>
            <input
              name="username"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">設定密碼</span>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">確認密碼</span>
            <input
              name="password2"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <button className="w-full rounded-xl bg-[var(--brand)] py-2.5 font-medium text-white hover:bg-[var(--brand-2)]">
            註冊並登入
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/" className="text-[var(--muted)] underline-offset-2 hover:underline">
            已有帳號？前往登入
          </Link>
        </div>
      </div>
    </div>
  );
}
