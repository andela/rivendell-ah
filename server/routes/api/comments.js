import { Router } from 'express';
import auth from '../../utils/middleware/AuthMiddleware';
import CommentsValidator from
  '../../utils/middleware/validator/CommentsValidator';
import CommentController from '../../controllers/CommentController';


const router = Router();

router.post(
  '/articles/:slug/comments',
  auth.authenticateUser,
  auth.verifyUser,
  CommentsValidator.createComment,
  CommentController.createComment,
);

router.post(
  '/articles/:slug/comments/:id/replies',
  auth.authenticateUser,
  auth.verifyUser,
  CommentsValidator.createComment,
  CommentController.createReply,
);

router.put(
  '/articles/:slug/comments/:id',
  auth.authenticateUser,
  auth.verifyUser,
  CommentsValidator.updateComment,
  CommentController.updateComment,
);

router.delete(
  '/articles/:slug/comments/:id',
  auth.authenticateUser,
  auth.verifyUser,
  CommentController.hideComment,
);

router.get(
  '/articles/:slug/comments/:id',
  CommentController.getComment,
);

router.get(
  '/articles/:slug/comments',
  CommentController.getComments,
);

router.get(
  '/articles/:slug/comments/:id/replies',
  CommentController.getReplies,
);

export default router;
