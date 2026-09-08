"use client";

import { useMemo, useState } from "react";

type HouseholdOption = {
  doorplate: string;
  householdNumber: string;
};

export function DoorplateHouseholdSelect({
  households,
}: {
  households: HouseholdOption[];
}) {
  const doorplates = useMemo(
    () => [...new Set(households.map((h) => h.doorplate))],
    [households],
  );
  const [doorplate, setDoorplate] = useState("");

  const householdNumbers = useMemo(
    () =>
      households
        .filter((h) => h.doorplate === doorplate)
        .map((h) => h.householdNumber),
    [households, doorplate],
  );

  return (
    <>
      <label className="block">
        <span className="mb-1 block text-sm text-[var(--muted)]">住戶門牌號碼</span>
        <select
          name="doorplate"
          required
          value={doorplate}
          onChange={(e) => setDoorplate(e.target.value)}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5"
        >
          <option value="" disabled>
            請選擇門牌
          </option>
          {doorplates.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-[var(--muted)]">戶號</span>
        <select
          name="householdNumber"
          required
          disabled={!doorplate}
          defaultValue=""
          key={doorplate}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 disabled:opacity-60"
        >
          <option value="" disabled>
            {doorplate ? "請選擇戶號" : "請先選擇門牌"}
          </option>
          {householdNumbers.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
