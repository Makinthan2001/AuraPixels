import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

export const addHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, image_url } = req.body;
    const userId = req.user?.id;

    if (!prompt || !image_url) {
      res.status(400);
      throw new Error('Prompt and image URL are required');
    }

    if (!userId) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const history = await prisma.history.create({
      data: {
        userId,
        prompt,
        imageUrl: image_url,
      },
    });

    res.status(201).json(history);
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    if (req.user?.id !== userId) {
      res.status(403);
      throw new Error('Not authorized to view this history');
    }

    const history = await prisma.history.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        prompt: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    // Map Prisma schema camelCase to snake_case for frontend compatibility if needed
    const formattedHistory = history.map(item => ({
      id: item.id,
      prompt: item.prompt,
      image_url: item.imageUrl,
      created_at: item.createdAt,
    }));

    res.json(formattedHistory);
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};
