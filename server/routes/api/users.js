import { Router } from 'express';
import UserController from '../../controllers/UserController';
import ArticleController from '../../controllers/ArticleController';
import UsersValidator from '../../utils/middleware/validator/UsersValidator';
import AuthMiddleware from '../../utils/middleware/AuthMiddleware';


const router = Router();

router.put(
  '/user',
  AuthMiddleware.authenticateUser,
  UsersValidator.updateUser,
  UserController.update,
);

router.post(
  '/users', UsersValidator.signup, UserController.signup,
);

router.post(
  '/users/login', UsersValidator.login, UserController.login,
);

router.post(
  '/users/verify/resend-email', UserController.resendEmail,
);

router.get(
  '/users/verify/:token', UserController.verify,
);

router.post(
  '/users/forgot-password', UsersValidator.forgotPassword,
  UserController.forgotPassword,
);

router.get(
  '/users/reset-password', UserController.resetPassword,
);

router.put(
  '/users/reset-password',
  UsersValidator.resetPassword,
  UserController.resetPasswordUpdate,
);

router.get(
  '/users/feeds',
  AuthMiddleware.authenticateUser,
  AuthMiddleware.verifyUser,
  ArticleController.getUserFeed,
);

router.get('/profiles/:username', UserController.getProfile);

router.get('/profiles', UserController.getAllProfiles);

export default router;
