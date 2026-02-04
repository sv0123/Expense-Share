// Email sending – works with SMTP from env; if not set, logs and resolves (demo mode)
let transporter = null;

function getTransporter() {
    if (transporter) return transporter;
    try {
        const nodemailer = require('nodemailer');
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        const host = process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = Number(process.env.SMTP_PORT) || 587;
        if (user && pass) {
            transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
            return transporter;
        }
    } catch (e) {
        console.warn('Nodemailer not installed or SMTP not configured:', e.message);
    }
    return null;
}

async function sendEmail({ to, subject, text, html }) {
    const trans = getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@expenseshare.com';
    const payload = { from, to, subject, text: text || (html && html.replace(/<[^>]+>/g, ' ')) || '', html };
    if (trans) {
        await trans.sendMail(payload);
        return true;
    }
    console.log('[Email stub] Would send:', { to: to.substring(0, 20) + '...', subject });
    return true;
}

module.exports = { sendEmail, getTransporter };
