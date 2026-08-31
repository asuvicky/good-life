import type { ParcelType, Role } from "@/lib/types";

export function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function parcelTypeLabel(type: string) {
  return type === "PARCEL" ? "包裹" : "郵件";
}

export function roleLabel(role: string) {
  return role === "CHAIR" ? "主委" : "管理員";
}

export function asParcelType(type: string): ParcelType {
  return type === "MAIL" ? "MAIL" : "PARCEL";
}

export function asRole(role: string): Role {
  return role === "CHAIR" ? "CHAIR" : "ADMIN";
}
