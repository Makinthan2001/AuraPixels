import { useRouter } from 'expo-router';
import { ProfileScreen } from '../../src/screens/ProfileScreen';

export default function Profile() {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'WallpaperDetail') {
        router.push({
          pathname: '/wallpaper-detail',
          params: { wallpaper: JSON.stringify(params.wallpaper) }
        });
      } else if (screen === 'GenerateTab') {
        router.push({
          pathname: '/(tabs)/generate',
          params: { initialPrompt: params.initialPrompt }
        });
      }
    }
  };

  return <ProfileScreen navigation={navigation} />;
}
