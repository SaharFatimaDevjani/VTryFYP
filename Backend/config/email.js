import nodemailer from "nodemailer";

// using a mailtrap sandbox inbox for now so password reset emails don't
// actually go out anywhere while testing - swap this for a real smtp
// provider before this ever goes live
export const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    // fallback creds so it still works locally even without a .env set up
    user: process.env.EMAIL_USER || "1895d6633bb382",
    pass: process.env.EMAIL_PASS || "e9e12434719d17",
  },
});
