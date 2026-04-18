import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPaymentConfirmation = async (email, details) => {
  const { coupleNames, packageName, inviteLink } = details;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Wedding Invitation Payment Confirmed!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>Congratulations!</h2>
        <p>Payment for the wedding invitation of <strong>${coupleNames}</strong> has been confirmed.</p>
        <p><strong>Package:</strong> ${packageName}</p>
        <p>Your live invitation link is now active:</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #d4af37; color: white; text-decoration: none; border-radius: 5px;">View Invitation</a>
        <p>Thank you for choosing us!</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendGeneralEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
};
