import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { Card, Button, Switch, Avatar, Badge, Divider, Modal, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';

const DriverProfileScreen = ({ navigation }) => {
  const [driverInfo] = useState({
    name: 'Carlos Rodríguez',
    email: 'carlos@rapiflow.cu',
    phone: '+53 5345 6789',
    vehicle: 'Motocicleta Honda',
    license: 'ABC123',
    joinDate: '2024-01-01',
    avatar: null
  });

  const [isOnline, setIsOnline] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Simular notificaciones de nuevos pedidos cuando el conductor está en línea
  useEffect(() => {
    let notificationInterval;
    
    if (isOnline) {
      // Simular nuevos pedidos cada 30 segundos cuando está en línea
      notificationInterval = setInterval(() => {
        const shouldReceiveOrder = Math.random() > 0.7; // 30% de probabilidad
        if (shouldReceiveOrder) {
          setHasNewOrders(true);
          setNotificationCount(prev => prev + 1);
          
          // Mostrar alerta de nuevo pedido
          Alert.alert(
            '🔔 Nuevo Pedido Disponible',
            'Hay un nuevo pedido esperando por ti. ¿Quieres verlo?',
            [
              { text: 'Más tarde', style: 'cancel' },
              { text: 'Ver pedido', onPress: () => setShowOrderModal(true) }
            ]
          );
        }
      }, 30000); // 30 segundos
    }

    return () => {
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
    };
  }, [isOnline]);
  const [availableOrders, setAvailableOrders] = useState([
    {
      id: 1,
      customerName: 'María González',
      restaurant: 'Restaurante El Cubano',
      pickupAddress: 'Calle Martí #123',
      deliveryAddress: 'Calle Maceo #456',
      distance: '2.5 km',
      estimatedTime: '15 min',
      payment: 45,
      items: ['Ropa Vieja', 'Arroz con Pollo'],
      status: 'pending'
    },
    {
      id: 2,
      customerName: 'Juan Pérez',
      restaurant: 'Pizzería La Italiana',
      pickupAddress: 'Avenida Central #789',
      deliveryAddress: 'Calle Independencia #321',
      distance: '1.8 km',
      estimatedTime: '12 min',
      payment: 35,
      items: ['Pizza Margherita', 'Refresco'],
      status: 'pending'
    }
  ]);

  const [activeOrders, setActiveOrders] = useState([
    {
      id: 3,
      customerName: 'Ana López',
      restaurant: 'Cafetería Central',
      pickupAddress: 'Plaza Principal #1',
      deliveryAddress: 'Calle Libertad #654',
      distance: '3.2 km',
      estimatedTime: '18 min',
      payment: 28,
      items: ['Café Cubano', 'Tostada'],
      status: 'picked_up',
      startTime: new Date().toLocaleTimeString()
    }
  ]);

  const [stats] = useState({
    totalDeliveries: 89,
    totalEarnings: 2340,
    avgRating: 4.9,
    totalDistance: 234.5,
    deliveriesToday: 8,
    earningsToday: 180
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nuevo pedido disponible',
      message: 'Pedido de Restaurante El Cubano - $45',
      time: '2 min ago',
      read: false
    },
    {
      id: 2,
      title: 'Entrega completada',
      message: 'Has ganado $35 por tu última entrega',
      time: '15 min ago',
      read: true
    }
  ]);

  const getUserInitials = () => {
    return driverInfo.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    if (newStatus) {
      Alert.alert(
        'Estado actualizado', 
        'Ahora estás en línea y puedes recibir pedidos. Te notificaremos cuando haya nuevos pedidos disponibles.'
      );
      setHasNewOrders(false);
      setNotificationCount(0);
    } else {
      Alert.alert('Estado actualizado', 'Ahora estás fuera de línea');
      setHasNewOrders(false);
      setNotificationCount(0);
    }
  };

  const viewNewOrders = () => {
    setHasNewOrders(false);
    setNotificationCount(0);
    setShowOrderModal(true);
  };

  const handleGoOnline = () => {
    setIsOnline(true);
    Alert.alert(
      '¡Estás en línea!',
      'Ahora recibirás notificaciones de nuevos pedidos disponibles.',
      [{ text: 'OK' }]
    );
    
    // Simular notificación de nuevo pedido después de 3 segundos
    setTimeout(() => {
      if (isOnline) {
        Alert.alert(
          '🔔 Nuevo Pedido Disponible',
          'Restaurante El Cubano\nDistancia: 2.5 km\nPago: $45\n\n¿Quieres aceptar este pedido?',
          [
            { text: 'Rechazar', style: 'cancel' },
            { text: 'Aceptar', onPress: () => acceptOrder(1) }
          ]
        );
      }
    }, 3000);
  };

  const handleGoOffline = () => {
    setIsOnline(false);
    Alert.alert(
      'Desconectado',
      'Ya no recibirás notificaciones de nuevos pedidos.',
      [{ text: 'OK' }]
    );
  };

  const acceptOrder = (orderId) => {
    const order = availableOrders.find(o => o.id === orderId);
    if (order) {
      const updatedOrder = {
        ...order,
        status: 'accepted',
        startTime: new Date().toLocaleTimeString()
      };
      
      setActiveOrders([...activeOrders, updatedOrder]);
      setAvailableOrders(availableOrders.filter(o => o.id !== orderId));
      
      Alert.alert(
        'Pedido Aceptado',
        `Has aceptado el pedido de ${order.customerName}. Dirígete al restaurante para recoger el pedido.`,
        [
          { text: 'OK', onPress: () => navigation.navigate('DriverDelivery', { order: updatedOrder }) }
        ]
      );
    }
  };

  const rejectOrder = (orderId) => {
    setAvailableOrders(availableOrders.filter(o => o.id !== orderId));
    Alert.alert('Pedido Rechazado', 'El pedido ha sido rechazado.');
  };

  const startDelivery = (orderId) => {
    const order = activeOrders.find(o => o.id === orderId);
    if (order) {
      navigation.navigate('DriverDelivery', { order });
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId 
        ? { ...notif, read: true }
        : notif
    ));
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const renderAvailableOrder = ({ item }) => (
    <Card style={styles.orderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <Text style={styles.restaurantName}>{item.restaurant}</Text>
          <Text style={styles.payment}>${item.payment}</Text>
        </View>
        
        <Text style={styles.customerName}>Cliente: {item.customerName}</Text>
        
        <View style={styles.addressContainer}>
          <View style={styles.addressItem}>
            <Ionicons name="restaurant" size={16} color="#FF6B35" />
            <Text style={styles.addressText}>{item.pickupAddress}</Text>
          </View>
          <View style={styles.addressItem}>
            <Ionicons name="home" size={16} color="#4CAF50" />
            <Text style={styles.addressText}>{item.deliveryAddress}</Text>
          </View>
        </View>
        
        <View style={styles.orderDetails}>
          <Text style={styles.distance}>📍 {item.distance}</Text>
          <Text style={styles.time}>⏱️ {item.estimatedTime}</Text>
        </View>
        
        <Text style={styles.itemsList}>Productos: {item.items.join(', ')}</Text>
        
        <View style={styles.orderActions}>
          <Button
            mode="outlined"
            onPress={() => rejectOrder(item.id)}
            style={styles.rejectButton}
            labelStyle={styles.rejectButtonText}
          >
            Rechazar
          </Button>
          <Button
            mode="contained"
            onPress={() => acceptOrder(item.id)}
            style={styles.acceptButton}
          >
            Aceptar
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderActiveOrder = ({ item }) => (
    <Card style={styles.activeOrderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <Text style={styles.restaurantName}>{item.restaurant}</Text>
          <Badge style={styles.statusBadge}>
            {item.status === 'accepted' ? 'Aceptado' : 
             item.status === 'picked_up' ? 'Recogido' : 'En camino'}
          </Badge>
        </View>
        
        <Text style={styles.customerName}>Cliente: {item.customerName}</Text>
        <Text style={styles.startTime}>Iniciado: {item.startTime}</Text>
        
        <View style={styles.orderActions}>
          <Button
            mode="contained"
            onPress={() => startDelivery(item.id)}
            style={styles.deliveryButton}
            icon="motorcycle"
          >
            Continuar Entrega
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => markNotificationAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel Repartidor</Text>
        <View style={styles.headerRight}>
          {unreadNotifications > 0 && (
            <Badge style={styles.notificationBadge}>{unreadNotifications}</Badge>
          )}
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Información del repartidor */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={60} 
                label={getUserInitials()} 
                backgroundColor="#FF6B35" 
                color="#FFFFFF"
              />
              <View style={[styles.statusIndicator, isOnline ? styles.online : styles.offline]} />
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{driverInfo.name}</Text>
              <Text style={styles.userType}>Repartidor</Text>
              <Text style={styles.vehicle}>{driverInfo.vehicle} - {driverInfo.license}</Text>
            </View>
            
            <View style={styles.onlineToggle}>
              <Text style={styles.statusText}>
                {isOnline ? '🟢 En línea' : '🔴 Desconectado'}
              </Text>
              <Switch
                value={isOnline}
                onValueChange={isOnline ? handleGoOffline : handleGoOnline}
                color="#FF6B35"
              />
            </View>
            
            {isOnline && hasNewOrders && (
              <TouchableOpacity style={styles.notificationBanner} onPress={viewNewOrders}>
                <View style={styles.notificationContent}>
                  <Ionicons name="notifications" size={24} color="#FF6B35" />
                  <View style={styles.notificationText}>
                    <Text style={styles.notificationTitle}>¡Nuevos pedidos disponibles!</Text>
                    <Text style={styles.notificationSubtitle}>
                      {notificationCount} {notificationCount === 1 ? 'pedido nuevo' : 'pedidos nuevos'}
                    </Text>
                  </View>
                  <Badge style={styles.notificationBadge}>{notificationCount}</Badge>
                </View>
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>

        {/* Estadísticas del día */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Estadísticas de Hoy</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.deliveriesToday}</Text>
                <Text style={styles.statLabel}>Entregas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>${stats.earningsToday}</Text>
                <Text style={styles.statLabel}>Ganado</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{activeOrders.length}</Text>
                <Text style={styles.statLabel}>Activos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.avgRating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Pedidos activos */}
        {activeOrders.length > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Pedidos Activos ({activeOrders.length})</Text>
              <FlatList
                data={activeOrders}
                renderItem={renderActiveOrder}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </Card.Content>
          </Card>
        )}

        {/* Pedidos disponibles */}
        {isOnline && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>
                Pedidos Disponibles ({availableOrders.length})
              </Text>
              {availableOrders.length > 0 ? (
                <FlatList
                  data={availableOrders}
                  renderItem={renderAvailableOrder}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="time" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyText}>No hay pedidos disponibles</Text>
                  <Text style={styles.emptySubtext}>Te notificaremos cuando haya nuevos pedidos</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Estado offline */}
        {!isOnline && (
          <Card style={styles.offlineCard}>
            <Card.Content style={styles.offlineContent}>
              <Ionicons name="power" size={48} color="#FF6B35" />
              <Text style={styles.offlineTitle}>Estás desconectado</Text>
              <Text style={styles.offlineText}>
                Activa el modo en línea para recibir pedidos y empezar a ganar dinero
              </Text>
              <Button
                mode="contained"
                onPress={handleGoOnline}
                style={styles.goOnlineButton}
                icon="power"
              >
                Conectarse
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Notificaciones */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Notificaciones</Text>
            {notifications.length > 0 ? (
              <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>No hay notificaciones</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('DriverOrders')}
            style={styles.historyButton}
            icon="history"
          >
            Historial de Entregas
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Cerrar sesión', 'Sesión cerrada exitosamente.')}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonText}
            icon="logout"
          >
            Cerrar sesión
          </Button>
        </View>
      </ScrollView>

      {/* Modal para pedidos disponibles */}
      <Portal>
        <Modal
          visible={showOrderModal}
          onDismiss={() => setShowOrderModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Pedidos Disponibles</Text>
          <ScrollView style={styles.modalContent}>
            {availableOrders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderNumber}>Pedido #{order.id}</Text>
                    <Text style={styles.orderValue}>${order.total}</Text>
                  </View>
                  <Text style={styles.orderBusiness}>{order.business}</Text>
                  <Text style={styles.orderAddress}>📍 {order.pickupAddress}</Text>
                  <Text style={styles.orderAddress}>🏠 {order.deliveryAddress}</Text>
                  <Text style={styles.orderDistance}>📏 {order.distance}</Text>
                  <Text style={styles.orderTime}>⏱️ Tiempo estimado: {order.estimatedTime}</Text>
                  
                  <View style={styles.orderActions}>
                    <Button
                      mode="outlined"
                      onPress={() => rejectOrder(order.id)}
                      style={styles.rejectButton}
                      labelStyle={styles.rejectButtonText}
                    >
                      Rechazar
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => acceptOrder(order.id)}
                      style={styles.acceptButton}
                    >
                      Aceptar
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
            {availableOrders.length === 0 && (
              <Text style={styles.noOrdersText}>No hay pedidos disponibles en este momento</Text>
            )}
          </ScrollView>
          <Button
            mode="text"
            onPress={() => setShowOrderModal(false)}
            style={styles.closeModalButton}
          >
            Cerrar
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: 20,
    backgroundColor: '#F44336',
    zIndex: 1,
  },
  notificationButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    marginBottom: 20,
    elevation: 3,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#F44336',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  userType: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 5,
  },
  vehicle: {
    fontSize: 12,
    color: '#666666',
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: 20,
    elevation: 2,
  },
  orderCard: {
    marginBottom: 15,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  activeOrderCard: {
    marginBottom: 15,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  payment: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  customerName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  startTime: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 10,
  },
  addressContainer: {
    marginBottom: 10,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  distance: {
    fontSize: 12,
    color: '#666666',
  },
  time: {
    fontSize: 12,
    color: '#666666',
  },
  itemsList: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  rejectButton: {
    flex: 1,
    borderColor: '#F44336',
  },
  rejectButtonText: {
    color: '#F44336',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  deliveryButton: {
    backgroundColor: '#FF6B35',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
  },
  offlineCard: {
    marginBottom: 20,
    elevation: 2,
  },
  offlineContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 15,
    marginBottom: 10,
  },
  offlineText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  goOnlineButton: {
    backgroundColor: '#FF6B35',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#888888',
    marginTop: 5,
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  unreadNotification: {
    backgroundColor: '#FFF3E0',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 11,
    color: '#888888',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginLeft: 10,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  historyButton: {
    backgroundColor: '#FF6B35',
    marginBottom: 15,
  },
  logoutButton: {
    borderColor: '#FF6B35',
  },
  logoutButtonText: {
    color: '#FF6B35',
  },
  notificationBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  notificationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalContent: {
    padding: 15,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  orderBusiness: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  orderDistance: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  noOrdersText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 20,
  },
  closeModalButton: {
    margin: 15,
  },
});

export default DriverProfileScreen;