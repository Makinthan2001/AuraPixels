import { useRouter, useLocalSearchParams } from 'expo-router';
import { VerifyResetOTPScreen } from '../../src/screens/VerifyResetOTPScreen';

export default function VerifyResetOTP() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const navigation = {
    goBack: () => router.back(),
    navigate: (screen: string, navParams?: any) => {
      if (screen === 'ResetPassword') {
        router.push({
          pathname: '/(auth)/reset-password',
          params: navParams
        });
      } else if (screen === 'Login') {
        router.replace('/(auth)/login');
      }
    }
  };

  return <VerifyResetOTPScreen navigation={navigation} route={{ params }} />;
}
