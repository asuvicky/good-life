"use client";

import { useFormStatus } from "react-dom";

export function ParcelSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div className="space-y-2">
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[var(--brand)] py-2.5 font-medium text-white hover:bg-[var(--brand-2)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "處理中，請稍候…" : "儲存並通知住戶"}
      </button>
      {pending && (
        <p className="text-center text-sm text-[var(--muted)]">
          正在上傳照片並發送通知，請勿重複點擊或關閉頁面
        </p>
      )}
    </div>
  );
}
