import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

const resolveWallpaperId = (req: AuthRequest) => {
  const rawValue = req.params.wallpaperId || req.body.wallpaper_id || req.body.wallpaperId;

  if (rawValue === undefined || rawValue === null) {
    return null;
  }

  const numericValue = typeof rawValue === 'string' ? parseInt(rawValue, 10) : Number(rawValue);

  return Number.isNaN(numericValue) ? null : numericValue;
};

const loadWallpaperState = async (wallpaperId: number, userId: number) => {
  return prisma.wallpaper.findUnique({
    where: { id: wallpaperId },
    select: {
      id: true,
      _count: { select: { favorites: true } },
      likes: {
        where: { userId },
        select: { id: true },
      },
      favorites: {
        where: { userId },
        select: { id: true },
      },
    },
  });
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const wallpaperIdToUse = resolveWallpaperId(req);

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!wallpaperIdToUse) {
      return res.status(400).json({ message: 'Wallpaper ID is required' });
    }

    const wallpaperCheck = await prisma.wallpaper.findUnique({
      where: { id: wallpaperIdToUse },
      select: { id: true },
    });
    
    if (!wallpaperCheck) {
      return res.status(404).json({ message: 'Wallpaper not found' });
    }

    const favCheck = await prisma.favorite.findUnique({
      where: {
        userId_wallpaperId: {
          userId,
          wallpaperId: wallpaperIdToUse,
        },
      },
    });

    if (favCheck) {
      await prisma.favorite.delete({
        where: { id: favCheck.id },
      });
      const current = await loadWallpaperState(wallpaperIdToUse, userId);
      return res.status(200).json({
        favorited: false,
        favoritesCount: current?._count.favorites || 0,
        likedByCurrentUser: current ? current.likes.length > 0 : false,
        favoritedByCurrentUser: false,
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        wallpaperId: wallpaperIdToUse,
      },
      select: {
        id: true,
        wallpaperId: true,
      },
    });

    const current = await loadWallpaperState(wallpaperIdToUse, userId);

    res.status(201).json({
      ...favorite,
      favorited: true,
      favoritesCount: current?._count.favorites || 0,
      likedByCurrentUser: current ? current.likes.length > 0 : false,
      favoritedByCurrentUser: true,
    });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const addFavorite = toggleFavorite;

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        wallpaper: {
          include: {
            user: { select: { name: true } },
            likes: { where: { userId }, select: { id: true } },
            favorites: { where: { userId }, select: { id: true } },
            _count: { select: { favorites: true } },
          },
        },
      },
    });

    const formattedFavorites = favorites.map(fav => ({
      id: fav.wallpaper.id,
      wallpaperId: fav.wallpaper.id,
      prompt: fav.wallpaper.prompt,
      imageUrl: fav.wallpaper.imageUrl,
      style: fav.wallpaper.style,
      resolution: fav.wallpaper.resolution,
      likesCount: fav.wallpaper.likesCount,
      favoritesCount: fav.wallpaper._count.favorites,
      createdAt: fav.wallpaper.createdAt,
      userName: fav.wallpaper.user?.name || 'AuraPixels',
      likedByCurrentUser: fav.wallpaper.likes.length > 0,
      favoritedByCurrentUser: fav.wallpaper.favorites.length > 0,
      isLiked: fav.wallpaper.likes.length > 0,
      isFavorited: true,
    }));

    res.json({ data: formattedFavorites });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const favoriteId = Number(req.params.id);
    const userId = req.user?.id;

    const favCheck = await prisma.favorite.findUnique({
      where: { id: favoriteId },
    });
    
    if (!favCheck) {
      res.status(404);
      throw new Error('Favorite not found');
    }

    if (favCheck.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to remove this favorite');
    }

    await prisma.favorite.delete({
      where: { id: favoriteId },
    });

    res.json({ message: 'Favorite removed' });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};
