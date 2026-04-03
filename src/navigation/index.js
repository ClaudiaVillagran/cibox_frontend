import { NavigationContainer } from '@react-navigation/native';
import useAuthStore from '../store/authStore';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default function RootNavigation() {
  const { token } = useAuthStore();

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}