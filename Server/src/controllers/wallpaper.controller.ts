import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getWallpapers = async (req: Request, res: Response) => {
  try {
    const wallpapers = await prisma.wallpaper.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        imageUrl: true,
        tags: true,
        createdAt: true,
      },
    });
    res.json(wallpapers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWallpaperById = async (req: Request, res: Response) => {
  try {
    const wallpaper = await prisma.wallpaper.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true,
        imageUrl: true,
        tags: true,
        createdAt: true,
      },
    });
    
    if (!wallpaper) {
      res.status(404);
      throw new Error('Wallpaper not found');
    }

    res.json(wallpaper);
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};
