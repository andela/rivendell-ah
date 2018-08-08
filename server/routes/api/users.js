
import { Router } from 'express';
import UserController from '../../controllers/User';
import validate from '../../utils/middleware/validator/users';
import oauthRoute from './auth/authRoute';

const router = Router();

router.use('/auth', oauthRoute);
router.get(
  '/user', UserController.get,
);

router.put(
  '/user', UserController.update,
);

router.post(
  '/users', validate.signup, UserController.signup,
);

router.post(
  '/users/login', UserController.login,
);

router.post(
  '/users/verify/resend-email', UserController.resendEmail,
);

router.get(
  '/users/verify/:token', UserController.verify,
);

router.post(
  '/users/forgot-password', validate.forgotPassword,
  UserController.forgotPassword,
);

router.get(
  '/users/reset-password', UserController.resetPassword,
);

router.put(
  '/users/reset-password', validate.resetPassowrd,
  UserController.resetPasswordUpdate,
);

export default router;
