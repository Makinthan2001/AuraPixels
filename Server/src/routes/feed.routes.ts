import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import { protect, optionalAuth } from '../middlewares/auth.middleware';
import { likeRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.get('/', optionalAuth, FeedController.getFeed);
router.get('/search', optionalAuth, FeedController.search);
router.get('/trending', optionalAuth, FeedController.getTrending);
router.get('/:id', optionalAuth, FeedController.getDetails);
router.post('/:id/like', protect, likeRateLimiter, FeedController.toggleLike);

export default router;
