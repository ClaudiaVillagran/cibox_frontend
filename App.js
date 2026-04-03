import { useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import useAuthStore from './src/store/authStore';
import RootNavigation from './src/navigation';

export default function App() {
  const { loadAuth, isLoading } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView>
        <Text>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return <RootNavigation />;
}