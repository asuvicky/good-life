"use client";

import { useRef } from "react";
import { createParcelAction } from "@/app/actions";
import { DoorplateHouseholdSelect } from "./doorplate-household-select";
import { ParcelSubmitButton } from "./parcel-submit-button";

type HouseholdOption = {
  doorplate: string;
  householdNumber: string;
};

export function NewParcelForm({
  households,
  nextNumberLabel,
}: {
  households: HouseholdOption[];
  nextNumberLabel: string;
}) {
  const submitted = useRef(false);

  return (
    <form
      action={createParcelAction}
      className="mt-6 space-y-5 rounded-2xl border border-[var(--line)] bg-white p-5"
      onSubmit={(event) => {
        if (submitted.current) {
          event.preventDefault();
          return;
        }
        submitted.current = true;
      }}
    >
      <label className="block">
        <span className="mb-1 block text-sm text-[var(--muted)]">包裹編號</span>
        <input
          value={nextNumberLabel}
          readOnly
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-lg font-semibold tracking-wide"
        />
        <span className="mt-1 block text-xs text-[var(--muted)]">
          系統自動產生（目前建議編號，儲存時以當下可用最小編號為準）
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-[var(--muted)]">包裹照片</span>
        <input
          name="photo"
          type="file"
          accept="image/*"
          capture="environment"
          required
          className="w-full rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)] px-3 py-4"
        />
      </label>

      <fieldset>
        <legend className="mb-2 text-sm text-[var(--muted)]">類型</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-2.5 has-[:checked]:border-[var(--brand)] has-[:checked]:bg-emerald-50">
            <input
              type="radio"
              name="type"
              value="PARCEL"
              defaultChecked
              className="accent-[var(--brand)]"
            />
            包裹
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-2.5 has-[:checked]:border-[var(--brand)] has-[:checked]:bg-emerald-50">
            <input
              type="radio"
              name="type"
              value="MAIL"
              className="accent-[var(--brand)]"
            />
            郵件
          </label>
        </div>
      </fieldset>

      <DoorplateHouseholdSelect households={households} />

      <ParcelSubmitButton />
    </form>
  );
}
