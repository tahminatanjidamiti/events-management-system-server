import nodemailer from 'nodemailer'
import config from '../config';



const emailSender = async (
    to: string,
    subject: string,
    html: string
) => {
    const transporter = nodemailer.createTransport({
        host: config.emailSender.smtp_host,
        port: Number(config.emailSender.smtp_port),
        secure: true, // Use `true` for port 465, `false` for all other ports like as used 587
        auth: {
            user: config.emailSender.smtp_user,
            pass: config.emailSender.smtp_pass, // app password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const info = await transporter.sendMail({
        from: `"From" <${config.emailSender.smtp_from}>`, // sender address
        to,
        subject,
        html,
    });

}

export default emailSender;