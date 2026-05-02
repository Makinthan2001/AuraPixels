import { useRouter } from 'expo-router';
import { HomeScreen } from '../../src/screens/HomeScreen';

export default function Home() {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'ProfileTab') {
        router.push('/(tabs)/profile');
      } else if (screen === 'WallpaperDetail') {
        router.push({
          pathname: '/wallpaper-detail',
          params: { wallpaper: JSON.stringify(params.wallpaper) }
        });
      }
    }
  };

  return <HomeScreen navigation={navigation} />;
}
