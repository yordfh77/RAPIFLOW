import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { Card, Button, Avatar, Searchbar, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';
import businessService from '../services/businessService';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/authService';

const ClientMainScreen = ({ navigation }) => {
  const { getUserName, user, clearUser } = useAuth();
  const userName = getUserName();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [availableBusinesses, setAvailableBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentOrders] = useState([
    { id: 1, type: 'food', business: 'Restaurante El Cubano', status: 'entregado', time: '2 horas' },
    { id: 2, type: 'transport', from: 'Centro', to: 'Hospital', status: 'completado', time: '1 día' },
    { id: 3, type: 'package', to: 'María González', status: 'en camino', time: '30 min' },
  ]);

  const categories = ['Todos', 'Restaurante', 'Tienda', 'Mercado', 'Kiosco', 'Farmacia', 'Supermercado'];

  // Función para cargar negocios
  const loadBusinesses = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const businesses = await businessService.getAllBusinesses();
      setAvailableBusinesses(businesses);
    } catch (error) {
      console.error('Error loading businesses:', error);
      // Fallback a datos locales en caso de error
      const localBusinesses = businessService.businesses || [];
      setAvailableBusinesses(localBusinesses);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para refrescar datos
  const onRefresh = () => {
    loadBusinesses(true);
  };

  // Cargar negocios al montar el componente
  useEffect(() => {
    loadBusinesses();

    // Suscribirse a cambios en los negocios
    const unsubscribe = businessService.subscribe((updatedBusinesses) => {
      setAvailableBusinesses(updatedBusinesses);
    });

    return unsubscribe;
  }, []);

  const services = [
    {
      id: 'transport',
      title: 'Pedir Transporte',
      subtitle: 'Viajes rápidos y seguros',
      icon: 'car',
      color: '#4CAF50',
      screen: 'Transport'
    },
    {
      id: 'food',
      title: 'Pedir Comida',
      subtitle: 'Restaurantes locales',
      icon: 'restaurant',
      color: '#FF9800',
      screen: 'FoodOrder'
    },
    {
      id: 'package',
      title: 'Enviar Paquete',
      subtitle: 'Entregas rápidas',
      icon: 'cube',
      color: '#2196F3',
      screen: 'Package'
    }
  ];

  // Filtrar negocios según búsqueda y categoría
  const filteredBusinesses = availableBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || business.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'entregado':
      case 'completado':
        return '#4CAF50';
      case 'en camino':
        return '#FF9800';
      case 'pendiente':
        return '#2196F3';
      default:
        return '#666666';
    }
  };

  const getOrderIcon = (type) => {
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

  // Función para obtener las iniciales del usuario
  const getUserInitials = () => {
    if (!userName || userName === 'Usuario') return 'U';
    const names = userName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  return (
    <ScrollView 
      style={globalStyles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FF6B35']}
          tintColor="#FF6B35"
        />
      }
    >
      {/* Header con saludo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>¡Hola, {userName}!</Text>
            <Text style={styles.location}>📍 Mayarí Arriba, Segundo Frente</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}
            >
              <Avatar.Text size={40} label={getUserInitials()} backgroundColor="#FF6B35" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                console.log('🔴 Botón de salir presionado');
                const confirmed = window.confirm('¿Realmente quieres salir?');
                if (confirmed) {
                  console.log('🔴 Iniciando logout...');
                  try {
                    const result = await logoutUser();
                    console.log('🔴 Resultado logout:', result);
                    if (result.success) {
                      console.log('🔴 Limpiando usuario...');
                      clearUser();
                      console.log('🔴 Navegando a Welcome...');
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Welcome' }],
                      });
                    } else {
                      console.log('🔴 Error en logout:', result.error);
                      window.alert('No se pudo cerrar sesión');
                    }
                  } catch (error) {
                    console.log('🔴 Error catch:', error);
                    window.alert('Error inesperado al cerrar sesión');
                  }
                } else {
                  console.log('🔴 Logout cancelado');
                }
              }}
              style={styles.logoutButton}
            >
              <Ionicons name="log-out-outline" size={24} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Servicios principales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Qué necesitas hoy?</Text>
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, { borderLeftColor: service.color }]}
              onPress={() => navigation.navigate(service.screen)}
            >
              <View style={styles.serviceContent}>
                <Ionicons name={service.icon} size={32} color={service.color} />
                <View style={styles.serviceText}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Barra de búsqueda y filtros */}
      <View style={styles.section}>
        <Searchbar
          placeholder="Buscar negocios..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.categoryChip, selectedCategory === category && styles.selectedCategoryChip]}
              textStyle={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Negocios disponibles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Negocios disponibles</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FoodOrder')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Cargando negocios...</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((business) => (
            <TouchableOpacity
              key={business.id}
              onPress={() => navigation.navigate('FoodOrder', { businessId: business.id, businessData: business })}
            >
              <Card style={[styles.businessCard, !business.isOpen && styles.businessCardClosed]}>
                <Card.Content>
                  <View style={styles.businessHeader}>
                    <Ionicons name="business" size={24} color={business.isOpen ? "#FF6B35" : "#CCCCCC"} />
                    <View style={styles.businessRating}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{business.rating}</Text>
                    </View>
                  </View>
                  <Text style={[styles.businessName, !business.isOpen && styles.businessNameClosed]}>
                    {business.name}
                  </Text>
                  <Text style={styles.businessType}>{business.category}</Text>
                  <Text style={styles.businessDescription}>{business.description}</Text>
                  <View style={styles.businessInfo}>
                    <Text style={styles.businessPhone}>📞 {business.phone}</Text>
                    <Text style={styles.businessAddress}>📍 {business.address}</Text>
                  </View>
                  <View style={styles.deliveryInfo}>
                    <Text style={[styles.deliveryTime, !business.isOpen && styles.deliveryTimeClosed]}>
                      {business.isOpen ? `🚚 ${business.deliveryTime}` : '🔒 Cerrado'}
                    </Text>
                    <Text style={styles.deliveryFee}>Envío: ${business.deliveryFee}</Text>
                  </View>
                  <Text style={styles.productCount}>
                    {business.products?.length || 0} productos disponibles
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="business-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>No hay negocios disponibles</Text>
                <Text style={styles.emptySubtext}>Desliza hacia abajo para actualizar</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Pedidos recientes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver historial</Text>
          </TouchableOpacity>
        </View>
        {recentOrders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => {
              if (order.status === 'en camino') {
                navigation.navigate('OrderTracking', { orderId: order.id });
              }
            }}
          >
            <View style={styles.orderContent}>
              <View style={styles.orderIcon}>
                <Ionicons 
                  name={getOrderIcon(order.type)} 
                  size={24} 
                  color="#FF6B35" 
                />
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.orderTitle}>
                  {order.business || order.from || order.to}
                </Text>
                <Text style={styles.orderTime}>Hace {order.time}</Text>
              </View>
              <View style={styles.orderStatus}>
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {order.status}
                </Text>
                {order.status === 'en camino' && (
                  <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón de emergencia */}
      <View style={styles.emergencySection}>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => Alert.alert('Emergencia', 'Función de emergencia activada. Se notificará a los servicios locales.')}
        >
          <Ionicons name="warning" size={24} color="#FFFFFF" />
          <Text style={styles.emergencyText}>Emergencia</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  location: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileButton: {
    padding: 5,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
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
  servicesGrid: {
    gap: 15,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceText: {
    flex: 1,
    marginLeft: 15,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  businessCard: {
    width: 220,
    marginRight: 15,
    elevation: 3,
  },
  businessCardClosed: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessNameClosed: {
    color: '#999',
  },
  businessType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  businessDescription: {
    fontSize: 11,
    color: '#888',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  searchBar: {
    marginBottom: 15,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryChip: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    color: '#666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  deliveryFee: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  businessInfo: {
    marginBottom: 8,
  },
  businessPhone: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  businessAddress: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  deliveryTimeClosed: {
    color: '#999',
  },
  deliveryTypes: {
    flexDirection: 'row',
    gap: 4,
  },
  productCount: {
    fontSize: 10,
    color: '#FF6B35',
    fontWeight: '500',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  orderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDetails: {
    flex: 1,
    marginLeft: 15,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  orderTime: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emergencySection: {
    padding: 20,
    paddingBottom: 40,
  },
  emergencyButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
    elevation: 3,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ClientMainScreen;