import { Router } from 'express';
import passport from 'passport';
import OauthController from '../../../controllers/OauthController';

const router = Router();


router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/linkedin',
  passport.authenticate('linkedin'),
);

router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'] }),
);

router.get(
  '/google/redirect',
  passport.authenticate('google', { session: false }),
  OauthController.handleRedirect,
);

router.get(
  '/linkedin/redirect',
  passport.authenticate('linkedin', { session: false }),
  OauthController.handleRedirect,
);

router.get(
  '/facebook/redirect',
  passport.authenticate('facebook', {
    session: false,
    scope: ['email'],
  }),
  OauthController.handleRedirect,
);


export default router;
