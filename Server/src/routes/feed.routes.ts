import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import { protect, optionalAuth } from '../middlewares/auth.middleware';
import { likeRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

/**
 * @route   GET /api/feed
 * @desc    Get main wallpaper feed
 * @access  Public (Optional Auth)
 */
router.get('/', optionalAuth, FeedController.getFeed);

/**
 * @route   GET /api/feed/search?q=anime
 * @desc    Search wallpapers by prompt, style, or creator name
 * @access  Public (Optional Auth)
 */
router.get('/search', optionalAuth, FeedController.search);

/**
 * @route   GET /api/feed/trending
 * @desc    Get trending wallpapers
 * @access  Public (Optional Auth)
 */
router.get('/trending', optionalAuth, FeedController.getTrending);

/**
 * @route   GET /api/feed/:id
 * @desc    Get wallpaper details
 * @access  Public (Optional Auth)
 */
router.get('/:id', optionalAuth, FeedController.getDetails);

/**
 * @route   POST /api/feed/:id/like
 * @desc    Toggle like for a wallpaper
 * @access  Private
 */
router.post('/:id/like', protect, likeRateLimiter, FeedController.toggleLike);

export default router;
