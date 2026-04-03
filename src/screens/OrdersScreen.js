import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { getMyOrders } from '../services/orderService';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      const items = data?.orders || data?.data?.orders || data?.data || data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch (error) {
      console.log('GET ORDERS ERROR:', error?.response?.data || error.message);
      Alert.alert('Error', 'No se pudieron cargar las órdenes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!orders.length) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 720,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>
            Aún no tienes órdenes
          </Text>
          <Text style={{ color: '#666', textAlign: 'center' }}>
            Cuando completes una compra, aparecerá aquí.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          padding: 16,
          width: '100%',
          maxWidth: 720,
          alignSelf: 'center',
        }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
            style={{
              borderWidth: 1,
              borderColor: '#e8e8e8',
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              backgroundColor: '#fff',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
              Orden #{item._id?.slice(-6)}
            </Text>

            <Text style={{ color: '#666', marginBottom: 4 }}>
              Estado: {item.status || '—'}
            </Text>

            <Text style={{ color: '#666', marginBottom: 4 }}>
              Total: ${item.total ?? '—'}
            </Text>

            <Text style={{ color: '#666' }}>
              Items: {item.items?.length ?? 0}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}