export function isTerminalStatus(status: string) {
  return ["completed", "failed", "published"].includes(status);
}
