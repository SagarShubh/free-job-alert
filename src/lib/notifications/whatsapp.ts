import 'server-only';

export async function sendWhatsAppNotification(text: string) {
    const phone = process.env.WHATSAPP_PHONE;
    const apiKey = process.env.WHATSAPP_API_KEY;

    if (!phone || !apiKey) {
        console.warn('Skipping WhatsApp notification: Missing WHATSAPP_PHONE or WHATSAPP_API_KEY');
        return;
    }

    try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${apiKey}`;
        const res = await fetch(url);

        if (!res.ok) {
            console.error('WhatsApp API Error:', await res.text());
        } else {
            console.log('WhatsApp notification sent!');
        }
    } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
    }
}
