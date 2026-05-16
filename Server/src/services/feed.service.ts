import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface FeedQueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  style?: string;
  search?: string;
  userId?: number;
  sort?: 'newest' | 'trending';
}

export interface FeedWallpaperItem {
  id: number;
  prompt: string;
  category: string | null;
  style: string | null;
  resolution: string | null;
  imageUrl: string;
  likesCount: number;
  createdAt: Date;
  userId: number | null;
  username: string;
  profileImage: string | null;
  isLiked: boolean;
  creator?: {
    id: number;
    name: string;
    profileImage: string | null;
  } | null;
}

export interface FeedDetailsResult extends FeedWallpaperItem {
  relatedWallpapers: FeedWallpaperItem[];
}

export class FeedService {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly MAX_LIMIT = 50;

  private static inferCategory(wallpaper: { prompt?: string; tags?: string[]; category?: string | null; style?: string | null }) {
    const existing = wallpaper.category || wallpaper.style;
    if (existing) return existing;

    const text = `${wallpaper.prompt || ''} ${(wallpaper.tags || []).join(' ')}`.toLowerCase();

    if (/(anime|manga|naruto|shinchan|ghibli|cartoon)/i.test(text)) return 'Anime';
    if (/(cinematic|film|movie|dramatic|lighting)/i.test(text)) return 'Cinematic';
    if (/(minimal|simple|clean lines|minimalist)/i.test(text)) return 'Minimal';
    if (/(abstract|liquid|paint|geometry|geometric)/i.test(text)) return 'Abstract';
    if (/(cyberpunk|neon|futuristic|dystopian|sci[- ]?fi)/i.test(text)) return 'Cyberpunk';

    return null;
  }

  private static sanitizePagination(page?: number, limit?: number) {
    const safePage = Number.isFinite(page) && (page || 0) > 0 ? Math.floor(page as number) : FeedService.DEFAULT_PAGE;
    const safeLimit = Number.isFinite(limit) && (limit || 0) > 0 ? Math.min(Math.floor(limit as number), FeedService.MAX_LIMIT) : FeedService.DEFAULT_LIMIT;

    return {
      page: safePage,
      limit: safeLimit,
      skip: (safePage - 1) * safeLimit,
    };
  }

  private static buildWhereClause(options: Pick<FeedQueryOptions, 'category' | 'style' | 'search'>) {
    const where: Prisma.WallpaperWhereInput = {};

    // Filter by category (priority) or style
    const filterValue = options.category || options.style;
    if (filterValue && filterValue !== 'All') {
      where.OR = [
        { category: { equals: filterValue, mode: 'insensitive' as const } },
        { style: { equals: filterValue, mode: 'insensitive' as const } },
      ];
    }

    const search = options.search?.trim();
    if (search) {
      const searchCondition: Prisma.WallpaperWhereInput = {
        OR: [
          { prompt: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
          { style: { contains: search, mode: 'insensitive' as const } },
          { user: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      };

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          searchCondition
        ];
        delete where.OR;
      } else {
        where.OR = searchCondition.OR;
      }
    }

    return where;
  }

  private static mapWallpaperRow(wallpaper: any, isLikedOverride?: boolean): FeedWallpaperItem {
    return {
      id: wallpaper.id,
      prompt: wallpaper.prompt,
      category: FeedService.inferCategory(wallpaper),
      style: wallpaper.style,
      resolution: wallpaper.resolution,
      imageUrl: wallpaper.imageUrl,
      likesCount: wallpaper.likesCount ?? wallpaper._count?.likes ?? 0,
      createdAt: wallpaper.createdAt,
      userId: wallpaper.userId,
      username: wallpaper.user?.name || 'Anonymous',
      profileImage: wallpaper.user?.profileImage || null,
      isLiked:
        typeof isLikedOverride === 'boolean'
          ? isLikedOverride
          : Array.isArray(wallpaper.likes)
            ? wallpaper.likes.length > 0
            : Boolean(wallpaper.isLiked),
      creator: wallpaper.user
        ? {
            id: wallpaper.user.id,
            name: wallpaper.user.name,
            profileImage: wallpaper.user.profileImage || null,
          }
        : null,
    };
  }

  /**
   * Get main feed wallpapers
   */
  static async getFeed(options: FeedQueryOptions) {
    const { page, limit, skip } = FeedService.sanitizePagination(options.page, options.limit);
    const where = FeedService.buildWhereClause({ category: options.category || options.style, search: options.search });
    const orderBy = options.sort === 'trending'
      ? [{ likesCount: 'desc' as const }, { createdAt: 'desc' as const }]
      : [{ createdAt: 'desc' as const }];

    const [wallpapers, total] = await Promise.all([
      prisma.wallpaper.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          _count: {
            select: { likes: true },
          },
          likes: options.userId
            ? {
                where: { userId: options.userId },
                select: { id: true },
              }
            : false,
        },
      }),
      prisma.wallpaper.count({ where }),
    ]);

    const formattedWallpapers = wallpapers.map((wallpaper) => FeedService.mapWallpaperRow(wallpaper));

    return {
      wallpapers: formattedWallpapers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get trending wallpapers
   */
  static async getTrending(userId?: number) {
    const wallpapers = await prisma.wallpaper.findMany({
      take: 100,
      orderBy: [
        { likesCount: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        likes: {
          select: {
            id: true,
            createdAt: true,
            userId: true,
          },
        },
      },
    });

    return wallpapers
      .map((wallpaper) => {
        const latestEngagementAt = wallpaper.likes.length
          ? wallpaper.likes.reduce((latest, like) => (like.createdAt > latest ? like.createdAt : latest), wallpaper.createdAt)
          : wallpaper.createdAt;

        const isLiked = userId ? wallpaper.likes.some((like) => like.userId === userId) : false;

        return {
          ...FeedService.mapWallpaperRow(wallpaper, isLiked),
          latestEngagementAt,
        };
      })
      .sort((a, b) => {
        if (b.likesCount !== a.likesCount) {
          return b.likesCount - a.likesCount;
        }

        const latestA = a.latestEngagementAt instanceof Date ? a.latestEngagementAt.getTime() : new Date(a.latestEngagementAt).getTime();
        const latestB = b.latestEngagementAt instanceof Date ? b.latestEngagementAt.getTime() : new Date(b.latestEngagementAt).getTime();

        if (latestB !== latestA) {
          return latestB - latestA;
        }

        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(0, 10)
      .map(({ latestEngagementAt, ...wallpaper }) => wallpaper);
  }

  /**
   * Toggle like for a wallpaper
   */
  static async toggleLike(wallpaperId: number, userId: number) {
    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id: wallpaperId },
      select: { id: true, likesCount: true, category: true },
    });

    if (!wallpaper) {
      const error = new Error('Wallpaper not found');
      (error as any).status = 404;
      throw error;
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_wallpaperId: { userId, wallpaperId },
      },
      select: { id: true },
    });

    if (existingLike) {
      await prisma.$transaction(async (tx) => {
        await tx.like.delete({
          where: { id: existingLike.id },
        });

        await tx.wallpaper.update({
          where: { id: wallpaperId },
          data: {
            likesCount: {
              decrement: 1,
            },
          },
        });
      });

      const updated = await prisma.wallpaper.findUnique({
        where: { id: wallpaperId },
        select: { likesCount: true },
      });

      return { liked: false, likesCount: updated?.likesCount || 0 };
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.like.create({
          data: { userId, wallpaperId },
        });

        await tx.wallpaper.update({
          where: { id: wallpaperId },
          data: {
            likesCount: {
              increment: 1,
            },
          },
        });
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const current = await prisma.wallpaper.findUnique({
          where: { id: wallpaperId },
          select: { likesCount: true },
        });

        return {
          liked: true,
          likesCount: current?.likesCount || 0,
        };
      }

      throw error;
    }

    const updated = await prisma.wallpaper.findUnique({
      where: { id: wallpaperId },
      select: { likesCount: true },
    });

    return { liked: true, likesCount: updated?.likesCount || 0 };
  }

  /**
   * Get wallpaper details
   */
  static async getDetails(id: number, userId?: number) {
    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!wallpaper) return null;

    const relatedConditions: Prisma.WallpaperWhereInput[] = [];
    if (wallpaper.style) {
      relatedConditions.push({ style: wallpaper.style });
    }
    if (wallpaper.userId) {
      relatedConditions.push({ userId: wallpaper.userId });
    }

    const related = relatedConditions.length
      ? await prisma.wallpaper.findMany({
          where: {
            OR: relatedConditions,
            NOT: { id: wallpaper.id },
          },
          take: 6,
          orderBy: [
            { likesCount: 'desc' },
            { createdAt: 'desc' },
          ],
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        })
      : [];

    return {
      ...FeedService.mapWallpaperRow(wallpaper),
      relatedWallpapers: related.map((item) => FeedService.mapWallpaperRow(item)),
    };
  }
}
