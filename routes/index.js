import { Router } from 'express';
import apiRouter from './api';

const router = Router();
router.use('/v1/api', apiRouter);

// return for call to /api
router.get('/v1/api', (req, res) => { // eslint-disable-line named-import, arrow-body-style
  return res.status(200).send({ message: 'Author\'s Haven is up and running' });
});

export default router;
