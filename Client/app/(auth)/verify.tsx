import { useLocalSearchParams, useRouter } from 'expo-router';
import { VerifyOTPScreen } from '../../src/screens/VerifyOTPScreen';

export default function Verify() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const navigation = {
    goBack: () => {
      router.back();
    }
  };

  return <VerifyOTPScreen route={{ params }} navigation={navigation} />;
}
