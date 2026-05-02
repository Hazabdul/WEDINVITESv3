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

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

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

export const sendRsvpNotification = async (email, invitation, rsvp) => {
  const coupleNames = `${invitation.brideName || invitation.couple?.bride || 'Bride'} & ${invitation.groomName || invitation.couple?.groom || 'Groom'}`;
  const status = rsvp.attending ? 'Attending' : 'Not attending';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2>New RSVP for ${escapeHtml(coupleNames)}</h2>
      <p><strong>Guest:</strong> ${escapeHtml(rsvp.guestName)}</p>
      <p><strong>Status:</strong> ${escapeHtml(status)}</p>
      <p><strong>Guest Count:</strong> ${escapeHtml(rsvp.guestCount)}</p>
      ${rsvp.email ? `<p><strong>Email:</strong> ${escapeHtml(rsvp.email)}</p>` : ''}
      ${rsvp.phone ? `<p><strong>Phone:</strong> ${escapeHtml(rsvp.phone)}</p>` : ''}
      ${rsvp.message ? `<p><strong>Message:</strong> ${escapeHtml(rsvp.message)}</p>` : ''}
    </div>
  `;

  return sendGeneralEmail(email, `New RSVP: ${rsvp.guestName}`, html);
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
