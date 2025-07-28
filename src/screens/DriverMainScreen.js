import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Card, Button, Badge, Switch, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';

const DriverMainScreen = ({ navigation }) => {
  const [driverName] = useState('Carlos Rodríguez');
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation] = useState('Centro de Mayarí Arriba');
  
  const [availableOrders] = useState([
    {
      id: 1,
      type: 'food',
      customer: 'Ana María López',
      customerPhone: '+53 5345 6789',
      restaurant: 'Restaurante El Cubano',
      restaurantPhone: '+53 5234 5678',
      restaurantAddress: 'Calle Martí #45, Mayarí Arriba',
      pickup: 'Calle Martí #45',
      delivery: 'Calle Maceo #123',
      distance: '2.1 km',
      payment: 45,
      items: [
        { name: 'Ropa Vieja', quantity: 1, price: 25 },
        { name: 'Arroz Blanco', quantity: 1, price: 20 }
      ],
      specialInstructions: 'Sin cebolla en la ropa vieja',
      time: '25 min',
      priority: 'normal',
      orderTime: '14:30',
      estimatedReady: '15:00'
    },
    {
      id: 2,
      type: 'transport',
      customer: 'Miguel Fernández',
      customerPhone: '+53 5456 7890',
      pickup: 'Hospital Municipal',
      delivery: 'Zona Residencial',
      distance: '3.5 km',
      payment: 80,
      time: '15 min',
      priority: 'urgent',
      passengers: 2,
      passengerCount: 2,
      specialInstructions: 'Paciente con muletas',
      requestTime: '14:45'
    },
    {
      id: 3,
      type: 'package',
      customer: 'Rosa Pérez',
      customerPhone: '+53 5567 8901',
      pickup: 'Farmacia Central',
      delivery: 'Barrio Obrero',
      distance: '1.8 km',
      payment: 35,
      description: 'Medicamentos',
      packageType: 'Medicamentos',
      packageSize: 'Pequeño',
      specialInstructions: 'Entregar en mano al destinatario',
      time: '20 min',
      priority: 'normal',
      requestTime: '14:50'
    }
  ]);

  const [activeDeliveries] = useState([
    {
      id: 4,
      type: 'food',
      customer: 'Luis García',
      status: 'pickup',
      restaurant: 'Pizzería La Habana',
      pickup: 'Calle Independencia #67',
      delivery: 'Calle Céspedes #89',
      payment: 55,
      estimatedTime: '10 min'
    }
  ]);

  const [todayStats] = useState({
    deliveries: 8,
    earnings: 420,
    distance: 45.2,
    rating: 4.8,
    onlineTime: '6h 30m'
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'food':
        return 'restaurant';
      case 'transport':
        return 'car';
      case 'package':
        return 'cube';
      default:
        return 'help-circle';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'food':
        return '#FF6B35';
      case 'transport':
        return '#2196F3';
      case 'package':
        return '#4CAF50';
      default:
        return '#666666';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#F44336';
      case 'high':
        return '#FF9800';
      case 'normal':
        return '#4CAF50';
      default:
        return '#666666';
    }
  };

  const handleAcceptOrder = (orderId) => {
    const order = availableOrders.find(o => o.id === orderId);
    if (!order) return;

    Alert.alert(
      'Pedido aceptado',
      `Has aceptado el pedido de ${order.customer}. Dirígete al punto de recogida.`,
      [
        {
          text: 'Ver ruta',
          onPress: () => navigation.navigate('OrderTracking', {
            orderId: orderId,
            orderType: order.type,
            customer: order.customer,
            pickup: order.pickup,
            delivery: order.delivery
          })
        },
        { text: 'OK' }
      ]
    );
  };

  const handleRejectOrder = (orderId) => {
    Alert.alert(
      'Rechazar pedido',
      '¿Estás seguro de que quieres rechazar este pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Pedido rechazado', 'El pedido ha sido rechazado.');
          }
        }
      ]
    );
  };

  const handleCallCustomer = (customer, phone = '+53 5234 5678') => {
    Alert.alert(
      'Llamar cliente',
      `¿Deseas llamar a ${customer}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Llamar', onPress: () => console.log(`Calling ${phone}`) }
      ]
    );
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    Alert.alert(
      isOnline ? 'Desconectado' : 'Conectado',
      isOnline 
        ? 'Ahora estás desconectado. No recibirás nuevos pedidos.' 
        : 'Ahora estás conectado. Puedes recibir nuevos pedidos.'
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* Header del conductor */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driverName}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color="#FFFFFF" />
              <Text style={styles.locationText}>{currentLocation}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('DriverProfile')}
            style={styles.profileButton}
          >
            <Avatar.Text size={40} label="CR" backgroundColor="#FFFFFF" color="#FF6B35" />
          </TouchableOpacity>
        </View>
        
        {/* Estado online/offline */}
        <View style={styles.statusContainer}>
          <View style={styles.statusInfo}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }
            ]} />
            <Text style={styles.statusText}>
              {isOnline ? 'En línea' : 'Desconectado'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            color="#FFFFFF"
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Estadísticas del día */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de hoy</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="checkmark-done" size={20} color="#4CAF50" />
                <Text style={styles.statNumber}>{todayStats.deliveries}</Text>
                <Text style={styles.statLabel}>Entregas</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="cash" size={20} color="#FF6B35" />
                <Text style={styles.statNumber}>${todayStats.earnings}</Text>
                <Text style={styles.statLabel}>Ganado</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="speedometer" size={20} color="#2196F3" />
                <Text style={styles.statNumber}>{todayStats.distance} km</Text>
                <Text style={styles.statLabel}>Recorrido</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.statNumber}>{todayStats.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Entregas activas */}
        {activeDeliveries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entrega en curso</Text>
            {activeDeliveries.map((delivery) => (
              <Card key={delivery.id} style={[styles.orderCard, styles.activeDeliveryCard]}>
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderTypeContainer}>
                      <Ionicons 
                        name={getTypeIcon(delivery.type)} 
                        size={20} 
                        color={getTypeColor(delivery.type)} 
                      />
                      <Text style={styles.orderType}>
                        {delivery.type === 'food' ? 'Comida' : 
                         delivery.type === 'transport' ? 'Transporte' : 'Paquete'}
                      </Text>
                    </View>
                    <Badge style={styles.activeBadge}>En curso</Badge>
                  </View>
                  
                  <Text style={styles.customerName}>{delivery.customer}</Text>
                  {delivery.restaurant && (
                    <Text style={styles.restaurantName}>📍 {delivery.restaurant}</Text>
                  )}
                  
                  <View style={styles.addressContainer}>
                    <View style={styles.addressRow}>
                      <Ionicons name="location" size={14} color="#FF6B35" />
                      <Text style={styles.addressText}>Recogida: {delivery.pickup}</Text>
                    </View>
                    <View style={styles.addressRow}>
                      <Ionicons name="flag" size={14} color="#4CAF50" />
                      <Text style={styles.addressText}>Entrega: {delivery.delivery}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderFooter}>
                    <Text style={styles.paymentAmount}>Pago: ${delivery.payment}</Text>
                    <View style={styles.orderActions}>
                      <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => handleCallCustomer(delivery.customer)}
                      >
                        <Ionicons name="call" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.navigateButton}
                        onPress={() => navigation.navigate('OrderTracking', {
                          orderId: delivery.id,
                          orderType: delivery.type,
                          customer: delivery.customer
                        })}
                      >
                        <Text style={styles.navigateButtonText}>Ver ruta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Pedidos disponibles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pedidos disponibles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DriverOrders')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          {!isOnline ? (
            <Card style={styles.offlineCard}>
              <Card.Content style={styles.offlineContent}>
                <Ionicons name="wifi-off" size={48} color="#CCCCCC" />
                <Text style={styles.offlineText}>Estás desconectado</Text>
                <Text style={styles.offlineSubtext}>Activa el modo en línea para recibir pedidos</Text>
              </Card.Content>
            </Card>
          ) : availableOrders.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="time" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>No hay pedidos disponibles</Text>
                <Text style={styles.emptySubtext}>Los nuevos pedidos aparecerán aquí</Text>
              </Card.Content>
            </Card>
          ) : (
            availableOrders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderTypeContainer}>
                      <Ionicons 
                        name={getTypeIcon(order.type)} 
                        size={20} 
                        color={getTypeColor(order.type)} 
                      />
                      <Text style={styles.orderType}>
                        {order.type === 'food' ? 'Comida' : 
                         order.type === 'transport' ? 'Transporte' : 'Paquete'}
                      </Text>
                    </View>
                    <View style={styles.orderMeta}>
                      {order.priority === 'urgent' && (
                        <Badge style={[styles.priorityBadge, { backgroundColor: getPriorityColor(order.priority) }]}>
                          Urgente
                        </Badge>
                      )}
                      <Text style={styles.timeText}>{order.time}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.customerName}>{order.customer}</Text>
                  <Text style={styles.customerPhone}>📞 {order.customerPhone}</Text>
                  
                  {order.restaurant && (
                    <>
                      <Text style={styles.restaurantName}>📍 {order.restaurant}</Text>
                      <Text style={styles.restaurantAddress}>🏪 {order.restaurantAddress}</Text>
                      <Text style={styles.restaurantPhone}>📞 {order.restaurantPhone}</Text>
                      <Text style={styles.orderTime}>🕐 Pedido: {order.orderTime} | Listo: {order.estimatedReady}</Text>
                    </>
                  )}
                  
                  <View style={styles.addressContainer}>
                    <View style={styles.addressRow}>
                      <Ionicons name="location" size={14} color="#FF6B35" />
                      <Text style={styles.addressText}>Recogida: {order.pickup}</Text>
                    </View>
                    <View style={styles.addressRow}>
                      <Ionicons name="flag" size={14} color="#4CAF50" />
                      <Text style={styles.addressText}>Entrega: {order.delivery}</Text>
                    </View>
                  </View>
                  
                  {order.items && (
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsLabel}>Productos:</Text>
                      {order.items.map((item, index) => (
                        <Text key={index} style={styles.itemsText}>
                          • {item.name} x{item.quantity} - ${item.price}
                        </Text>
                      ))}
                    </View>
                  )}
                  
                  {order.description && (
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsLabel}>Descripción:</Text>
                      <Text style={styles.itemsText}>{order.description}</Text>
                    </View>
                  )}
                  
                  {order.packageType && (
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsLabel}>Paquete:</Text>
                      <Text style={styles.itemsText}>📦 {order.packageType} ({order.packageSize})</Text>
                    </View>
                  )}
                  
                  {order.passengerCount && (
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsLabel}>Pasajeros:</Text>
                      <Text style={styles.itemsText}>👥 {order.passengerCount} persona{order.passengerCount > 1 ? 's' : ''}</Text>
                    </View>
                  )}
                  
                  {order.specialInstructions && (
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsLabel}>Instrucciones especiales:</Text>
                      <Text style={styles.itemsText}>💬 {order.specialInstructions}</Text>
                    </View>
                  )}
                  
                  {(order.requestTime || order.orderTime) && (
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsLabel}>Tiempo:</Text>
                      <Text style={styles.itemsText}>
                        🕐 {order.requestTime ? `Solicitado: ${order.requestTime}` : `Pedido: ${order.orderTime}`}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.orderFooter}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.distanceText}>📍 {order.distance}</Text>
                      <Text style={styles.paymentAmount}>💰 ${order.payment}</Text>
                    </View>
                    <View style={styles.orderActions}>
                      <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => handleCallCustomer(order.customer, order.customerPhone)}
                      >
                        <Ionicons name="call" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleRejectOrder(order.id)}
                      >
                        <Text style={styles.rejectButtonText}>Rechazar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptOrder(order.id)}
                      >
                        <Text style={styles.acceptButtonText}>Aceptar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>

        {/* Accesos rápidos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos rápidos</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('DriverOrders')}
            >
              <Ionicons name="list" size={24} color="#FF6B35" />
              <Text style={styles.quickActionText}>Historial</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => Alert.alert('Ganancias', 'Total de hoy: $420\nTotal de la semana: $2,100')}
            >
              <Ionicons name="analytics" size={24} color="#4CAF50" />
              <Text style={styles.quickActionText}>Ganancias</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => Alert.alert('Soporte', 'Contacta con soporte técnico:\nTeléfono: +53 5123 4567')}
            >
              <Ionicons name="help-circle" size={24} color="#2196F3" />
              <Text style={styles.quickActionText}>Soporte</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => Alert.alert('Emergencia', 'Llamando a emergencias...')}
            >
              <Ionicons name="warning" size={24} color="#F44336" />
              <Text style={styles.quickActionText}>Emergencia</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FF6B35',
    padding: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 5,
  },
  profileButton: {
    padding: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 10,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  orderCard: {
    marginBottom: 15,
    elevation: 2,
  },
  activeDeliveryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginLeft: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    marginRight: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#666666',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  restaurantName: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 10,
  },
  addressContainer: {
    marginBottom: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 12,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  itemsContainer: {
    marginBottom: 10,
  },
  itemsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 3,
  },
  itemsText: {
    fontSize: 12,
    color: '#333333',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  orderInfo: {
    flex: 1,
  },
  distanceText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  navigateButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  navigateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rejectButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 8,
  },
  rejectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  acceptButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  offlineCard: {
    elevation: 1,
    backgroundColor: '#F5F5F5',
  },
  offlineContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  offlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 15,
  },
  offlineSubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 5,
    textAlign: 'center',
  },
  emptyCard: {
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginTop: 8,
  },
});

export default DriverMainScreen;