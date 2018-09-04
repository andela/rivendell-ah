import { Router } from 'express';
import SubscriptionController from
  '../../controllers/SubscriptionController';
import AuthMiddleware from
  '../../utils/middleware/AuthMiddleware';
import validateSubscriptionType from
  '../../utils/middleware/subscriptionMiddleware';

const router = Router();

// Adds a login user to the follower list a specified userId
router.post(
  '/notification/subscriptions/:id',
  AuthMiddleware.authenticateUser,
  AuthMiddleware.verifyUser,
  validateSubscriptionType,
  SubscriptionController.subscribe,
);

// Removes a login user from the follower list a specified userId
router.delete(
  '/notification/subscriptions/:id',
  AuthMiddleware.authenticateUser,
  AuthMiddleware.verifyUser,
  validateSubscriptionType,
  SubscriptionController.unsubscribe,
);

export default router;
