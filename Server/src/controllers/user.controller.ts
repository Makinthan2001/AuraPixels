import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            wallpapers: true,
            favorites: true,
            history: true,
            likes: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      generatedCount: user._count.history,
      likedCount: user._count.likes,
      favoritesCount: user._count.favorites,
      joinedDate: user.createdAt.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Convert the image buffer to a Base64 string
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: base64Image },
    });

    res.status(200).json({
      success: true,
      message: 'Photo uploaded',
      data: { profileImage: updatedUser.profileImage },
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
