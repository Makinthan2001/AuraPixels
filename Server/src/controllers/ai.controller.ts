import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';
import { AIService, AIStyle, AISize } from '../services/ai.service';

export const generateWallpaper = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, style = 'cinematic', size = 'portrait' } = req.body;
    const userId = req.user?.id;

    if (!prompt) {
      res.status(400).json({ message: 'Prompt is required' });
      return;
    }

    if (prompt.length > 200) {
      res.status(400).json({ message: 'Prompt must be 200 characters or less' });
      return;
    }

    const validStyles: AIStyle[] = ['cinematic', 'anime', 'minimal', 'abstract', 'cyberpunk', 'realistic'];
    if (!validStyles.includes(style)) {
      res.status(400).json({ message: 'Invalid style' });
      return;
    }

    const validSizes: AISize[] = ['square', 'portrait', 'landscape', 'tablet', 'ultrawide'];
    if (!validSizes.includes(size)) {
      res.status(400).json({ message: 'Invalid size' });
      return;
    }

    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Call AIService to get enhanced prompt and image URL (base64)
    const generatedData = await AIService.generateImage(prompt, style as AIStyle, size as AISize);

    // Save to wallpapers table and history table using Prisma transaction
    const [wallpaper, history] = await prisma.$transaction([
      prisma.wallpaper.create({
        data: {
          imageUrl: generatedData.imageUrl, // storing base64 for now
          prompt: generatedData.enhancedPrompt,
          tags: ['AI Generated', style],
        },
        select: {
          id: true,
          imageUrl: true,
        }
      }),
      prisma.history.create({
        data: {
          userId,
          prompt: generatedData.enhancedPrompt,
          imageUrl: generatedData.imageUrl,
          style: style,
          resolution: size,
        }
      })
    ]);

    res.status(201).json({
      prompt: generatedData.enhancedPrompt,
      style: style,
      size: generatedData.size,
      imageUrl: wallpaper.imageUrl
    });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    const status = typeof error.status === 'number' ? error.status : (res.statusCode !== 200 ? res.statusCode : 500);
    res.status(status).json({ 
      message: error.message || 'An unexpected error occurred during image generation.',
      details: error.stack // Optional: remove in production
    });
  }
};
