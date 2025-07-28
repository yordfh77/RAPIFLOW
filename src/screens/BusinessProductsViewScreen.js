import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import productService from '../services/productService';

const BusinessProductsViewScreen = ({ route, navigation }) => {
  const { businessData } = route.params;
  const [cart, setCart] = useState([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState('delivery');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos del negocio desde Firebase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('=== CARGANDO PRODUCTOS DEL NEGOCIO ===');
        console.log('Business ID:', businessData.id);
        
        setLoading(true);
        const businessProducts = await productService.getBusinessProducts(businessData.id);
        console.log('Productos cargados:', businessProducts.length);
        setProducts(businessProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        Alert.alert('Error', 'No se pudieron cargar los productos del negocio');
        // Fallback a productos locales si existen
        if (businessData.products && businessData.products.length > 0) {
          setProducts(businessData.products);
        }
      } finally {
        setLoading(false);
      }
    };

    if (businessData && businessData.id) {
      loadProducts();
    } else {
      // Si no hay ID, usar productos locales
      setProducts(businessData.products || []);
      setLoading(false);
    }
  }, [businessData]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    Alert.alert('Producto agregado', `${product.name} agregado al carrito`);
  };

  const removeFromCart = (productId) => {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== productId));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const proceedToOrder = () => {
    if (cart.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito antes de continuar');
      return;
    }
    
    navigation.navigate('OrderConfirmation', {
      businessData,
      cart,
      deliveryType: selectedDeliveryType,
      total: getCartTotal()
    });
  };

  return (
    <View style={styles.container}>
      {/* Header del negocio */}
      <Card style={styles.businessHeader}>
        <Card.Content>
          <View style={styles.businessInfo}>
            <View style={styles.businessTitleRow}>
              <Ionicons name="storefront" size={28} color="#FF6B35" />
              <View style={styles.businessDetails}>
                <Text style={styles.businessName}>{businessData.name}</Text>
                <Text style={styles.businessType}>{businessData.type}</Text>
              </View>
              <View style={styles.businessRating}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{businessData.rating}</Text>
              </View>
            </View>
            
            <View style={styles.contactInfo}>
              <Text style={styles.contactText}>📞 {businessData.phone}</Text>
              <Text style={styles.contactText}>📍 {businessData.address}</Text>
              <Text style={styles.deliveryTimeText}>🚚 {businessData.delivery}</Text>
            </View>

            {/* Opciones de entrega */}
            <View style={styles.deliveryOptions}>
              <Text style={styles.deliveryOptionsTitle}>Tipo de entrega:</Text>
              <View style={styles.deliveryChips}>
                {(businessData.deliveryType === 'both' || businessData.deliveryType === 'delivery') && (
                  <Chip
                    selected={selectedDeliveryType === 'delivery'}
                    onPress={() => setSelectedDeliveryType('delivery')}
                    style={styles.deliveryChip}
                    icon="bicycle"
                  >
                    Entrega a domicilio
                  </Chip>
                )}
                {(businessData.deliveryType === 'both' || businessData.deliveryType === 'pickup') && (
                  <Chip
                    selected={selectedDeliveryType === 'pickup'}
                    onPress={() => setSelectedDeliveryType('pickup')}
                    style={styles.deliveryChip}
                    icon="storefront"
                  >
                    Recoger en tienda
                  </Chip>
                )}
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Lista de productos */}
      <ScrollView style={styles.productsContainer}>
        <Text style={styles.productsTitle}>Productos disponibles ({products.length})</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Cargando productos...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>Este negocio aún no tiene productos disponibles</Text>
            <Text style={styles.emptySubtitle}>Vuelve más tarde para ver las novedades</Text>
          </View>
        ) : (
          products.map((product) => {
          const cartItem = cart.find(item => item.id === product.id);
          return (
            <Card key={product.id} style={styles.productCard}>
              <Card.Content>
                <View style={styles.productInfo}>
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>${product.price}</Text>
                    <View style={styles.productStatus}>
                      <Ionicons 
                        name={product.available ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={product.available ? "#4CAF50" : "#F44336"} 
                      />
                      <Text style={[styles.statusText, { color: product.available ? "#4CAF50" : "#F44336" }]}>
                        {product.available ? 'Disponible' : 'No disponible'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.productActions}>
                    {cartItem && (
                      <View style={styles.quantityControls}>
                        <TouchableOpacity 
                          onPress={() => removeFromCart(product.id)}
                          style={styles.quantityButton}
                        >
                          <Ionicons name="remove" size={20} color="#FF6B35" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                        <TouchableOpacity 
                          onPress={() => addToCart(product)}
                          style={styles.quantityButton}
                        >
                          <Ionicons name="add" size={20} color="#FF6B35" />
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    {!cartItem && product.available && (
                      <Button
                        mode="contained"
                        onPress={() => addToCart(product)}
                        style={styles.addButton}
                        buttonColor="#FF6B35"
                      >
                        Agregar
                      </Button>
                    )}
                    
                    {!product.available && (
                      <Button
                        mode="outlined"
                        disabled
                        style={styles.disabledButton}
                      >
                        No disponible
                      </Button>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>
          );
        })
        )}
      </ScrollView>

      {/* Carrito flotante */}
      {cart.length > 0 && (
        <View style={styles.cartFooter}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>{getCartItemCount()} productos</Text>
            <Text style={styles.cartTotal}>Total: ${getCartTotal()}</Text>
          </View>
          <Button
            mode="contained"
            onPress={proceedToOrder}
            style={styles.orderButton}
            buttonColor="#FF6B35"
          >
            Realizar pedido
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  businessHeader: {
    margin: 16,
    elevation: 4,
  },
  businessInfo: {
    gap: 12,
  },
  businessTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  businessType: {
    fontSize: 14,
    color: '#666',
  },
  businessRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactInfo: {
    gap: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
  },
  deliveryTimeText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  deliveryOptions: {
    gap: 8,
  },
  deliveryOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deliveryChips: {
    flexDirection: 'row',
    gap: 8,
  },
  deliveryChip: {
    backgroundColor: '#FFF',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  productCard: {
    marginBottom: 12,
    elevation: 2,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  productStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  productActions: {
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    minWidth: 80,
  },
  disabledButton: {
    minWidth: 80,
    opacity: 0.5,
  },
  cartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    fontSize: 14,
    color: '#666',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderButton: {
    minWidth: 140,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default BusinessProductsViewScreen;