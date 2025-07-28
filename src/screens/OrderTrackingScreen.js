import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Card, Button, ProgressBar, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';

const OrderTrackingScreen = ({ route, navigation }) => {
  const { orderData: initialOrderData } = route.params;
  const [orderData, setOrderData] = useState(initialOrderData);
  const [refreshing, setRefreshing] = useState(false);

  const orderStatuses = {
    pending: { label: 'Pendiente', icon: 'time', color: '#FF9800', progress: 0.2 },
    confirmed: { label: 'Confirmado', icon: 'checkmark-circle', color: '#2196F3', progress: 0.4 },
    preparing: { label: 'Preparando', icon: 'restaurant', color: '#FF6B35', progress: 0.6 },
    ready: { label: 'Listo', icon: 'bag-check', color: '#4CAF50', progress: 0.8 },
    delivered: { label: 'Entregado', icon: 'checkmark-done', color: '#4CAF50', progress: 1.0 },
    cancelled: { label: 'Cancelado', icon: 'close-circle', color: '#F44336', progress: 0 },
  };

  const currentStatus = orderStatuses[orderData.status] || orderStatuses.pending;

  const onRefresh = () => {
    setRefreshing(true);
    // Simular actualización del estado del pedido
    setTimeout(() => {
      const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
      const currentIndex = statuses.indexOf(orderData.status);
      if (currentIndex < statuses.length - 1) {
        setOrderData({
          ...orderData,
          status: statuses[currentIndex + 1],
          lastUpdated: new Date().toISOString(),
        });
      }
      setRefreshing(false);
    }, 1500);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstimatedTime = () => {
    const now = new Date();
    const orderTime = new Date(orderData.timestamp);
    const elapsed = Math.floor((now - orderTime) / (1000 * 60)); // minutos transcurridos
    
    switch (orderData.status) {
      case 'pending':
        return '5-10 minutos para confirmación';
      case 'confirmed':
        return '10-15 minutos para comenzar preparación';
      case 'preparing':
        const prepTime = orderData.business.delivery.split('-')[0];
        return `${Math.max(0, parseInt(prepTime) - elapsed)} minutos restantes`;
      case 'ready':
        return orderData.deliveryType === 'delivery' ? '10-15 minutos para entrega' : 'Listo para recoger';
      case 'delivered':
        return 'Pedido completado';
      default:
        return 'Calculando...';
    }
  };



  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Estado del pedido */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <Text style={styles.orderNumber}>Pedido #{orderData.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: currentStatus.color }]}>
              <Ionicons name={currentStatus.icon} size={16} color="#FFF" />
              <Text style={styles.statusText}>{currentStatus.label}</Text>
            </View>
          </View>
          
          <ProgressBar 
            progress={currentStatus.progress} 
            color={currentStatus.color}
            style={styles.progressBar}
          />
          
          <Text style={styles.estimatedTime}>{getEstimatedTime()}</Text>
          <Text style={styles.orderDate}>Pedido realizado: {formatDate(orderData.timestamp)}</Text>
        </Card.Content>
      </Card>

      {/* Información del negocio */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Negocio</Text>
          <View style={styles.businessInfo}>
            <Ionicons name="storefront" size={24} color="#FF6B35" />
            <View style={styles.businessDetails}>
              <Text style={styles.businessName}>{orderData.business.name}</Text>
              <Text style={styles.businessAddress}>📍 {orderData.business.address}</Text>
              <Text style={styles.businessPhone}>📞 {orderData.business.phone}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Información de entrega */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Entrega</Text>
          <View style={styles.deliveryInfo}>
            <Ionicons 
              name={orderData.deliveryType === 'delivery' ? 'bicycle' : 'storefront'} 
              size={24} 
              color="#4CAF50" 
            />
            <View style={styles.deliveryDetails}>
              <Text style={styles.deliveryType}>
                {orderData.deliveryType === 'delivery' ? 'Entrega a domicilio' : 'Recoger en tienda'}
              </Text>
              <Text style={styles.deliveryAddress}>📍 {orderData.customerAddress}</Text>
              <Text style={styles.customerPhone}>📞 {orderData.customerPhone}</Text>
              {orderData.specialInstructions && (
                <Text style={styles.specialInstructions}>
                  💬 {orderData.specialInstructions}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Productos del pedido */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Productos</Text>
          {orderData.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Cantidad: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${item.price * item.quantity}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Resumen de costos */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Resumen</Text>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Subtotal</Text>
            <Text style={styles.costValue}>${orderData.subtotal}</Text>
          </View>
          
          {orderData.deliveryFee > 0 && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Costo de entrega</Text>
              <Text style={styles.costValue}>${orderData.deliveryFee}</Text>
            </View>
          )}
          
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${orderData.total}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Acciones */}
      <View style={styles.actionsContainer}>
        {orderData.status === 'pending' && (
          <Button
            mode="outlined"
            onPress={() => {
              // Lógica para cancelar pedido
              setOrderData({ ...orderData, status: 'cancelled' });
            }}
            style={styles.cancelButton}
            textColor="#F44336"
          >
            Cancelar pedido
          </Button>
        )}
        
        <Button
          mode="contained"
          onPress={() => navigation.navigate('ClientMain')}
          style={styles.homeButton}
          buttonColor="#FF6B35"
        >
          Volver al inicio
        </Button>
        
        {orderData.status === 'delivered' && (
          <Button
            mode="outlined"
            onPress={() => {
              // Navegar a pantalla de calificación
              navigation.navigate('OrderRating', { orderData });
            }}
            style={styles.rateButton}
          >
            Calificar pedido
          </Button>
        )}
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
    margin: 15,
    marginBottom: 10,
    elevation: 3,
    borderRadius: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  businessDetails: {
    flex: 1,
    marginLeft: 15,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  businessAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  businessPhone: {
    fontSize: 14,
    color: '#666',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deliveryDetails: {
    flex: 1,
    marginLeft: 15,
  },
  deliveryType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  specialInstructions: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    marginTop: 10,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  actionsContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  cancelButton: {
    marginBottom: 10,
    borderColor: '#F44336',
  },
  homeButton: {
    marginBottom: 10,
  },
  rateButton: {
    borderColor: '#FF6B35',
  },
});

export default OrderTrackingScreen;