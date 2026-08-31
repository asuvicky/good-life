"use client";

import { claimParcelAction } from "@/app/actions";

export function ClaimCheckbox({ id, q }: { id: string; q: string }) {
  return (
    <form action={claimParcelAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="q" value={q} />
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 hover:bg-[var(--bg)]">
        <input
          type="checkbox"
          name="claimed"
          className="size-4 accent-[var(--brand)]"
          onChange={(event) => {
            if (event.currentTarget.checked) {
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <span>已領取</span>
      </label>
    </form>
  );
}
