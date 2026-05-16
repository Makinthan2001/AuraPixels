import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

type RateLimitKeyBuilder = (req: AuthRequest) => string;

interface RateLimitOptions {
  windowMs: number;
  limit: number;
  keyBuilder?: RateLimitKeyBuilder;
  message?: string;
}

interface BucketState {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketState>();

export const createRateLimiter = (options: RateLimitOptions) => {
  const { windowMs, limit, keyBuilder, message = 'Too many requests, please try again later.' } = options;

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = keyBuilder?.(req) || req.user?.id?.toString() || req.ip || 'global';
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= limit) {
      res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000).toString());
      return res.status(429).json({
        success: false,
        message,
      });
    }

    bucket.count += 1;
    buckets.set(key, bucket);
    return next();
  };
};

export const likeRateLimiter = createRateLimiter({
  windowMs: 60_000,
  limit: 15,
  message: 'You are liking wallpapers too quickly. Please slow down.',
});
