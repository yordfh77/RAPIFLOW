import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Card, Button, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { businessData, cart, deliveryType, total } = route.params;
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const deliveryFee = deliveryType === 'delivery' ? 20 : 0;
  const finalTotal = total + deliveryFee;

  const confirmOrder = async () => {
    if (deliveryType === 'delivery' && !customerAddress.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu dirección de entrega');
      return;
    }
    
    if (!customerPhone.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu número de teléfono');
      return;
    }

    setIsLoading(true);
    
    // Simular envío del pedido
    setTimeout(() => {
      setIsLoading(false);
      
      const orderData = {
        id: Date.now(),
        business: businessData,
        items: cart,
        deliveryType,
        customerAddress: deliveryType === 'delivery' ? customerAddress : businessData.address,
        customerPhone,
        specialInstructions,
        subtotal: total,
        deliveryFee,
        total: finalTotal,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };
      
      Alert.alert(
        'Pedido confirmado',
        `Tu pedido #${orderData.id} ha sido enviado al negocio. Te notificaremos cuando esté listo.`,
        [
          {
            text: 'Ver pedido',
            onPress: () => navigation.navigate('OrderTracking', { orderData })
          },
          {
            text: 'Volver al inicio',
            onPress: () => navigation.navigate('ClientMain')
          }
        ]
      );
    }, 2000);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Información del negocio */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Negocio</Text>
          <View style={styles.businessInfo}>
            <Ionicons name="storefront" size={24} color="#FF6B35" />
            <View style={styles.businessDetails}>
              <Text style={styles.businessName}>{businessData.name}</Text>
              <Text style={styles.businessAddress}>📍 {businessData.address}</Text>
              <Text style={styles.businessPhone}>📞 {businessData.phone}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Tipo de entrega */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Tipo de entrega</Text>
          <View style={styles.deliveryTypeInfo}>
            <Ionicons 
              name={deliveryType === 'delivery' ? 'bicycle' : 'storefront'} 
              size={24} 
              color="#4CAF50" 
            />
            <Text style={styles.deliveryTypeText}>
              {deliveryType === 'delivery' ? 'Entrega a domicilio' : 'Recoger en tienda'}
            </Text>
          </View>
          {deliveryType === 'delivery' && (
            <Text style={styles.deliveryTime}>Tiempo estimado: {businessData.delivery}</Text>
          )}
        </Card.Content>
      </Card>

      {/* Productos del pedido */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Tu pedido</Text>
          {cart.map((item, index) => (
            <View key={item.id}>
              <View style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Cantidad: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>${item.price * item.quantity}</Text>
              </View>
              {index < cart.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Información del cliente */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Información de contacto</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono *</Text>
            <TextInput
              style={styles.input}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="Ej: +53 5234 5678"
              keyboardType="phone-pad"
            />
          </View>

          {deliveryType === 'delivery' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dirección de entrega *</Text>
              <TextInput
                style={styles.input}
                value={customerAddress}
                onChangeText={setCustomerAddress}
                placeholder="Ej: Calle Martí #123, Mayarí Arriba"
                multiline
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Instrucciones especiales (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder="Ej: Sin cebolla, extra salsa, tocar el timbre..."
              multiline
              numberOfLines={3}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Resumen de costos */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Subtotal</Text>
            <Text style={styles.costValue}>${total}</Text>
          </View>
          
          {deliveryType === 'delivery' && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Costo de entrega</Text>
              <Text style={styles.costValue}>${deliveryFee}</Text>
            </View>
          )}
          
          <Divider style={styles.divider} />
          
          <View style={styles.costRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${finalTotal}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Botón de confirmación */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={confirmOrder}
          loading={isLoading}
          disabled={isLoading}
          style={styles.confirmButton}
          buttonColor="#FF6B35"
        >
          {isLoading ? 'Enviando pedido...' : 'Confirmar pedido'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  businessDetails: {
    flex: 1,
    gap: 4,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  businessAddress: {
    fontSize: 14,
    color: '#666',
  },
  businessPhone: {
    fontSize: 14,
    color: '#666',
  },
  deliveryTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  deliveryTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  divider: {
    marginVertical: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  costLabel: {
    fontSize: 16,
    color: '#666',
  },
  costValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  confirmButton: {
    paddingVertical: 8,
  },
});

export default OrderConfirmationScreen;