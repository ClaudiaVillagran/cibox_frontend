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
import { getPantry, movePantryItemToCart } from '../services/pantryService';

export default function PantryScreen({ navigation }) {
  const [pantry, setPantry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState(null);

  const fetchPantry = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPantry();
      setPantry(data);
    } catch (error) {
      console.log('GET PANTRY ERROR:', error?.response?.data || error.message);
      showAppAlert('Error', 'No se pudo cargar la despensa');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMoveToCart = async (productId) => {
    try {
      setMovingId(productId);
      await movePantryItemToCart(productId);
      showAppAlert('Éxito', 'Producto agregado al carrito');
    } catch (error) {
      console.log('MOVE PANTRY TO CART ERROR:', error?.response?.data || error.message);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'No se pudo mover al carrito'
      );
    } finally {
      setMovingId(null);
    }
  };

  useEffect(() => {
    fetchPantry();
  }, [fetchPantry]);

  const items = pantry?.items || [];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!items.length) {
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
            Tu despensa está vacía
          </Text>

          <Text style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>
            Agrega productos para mantener una lista recurrente de compra.
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Home')}
            style={{
              backgroundColor: '#111',
              paddingHorizontal: 18,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              Ir al catálogo
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={{
          padding: 16,
          width: '100%',
          maxWidth: 900,
          alignSelf: 'center',
          paddingBottom: 32,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: 18 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
              Mi despensa
            </Text>

            <Text style={{ color: '#666' }}>
              Guarda productos frecuentes y agrégalos al carrito cuando quieras.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isMoving = movingId === item.product_id;

          return (
            <View
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
                {item.name}
              </Text>

              <Text style={{ color: '#666', marginBottom: 4 }}>
                Cantidad: {item.quantity}
              </Text>

              <Text style={{ color: '#666', marginBottom: 4 }}>
                Frecuencia: {item.frequency || 'monthly'}
              </Text>

              <Text style={{ color: '#666', marginBottom: 12 }}>
                Precio referencia: ${item.price ?? '—'}
              </Text>

              <Pressable
                onPress={() => handleMoveToCart(item.product_id)}
                disabled={isMoving}
                style={{
                  backgroundColor: isMoving ? '#777' : '#111',
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {isMoving ? 'Agregando...' : 'Agregar al carrito'}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}