import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  console.log("📧 Sending email to:", to);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"BanaCrafts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ EMAIL ERROR FULL:", error);
    throw error; // 🔥 VERY IMPORTANT
  }
};

export default sendEmail;