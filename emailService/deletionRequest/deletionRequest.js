const { transporter } = require("../../config/nodemailerConfig/emailConfigMiddleware");
const logo = process.env.LOGO;
const name = process.env.NAME;
const adminEmail = process.env.ADMIN_EMAIL;

const sendAccountDeletionStatusEmail = async (email, fullName, requestId, status) => {
  try {
    const subjectLine = `Account Deletion Request ${status.toUpperCase()}`;
    const adminReply =
      status === "approved"
        ? `Your account has been successfully deleted from ${name}. We're sorry to see you go!`
        : "Your request for account deletion has been rejected. If you believe this is a mistake, please contact our support team.";

    await transporter.sendMail({
      from: `"${name} Support" <${adminEmail}>`,
      to: email,
      subject: ` ${subjectLine}`,
      html: `
        <div style="background-color: #f8f9fa; padding: 40px 0; font-family: Arial, sans-serif;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <h2 style="text-align: center; background-color: #0d6efd; padding: 15px; color: white; border-radius: 6px;">Account Deletion Request ${status.toUpperCase()}</h2>
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>Your account deletion request with ID <strong>#${requestId}</strong> has been <strong>${status}</strong>.</p>
            <p><strong>Message from Admin:</strong></p>
            <blockquote style="background-color: #f1f1f1; padding: 15px; border-left: 4px solid #0d6efd; border-radius: 4px;">
              ${adminReply}
            </blockquote>
            <p>If you have further queries, feel free to contact our support team.</p>
            <p>Regards,<br/>${name} Support Team</p>
            <hr />
            <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} ${name}. All rights reserved.</p>
          </div>
        </div>
      `
    });

    // console.log(`Deletion request ${status} email sent to ${email}`);
  } catch (error) {
    console.error("Error sending deletion request email:", error);
  }
};

module.exports = {
    sendAccountDeletionStatusEmail
}