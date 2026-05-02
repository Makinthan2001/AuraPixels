import { useRouter } from 'expo-router';
import { RegisterScreen } from '../../src/screens/RegisterScreen';

export default function Register() {
  const router = useRouter();
  
  const navigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'Login') {
        router.push('/(auth)/login');
      } else if (screen === 'VerifyOTP') {
        router.push({
          pathname: '/(auth)/verify',
          params: params
        });
      }
    }
  };

  return <RegisterScreen navigation={navigation} />;
}
