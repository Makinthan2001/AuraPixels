import { useRouter } from 'expo-router';
import { FavoritesScreen } from '../../src/screens/FavoritesScreen';

export default function Favorites() {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'WallpaperDetail') {
        router.push({
          pathname: '/wallpaper-detail',
          params: { wallpaper: JSON.stringify(params.wallpaper) }
        });
      }
    }
  };

  return <FavoritesScreen navigation={navigation} />;
}
