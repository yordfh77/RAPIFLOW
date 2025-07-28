import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Card, Button, Badge, FAB, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/authService';
import businessService from '../services/businessService';

const BusinessMainScreen = ({ navigation }) => {
  const { clearUser, getUserName, user } = useAuth();
  const businessName = user?.businessName || getUserName() || 'Mi Negocio';
  const [isOpen, setIsOpen] = useState(true);
  const [pendingOrders] = useState([
    {
      id: 1,
      customer: 'Juan Pérez',
      items: ['Ropa Vieja', 'Arroz con Pollo'],
      total: 210,
      status: 'nuevo',
      time: '5 min',
      phone: '+53 5234 5678'
    },
    {
      id: 2,
      customer: 'María González',
      items: ['Pollo Asado', 'Yuca con Mojo'],
      total: 150,
      status: 'preparando',
      time: '15 min',
      phone: '+53 5345 6789'
    },
    {
      id: 3,
      customer: 'Carlos Rodríguez',
      items: ['Pescado a la Plancha'],
      total: 150,
      status: 'listo',
      time: '2 min',
      phone: '+53 5456 7890'
    }
  ]);

  const [todayStats] = useState({
    orders: 12,
    revenue: 1850,
    avgOrderValue: 154,
    completionRate: 95
  });

  const [products] = useState([
    { id: 1, name: 'Ropa Vieja', price: 120, available: true, orders: 8 },
    { id: 2, name: 'Pollo Asado', price: 100, available: true, orders: 5 },
    { id: 3, name: 'Pescado a la Plancha', price: 150, available: false, orders: 3 },
    { id: 4, name: 'Arroz con Pollo', price: 90, available: true, orders: 6 }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'nuevo':
        return '#2196F3';
      case 'preparando':
        return '#FF9800';
      case 'listo':
        return '#4CAF50';
      case 'entregado':
        return '#666666';
      default:
        return '#666666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'nuevo':
        return 'Nuevo';
      case 'preparando':
        return 'Preparando';
      case 'listo':
        return 'Listo';
      case 'entregado':
        return 'Entregado';
      default:
        return status;
    }
  };

  const handleOrderAction = (orderId, action) => {
    const order = pendingOrders.find(o => o.id === orderId);
    if (!order) return;

    switch (action) {
      case 'accept':
        Alert.alert('Pedido aceptado', `El pedido de ${order.customer} ha sido aceptado y está en preparación.`);
        break;
      case 'ready':
        Alert.alert('Pedido listo', `El pedido de ${order.customer} está listo para entrega.`);
        break;
      case 'call':
        Alert.alert(
          'Llamar cliente',
          `¿Deseas llamar a ${order.customer}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Llamar', onPress: () => console.log(`Calling ${order.phone}`) }
          ]
        );
        break;
      default:
        break;
    }
  };

  // Crear o actualizar perfil del negocio en Firebase
  useEffect(() => {
    const createBusinessProfile = async () => {
      if (user?.uid) {
        try {
          const businessData = {
            id: user.uid,
            name: businessName,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            description: user.description || 'Negocio registrado en RapiFlow',
            category: user.category || 'Restaurante',
            type: user.businessType || 'Comida',
            isOpen: isOpen,
            isActive: true,
            rating: 5.0,
            delivery: '20-30 min',
            deliveryType: 'both'
          };
          
          await businessService.createOrUpdateBusinessInFirebase(businessData);
          console.log('Business profile created/updated in Firebase');
        } catch (error) {
          console.error('Error creating business profile:', error);
        }
      }
    };
    
    createBusinessProfile();
  }, [user?.uid, businessName]);

  const toggleBusinessStatus = async () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);
    
    // Actualizar estado en Firebase
    if (user?.uid) {
      try {
        await businessService.updateBusinessStatusInFirebase(user.uid, newStatus);
      } catch (error) {
        console.error('Error updating business status:', error);
      }
    }
    
    Alert.alert(
      newStatus ? 'Negocio abierto' : 'Negocio cerrado',
      newStatus 
        ? 'Tu negocio ahora está abierto. Puedes recibir nuevos pedidos.' 
        : 'Tu negocio ahora está cerrado. No recibirás nuevos pedidos.'
    );
  };

  const handleLogout = () => {
    const confirmed = window.confirm('¿Realmente quieres salir?');
    if (confirmed) {
      clearUser();
      navigation.navigate('Welcome');
    }
  };

  const newOrdersCount = pendingOrders.filter(order => order.status === 'nuevo').length;
  const readyOrdersCount = pendingOrders.filter(order => order.status === 'listo').length;

  return (
    <View style={globalStyles.container}>
      {/* Header con información del negocio */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{businessName}</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: isOpen ? '#4CAF50' : '#F44336' }
              ]} />
              <Text style={styles.statusText}>
                {isOpen ? 'Abierto' : 'Cerrado'}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('BusinessProfile')}
              style={styles.profileButton}
            >
              <Avatar.Text size={40} label="EC" backgroundColor="#FFFFFF" color="#FF6B35" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                console.log('Logout button pressed');
                handleLogout();
              }}
              style={styles.logoutButton}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutButtonLabel}>← Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Botón de abrir/cerrar */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: isOpen ? '#F44336' : '#4CAF50' }
          ]}
          onPress={toggleBusinessStatus}
        >
          <Ionicons 
            name={isOpen ? 'close-circle' : 'checkmark-circle'} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.toggleButtonText}>
            {isOpen ? 'Cerrar negocio' : 'Abrir negocio'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Estadísticas del día */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de hoy</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="receipt" size={24} color="#FF6B35" />
                <Text style={styles.statNumber}>{todayStats.orders}</Text>
                <Text style={styles.statLabel}>Pedidos</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="cash" size={24} color="#4CAF50" />
                <Text style={styles.statNumber}>${todayStats.revenue}</Text>
                <Text style={styles.statLabel}>Ingresos</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="trending-up" size={24} color="#2196F3" />
                <Text style={styles.statNumber}>${todayStats.avgOrderValue}</Text>
                <Text style={styles.statLabel}>Promedio</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="checkmark-done" size={24} color="#9C27B0" />
                <Text style={styles.statNumber}>{todayStats.completionRate}%</Text>
                <Text style={styles.statLabel}>Completados</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Alertas importantes */}
        {(newOrdersCount > 0 || readyOrdersCount > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alertas</Text>
            {newOrdersCount > 0 && (
              <Card style={[styles.alertCard, styles.newOrderAlert]}>
                <Card.Content>
                  <View style={styles.alertContent}>
                    <Ionicons name="notifications" size={24} color="#2196F3" />
                    <View style={styles.alertText}>
                      <Text style={styles.alertTitle}>Nuevos pedidos</Text>
                      <Text style={styles.alertDescription}>
                        Tienes {newOrdersCount} pedido{newOrdersCount > 1 ? 's' : ''} nuevo{newOrdersCount > 1 ? 's' : ''} esperando confirmación
                      </Text>
                    </View>
                    <Badge style={styles.alertBadge}>{newOrdersCount}</Badge>
                  </View>
                </Card.Content>
              </Card>
            )}
            
            {readyOrdersCount > 0 && (
              <Card style={[styles.alertCard, styles.readyOrderAlert]}>
                <Card.Content>
                  <View style={styles.alertContent}>
                    <Ionicons name="bag-check" size={24} color="#4CAF50" />
                    <View style={styles.alertText}>
                      <Text style={styles.alertTitle}>Pedidos listos</Text>
                      <Text style={styles.alertDescription}>
                        {readyOrdersCount} pedido{readyOrdersCount > 1 ? 's' : ''} listo{readyOrdersCount > 1 ? 's' : ''} para entrega
                      </Text>
                    </View>
                    <Badge style={[styles.alertBadge, styles.readyBadge]}>{readyOrdersCount}</Badge>
                  </View>
                </Card.Content>
              </Card>
            )}
          </View>
        )}

        {/* Pedidos pendientes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pedidos activos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver historial</Text>
            </TouchableOpacity>
          </View>
          
          {pendingOrders.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="receipt-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>No hay pedidos activos</Text>
                <Text style={styles.emptySubtext}>Los nuevos pedidos aparecerán aquí</Text>
              </Card.Content>
            </Card>
          ) : (
            pendingOrders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.customerName}>{order.customer}</Text>
                      <Text style={styles.orderTime}>Hace {order.time}</Text>
                    </View>
                    <View style={styles.orderStatus}>
                      <Badge 
                        style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
                      >
                        {getStatusText(order.status)}
                      </Badge>
                    </View>
                  </View>
                  
                  <View style={styles.orderItems}>
                    <Text style={styles.itemsLabel}>Productos:</Text>
                    {order.items.map((item, index) => (
                      <Text key={index} style={styles.itemText}>• {item}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>Total: ${order.total}</Text>
                    <View style={styles.orderActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleOrderAction(order.id, 'call')}
                      >
                        <Ionicons name="call" size={16} color="#4CAF50" />
                      </TouchableOpacity>
                      
                      {order.status === 'nuevo' && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.acceptButton]}
                          onPress={() => handleOrderAction(order.id, 'accept')}
                        >
                          <Text style={styles.actionButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                      )}
                      
                      {order.status === 'preparando' && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.readyButton]}
                          onPress={() => handleOrderAction(order.id, 'ready')}
                        >
                          <Text style={styles.actionButtonText}>Listo</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>

        {/* Gestión de productos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gestión de productos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BusinessProducts')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.manageProductsCard}
            onPress={() => navigation.navigate('BusinessProducts')}
          >
            <Card style={styles.productManagementCard}>
              <Card.Content style={styles.productManagementContent}>
                <View style={styles.productManagementInfo}>
                  <Ionicons name="restaurant" size={32} color="#FF6B35" />
                  <View style={styles.productManagementText}>
                    <Text style={styles.productManagementTitle}>Gestionar Productos</Text>
                    <Text style={styles.productManagementSubtitle}>Agregar, editar y administrar tu menú</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666666" />
              </Card.Content>
            </Card>
          </TouchableOpacity>
          
          <Text style={styles.subsectionTitle}>Productos populares</Text>
          
          {products.map((product) => (
            <Card key={product.id} style={styles.productCard}>
              <Card.Content>
                <View style={styles.productContent}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>${product.price}</Text>
                  </View>
                  <View style={styles.productStats}>
                    <Text style={styles.productOrders}>{product.orders} pedidos hoy</Text>
                    <View style={[
                      styles.availabilityIndicator,
                      { backgroundColor: product.available ? '#4CAF50' : '#F44336' }
                    ]}>
                      <Text style={styles.availabilityText}>
                        {product.available ? 'Disponible' : 'Agotado'}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* FAB para agregar productos */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('BusinessProducts', { openAddModal: true })}
        color="#FFFFFF"
        label="Agregar Producto"
      />
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
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statusContainer: {
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
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    padding: 5,
    marginRight: 10,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  alertCard: {
    marginBottom: 10,
    elevation: 2,
  },
  newOrderAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  readyOrderAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    flex: 1,
    marginLeft: 15,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  alertDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  alertBadge: {
    backgroundColor: '#2196F3',
  },
  readyBadge: {
    backgroundColor: '#4CAF50',
  },
  orderCard: {
    marginBottom: 15,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  orderTime: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  orderItems: {
    marginBottom: 15,
  },
  itemsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  acceptButton: {
    backgroundColor: '#2196F3',
  },
  readyButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  productCard: {
    marginBottom: 10,
    elevation: 1,
  },
  productContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  productPrice: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginTop: 2,
  },
  productStats: {
    alignItems: 'flex-end',
  },
  productOrders: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 5,
  },
  availabilityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF6B35',
  },
  manageProductsCard: {
    marginBottom: 15,
  },
  productManagementCard: {
    elevation: 2,
    borderRadius: 12,
  },
  productManagementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  productManagementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productManagementText: {
    marginLeft: 16,
    flex: 1,
  },
  productManagementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  productManagementSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 10,
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default BusinessMainScreen;