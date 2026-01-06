import 'server-only';

export async function sendTelegramNotification(text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn('Skipping Telegram notification: Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        if (!res.ok) {
            console.error('Telegram API Error:', await res.text());
        } else {
            console.log('Telegram notification sent!');
        }
    } catch (error) {
        console.error('Failed to send Telegram notification:', error);
    }
}
