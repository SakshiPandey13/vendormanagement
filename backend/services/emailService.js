/**
 * Email Service — nodemailer removed.
 * All methods silently succeed (no emails are sent).
 */

const emailService = {
  sendPasswordReset: async (email, name, resetUrl) => {
    console.log(`[Email disabled] Password reset for ${email}`);
    return true;
  },

  sendWelcome: async (email, name, role) => {
    console.log(`[Email disabled] Welcome email for ${email} (${role})`);
    return true;
  },

  sendOrderAssigned: async (email, name, orderNumber, expectedDate) => {
    console.log(`[Email disabled] Order ${orderNumber} assigned — notified ${email}`);
    return true;
  },

  sendPaymentCompleted: async (email, name, paymentNumber, amount) => {
    console.log(`[Email disabled] Payment ${paymentNumber} completed — notified ${email}`);
    return true;
  },

  sendLowStockAlert: async (email, adminName, products) => {
    console.log(`[Email disabled] Low stock alert for ${adminName} at ${email}`);
    return true;
  },
};

module.exports = emailService;
