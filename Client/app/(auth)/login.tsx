import { useRouter } from 'expo-router';
import { LoginScreen } from '../../src/screens/LoginScreen';

export default function Login() {
  const router = useRouter();
  
  const navigation = {
    navigate: (screen: string) => {
      if (screen === 'Register') {
        router.push('/(auth)/register');
      }
    }
  };

  return <LoginScreen navigation={navigation} />;
}
