import { useRouter, useLocalSearchParams } from 'expo-router';
import { ResetPasswordScreen } from '../../src/screens/ResetPasswordScreen';

export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const navigation = {
    goBack: () => router.back(),
    navigate: (screen: string) => {
      if (screen === 'Login') {
        router.replace('/(auth)/login');
      }
    }
  };

  return <ResetPasswordScreen navigation={navigation} route={{ params }} />;
}
