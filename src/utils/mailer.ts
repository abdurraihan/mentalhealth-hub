import nodemailer from "nodemailer";

type MailType = "verify" | "reset";

export const sendMail = async (to: string, otp: string, type: MailType) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  // Dynamic text based on type
  const isVerify = type === "verify";
  const subject = isVerify
    ? "Verify Your Email Address"
    : "Password Reset Verification";

  const headerTitle = isVerify ? "Email Verification" : "Password Reset";
  const messageLine = isVerify
    ? "Please use the verification code below to verify your email address."
    : "Please use the verification code below to reset your password.";

  const htmlContent = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; padding: 40px;">
    <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
      
      <!-- Header -->
      <div style="background: ${
        isVerify ? "#22c55e" : "#004aad"
      }; padding: 20px 0; text-align: center;">
        <h2 style="color: white; margin: 0; font-size: 20px; letter-spacing: 0.5px;">
          🔐 ${headerTitle}
        </h2>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #333333;">
        <p style="font-size: 16px;">Hello <strong>User</strong>,</p>
        <p style="font-size: 15px; color: #555;">
          ${messageLine}
        </p>

        <!-- OTP Box -->
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: ${
            isVerify ? "#22c55e" : "#004aad"
          }; color: white; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 14px 40px; border-radius: 8px;">
            ${otp}
          </div>
        </div>

        <p style="font-size: 14px; color: #555; text-align: center; margin-top: 10px;">
          This code will expire in <strong>10 minutes</strong>.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="font-size: 14px; color: #555;">
          If you did not request this, please ignore this email.
        </p>

        <p style="margin-top: 30px; font-size: 14px; color: #333;">
          Best regards,<br>
          <strong style="color:${isVerify ? "#22c55e" : "#004aad"};">Admin Support Team</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f9fafc; text-align: center; padding: 16px; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} Admin Portal — All rights reserved.
      </div>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"Admin Support" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  });
};
