
import { Router } from 'express';
import userRouter from './users';
import articleRouter from './articles';
import followRouter from './follow';
import commentRouter from './comments';
import oauthRoute from './auth/authRoute';
import categoryRouter from './categories';
import subscriptionRouter from './subscription';

const router = Router();

router.use('/', oauthRoute);
router.use('/', userRouter);
router.use('/', articleRouter);
router.use('/', followRouter);
router.use('/', commentRouter);
router.use('/', categoryRouter);
router.use('/', subscriptionRouter);

export default router;
