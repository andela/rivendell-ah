import { Router } from 'express';
import userRouter from './users';
import articleRouter from './articles';
import followRouter from './follow';
import commentRouter from './comments';

const router = Router();
router.use('/', userRouter);
router.use('/', articleRouter);
router.use('/', followRouter);
router.use('/', commentRouter);
router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        const errObj = errors;
        errObj[key] = err.errors[key].message;
        return errObj;
      }, {}),
    });
  }
  return next(err);
});

export default router;
