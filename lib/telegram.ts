export async function sendTelegramMessage(chatId: string, text: string) {
  await fetch("/api/telegram/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, text }),
  });
}
