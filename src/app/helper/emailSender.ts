import nodemailer from 'nodemailer'
import config from '../config';


const emailSender = async (
    to: string,
    subject: string,
    html: string
) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: config.emailSender.email,
            pass: config.emailSender.app_pass, // app password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const info = await transporter.sendMail({
        from: '"From" <mity2027@gmail.com>', // sender address
        to,
        subject,
        html,
    });

}

export default emailSender;