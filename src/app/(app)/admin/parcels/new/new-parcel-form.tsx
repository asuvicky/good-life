"use client";

import { useRef, useState } from "react";
import { createParcelAction } from "@/app/actions";
import { DoorplateHouseholdSelect } from "./doorplate-household-select";
import { ParcelSubmitButton } from "./parcel-submit-button";

type HouseholdOption = {
  doorplate: string;
  householdNumber: string;
};

function ParcelPhotoField() {
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submitInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  function assignFile(file: File | undefined) {
    if (!file || !submitInputRef.current) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    submitInputRef.current.files = dt.files;
    setError(null);
    setFileLabel(file.name);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  return (
    <div className="block">
      <span className="mb-1 block text-sm text-[var(--muted)]">包裹照片</span>
      <p className="mb-2 text-xs text-[var(--muted)]">
        可用相機拍攝，或從手機相簿上傳
      </p>

      {/* 實際送出用；用 DataTransfer 寫入選到的檔案 */}
      <input
        ref={submitInputRef}
        name="photo"
        type="file"
        accept="image/*"
        required
        className="sr-only"
        tabIndex={-1}
        onInvalid={(e) => {
          e.preventDefault();
          setError("請先拍攝或上傳包裹照片");
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          assignFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          assignFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)] px-3 py-4 text-sm font-medium hover:border-[var(--brand)]"
        >
          相機拍攝
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)] px-3 py-4 text-sm font-medium hover:border-[var(--brand)]"
        >
          上傳照片
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {previewUrl && (
        <div className="mt-3 overflow-hidden rounded-xl border border-[var(--line)]">
          <img
            src={previewUrl}
            alt="已選照片預覽"
            className="max-h-48 w-full object-contain bg-[var(--bg)]"
          />
          {fileLabel && (
            <p className="truncate border-t border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]">
              已選擇：{fileLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

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

      <ParcelPhotoField />

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
