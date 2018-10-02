import { Router } from 'express';
import auth from '../../utils/middleware/AuthMiddleware';
import validate from '../../utils/middleware/validator/articles';
import ArticleController from '../../controllers/ArticleController';
import RatingController from '../../controllers/RatingController';
import ratingMiddleware from '../../utils/middleware/ratingMiddleware';
import articleFilters from '../../utils/middleware/articleFilters';

import LikeController from '../../controllers/LikeController';
import ReportController from '../../controllers/ReportController';
import filterTag from '../../utils/middleware/filterTag';
import ReportValidator from '../../utils/middleware/validator/ReportValidator';

const router = Router();
router.post(
  '/articles',
  auth.authenticateUser, auth.verifyUser,
  validate.createArticle,
  filterTag,
  ArticleController.createArticle,
);

router.get(
  '/articles/top-rated',
  ArticleController.getTopRatedArticles,
);

router.get(
  '/articles/favorites',
  auth.authenticateUser, auth.verifyUser,
  ArticleController.getFavoriteArticles,
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

// routes for  liking/unliking articles
router.post(
  '/articles/:slug/like',
  auth.authenticateUser,
  auth.verifyUser,
  LikeController.likeArticle,
);
// route to unlike an article
router.delete(
  '/articles/:slug/like',
  auth.authenticateUser,
  auth.verifyUser,
  LikeController.unlikeArticle,
);
// route for getting likes information about an article
router.get(
  '/articles/:slug/like',
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

router.post(
  '/articles/:slug/report',
  auth.authenticateUser,
  auth.verifyUser,
  ReportValidator.createReport,
  ReportController.reportArticle,
);

export default router;
