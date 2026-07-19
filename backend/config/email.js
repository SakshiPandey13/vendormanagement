/**
 * Email transporter — nodemailer removed.
 * Exports a no-op stub so existing imports don't break.
 */
const transporter = {
  sendMail: async () => ({ messageId: 'disabled' }),
  verify: (cb) => cb(null),
};

module.exports = transporter;
