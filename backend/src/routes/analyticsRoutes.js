import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';

const router = Router();

router.post('/track', analyticsController.track);

export default router;
