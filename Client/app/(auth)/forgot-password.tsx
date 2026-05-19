import { useRouter } from 'expo-router';
import { ForgotPasswordScreen } from '../../src/screens/ForgotPasswordScreen';

export default function ForgotPassword() {
  const router = useRouter();
  
  const navigation = {
    goBack: () => router.back(),
    navigate: (screen: string, params?: any) => {
      if (screen === 'VerifyResetOTP') {
        router.push({
          pathname: '/(auth)/verify-reset-otp',
          params: params
        });
      } else if (screen === 'Login') {
        router.replace('/(auth)/login');
      }
    }
  };

  return <ForgotPasswordScreen navigation={navigation} />;
}
