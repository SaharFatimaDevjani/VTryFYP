import nodemailer from "nodemailer";

// Looking to send emails in production? Check out our Email API/SMTP product!
export const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER || "1ffc2cd2a99813",
    pass: process.env.EMAIL_PASS || "e3f7e6b162a057",
  },
});
