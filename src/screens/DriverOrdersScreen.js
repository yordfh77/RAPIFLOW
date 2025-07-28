import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Card, Button, Badge, Searchbar, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';

const DriverOrdersScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  
  const [orders] = useState([
    {
      id: 1,
      type: 'food',
      customer: 'Ana María López',
      restaurant: 'Restaurante El Cubano',
      pickup: 'Calle Martí #45',
      delivery: 'Calle Maceo #123',
      distance: '2.1 km',
      payment: 45,
      status: 'completado',
      date: '2024-01-15',
      time: '14:30',
      rating: 5,
      duration: '25 min',
      items: ['Ropa Vieja', 'Arroz Blanco']
    },
    {
      id: 2,
      type: 'transport',
      customer: 'Miguel Fernández',
      pickup: 'Hospital Municipal',
      delivery: 'Zona Residencial',
      distance: '3.5 km',
      payment: 80,
      status: 'completado',
      date: '2024-01-15',
      time: '13:15',
      rating: 4,
      duration: '18 min',
      passengers: 2
    },
    {
      id: 3,
      type: 'package',
      customer: 'Rosa Pérez',
      pickup: 'Farmacia Central',
      delivery: 'Barrio Obrero',
      distance: '1.8 km',
      payment: 35,
      status: 'completado',
      date: '2024-01-15',
      time: '12:45',
      rating: 5,
      duration: '15 min',
      description: 'Medicamentos'
    },
    {
      id: 4,
      type: 'food',
      customer: 'Luis García',
      restaurant: 'Pizzería La Habana',
      pickup: 'Calle Independencia #67',
      delivery: 'Calle Céspedes #89',
      distance: '2.8 km',
      payment: 55,
      status: 'en_curso',
      date: '2024-01-15',
      time: '15:20',
      duration: '10 min',
      items: ['Pizza Margherita', 'Refresco']
    },
    {
      id: 5,
      type: 'transport',
      customer: 'Carmen Rodríguez',
      pickup: 'Centro Comercial',
      delivery: 'Reparto Nuevo',
      distance: '4.2 km',
      payment: 90,
      status: 'cancelado',
      date: '2024-01-14',
      time: '16:00',
      cancelReason: 'Cliente no disponible',
      passengers: 1
    },
    {
      id: 6,
      type: 'food',
      customer: 'Pedro Martínez',
      restaurant: 'Cafetería Central',
      pickup: 'Plaza de Armas',
      delivery: 'Barrio Industrial',
      distance: '3.1 km',
      payment: 40,
      status: 'completado',
      date: '2024-01-14',
      time: '11:30',
      rating: 4,
      duration: '22 min',
      items: ['Café Cubano', 'Tostada']
    },
    {
      id: 7,
      type: 'package',
      customer: 'María González',
      pickup: 'Oficina de Correos',
      delivery: 'Calle Libertad #234',
      distance: '1.5 km',
      payment: 30,
      status: 'completado',
      date: '2024-01-14',
      time: '10:15',
      rating: 5,
      duration: '12 min',
      description: 'Documentos importantes'
    },
    {
      id: 8,
      type: 'food',
      customer: 'José Hernández',
      restaurant: 'Paladares Unidos',
      pickup: 'Avenida Principal',
      delivery: 'Zona Rural',
      distance: '5.8 km',
      payment: 75,
      status: 'completado',
      date: '2024-01-13',
      time: '19:45',
      rating: 3,
      duration: '35 min',
      items: ['Pollo Asado', 'Yuca con Mojo', 'Frijoles']
    }
  ]);

  const filters = ['Todos', 'Completado', 'En curso', 'Cancelado'];
  const typeFilters = ['Todos', 'Comida', 'Transporte', 'Paquete'];
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('Todos');

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(order => 
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.delivery.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.restaurant && order.restaurant.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtrar por estado
    if (selectedFilter !== 'Todos') {
      const statusMap = {
        'Completado': 'completado',
        'En curso': 'en_curso',
        'Cancelado': 'cancelado'
      };
      filtered = filtered.filter(order => order.status === statusMap[selectedFilter]);
    }

    // Filtrar por tipo
    if (selectedTypeFilter !== 'Todos') {
      const typeMap = {
        'Comida': 'food',
        'Transporte': 'transport',
        'Paquete': 'package'
      };
      filtered = filtered.filter(order => order.type === typeMap[selectedTypeFilter]);
    }

    return filtered.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completado':
        return '#4CAF50';
      case 'en_curso':
        return '#FF9800';
      case 'cancelado':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completado':
        return 'Completado';
      case 'en_curso':
        return 'En curso';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={12}
          color={i <= rating ? '#FFD700' : '#CCCCCC'}
        />
      );
    }
    return stars;
  };

  const handleOrderPress = (order) => {
    if (order.status === 'en_curso') {
      navigation.navigate('OrderTracking', {
        orderId: order.id,
        orderType: order.type,
        customer: order.customer
      });
    } else {
      Alert.alert(
        'Detalles del pedido',
        `Cliente: ${order.customer}\n` +
        `Tipo: ${order.type === 'food' ? 'Comida' : order.type === 'transport' ? 'Transporte' : 'Paquete'}\n` +
        `Distancia: ${order.distance}\n` +
        `Pago: $${order.payment}\n` +
        `Duración: ${order.duration || 'N/A'}\n` +
        `Estado: ${getStatusText(order.status)}` +
        (order.rating ? `\nCalificación: ${order.rating}/5 estrellas` : '') +
        (order.cancelReason ? `\nRazón de cancelación: ${order.cancelReason}` : '')
      );
    }
  };

  const getOrderStats = () => {
    const completed = orders.filter(o => o.status === 'completado');
    const totalEarnings = completed.reduce((sum, order) => sum + order.payment, 0);
    const totalDistance = completed.reduce((sum, order) => sum + parseFloat(order.distance), 0);
    const avgRating = completed.filter(o => o.rating).reduce((sum, order, _, arr) => 
      sum + order.rating / arr.length, 0
    );

    return {
      totalOrders: completed.length,
      totalEarnings,
      totalDistance: totalDistance.toFixed(1),
      avgRating: avgRating.toFixed(1)
    };
  };

  const stats = getOrderStats();
  const filteredOrders = getFilteredOrders();

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
        <Text style={styles.headerTitle}>Historial de Entregas</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Entregas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>${stats.totalEarnings}</Text>
            <Text style={styles.statLabel}>Ganado</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalDistance} km</Text>
            <Text style={styles.statLabel}>Recorrido</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.avgRating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por cliente, dirección..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Estado:</Text>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && styles.filterChipActive
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedFilter === filter && styles.filterChipTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Tipo:</Text>
            {typeFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  selectedTypeFilter === filter && styles.filterChipActive
                ]}
                onPress={() => setSelectedTypeFilter(filter)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedTypeFilter === filter && styles.filterChipTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Lista de pedidos */}
      <ScrollView style={styles.content}>
        {filteredOrders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="document-text-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No se encontraron entregas</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery.trim() || selectedFilter !== 'Todos' || selectedTypeFilter !== 'Todos'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Tus entregas aparecerán aquí'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <TouchableOpacity key={order.id} onPress={() => handleOrderPress(order)}>
              <Card style={styles.orderCard}>
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
                      <Badge 
                        style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
                      >
                        {getStatusText(order.status)}
                      </Badge>
                    </View>
                  </View>
                  
                  <Text style={styles.customerName}>{order.customer}</Text>
                  {order.restaurant && (
                    <Text style={styles.restaurantName}>📍 {order.restaurant}</Text>
                  )}
                  
                  <View style={styles.addressContainer}>
                    <View style={styles.addressRow}>
                      <Ionicons name="location" size={12} color="#FF6B35" />
                      <Text style={styles.addressText}>Desde: {order.pickup}</Text>
                    </View>
                    <View style={styles.addressRow}>
                      <Ionicons name="flag" size={12} color="#4CAF50" />
                      <Text style={styles.addressText}>Hasta: {order.delivery}</Text>
                    </View>
                  </View>
                  
                  {order.items && (
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsLabel}>Productos:</Text>
                      <Text style={styles.itemsText}>{order.items.join(', ')}</Text>
                    </View>
                  )}
                  
                  {order.description && (
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsLabel}>Descripción:</Text>
                      <Text style={styles.itemsText}>{order.description}</Text>
                    </View>
                  )}
                  
                  {order.passengers && (
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsLabel}>Pasajeros:</Text>
                      <Text style={styles.itemsText}>{order.passengers} persona{order.passengers > 1 ? 's' : ''}</Text>
                    </View>
                  )}
                  
                  {order.cancelReason && (
                    <View style={styles.itemsContainer}>
                      <Text style={styles.itemsLabel}>Motivo de cancelación:</Text>
                      <Text style={[styles.itemsText, styles.cancelReason]}>{order.cancelReason}</Text>
                    </View>
                  )}
                  
                  <View style={styles.orderFooter}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.dateTime}>{order.date} • {order.time}</Text>
                      <View style={styles.orderDetails}>
                        <Text style={styles.distanceText}>📍 {order.distance}</Text>
                        <Text style={styles.paymentAmount}>💰 ${order.payment}</Text>
                        {order.duration && (
                          <Text style={styles.durationText}>⏱️ {order.duration}</Text>
                        )}
                      </View>
                    </View>
                    
                    {order.rating && (
                      <View style={styles.ratingContainer}>
                        <View style={styles.starsContainer}>
                          {renderStars(order.rating)}
                        </View>
                        <Text style={styles.ratingText}>{order.rating}/5</Text>
                      </View>
                    )}
                    
                    {order.status === 'en_curso' && (
                      <View style={styles.actionContainer}>
                        <Ionicons name="chevron-forward" size={16} color="#FF6B35" />
                      </View>
                    )}
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    width: 34,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  searchInput: {
    fontSize: 14,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginRight: 10,
  },
  filterChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyCard: {
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
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
    textAlign: 'center',
  },
  orderCard: {
    marginBottom: 15,
    elevation: 2,
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
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    marginBottom: 3,
  },
  addressText: {
    fontSize: 11,
    color: '#333333',
    marginLeft: 6,
    flex: 1,
  },
  itemsContainer: {
    marginBottom: 8,
  },
  itemsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 2,
  },
  itemsText: {
    fontSize: 11,
    color: '#333333',
  },
  cancelReason: {
    color: '#F44336',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  orderInfo: {
    flex: 1,
  },
  dateTime: {
    fontSize: 10,
    color: '#999999',
    marginBottom: 5,
  },
  orderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 10,
    color: '#666666',
    marginRight: 10,
  },
  paymentAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginRight: 10,
  },
  durationText: {
    fontSize: 10,
    color: '#666666',
  },
  ratingContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 10,
    color: '#666666',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
});

export default DriverOrdersScreen;