import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    console.log("ADD FAVORITE CALLED with body:", req.body);
    const wallpaperIdToUse = req.body.wallpaper_id || req.body.wallpaperId;
    const userId = req.user?.id;

    if (!wallpaperIdToUse) {
      res.status(400);
      throw new Error('Wallpaper ID is required');
    }

    // Convert to number just in case
    const numericWallpaperId = typeof wallpaperIdToUse === 'string' ? parseInt(wallpaperIdToUse, 10) : wallpaperIdToUse;

    if (Number.isNaN(numericWallpaperId)) {
      res.status(400);
      throw new Error('Invalid Wallpaper ID format');
    }

    if (!userId) {
      res.status(401);
      throw new Error('Not authorized');
    }

    // Check if wallpaper exists
    const wallpaperCheck = await prisma.wallpaper.findUnique({
      where: { id: numericWallpaperId },
      select: { id: true },
    });
    
    if (!wallpaperCheck) {
      res.status(404);
      throw new Error('Wallpaper not found');
    }

    // Check if already favorited
    const favCheck = await prisma.favorite.findUnique({
      where: {
        userId_wallpaperId: {
          userId,
          wallpaperId: numericWallpaperId,
        },
      },
    });

    if (favCheck) {
      await prisma.favorite.delete({
        where: { id: favCheck.id },
      });
      return res.status(200).json({ message: 'Favorite removed', isFavorited: false });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        wallpaperId: numericWallpaperId,
      },
      select: {
        id: true,
        wallpaperId: true,
      },
    });

    res.status(201).json(favorite);
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

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
          },
        },
      },
    });

    const formattedFavorites = favorites.map(fav => ({
      id: fav.wallpaper.id,
      prompt: fav.wallpaper.prompt,
      imageUrl: fav.wallpaper.imageUrl,
      style: fav.wallpaper.style,
      resolution: fav.wallpaper.resolution,
      likesCount: fav.wallpaper.likesCount,
      createdAt: fav.wallpaper.createdAt,
      userName: fav.wallpaper.user?.name || 'AuraPixels',
      isLiked: fav.wallpaper.likes.length > 0,
      isFavorite: true,
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
