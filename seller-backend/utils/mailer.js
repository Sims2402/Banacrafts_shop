const nodemailer = require("nodemailer");

/**
 * Same transporter as forgot-password / OTP (EMAIL_USER, EMAIL_PASS, or SMTP_*).
 */
function buildMailer() {
  const emailUser =
    process.env.EMAIL_USER ||
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    "";
  const emailPass =
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    process.env.SMTP_PASS ||
    "";

  const from = process.env.SMTP_FROM || emailUser || "";

  if (!from) {
    throw new Error(
      "Missing EMAIL_USER (or SMTP_FROM/SMTP_USER) env var for mail sender"
    );
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure =
      String(process.env.SMTP_SECURE || "").toLowerCase() === "true";
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return { transporter, from };
  }

  if (emailUser && emailPass) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    return { transporter, from };
  }

  throw new Error(
    "Missing SMTP config. Set EMAIL_USER/EMAIL_PASS (Gmail App Password) or SMTP_HOST/SMTP_USER/SMTP_PASS"
  );
}

module.exports = { buildMailer };
