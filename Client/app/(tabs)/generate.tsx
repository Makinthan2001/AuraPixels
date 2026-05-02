import { useLocalSearchParams } from 'expo-router';
import { GenerateScreen } from '../../src/screens/GenerateScreen';

export default function Generate() {
  const params = useLocalSearchParams();
  
  return <GenerateScreen route={{ params }} navigation={{}} />;
}
