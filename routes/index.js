import { Router } from 'express';
import apiRouter from './api';

const router = Router();
router.use('/api', apiRouter);

// return for call to /api
router.get('/api', (req, res) => { // eslint-disable-line named-import, arrow-body-style
  return res.status(200).send({ message: 'Author\'s Haven is up and running' });
});

export default router;
