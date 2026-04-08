import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { loginRequest } from '../services/authService';
import useAuthStore from '../store/authStore';
import { showAppAlert } from '../utils/appAlerts';

export default function LoginScreen() {
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const data = await loginRequest({ email, password });

      const user = data.user || data.data?.user;
      const token = data.token || data.data?.token;

      setAuth({ user, token });
    } catch (error) {
      showAppAlert('Error', 'Login fallido');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <Button title="Ingresar" onPress={handleLogin} />
    </View>
  );
}