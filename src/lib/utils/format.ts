export function formatDuration(totalSeconds: number) {
  const hundredths = Math.round(Math.max(0, totalSeconds) * 100);
  const minutes = Math.floor(hundredths / 6000);
  const seconds = Math.floor(hundredths / 100) % 60;
  const fraction = hundredths % 100;
  return `${minutes}:${String(seconds).padStart(2, "0")}${fraction ? `.${String(fraction).padStart(2, "0")}` : ""}`;
}

export function formatRelativeDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
