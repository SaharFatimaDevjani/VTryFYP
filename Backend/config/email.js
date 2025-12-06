import nodemailer from "nodemailer";

// Looking to send emails in production? Check out our Email API/SMTP product!
export const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER || "e3c3c4e45b71a3",
    pass: process.env.EMAIL_PASS || "a5b93a44cd2b3f",
  },
});
