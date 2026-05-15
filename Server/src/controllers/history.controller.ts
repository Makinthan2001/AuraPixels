import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { HistoryService } from '../services/history.service';

export const addHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, imageUrl, style, resolution } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!prompt || !imageUrl) {
      return res.status(400).json({ message: 'Prompt and image URL are required' });
    }

    const history = await HistoryService.addHistory({
      userId,
      prompt,
      imageUrl,
      style,
      resolution,
    });

    res.status(201).json({
      message: 'History saved successfully',
      history,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const style = req.query.style as string;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await HistoryService.getHistory({
      userId,
      page,
      limit,
      search,
      style,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHistoryItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam as string, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid id parameter' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await HistoryService.deleteHistoryItem(id, userId);

    res.json({ message: 'History deleted successfully' });
  } catch (error: any) {
    const status = error.message.includes('unauthorized') ? 403 : 404;
    res.status(status).json({ message: error.message });
  }
};

export const clearAllHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await HistoryService.clearAllHistory(userId);

    res.json({ message: 'All history cleared' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
