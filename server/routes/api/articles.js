import { Router } from 'express';
import auth from '../../utils/middleware/AuthMiddleware';
import validate from '../../utils/middleware/validator/articles';
import ArticleController from '../../controllers/ArticleController';

import LikeController from '../../controllers/LikeController';


const router = Router();

router.post(
  '/',
  auth.authenticateUser, auth.verifyUser,
  validate.createArticle,
  ArticleController.createArticle,
);

router.get(
  '/:slug',
  ArticleController.getArticle,
);
router.get(
  '/',
  ArticleController.getAllArticle,
);

router.put(
  '/:slug',
  auth.authenticateUser, auth.verifyUser,
  validate.updateArticle,
  ArticleController.updateArticle,
);

router.delete(
  '/:slug',
  auth.authenticateUser, auth.verifyUser,
  ArticleController.deleteArticle,
);

router.post(
  '/:slug/like',
  auth.authenticateUser,
  auth.verifyUser,
  LikeController.likeArticle,
);

router.delete(
  '/:slug/like',
  auth.authenticateUser,
  auth.verifyUser,
  LikeController.unlikeArticle,
);
router.get(
  '/:slug/like',
  auth.authenticateUser,
  auth.verifyUser,
  LikeController.getArticleLikes,
);
export default router;
