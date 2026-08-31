import { prisma } from "@/lib/db";
import { deleteStaffAction, upsertStaffAction } from "@/app/actions";
import { formatDateTime, roleLabel } from "@/lib/format";

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; edit?: string }>;
}) {
  const { error, ok, edit } = await searchParams;
  const staff = await prisma.staff.findMany({ orderBy: { createdAt: "asc" } });
  const editing = staff.find((s) => s.id === edit);

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <section>
        <h1 className="text-2xl font-semibold">{editing ? "編輯管理員" : "新增管理員"}</h1>
        <p className="mt-1 text-[var(--muted)]">
          每位管理員為獨立姓名；第一次使用請以帳號密碼登入網頁後台
        </p>
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {ok && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            已儲存
          </p>
        )}
        <form action={upsertStaffAction} className="mt-5 space-y-4 rounded-2xl border border-[var(--line)] bg-white p-5">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">姓名</span>
            <input
              name="name"
              required
              defaultValue={editing?.name ?? ""}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">登入帳號</span>
            <input
              name="username"
              required
              defaultValue={editing?.username ?? ""}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">
              {editing ? "新密碼（空白則不更改）" : "密碼"}
            </span>
            <input
              name="password"
              type="password"
              required={!editing}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[var(--muted)]">角色</span>
            <select
              name="role"
              defaultValue={editing?.role ?? "ADMIN"}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5"
            >
              <option value="ADMIN">管理員</option>
              <option value="CHAIR">主委</option>
            </select>
          </label>
          <button className="w-full rounded-xl bg-[var(--brand)] py-2.5 text-white hover:bg-[var(--brand-2)]">
            {editing ? "更新" : "新增"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold">管理員名單</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-[var(--bg)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">姓名</th>
                <th className="px-4 py-3 font-medium">帳號</th>
                <th className="px-4 py-3 font-medium">角色</th>
                <th className="px-4 py-3 font-medium">建立</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-t border-[var(--line)]">
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.username}</td>
                  <td className="px-4 py-3">{roleLabel(s.role)}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{formatDateTime(s.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a className="text-[var(--brand)]" href={`/chair/staff?edit=${s.id}`}>
                        編輯
                      </a>
                      <form action={deleteStaffAction}>
                        <input type="hidden" name="id" value={s.id} />
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
