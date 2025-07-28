import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Card, Button, Badge, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';
import businessService from '../services/businessService';

const BusinessProductsView = ({ navigation, route }) => {
  const { businessData } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Cargar productos del negocio
    if (businessData && businessData.products) {
      setProducts(businessData.products);
    }
  }, [businessData]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, businessName: businessData.name }]);
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
    
    if (businessData.minOrder && total < businessData.minOrder) {
      Alert.alert(
        'Pedido mínimo',
        `El pedido mínimo para ${businessData.name} es $${businessData.minOrder}. Tu pedido actual es $${total}.`
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
              business: businessData.name,
              total: total,
              items: cart
            });
          }
        }
      ]
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* Header del negocio */}
      <View style={styles.businessHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.businessInfo}>
          <Text style={styles.businessHeaderName}>{businessData.name}</Text>
          <Text style={styles.businessHeaderDetails}>
            ⭐ {businessData.rating} • 🚚 {businessData.deliveryTime} • Envío ${businessData.deliveryFee}
          </Text>
          <Text style={styles.businessDescription}>{businessData.description}</Text>
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar productos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Lista de productos */}
      <ScrollView style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Productos disponibles ({filteredProducts.length})</Text>
        
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No se encontraron productos' : 'Este negocio aún no tiene productos disponibles'}
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const cartItem = cart.find(item => item.id === product.id);
            return (
              <Card key={product.id} style={styles.productCard}>
                <Card.Content>
                  <View style={styles.productContent}>
                    <View style={styles.productImage}>
                      <Ionicons name="cube-outline" size={40} color="#FF6B35" />
                    </View>
                    <View style={styles.productDetails}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productDescription}>{product.description}</Text>
                      <Text style={styles.productPrice}>${product.price}</Text>
                      {product.category && (
                        <Text style={styles.productCategory}>Categoría: {product.category}</Text>
                      )}
                    </View>
                    <View style={styles.productActions}>
                      {cartItem ? (
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(product.id, cartItem.quantity - 1)}
                          >
                            <Ionicons name="remove" size={20} color="#FF6B35" />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => updateQuantity(product.id, cartItem.quantity + 1)}
                          >
                            <Ionicons name="add" size={20} color="#FF6B35" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => addToCart(product)}
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
        )}
      </ScrollView>

      {/* Carrito flotante */}
      {cart.length > 0 && (
        <View style={styles.cartContainer}>
          <TouchableOpacity style={styles.cartButton} onPress={handleCheckout}>
            <View style={styles.cartContent}>
              <View style={styles.cartInfo}>
                <Badge style={styles.cartBadge}>{getCartItemCount()}</Badge>
                <Text style={styles.cartText}>Ver carrito</Text>
              </View>
              <Text style={styles.cartTotal}>${getCartTotal()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  businessHeader: {
    backgroundColor: '#FF6B35',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  businessInfo: {
    alignItems: 'flex-start',
  },
  businessHeaderName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  businessHeaderDetails: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  businessDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  menuContainer: {
    flex: 1,
    padding: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
  },
  productCard: {
    marginBottom: 15,
    elevation: 2,
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  productCategory: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  productActions: {
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 5,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginHorizontal: 15,
  },
  cartContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  cartButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 5,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartTotal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BusinessProductsView;