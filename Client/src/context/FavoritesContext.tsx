import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../services/api";
import { AuthContext } from "./AuthContext";

export interface Wallpaper {
  id: string;
  url: string;
  prompt?: string;
  tags?: string[];
  isGenerated?: boolean;
  wallpaperId?: number | null;
  likedByCurrentUser?: boolean;
  favoritedByCurrentUser?: boolean;
  likesCount?: number;
  favoritesCount?: number;
}

interface FavoritesContextData {
  favorites: Wallpaper[];
  history: Wallpaper[];
  addFavorite: (wallpaper: Wallpaper) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  addToHistory: (wallpaper: Wallpaper) => void;
  refreshFavorites: () => Promise<void>;
  homeFeedRevision: number;
  invalidateHomeFeed: () => void;
  toggleFavorite: (
    wallpaper: Wallpaper,
  ) => Promise<{ favorited: boolean; favoritesCount: number }>;
}

export const FavoritesContext = createContext<FavoritesContextData>(
  {} as FavoritesContextData,
);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Wallpaper[]>([]);
  const [history, setHistory] = useState<Wallpaper[]>([]);
  const [homeFeedRevision, setHomeFeedRevision] = useState(0);
  const { isAuthenticated } = useContext(AuthContext);

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    try {
      const response = await api.getFavorites({ page: 1, limit: 100 });
      const items = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setFavorites(
        items.map((item: any) => ({
          id: String(item.id),
          wallpaperId: typeof item.id === "number" ? item.id : Number(item.id),
          url: item.imageUrl,
          prompt: item.prompt,
          tags: item.tags,
          isGenerated: true,
          likedByCurrentUser: Boolean(item.likedByCurrentUser ?? item.isLiked),
          favoritedByCurrentUser: Boolean(
            item.favoritedByCurrentUser ?? item.isFavorite ?? true,
          ),
          likesCount: item.likesCount,
          favoritesCount: item.favoritesCount,
        })),
      );
    } catch (error) {
      console.error("Failed to hydrate favorites", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshFavorites();
  }, [refreshFavorites]);

  const addFavorite = (wallpaper: Wallpaper) => {
    setFavorites((current) => {
      if (current.find((f) => f.id === wallpaper.id)) {
        return current;
      }

      return [...current, wallpaper];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((current) => current.filter((f) => f.id !== id));
  };

  const isFavorite = (id: string) => {
    return !!favorites.find((f) => f.id === id);
  };

  const addToHistory = (wallpaper: Wallpaper) => {
    setHistory((current) => [wallpaper, ...current]);
  };

  const invalidateHomeFeed = useCallback(() => {
    setHomeFeedRevision((current) => current + 1);
  }, []);

  const toggleFavorite = useCallback(
    async (wallpaper: Wallpaper) => {
      const wallpaperId =
        wallpaper.wallpaperId ?? Number.parseInt(wallpaper.id, 10);
      const canPersist =
        Number.isFinite(wallpaperId) && !Number.isNaN(wallpaperId);
      const currentlyFavorited = isFavorite(String(wallpaper.id));

      if (currentlyFavorited) {
        removeFavorite(String(wallpaper.id));
      } else {
        addFavorite(wallpaper);
      }

      if (!canPersist) {
        return {
          favorited: !currentlyFavorited,
          favoritesCount: currentlyFavorited ? 0 : 1,
        };
      }

      try {
        const response = await api.toggleFavorite(wallpaperId);
        const favorited = Boolean(
          response.data?.favorited ??
          response.data?.favoritedByCurrentUser ??
          !currentlyFavorited,
        );
        const favoritesCount = Number(response.data?.favoritesCount ?? 0);

        if (favorited) {
          addFavorite({
            ...wallpaper,
            id: String(wallpaperId),
            wallpaperId,
            favoritedByCurrentUser: true,
            favoritesCount,
          });
        } else {
          removeFavorite(String(wallpaper.id));
        }

        invalidateHomeFeed();

        return { favorited, favoritesCount };
      } catch (error) {
        if (currentlyFavorited) {
          addFavorite(wallpaper);
        } else {
          removeFavorite(String(wallpaper.id));
        }

        throw error;
      }
    },
    [addFavorite, isFavorite, removeFavorite],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        history,
        addFavorite,
        removeFavorite,
        isFavorite,
        addToHistory,
        refreshFavorites,
        homeFeedRevision,
        invalidateHomeFeed,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
