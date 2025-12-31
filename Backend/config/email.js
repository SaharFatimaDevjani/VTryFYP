import nodemailer from "nodemailer";

// Looking to send emails in production? Check out our Email API/SMTP product!
export const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER || "1895d6633bb382",
    pass: process.env.EMAIL_PASS || "e9e12434719d17",
  },
});
