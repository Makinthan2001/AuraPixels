import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { FeedService } from '../services/feed.service';

const parsePositiveInt = (value: unknown, fallback: number, min = 1, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

export class FeedController {
  /**
   * Get main feed
   */
  static async getFeed(req: AuthRequest, res: Response) {
    try {
      const { page, limit, category, style, search, sort } = req.query;
      const userId = req.user?.id;

      const result = await FeedService.getFeed({
        page: parsePositiveInt(page, 1, 1),
        limit: parsePositiveInt(limit, 20, 1, 50),
        category: (category || style) as string,
        search: search as string,
        userId,
        sort: sort === 'trending' ? 'trending' : 'newest',
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch feed',
      });
    }
  }

  /**
   * Get trending wallpapers
   */
  static async getTrending(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const result = await FeedService.getTrending(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch trending wallpapers',
      });
    }
  }

  /**
   * Toggle like
   */
  static async toggleLike(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const wallpaperParam = Array.isArray(id) ? id[0] : id;
      const wallpaperId = parseInt(wallpaperParam as string, 10);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (Number.isNaN(wallpaperId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid wallpaper id',
        });
      }

      const result = await FeedService.toggleLike(wallpaperId, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const status = error.status || error.statusCode || 500;

      res.status(status).json({
        success: false,
        message: error.message || 'Failed to toggle like',
      });
    }
  }

  /**
   * Get wallpaper details
   */
  static async getDetails(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const wallpaperParam = Array.isArray(id) ? id[0] : id;
      const wallpaperId = parseInt(wallpaperParam as string, 10);
      const userId = req.user?.id;

      if (Number.isNaN(wallpaperId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid wallpaper id',
        });
      }

      const result = await FeedService.getDetails(wallpaperId, userId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Wallpaper not found',
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch details',
      });
    }
  }

  /**
   * Search wallpapers
   */
  static async search(req: AuthRequest, res: Response) {
    try {
      const { q, page, limit, category } = req.query;
      const userId = req.user?.id;

      const result = await FeedService.getFeed({
        search: q as string,
        category: category as string,
        page: parsePositiveInt(page, 1, 1),
        limit: parsePositiveInt(limit, 20, 1, 50),
        userId,
        sort: 'newest',
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to search wallpapers',
      });
    }
  }
}
