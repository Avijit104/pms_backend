import Mailgen from "mailgen"
import nodemailer from "nodemailer"

const emailVarificationContent = (username, varificationUrl) => {
    return {
        name: username,
        intro: "Welcome to ManagePro",
        action: {
            intstructions:
                "To verifiy your registered email id please click on the following button",
            button: {
                color: "#22BC66",
                text: "Verifiy Email",
                link: varificationUrl,
            },
        },
        outro: "Need help, or have questions? Just reply to this email",
    }
}

const resetPasswordContent = (username, resetPasswordUrl) => {
    return {
        name: username,
        intro: "Wellcome to ManagePro",
        action: {
            intstructions:
                "To reset your password please click on the following button",
            button: {
                color: "#22BC66",
                text: "Reset Password",
                link: resetPasswordUrl,
            },
        },
        outro: "If it is not you then just ignore this email",
    }
}

const mailSender = async (options) => {
    const mailgen = new Mailgen({
        theme: "default",
        product: {
            name: "managepro",
            link: "https://managepro.com",
        },
    })
    const emailText = mailgen.generatePlaintext(options.mailgenContent)
    const emailHtml = mailgen.generate(options.mailgenContent)

    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USERNAME,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    })
    const mail = {
        from: "mail.managepro@example.com",
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml,
    }

    try {
        await transport.sendMail(mail)
    } catch (error) {
        console.error("mail server error ", error)
    }
}

export { emailVarificationContent, resetPasswordContent, mailSender }
