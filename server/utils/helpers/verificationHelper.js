
import emailService from '../services/emailService';
import emailTemplates from '../services/emailTemplates';
import tokenService from '../services/tokenService';

export default {
  /**
   * Send verification to a user on sign up
   * @param {Object} user - user retrieved from the database
   * @returns {Promise} send email
   */
  sendVerificationEmail: (user) => {
    const token = tokenService.generateToken({ id: user.id }, 60 * 30);
    const url = `${process.env.BASEURL}/api/users/verify/${token}`;
    const mailOptions = emailService.mailOptions(
      user.email,
      'Verify your Authors Haven account',
      emailTemplates.verificationTemplate(url),
    );
    // do not send email on test environment
    return emailService.sendMail(mailOptions);
  },
  /**
   * Validate user before verifying or re-sending email
   * @param {Object} user - user retrieved from the database
   * @returns {Boolean} false
   */
  validateUser: (user) => {
    if (!user) {
      return {
        status: false,
        statusCode: 404,
        error: 'User not found in the database',
      };
    }
    if (user.verified) {
      return {
        status: false,
        statusCode: 409,
        error: 'Your account has already been verified',
      };
    }
    return { status: true };
  },
  /**
   * Validate email on re-sending verification email
   * @param {String} email - email to be verified
   * @returns {Boolean} false
   */
  validateEmail: (email) => {
    if (!email) {
      return {
        status: false,
        statusCode: 400,
        error: 'Email not provided',
      };
    }
    const regEx = /^.+@.+\..+$/;
    if (!regEx.test(email)) {
      return {
        status: false,
        statusCode: 400,
        error: 'Please provide a valid email',
      };
    }
    return { status: true };
  },
};
