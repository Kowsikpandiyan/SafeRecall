const nodemailer = require('nodemailer');

/**
 * Creates and returns a Nodemailer transporter instance using environment variables.
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  // If custom SMTP host is provided, use it; otherwise default to standard Gmail service
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};

/**
 * 1. Product Purchase Confirmation Email
 * Subject: Purchase Confirmation - Order #{ORDER_ID}
 */
const sendPurchaseConfirmationEmail = async ({
  to,
  customerName,
  shopName,
  shopEmail,
  productName,
  quantity,
  orderId,
  totalAmount
}) => {
  try {
    if (!to) {
      console.warn('[Email Service]: No recipient email provided for purchase confirmation.');
      return { success: false, reason: 'Missing recipient email' };
    }

    const transporter = createTransporter();
    if (!transporter) {
      console.warn('[Email Service]: EMAIL_USER or EMAIL_APP_PASSWORD is not configured in .env. Skipping purchase email.');
      return { success: false, reason: 'Email credentials not configured' };
    }

    const sellerName = shopName || 'the Shop';
    const subject = `Purchase Confirmation - Order #${orderId}`;
    const textContent = `Hi ${customerName || 'Customer'},

Your purchase from ${sellerName} has been successfully completed.

Product: ${productName}
Quantity: ${quantity}
Order ID: #${orderId}
Total Amount: ₹${totalAmount}

Thank you for shopping with us!`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
        <h2 style="color: #2b6cb0; margin-top: 0;">Purchase Confirmation</h2>
        <p>Hi <strong>${customerName || 'Customer'}</strong>,</p>
        <p>Your purchase from <strong>${sellerName}</strong> has been successfully completed.</p>
        <div style="background-color: #f7fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 6px 0;"><strong>Product:</strong> ${productName}</p>
          <p style="margin: 6px 0;"><strong>Quantity:</strong> ${quantity}</p>
          <p style="margin: 6px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 6px 0;"><strong>Total Amount:</strong> ₹${totalAmount}</p>
        </div>
        <p>Thank you for shopping with us!</p>
      </div>
    `;

    const mailOptions = {
      from: `"${sellerName}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent
    };

    if (shopEmail) {
      mailOptions.replyTo = shopEmail;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service]: Purchase confirmation email sent to ${to} for order #${orderId} from shop '${sellerName}' (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error]: Failed to send purchase confirmation email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 2. Product Return/Recall Confirmation Email
 * Subject: Product Return Request - Order #{ORDER_ID}
 */
const sendReturnRequestEmail = async ({
  to,
  customerName,
  shopName,
  shopEmail,
  productName,
  orderId,
  returnReason
}) => {
  try {
    if (!to) {
      console.warn('[Email Service]: No recipient email provided for return request.');
      return { success: false, reason: 'Missing recipient email' };
    }

    const transporter = createTransporter();
    if (!transporter) {
      console.warn('[Email Service]: EMAIL_USER or EMAIL_APP_PASSWORD is not configured in .env. Skipping return request email.');
      return { success: false, reason: 'Email credentials not configured' };
    }

    const sellerName = shopName || 'the Shop';
    const subject = `Product Return Request - Order #${orderId}`;
    const textContent = `Hi ${customerName || 'Customer'},

Your return/recall request for the product purchased from
${sellerName} has been successfully received.

Product: ${productName}
Order ID: #${orderId}
Reason: ${returnReason || 'Product recall return request'}

We will review your request and update you accordingly.`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
        <h2 style="color: #c53030; margin-top: 0;">Product Return Request</h2>
        <p>Hi <strong>${customerName || 'Customer'}</strong>,</p>
        <p>Your return/recall request for the product purchased from <strong>${sellerName}</strong> has been successfully received.</p>
        <div style="background-color: #fff5f5; padding: 16px; border-radius: 6px; margin: 16px 0; border: 1px solid #feb2b2;">
          <p style="margin: 6px 0;"><strong>Product:</strong> ${productName}</p>
          <p style="margin: 6px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 6px 0;"><strong>Reason:</strong> ${returnReason || 'Product recall return request'}</p>
        </div>
        <p>We will review your request and update you accordingly.</p>
      </div>
    `;

    const mailOptions = {
      from: `"${sellerName}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent
    };

    if (shopEmail) {
      mailOptions.replyTo = shopEmail;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service]: Return request email sent to ${to} for order #${orderId} (Shop: '${sellerName}') (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error]: Failed to send return request email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 3. Product Recall Alert Email
 * Subject: Important Product Recall Alert - {PRODUCT_NAME}
 */
const sendProductRecallEmail = async ({
  to,
  customerName,
  productName,
  orderId,
  shopName,
  shopEmail,
  recallReason
}) => {
  try {
    if (!to) {
      console.warn('[Email Service]: No recipient email provided for recall notification.');
      return { success: false, reason: 'Missing recipient email' };
    }

    const transporter = createTransporter();
    if (!transporter) {
      console.warn('[Email Service]: EMAIL_USER or EMAIL_APP_PASSWORD is not configured in .env. Skipping recall email.');
      return { success: false, reason: 'Email credentials not configured' };
    }

    const sellerName = shopName || 'the Shop';
    const subject = `Important Product Recall Alert - ${productName}`;

    const textContent = `Hi ${customerName || 'Customer'},

Important Product Recall Alert

The following product that you previously purchased has been recalled.

Product: ${productName}
Order ID: ${orderId}
Shop/Manufacturer: ${sellerName}

Recall Reason:
${recallReason}

Please stop using the product and follow the return/recall instructions provided by the shop.

We apologize for the inconvenience.

Thank you,
${sellerName}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e53e3e; border-radius: 8px; padding: 24px;">
        <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
          <h2 style="color: #c53030; margin: 0 0 8px 0; font-size: 20px;">⚠️ Important Product Recall Alert</h2>
          <p style="margin: 0; color: #742a2a; font-size: 14px;">Immediate action required for your purchased product</p>
        </div>
        
        <p>Hi <strong>${customerName || 'Customer'}</strong>,</p>
        <p><strong>Important Product Recall Alert</strong></p>
        <p>The following product that you previously purchased has been recalled.</p>
        
        <div style="background-color: #f7fafc; padding: 16px; border-radius: 6px; margin: 16px 0; border: 1px solid #edf2f7;">
          <p style="margin: 6px 0;"><strong>Product:</strong> ${productName}</p>
          <p style="margin: 6px 0;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 6px 0;"><strong>Shop/Manufacturer:</strong> ${sellerName}</p>
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #cbd5e0;">
            <strong style="color: #c53030;">Recall Reason:</strong>
            <p style="margin: 4px 0 0 0; color: #4a5568;">${recallReason}</p>
          </div>
        </div>
        
        <p style="color: #c53030; font-weight: bold;">Please stop using the product and follow the return/recall instructions provided by the shop.</p>
        <p>We apologize for the inconvenience.</p>
        <br/>
        <p>Thank you,<br/><strong>${sellerName}</strong></p>
      </div>
    `;

    const mailOptions = {
      from: `"${sellerName}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent
    };

    if (shopEmail) {
      mailOptions.replyTo = shopEmail;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service]: Product recall email successfully sent to ${to} for product '${productName}' (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error]: Failed to send product recall email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPurchaseConfirmationEmail,
  sendReturnRequestEmail,
  sendProductRecallEmail
};
