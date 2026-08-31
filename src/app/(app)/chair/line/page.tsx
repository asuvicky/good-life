import { prisma } from "@/lib/db";
import { getLineSetupStatus } from "@/lib/line-rich-menu";
import { setupLineRichMenuAction } from "@/app/actions";

export default async function LineSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; id?: string }>;
}) {
  const { error, ok, id } = await searchParams;
  const status = getLineSetupStatus();
  const [bindingCount, householdCount, pendingCount] = await Promise.all([
    prisma.lineBinding.count(),
    prisma.household.count(),
    prisma.parcel.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">LINE 串接設定</h1>
        <p className="mt-1 text-[var(--muted)]">
          檢查官方帳號設定、Webhook，並一鍵建立住戶圖文選單
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {ok === "richmenu" && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          圖文選單已建立並設為預設
          {id ? `（${id}）` : ""}。請用手機開啟官方帳號確認下方選單。
        </p>
      )}

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <h2 className="text-lg font-semibold">連線狀態</h2>
        <ul className="mt-4 space-y-3 text-sm">
          <StatusRow
            ok={status.database}
            label="PostgreSQL 資料庫"
            detail={
              status.database
                ? "DATABASE_URL 已設定"
                : "請在 Vercel 或 Neon 建立資料庫並填入 DATABASE_URL"
            }
          />
          <StatusRow
            ok={status.blob}
            label="Vercel Blob 照片儲存"
            detail={
              status.blob
                ? "已設定，包裹照片會永久保存"
                : "Vercel 上請建立 Blob Store；本機可暫用 public/uploads"
            }
          />
          <StatusRow
            ok={status.secret}
            label="LINE_CHANNEL_SECRET"
            detail={status.secret ? "已設定" : "尚未填入環境變數"}
          />
          <StatusRow
            ok={status.token}
            label="LINE_CHANNEL_ACCESS_TOKEN"
            detail={status.token ? "已設定" : "尚未填入環境變數"}
          />
          <StatusRow
            ok={Boolean(status.baseUrl)}
            label="對外網址"
            detail={
              status.baseUrl ||
              (status.vercel ? "Vercel 部署後會自動產生" : "請設定 APP_BASE_URL")
            }
          />
          <StatusRow
            ok={status.readyForPhotos}
            label="LINE 包裹照片"
            detail={
              status.readyForPhotos
                ? "HTTPS + Blob 已就緒，可推播照片"
                : "需 HTTPS 網址與 Blob 儲存"
            }
          />
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <h2 className="text-lg font-semibold">Webhook</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          到 LINE Developers → Messaging API → Webhook settings，貼上以下網址並開啟 Use
          webhook。
        </p>
        <code className="mt-3 block overflow-x-auto rounded-xl bg-[var(--bg)] px-3 py-3 text-sm">
          {status.webhookUrl || "部署到 Vercel 後會顯示，例如 https://你的專案.vercel.app/api/line/webhook"}
        </code>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <h2 className="text-lg font-semibold">圖文選單</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          建立後，聊天室下方會出現「綁定」「我的包裹」兩個按鈕。需先填好 Channel Access
          Token。
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/line/rich-menu.png"
          alt="圖文選單預覽"
          className="mt-4 w-full max-w-xl rounded-xl border border-[var(--line)] bg-[var(--bg)] object-cover"
        />
        <form action={setupLineRichMenuAction} className="mt-4">
          <button
            type="submit"
            disabled={!status.token}
            className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-white hover:bg-[var(--brand-2)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            建立／更新圖文選單
          </button>
        </form>
        <p className="mt-3 text-sm text-[var(--muted)]">
          也可在終端機執行：<code>npm run line:rich-menu</code>
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="住戶戶數" value={householdCount} />
        <StatCard label="已綁定 LINE" value={bindingCount} />
        <StatCard label="未領取包裹" value={pendingCount} />
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 text-sm leading-7 text-[var(--muted)]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">建議設定順序</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>將程式碼推上 GitHub，到 Vercel 匯入專案</li>
          <li>在 Vercel 建立 Postgres 與 Blob Store，並連結到此專案</li>
          <li>填入 LINE Channel secret、access token、SESSION_SECRET</li>
          <li>部署完成後，到 LINE Developers 設定 Webhook 並 Verify</li>
          <li>在本頁按「建立／更新圖文選單」</li>
          <li>執行種子資料建立預設帳號（見 README）</li>
          <li>用手機加入官方帳號，測試「綁定」與「我的包裹」</li>
        </ol>
      </section>
    </div>
  );
}

function StatusRow({
  ok,
  label,
  detail,
}: {
  ok: boolean;
  label: string;
  detail: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl bg-[var(--bg)] px-3 py-3">
      <span
        className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-xs text-white ${
          ok ? "bg-[var(--brand)]" : "bg-amber-500"
        }`}
      >
        {ok ? "✓" : "!"}
      </span>
      <div>
        <div className="font-medium text-[var(--ink)]">{label}</div>
        <div className="text-[var(--muted)]">{detail}</div>
      </div>
    </li>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
