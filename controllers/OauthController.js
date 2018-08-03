
import {  User } from '../models'; //eslint-disable-line
import tokenService from '../services/tokenService';


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
   * This method is used as the passport callback
   * function for all the third party systmes that
   *  were implemented. The method persists or
   * retrieves a user into or from the database.
   * If the user exists the user is retrieved, if not
   * the user is retrieved
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
    const user = {
      hash: profile.id,
      username: email,
      email,
      name: profile.displayName,
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
   * Function returns a descriptive message  to the user. Itis used to
   * handle the redirect URL of all the third party OAuth authenticator
   * @param {object} req this objet contains the details of the request
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
        name: user.name,
      },
      message: 'Successfully authenticated the user',
      token,
    });
  }
}

export default OauthController;
