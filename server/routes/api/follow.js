import { Router } from 'express';
import FollowController from
  '../../controllers/FollowController';
import AuthMiddleware from
  '../../utils/middleware/AuthMiddleware';

const router = Router();

// Adds a login user to the follower list a specified userId
router.post(
  '/profiles/:userId/follow',
  AuthMiddleware.authenticateUser,
  AuthMiddleware.verifyUser,
  FollowController.follow,
);

// Removes a login user from the follower list a specified userId
router.delete(
  '/profiles/:userId/follow',
  AuthMiddleware.authenticateUser,
  AuthMiddleware.verifyUser,
  FollowController.unfollow,
);

// Get all the followers of a login user
router.get(
  '/followers',
  AuthMiddleware.authenticateUser,
  AuthMiddleware.verifyUser,
  FollowController.getFollowers,
);

// Get all the followers of a another user with a specified id
router.get(
  '/profiles/:userId/followers',
  AuthMiddleware.authenticateUser,
  AuthMiddleware.verifyUser,
  FollowController.getFollowers,
);

// Get all profiles of those that the login user is following
router.get(
  '/followings',
  AuthMiddleware.authenticateUser,
  AuthMiddleware.verifyUser,
  FollowController.getFollowings,
);

// Get all the profiles of those another user is following
router.get(
  '/profiles/:userId/followings',
  AuthMiddleware.authenticateUser,
  AuthMiddleware.verifyUser,
  FollowController.getFollowings,
);

export default router;
