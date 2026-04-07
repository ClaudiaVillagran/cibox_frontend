import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { colors, radius, spacing } from '../constants/theme';
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
      showAppAlert('Error', 'No se pudieron cargar las órdenes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cardStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  };

  if (loading) {
    return (
      <ScreenContainer maxWidth={720}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenContainer>
    );
  }

  if (!orders.length) {
    return (
      <ScreenContainer maxWidth={720}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: spacing.xl,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: colors.text,
              marginBottom: 10,
            }}
          >
            Aún no tienes órdenes
          </Text>

          <Text
            style={{
              color: colors.muted,
              textAlign: 'center',
              maxWidth: 420,
            }}
          >
            Cuando completes una compra, aparecerá aquí.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={720}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 6,
              }}
            >
              Mis órdenes
            </Text>

            <Text style={{ color: colors.muted }}>
              Revisa el estado y detalle de tus compras.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
            style={cardStyle}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Orden #{item._id?.slice(-6)}
            </Text>

            <Text style={{ color: colors.muted, marginBottom: 4 }}>
              Estado: {item.status || '—'}
            </Text>

            <Text style={{ color: colors.muted, marginBottom: 4 }}>
              Total: ${item.total ?? '—'}
            </Text>

            <Text style={{ color: colors.muted }}>
              Items: {item.items?.length ?? 0}
            </Text>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}