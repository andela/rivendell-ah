import { Router } from 'express';
import userRouter from './users';

const router = Router();
router.use('/', userRouter);
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
