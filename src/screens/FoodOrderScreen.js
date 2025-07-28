import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Card, Button, Badge, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';
import businessService from '../services/businessService';

const FoodOrderScreen = ({ navigation, route }) => {
  const { businessId, businessData } = route.params || {};
  
  // Si se pasa businessData, navegar directamente a la vista de productos
  React.useEffect(() => {
    if (businessData) {
      navigation.replace('BusinessProductsView', { businessData });
    }
  }, [businessData, navigation]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'Todos', icon: 'grid' },
    { id: 'restaurante', name: 'Restaurante', icon: 'restaurant' },
    { id: 'tienda', name: 'Tienda', icon: 'storefront' },
    { id: 'mercado', name: 'Mercado', icon: 'basket' },
    { id: 'kiosco', name: 'Kiosco', icon: 'home' },
    { id: 'farmacia', name: 'Farmacia', icon: 'medical' },
    { id: 'supermercado', name: 'Supermercado', icon: 'business' },
  ];

  // Cargar negocios desde businessService
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);
        const businesses = await businessService.getAllBusinesses();
        
        // Mapear negocios al formato esperado por la pantalla
        const mappedBusinesses = businesses.map(business => ({
          id: business.id,
          name: business.name,
          category: business.category?.toLowerCase() || 'restaurante',
          rating: business.rating || 4.5,
          deliveryTime: business.deliveryTime || business.delivery || '20-30 min',
          deliveryFee: business.deliveryFee || 15,
          minOrder: business.minOrder || 50,
          image: getCategoryEmoji(business.category),
          products: business.products || [],
          isOpen: business.isOpen !== undefined ? business.isOpen : true,
          phone: business.phone,
          address: business.address,
          description: business.description
        }));
        
        setRestaurants(mappedBusinesses);
      } catch (error) {
        console.error('Error loading businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  // Función para obtener emoji según categoría
  const getCategoryEmoji = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('restaurante') || categoryLower.includes('comida')) return '🍽️';
    if (categoryLower.includes('pizza')) return '🍕';
    if (categoryLower.includes('café') || categoryLower.includes('cafetería')) return '☕';
    if (categoryLower.includes('farmacia')) return '💊';
    if (categoryLower.includes('supermercado')) return '🏢';
    if (categoryLower.includes('mercado')) return '🧺';
    if (categoryLower.includes('tienda')) return '🏪';
    if (categoryLower.includes('kiosco')) return '🏠';
    return '🏪'; // Default
  };

  const getProductEmoji = (productName, productCategory) => {
    const name = productName?.toLowerCase() || '';
    const category = productCategory?.toLowerCase() || '';
    
    // Emojis específicos por nombre de producto
    if (name.includes('pizza')) return '🍕';
    if (name.includes('hamburger') || name.includes('burger')) return '🍔';
    if (name.includes('flan') || name.includes('postre')) return '🍮';
    if (name.includes('ropa vieja') || name.includes('carne')) return '🥩';
    if (name.includes('pollo')) return '🍗';
    if (name.includes('pescado') || name.includes('mariscos')) return '🐟';
    if (name.includes('ensalada')) return '🥗';
    if (name.includes('sopa')) return '🍲';
    if (name.includes('pasta') || name.includes('espagueti')) return '🍝';
    if (name.includes('arroz')) return '🍚';
    if (name.includes('café') || name.includes('coffee')) return '☕';
    if (name.includes('jugo') || name.includes('bebida')) return '🥤';
    if (name.includes('cerveza')) return '🍺';
    if (name.includes('vino')) return '🍷';
    if (name.includes('pan') || name.includes('bread')) return '🍞';
    if (name.includes('leche') || name.includes('milk')) return '🥛';
    if (name.includes('vitamina') || name.includes('medicamento')) return '💊';
    if (name.includes('jarabe')) return '🧴';
    
    // Emojis por categoría de producto
    if (category.includes('pizza')) return '🍕';
    if (category.includes('postre') || category.includes('dulce')) return '🍰';
    if (category.includes('bebida')) return '🥤';
    if (category.includes('plato') || category.includes('principal')) return '🍽️';
    if (category.includes('entrada') || category.includes('aperitivo')) return '🥗';
    if (category.includes('medicamento') || category.includes('farmacia')) return '💊';
    if (category.includes('suplemento')) return '💊';
    
    // Emoji por defecto
    return '🍽️';
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesCategory = selectedCategory === 'all' || restaurant.category === selectedCategory;
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isOpen = restaurant.isOpen;
    return matchesCategory && matchesSearch && isOpen;
  });

  // Mostrar indicador de carga
  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#666' }}>Cargando negocios...</Text>
      </View>
    );
  }

  const addToCart = (product, restaurant) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, restaurant: restaurant.name }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito para continuar');
      return;
    }

    const total = getCartTotal();
    const restaurant = restaurants.find(r => r.products.some(p => cart.some(c => c.id === p.id)));
    
    if (restaurant && total < restaurant.minOrder) {
      Alert.alert(
        'Pedido mínimo',
        `El pedido mínimo para ${restaurant.name} es $${restaurant.minOrder}. Tu pedido actual es $${total}.`
      );
      return;
    }

    Alert.alert(
      'Confirmar Pedido',
      `Total: $${total}\n¿Confirmar pedido?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setCart([]);
            navigation.navigate('OrderTracking', { 
              orderId: Date.now(),
              type: 'food',
              restaurant: restaurant?.name,
              total: total
            });
          }
        }
      ]
    );
  };

  if (selectedRestaurant) {
    const restaurant = restaurants.find(r => r.id === selectedRestaurant);
    return (
      <View style={globalStyles.container}>
        {/* Header del restaurante */}
        <View style={styles.restaurantHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedRestaurant(null)}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantHeaderName}>{restaurant.name}</Text>
            <Text style={styles.restaurantHeaderDetails}>
              ⭐ {restaurant.rating} • 🚚 {restaurant.deliveryTime} • Envío $${restaurant.deliveryFee}
            </Text>
          </View>
        </View>

        {/* Menú de productos */}
        <ScrollView style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Menú</Text>
          {restaurant.products && restaurant.products.length > 0 ? (
            restaurant.products.map((product) => {
              const cartItem = cart.find(item => item.id === product.id);
              return (
                <Card key={product.id} style={styles.productCard}>
                  <Card.Content>
                    <View style={styles.productContent}>
                      <View style={styles.productImage}>
                        <Text style={styles.productEmoji}>{getProductEmoji(product.name, product.category)}</Text>
                      </View>
                      <View style={styles.productDetails}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productDescription}>{product.description || 'Sin descripción'}</Text>
                        <Text style={styles.productPrice}>${product.price}</Text>
                      </View>
                    <View style={styles.productActions}>
                      {cartItem ? (
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(product.id, cartItem.quantity - 1)}
                          >
                            <Ionicons name="remove" size={16} color="#FF6B35" />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(product.id, cartItem.quantity + 1)}
                          >
                            <Ionicons name="add" size={16} color="#FF6B35" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => addToCart(product, restaurant)}
                        >
                          <Ionicons name="add" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                 </Card.Content>
               </Card>
             );
           })
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
                No hay productos disponibles en este momento
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Carrito flotante */}
        {cart.length > 0 && (
          <View style={styles.cartFloating}>
            <TouchableOpacity style={styles.cartButton} onPress={handleCheckout}>
              <View style={styles.cartContent}>
                <View style={styles.cartInfo}>
                  <Text style={styles.cartText}>
                    {getCartItemCount()} productos • ${getCartTotal()}
                  </Text>
                </View>
                <Text style={styles.checkoutText}>Confirmar Pedido</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar restaurantes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Categorías */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon} 
              size={20} 
              color={selectedCategory === category.id ? '#FFFFFF' : '#FF6B35'} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de restaurantes */}
      <ScrollView style={styles.restaurantsContainer}>
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              onPress={() => setSelectedRestaurant(restaurant.id)}
            >
              <Card style={styles.restaurantCard}>
                <Card.Content>
                  <View style={styles.restaurantContent}>
                    <View style={styles.restaurantImageContainer}>
                      <Text style={styles.restaurantEmoji}>{restaurant.image}</Text>
                    </View>
                    <View style={styles.restaurantDetails}>
                      <Text style={styles.restaurantName}>{restaurant.name}</Text>
                      <View style={styles.restaurantMeta}>
                        <Text style={styles.restaurantRating}>⭐ {restaurant.rating}</Text>
                        <Text style={styles.restaurantTime}>🚚 {restaurant.deliveryTime}</Text>
                      </View>
                      <Text style={styles.restaurantFee}>Envío: ${restaurant.deliveryFee} • Mínimo: ${restaurant.minOrder}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 10 }}>
              No hay negocios disponibles
            </Text>
            <Text style={{ fontSize: 14, color: '#999', textAlign: 'center' }}>
              {selectedCategory === 'all' 
                ? 'No hay negocios abiertos en este momento'
                : `No hay negocios abiertos en la categoría "${categories.find(c => c.id === selectedCategory)?.name}"`
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Carrito flotante */}
      {cart.length > 0 && (
        <View style={styles.cartFloating}>
          <TouchableOpacity style={styles.cartButton} onPress={handleCheckout}>
            <View style={styles.cartContent}>
              <Badge style={styles.cartBadge}>{getCartItemCount()}</Badge>
              <Text style={styles.cartText}>Ver Carrito • ${getCartTotal()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    elevation: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  restaurantsContainer: {
    flex: 1,
    padding: 15,
  },
  restaurantCard: {
    marginBottom: 15,
    elevation: 2,
  },
  restaurantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantEmoji: {
    fontSize: 30,
  },
  restaurantDetails: {
    flex: 1,
    marginLeft: 15,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  restaurantRating: {
    fontSize: 12,
    marginRight: 15,
  },
  restaurantTime: {
    fontSize: 12,
  },
  restaurantFee: {
    fontSize: 11,
    color: '#666666',
  },
  restaurantHeader: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    marginRight: 15,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantHeaderName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  restaurantHeaderDetails: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 5,
  },
  menuContainer: {
    flex: 1,
    padding: 15,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  productCard: {
    marginBottom: 15,
    elevation: 1,
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 24,
  },

  productDetails: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 3,
  },
  productDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  productActions: {
    alignItems: 'center',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  cartFloating: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  cartButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    padding: 15,
    elevation: 5,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
  },
  cartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#FFFFFF',
    color: '#FF6B35',
    marginRight: 10,
  },
  cartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FoodOrderScreen;