import passport from 'passport';
import { Router } from 'express';
import models from '../../models';

const { User } = models;
const router = Router();
router.get('/user', (req, res, next) => {
  User.findById(req.payload.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }
      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

router.put('/user', (req, res, next) => {
  User.findById(req.payload.id)
    .then((newUser) => {
      if (!newUser) {
        return res.sendStatus(401);
      }
      const user = newUser;
      const {
        username, email, bio, image, password,
      } = req.body.user;

      // only update fields that were actually passed...
      if (!username) {
        user.username = username;
      }
      if (!email) {
        user.email = email;
      }
      if (!bio) {
        user.bio = req.body.user.bio;
      }
      if (!image) {
        user.image = image;
      }
      if (!password) {
        user.setPassword(req.body.user.password);
      }
      return user.save().then(() => res.json({ user: newUser.toAuthJSON() }));
    })
    .catch(next);
});

router.post('/users/login', (req, res, next) => {
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "can't be blank" } });
  }
  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "can't be blank" } });
  }
  passport.authenticate('local', { session: false }, (
    err,
    user,
    info,
  ) => {
    if (err) {
      return next(err);
    }
    if (user) {
      return res.json({
        email: user.email,
        username: user.username,
      });
    }
    return res.status(422).json(info);
  })(req, res, next);
  return undefined;
});

router.post('/users', (req, res, next) => {
  const {
    username,
    email,
    password: hash,
  } = req.body.user;

  User.create({ username, email, hash })
    .then(user => res.json({
      email: user.email,
      username: user.username,
    })).catch(next);
});

export default router;
