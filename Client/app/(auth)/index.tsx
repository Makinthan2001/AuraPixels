import { useRouter } from 'expo-router';
import { LandingScreen } from '../../src/screens/LandingScreen';

export default function Index() {
  const router = useRouter();
  
  const navigation = {
    navigate: (screen: string) => {
      if (screen === 'Register') {
        router.push('/(auth)/register');
      } else if (screen === 'Login') {
        router.push('/(auth)/login');
      }
    }
  };

  return <LandingScreen navigation={navigation} />;
}
