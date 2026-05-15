import { prisma } from '../lib/prisma';

export interface HistoryCreateData {
  userId: number;
  prompt: string;
  style: string;
  resolution: string;
  imageUrl: string;
}

export interface HistoryQueryOptions {
  userId: number;
  page?: number;
  limit?: number;
  search?: string;
  style?: string;
}

export class HistoryService {
  /**
   * Save a new history item
   */
  static async addHistory(data: HistoryCreateData) {
    return await prisma.history.create({
      data: {
        userId: data.userId,
        prompt: data.prompt,
        style: data.style,
        resolution: data.resolution,
        imageUrl: data.imageUrl,
      },
    });
  }

  /**
   * Get history for a user with filtering and pagination
   */
  static async getHistory(options: HistoryQueryOptions) {
    const { userId, page = 1, limit = 10, search, style } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (search) {
      where.prompt = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (style && style !== 'All') {
      where.style = {
        equals: style,
        mode: 'insensitive',
      };
    }

    const [items, total] = await Promise.all([
      prisma.history.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.history.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete a specific history item
   */
  static async deleteHistoryItem(id: number, userId: number) {
    // Ownership check is done in service to be safe
    const item = await prisma.history.findUnique({
      where: { id },
    });

    if (!item || item.userId !== userId) {
      throw new Error('History item not found or unauthorized');
    }

    return await prisma.history.delete({
      where: { id },
    });
  }

  /**
   * Clear all history for a user
   */
  static async clearAllHistory(userId: number) {
    return await prisma.history.deleteMany({
      where: { userId },
    });
  }
}
