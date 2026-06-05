import nodemailer from "nodemailer";

// Transporter de nodemailer configurado con variables de entorno
export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Enviar correo genérico
export const enviarCorreo = async (to: string, subject: string, html: string): Promise<void> => {
    await transporter.sendMail({
        from: process.env.MAIL_FROM || "SIGOP <noreply@sigop.com>",
        to,
        subject,
        html,
    });
};
