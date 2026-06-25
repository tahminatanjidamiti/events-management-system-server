import config from '../config';

const emailSender = async (
    to: string,
    subject: string,
    html: string
) => {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': config.brevo.apiKey as string,
            'Content-Type': 'application/json',
            'accept': 'application/json',
        },
        body: JSON.stringify({
            sender: {
                name: 'EventsVibe',
                email: config.brevo.fromEmail,
            },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo email failed: ${response.status} - ${errorBody}`);
    }
};

export default emailSender;