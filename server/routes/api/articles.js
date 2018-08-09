import { Router } from 'express';
import auth from '../../utils/middleware/AuthMiddleware';
import validate from '../../utils/middleware/validator/articles';
import ArticleController from '../../controllers/ArticleController';

import LikeController from '../../controllers/LikeController';


const router = Router();

router.post(
  '/articles',
  auth.authenticateUser, auth.verifyUser,
  validate.createArticle,
  ArticleController.createArticle,
);

router.get(
  '/articles/:slug',
  ArticleController.getArticle,
);
router.get(
  '/articles',
  ArticleController.getAllArticle,
);

router.put(
  '/articles/:slug',
  auth.authenticateUser, auth.verifyUser,
  validate.updateArticle,
  ArticleController.updateArticle,
);

router.delete(
  '/articles/:slug',
  auth.authenticateUser, auth.verifyUser,
  ArticleController.deleteArticle,
);

router.post(
  '/articles/:slug/like',
  auth.authenticateUser,
  auth.verifyUser,
  LikeController.likeArticle,
);

router.delete(
  '/articles/:slug/like',
  auth.authenticateUser,
  auth.verifyUser,
  LikeController.unlikeArticle,
);
router.get(
  '/articles/:slug/like',
  auth.authenticateUser,
  auth.verifyUser,
  LikeController.getArticleLikes,
);
export default router;
