
import crypto from 'crypto';
import { User } from '../database/models'; //eslint-disable-line
import tokenService from '../utils/services/tokenService';

/**
 *
 * The OauthController contains static methods that are used to handle the
 * different routes used for social third-party authenication.
 *
 * The methods it contains are used in line with PassportJS module
 *  @class OauthController
 *  @returns {void} this is a class thus does not return anything
 */
class OauthController {
  /**
   * This method is used as the passport callback function
   * for all the third party systems that were implemented.
   *  The method persists or retrieves a user into or from
   * the database.
   * @param {object} accessToken an accessToken which
   * could be used to work with the provider
   * @param {string} refreshToken string that can be used
   * to refresh the user token
   * @param {object} profile an object containing the data of the user
   * @param {function} done  fuunction that must be called once all
   * processing is complete
  * @returns {void} void
   */
  static passportCallback(accessToken, refreshToken, profile, done) {
    const email = profile.emails[0].value;
    let { familyName: firstName, givenName: lastName } = profile.name;
    if (!(firstName && lastName)) {
      [firstName, lastName] = profile.displayName.split(' ');
    }
    const user = {
      hash: crypto.randomBytes(16).toString('hex'),
      username: email,
      email,
      firstName,
      lastName,
      verified: true,
      image: profile.photos[0] ? profile.photos[0].value : undefined,
    };
    User.findOrCreate({
      where: { email },
      defaults: user,
    }).then(([foundOrCreatedUser]) => {
      done(null, foundOrCreatedUser.dataValues);
    });
  }


  /**
   * Function returns a descriptive message  to the user. It is used to
   * handle the redirect URL of all the third party OAuth authenticator
   * @param {object} req this object contains the details of the request
   * @param {object} res this is used to send a response to the user
   * @returns {void} void
   */
  static handleRedirect(req, res) {
    const { user } = req;
    const token = tokenService.generateToken({
      id: user.id,
      email: user.email,
    }, '3d');
    res.json({
      status: 'success',
      data: {
        email: user.email,
        image: user.image,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        token,
        username: user.username,
      },
      message: 'Successfully authenticated the user',

    });
  }
}

export default OauthController;
