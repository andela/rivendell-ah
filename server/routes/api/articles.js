import { Router } from 'express';
import auth from '../../utils/middleware/AuthMiddleware';
import validate from '../../utils/middleware/validator/articles';
import ArticleController from '../../controllers/ArticleController';


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

export default router;
