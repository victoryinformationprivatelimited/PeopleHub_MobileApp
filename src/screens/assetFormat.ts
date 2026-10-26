/** Date helpers shared by the asset screens. Dates are plain yyyy-mm-dd strings. */

export const fmtDate = (ymd?: string | null): string =>
  ymd ? new Date(ymd.length > 10 ? ymd : `${ymd}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

const pad = (n: number) => String(n).padStart(2, "0");

/** Today, plus an optional number of days, as yyyy-mm-dd in the phone's local time. */
export function ymdFromToday(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Whole days from today until the given date; negative once it has passed. */
export function daysUntil(ymd: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${ymd}T00:00:00`).getTime() - today.getTime()) / 86400000);
}
