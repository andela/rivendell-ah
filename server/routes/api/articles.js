import { Router } from 'express';
import auth from '../../utils/middleware/AuthMiddleware';
import validate from '../../utils/middleware/validator/articles';
import ArticleController from '../../controllers/ArticleController';
import RatingController from '../../controllers/RatingController';
import ratingMiddleware from '../../utils/middleware/ratingMiddleware';
import articleFilters from '../../utils/middleware/articleFilters';

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
  '/articles', articleFilters,
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

// routes for rating articles
router.post(
  '/articles/:slug/rating',
  auth.authenticateUser,
  auth.verifyUser,
  ratingMiddleware.validateRating,
  RatingController.rateArticle,
);

router.put(
  '/articles/:slug/rating',
  auth.authenticateUser,
  auth.verifyUser,
  ratingMiddleware.validateRating,
  RatingController.updateRating,
);

router.get(
  '/articles/:slug/rating',
  RatingController.getArticleRating,
);

export default router;
