import { Router } from 'express';
import passport from 'passport';
import OauthController from '../../../controllers/OauthController';

const router = Router();


router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/auth/linkedin',
  passport.authenticate('linkedin'),
);

router.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] }),
);

router.get(
  '/auth/google/redirect',
  passport.authenticate('google', { session: false }),
  OauthController.handleRedirect,
);

router.get(
  '/auth/linkedin/redirect',
  passport.authenticate('linkedin', { session: false }),
  OauthController.handleRedirect,
);

router.get(
  '/auth/facebook/redirect',
  passport.authenticate('facebook', {
    session: false,
    scope: ['email'],
  }),
  OauthController.handleRedirect,
);


export default router;
