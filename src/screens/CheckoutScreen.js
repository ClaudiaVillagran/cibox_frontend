import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createOrderFromCustomBox } from '../services/orderService';

export default function CheckoutScreen({ navigation }) {
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('webpay');
  const [couponCode, setCouponCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!region.trim() || !city.trim() || !address.trim()) {
      Alert.alert('Faltan datos', 'Completa región, ciudad y dirección');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        shipping: {
          region: region.trim(),
          city: city.trim(),
          address: address.trim(),
        },
        payment: {
          method: paymentMethod,
        },
      };

      if (couponCode.trim()) {
        payload.couponCode = couponCode.trim();
      }

      const data = await createOrderFromCustomBox(payload);
      const order = data?.order || data?.data?.order || data?.data || data;

      Alert.alert('Compra creada', 'La orden fue creada correctamente');

      navigation.replace('Orders');
    } catch (error) {
      console.log('CHECKOUT ERROR:', error?.response?.data || error.message);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'No se pudo crear la orden'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View
          style={{
            width: '100%',
            maxWidth: 720,
            alignSelf: 'center',
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
            Checkout
          </Text>

          <Text style={{ color: '#666', marginBottom: 24 }}>
            Completa los datos de envío y pago para crear tu orden.
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: '#e5e5e5',
              borderRadius: 16,
              padding: 16,
              backgroundColor: '#fff',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 14 }}>
              Envío
            </Text>

            <Text style={{ marginBottom: 6, fontWeight: '600' }}>Región</Text>
            <TextInput
              value={region}
              onChangeText={setRegion}
              placeholder="Ej: RM"
              style={{
                borderWidth: 1,
                borderColor: '#dcdcdc',
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
              }}
            />

            <Text style={{ marginBottom: 6, fontWeight: '600' }}>Ciudad</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Ej: Santiago"
              style={{
                borderWidth: 1,
                borderColor: '#dcdcdc',
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
              }}
            />

            <Text style={{ marginBottom: 6, fontWeight: '600' }}>Dirección</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Ej: Las Condes 123"
              style={{
                borderWidth: 1,
                borderColor: '#dcdcdc',
                borderRadius: 10,
                padding: 12,
                marginBottom: 20,
              }}
            />

            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 14 }}>
              Pago
            </Text>

            <Text style={{ marginBottom: 6, fontWeight: '600' }}>
              Método de pago
            </Text>
            <TextInput
              value={paymentMethod}
              onChangeText={setPaymentMethod}
              placeholder="webpay"
              style={{
                borderWidth: 1,
                borderColor: '#dcdcdc',
                borderRadius: 10,
                padding: 12,
                marginBottom: 20,
              }}
            />

            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 14 }}>
              Cupón
            </Text>

            <Text style={{ marginBottom: 6, fontWeight: '600' }}>
              Código de cupón
            </Text>
            <TextInput
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Opcional"
              autoCapitalize="characters"
              style={{
                borderWidth: 1,
                borderColor: '#dcdcdc',
                borderRadius: 10,
                padding: 12,
                marginBottom: 20,
              }}
            />

            <Pressable
              onPress={handleCheckout}
              disabled={submitting}
              style={{
                backgroundColor: submitting ? '#777' : '#111',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                {submitting ? 'Creando orden...' : 'Confirmar compra'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}