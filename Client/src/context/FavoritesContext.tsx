import React, { createContext, useState } from 'react';

export interface Wallpaper {
  id: string;
  url: string;
  prompt?: string;
  tags?: string[];
  isGenerated?: boolean;
}

interface FavoritesContextData {
  favorites: Wallpaper[];
  history: Wallpaper[];
  addFavorite: (wallpaper: Wallpaper) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  addToHistory: (wallpaper: Wallpaper) => void;
}

export const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Wallpaper[]>([]);
  const [history, setHistory] = useState<Wallpaper[]>([]);

  const addFavorite = (wallpaper: Wallpaper) => {
    if (!favorites.find(f => f.id === wallpaper.id)) {
      setFavorites([...favorites, wallpaper]);
    }
  };

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(f => f.id !== id));
  };

  const isFavorite = (id: string) => {
    return !!favorites.find(f => f.id === id);
  };

  const addToHistory = (wallpaper: Wallpaper) => {
    setHistory([wallpaper, ...history]);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, history, addFavorite, removeFavorite, isFavorite, addToHistory }}>
      {children}
    </FavoritesContext.Provider>
  );
};
