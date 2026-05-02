import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import wallpaperRoutes from './routes/wallpaper.routes';
import aiRoutes from './routes/ai.routes';
import favoriteRoutes from './routes/favorite.routes';
import historyRoutes from './routes/history.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallpapers', wallpaperRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/history', historyRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('AuraPixels API is running...');
});

// Error handling middleware
app.use(errorHandler);

export default app;
