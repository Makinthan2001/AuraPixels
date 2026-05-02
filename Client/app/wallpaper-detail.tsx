import { useLocalSearchParams, useRouter } from 'expo-router';
import { WallpaperDetailScreen } from '../src/screens/WallpaperDetailScreen';

export default function WallpaperDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  let wallpaper = null;
  if (typeof params.wallpaper === 'string') {
    try {
      wallpaper = JSON.parse(params.wallpaper);
    } catch (e) {
      console.error("Failed to parse wallpaper param", e);
    }
  }

  const navigation = {
    goBack: () => router.back(),
    navigate: (screen: string, navParams?: any) => {
      if (screen === 'GenerateTab') {
        router.push({
          pathname: '/(tabs)/generate',
          params: { initialPrompt: navParams?.initialPrompt }
        });
      }
    }
  };

  if (!wallpaper) return null;

  return <WallpaperDetailScreen route={{ params: { wallpaper } }} navigation={navigation} />;
}
