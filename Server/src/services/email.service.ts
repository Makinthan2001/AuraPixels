import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  sendOTP: async (email: string, otp: string) => {
    const mailOptions = {
      from: `"AuraPixels" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: 'Verify Your Email - AuraPixels',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #723E31; text-align: center;">Welcome to AuraPixels</h2>
          <p>Hello,</p>
          <p>Thank you for choosing AuraPixels. Use the following OTP to verify your email address. This code is valid for <b>5 minutes</b>.</p>
          <div style="background-color: #F2F1EF; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #723E31;">${otp}</span>
          </div>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #666666; text-align: center;">&copy; 2026 AuraPixels. All rights reserved.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}`);
    } catch (error: any) {
      console.error('SMTP Error:', error.message);
      if (error.response) console.error('SMTP Response:', error.response);
      throw new Error('Failed to send OTP email');
    }
  },
};
