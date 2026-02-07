export function formatTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function clampArray(list = [], max = 200) {
  if (list.length <= max) return list;
  return list.slice(list.length - max);
}

export function joinLines(list = []) {
  return list.filter(Boolean).join("\n");
}

export function toStringArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item));
  if (typeof value === "string") return value ? [value] : [];
  if (value == null) return [];
  if (typeof value === "object") {
    return Object.values(value)
      .flat()
      .filter(Boolean)
      .map((item) => String(item));
  }
  return [String(value)];
}

export function normalizePlan(plan) {
  if (!plan || typeof plan !== "object") {
    return { immediate: [], days30: [], days90: [] };
  }
  const immediate = toStringArray(plan.immediate);
  const days30 = toStringArray(plan.days30 ?? plan["30_days"] ?? plan["30Days"] ?? plan["30days"]);
  const days90 = toStringArray(plan.days90 ?? plan["90_days"] ?? plan["90Days"] ?? plan["90days"]);
  return { immediate, days30, days90 };
}
