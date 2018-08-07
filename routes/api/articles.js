import slugCreate from 'slug';
import { Router } from 'express';
import models from '../../models';
import auth from '../../middleware/AuthMiddleware';

const { Article, User } = models;
const router = Router();

router.post('/articles', auth.authenticateUser, (req, res, next) => {
  const {
    title, description, body,
  } = req.body.article;

  // generating a unique slug
  const timeStamp = Date.now();
  const slug = slugCreate(`${title} ${req.body.decoded.username} ${timeStamp}`);

  const authorId = req.body.decoded.id;


  Article.create({
    slug, title, description, body, authorId,
  })
    .then((article) => {
      res.status(201).json({
        article: {
          title: article.title,
          description: article.description,
          body: article.body,
          slug,
        },
        message: 'Article Sucessfully Created',
      });
    })
    .catch(next);
});

router.get('/articles/:slug', (req, res, next) => {
  Article.find({ where: { slug: req.params.slug } })
    .then((article) => {
      if (article) {
        User.find({ where: { id: article.authorId } })
          .then((user) => {
            res.status(201).json({
              article: {
                slug: article.slug,
                title: article.title,
                description: article.description,
                body: article.body,
                author: user.username,
              },
              message: 'Article Found',
            });
          })
          .catch(next);
      } else {
        res.status(404).json({
          status: 'fail',
          message: 'Article not found',
        });
      }
    })
    .catch(next);
});

router.put('/articles/:slug', auth.authenticateUser, (req, res, next) => {
  const {
    title, description, body,
  } = req.body.article;

  Article.find({ where: { slug: req.params.slug } })
    .then((article) => {
      if (article) {
        const updatedArticle = article;
        updatedArticle.title = title !== undefined ? title : article.title;
        updatedArticle.description = description !== undefined ? description : article.description;
        updatedArticle.body = body !== undefined ? body : article.body;
        updatedArticle.save();
        User.find({ where: { id: article.authorId } })
          .then((user) => {
            res.status(200).json({
              article: {
                slug: article.slug,
                title: article.title,
                description: article.description,
                body: article.body,
                author: user.username,
              },
              message: 'Article Updated',
            });
          })
          .catch(next);
      } else {
        res.status(404).json({
          status: 'fail',
          message: 'Article not found',
        });
      }
    })
    .catch(next);
});

router.delete('/articles/:slug', auth.authenticateUser, (req, res, next) => {
  Article.find({ where: { slug: req.params.slug } })
    .then((article) => {
      if (article) {
        Article.destroy({ where: { slug: req.params.slug } })
          .then((success) => {
            if (success) {
              res.status(200).json({
                article: {
                  slug: article.slug,
                  title: article.title,
                  description: article.description,
                  body: article.body,
                },
                message: 'Article Deleted',
              });
            } else {
              res.status(500).json({
                status: 'fail',
                message: 'Could not delete Article',
              });
            }
          })
          .catch(next);
      } else {
        res.status(404).json({
          status: 'fail',
          message: 'Article not found',
        });
      }
    })
    .catch(next);
});

export default router;
