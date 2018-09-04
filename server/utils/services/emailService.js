/* eslint-disable object-shorthand */
const nodemailer = require('nodemailer');

let nodemailerConfig;
if (process.env.NODE_ENV === 'production') {
  nodemailerConfig = {
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  };
} else {
  nodemailerConfig = {
    host: process.env.MAIL_TRAP_HOST,
    port: process.env.MAIL_TRAP_PORT,
    auth: {
      user: process.env.MAIL_TRAP_USER,
      pass: process.env.MAIL_TRAP_PASS,
    },
  };
}

const transporter = nodemailer.createTransport(nodemailerConfig);


module.exports = {
  /**
  * Create mail options used for configuring nodmailer emails
  * @param {String} recipient - the email address of the user
  * @param {String} subject - the subject of the email
  * @param {String} html - the body of the email
  * @returns {Object} mailing options
  */
  mailOptions(recipient, subject, html, bcc) {
    return {
      from: 'no-reply@authors-haven.com',
      to: recipient,
      subject: subject,
      html: html,
      bcc,
    };
  },
  /**
  * Send email
  * @param {Object} mailOptions - mailing options
  * @returns {Promise} send mail
  */
  sendMail(mailOptions) {
    if (process.env.NODE_ENV === 'test') {
      return new Promise(resolve => resolve(null));
    }
    return transporter.sendMail(mailOptions);
  },
};
