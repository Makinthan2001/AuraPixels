import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

export const generateWallpaper = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt } = req.body;
    const userId = req.user?.id;

    if (!prompt) {
      res.status(400);
      throw new Error('Prompt is required');
    }

    if (!userId) {
      res.status(401);
      throw new Error('Not authorized');
    }

    // Mock AI Generation (In production, call DALL-E or Midjourney API here)
    const mockGeneratedUrl = `https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop&sig=${Math.random()}`;

    // Save to wallpapers table and history table using Prisma transaction
    const [wallpaper, history] = await prisma.$transaction([
      prisma.wallpaper.create({
        data: {
          imageUrl: mockGeneratedUrl,
          prompt,
          tags: ['AI Generated'],
        },
        select: {
          id: true,
          imageUrl: true,
        }
      }),
      prisma.history.create({
        data: {
          userId,
          prompt,
          imageUrl: mockGeneratedUrl,
        }
      })
    ]);

    res.status(201).json(wallpaper);
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};
