export function formatTime(dateString: string) {
  const time = new Date(dateString);
  return time.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}
