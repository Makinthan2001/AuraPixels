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
    const userId = Number(req.params.userId);

    // Verify requesting user is getting their own favorites
    if (req.user?.id !== userId) {
      res.status(403);
      throw new Error('Not authorized to get these favorites');
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        wallpaper: {
          select: {
            id: true,
            imageUrl: true,
            tags: true,
          },
        },
      },
    });

    const formattedFavorites = favorites.map(fav => ({
      favorite_id: fav.id,
      wallpaper_id: fav.wallpaper.id,
      image_url: fav.wallpaper.imageUrl,
      tags: fav.wallpaper.tags,
    }));

    res.json(formattedFavorites);
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
