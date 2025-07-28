import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Image } from 'react-native';
import { Card, Button, Switch, Avatar, Modal, Portal, Divider, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';
import businessService from '../services/businessService';

const BusinessProfileScreen = ({ navigation }) => {
  // ID del negocio actual (en una app real vendría del contexto de autenticación)
  const [currentBusinessId] = useState(1); // Simulando que es el Restaurante El Cubano
  const [businessInfo, setBusinessInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);

  // Cargar datos del negocio al montar el componente
  useEffect(() => {
    const business = businessService.getBusinessById(currentBusinessId);
    if (business) {
      setBusinessInfo({
        name: business.name,
        email: 'negocio@rapiflow.cu', // En una app real vendría de la autenticación
        phone: business.phone,
        address: business.address,
        description: business.description,
        category: business.category,
        openTime: business.openTime,
        closeTime: business.closeTime,
        joinDate: '2024-01-01',
        avatar: null
      });
      setProducts(business.products || []);
      setOffers(business.offers || []);
    }

    // Suscribirse a cambios en el servicio
    const unsubscribe = businessService.subscribe((businesses) => {
      const updatedBusiness = businesses.find(b => b.id === currentBusinessId);
      if (updatedBusiness) {
        setProducts(updatedBusiness.products || []);
        setOffers(updatedBusiness.offers || []);
      }
    });

    return unsubscribe;
  }, [currentBusinessId]);

  const [stats] = useState({
    totalSales: 156,
    totalRevenue: 8450,
    avgRating: 4.6,
    productsCount: products.length,
    ordersToday: 12,
    pendingOrders: 3
  });

  const [showProductModal, setShowProductModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingOffer, setEditingOffer] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true
  });
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    originalPrice: '',
    discountPrice: '',
    validUntil: '',
    active: true
  });

  const getUserInitials = () => {
    return businessInfo.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    const product = {
      id: Date.now(),
      ...newProduct,
      price: parseFloat(newProduct.price)
    };

    businessService.addProduct(currentBusinessId, product);
    setNewProduct({ name: '', description: '', price: '', category: '', available: true });
    setShowProductModal(false);
    Alert.alert('Éxito', 'Producto agregado correctamente.');
  };

  const handleAddOffer = () => {
    if (!newOffer.title || !newOffer.description) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    const offer = {
      id: Date.now(),
      ...newOffer,
      originalPrice: parseFloat(newOffer.originalPrice) || 0,
      discountPrice: parseFloat(newOffer.discountPrice) || 0
    };

    businessService.addOffer(currentBusinessId, offer);
    setNewOffer({ title: '', description: '', originalPrice: '', discountPrice: '', validUntil: '', active: true });
    setShowOfferModal(false);
    Alert.alert('Éxito', 'Oferta agregada correctamente.');
  };

  const toggleProductAvailability = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const updatedProduct = { ...product, available: !product.available };
      businessService.updateProduct(currentBusinessId, productId, updatedProduct);
    }
  };

  const toggleOfferStatus = (offerId) => {
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      const updatedOffer = { ...offer, active: !offer.active };
      businessService.updateOffer(currentBusinessId, offerId, updatedOffer);
    }
  };

  const deleteProduct = (productId) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que quieres eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            businessService.removeProduct(currentBusinessId, productId);
            Alert.alert('Producto eliminado', 'El producto ha sido eliminado correctamente.');
          }
        }
      ]
    );
  };

  const deleteOffer = (offerId) => {
    Alert.alert(
      'Eliminar oferta',
      '¿Estás seguro de que quieres eliminar esta oferta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            businessService.removeOffer(currentBusinessId, offerId);
            Alert.alert('Oferta eliminada', 'La oferta ha sido eliminada correctamente.');
          }
        }
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Mi Negocio</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Configuración', 'Próximamente disponible')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Información del negocio */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={80} 
                label={getUserInitials()} 
                backgroundColor="#FF6B35" 
                color="#FFFFFF"
              />
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={() => Alert.alert('Cambiar logo', 'Próximamente podrás cambiar el logo de tu negocio')}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{businessInfo.name}</Text>
              <Text style={styles.userType}>{businessInfo.category}</Text>
              <Text style={styles.description}>{businessInfo.description}</Text>
              <Text style={styles.schedule}>Horario: {businessInfo.openTime} - {businessInfo.closeTime}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Estadísticas del negocio */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Estadísticas de Hoy</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.ordersToday}</Text>
                <Text style={styles.statLabel}>Pedidos Hoy</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.avgRating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.productsCount}</Text>
                <Text style={styles.statLabel}>Productos</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Productos */}
        <Card style={styles.productsCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis Productos</Text>
              <TouchableOpacity
                onPress={() => setShowProductModal(true)}
                style={styles.addButton}
              >
                <Ionicons name="add" size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
            
            {products.map((product) => (
              <View key={product.id} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription}>{product.description}</Text>
                  <Text style={styles.productPrice}>${product.price}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>
                </View>
                <View style={styles.productActions}>
                  <Switch
                    value={product.available}
                    onValueChange={() => toggleProductAvailability(product.id)}
                    color="#FF6B35"
                  />
                  <TouchableOpacity
                    onPress={() => deleteProduct(product.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Ofertas */}
        <Card style={styles.offersCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis Ofertas</Text>
              <TouchableOpacity
                onPress={() => setShowOfferModal(true)}
                style={styles.addButton}
              >
                <Ionicons name="add" size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
            
            {offers.map((offer) => (
              <View key={offer.id} style={styles.offerItem}>
                <View style={styles.offerInfo}>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <Text style={styles.offerDescription}>{offer.description}</Text>
                  {offer.originalPrice > 0 && (
                    <View style={styles.priceContainer}>
                      <Text style={styles.originalPrice}>${offer.originalPrice}</Text>
                      <Text style={styles.discountPrice}>${offer.discountPrice}</Text>
                    </View>
                  )}
                  <Text style={styles.validUntil}>Válida hasta: {offer.validUntil}</Text>
                </View>
                <View style={styles.offerActions}>
                  <Switch
                    value={offer.active}
                    onValueChange={() => toggleOfferStatus(offer.id)}
                    color="#FF6B35"
                  />
                  <TouchableOpacity
                    onPress={() => deleteOffer(offer.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('BusinessOrders')}
            style={styles.ordersButton}
            icon="receipt"
          >
            Ver Pedidos
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

      {/* Modal para agregar producto */}
      <Portal>
        <Modal
          visible={showProductModal}
          onDismiss={() => {
            setShowProductModal(false);
            setNewProduct({ name: '', description: '', price: '', category: '', available: true });
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Agregar Producto</Text>
          
          <TextInput
            style={styles.modalInput}
            value={newProduct.name}
            onChangeText={(text) => setNewProduct({...newProduct, name: text})}
            placeholder="Nombre del producto *"
          />
          
          <TextInput
            style={styles.modalInput}
            value={newProduct.description}
            onChangeText={(text) => setNewProduct({...newProduct, description: text})}
            placeholder="Descripción"
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            style={styles.modalInput}
            value={newProduct.price}
            onChangeText={(text) => setNewProduct({...newProduct, price: text})}
            placeholder="Precio *"
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.modalInput}
            value={newProduct.category}
            onChangeText={(text) => setNewProduct({...newProduct, category: text})}
            placeholder="Categoría"
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setShowProductModal(false);
                setNewProduct({ name: '', description: '', price: '', category: '', available: true });
              }}
              style={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleAddProduct}
              style={styles.saveButton}
            >
              Agregar
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Modal para agregar oferta */}
      <Portal>
        <Modal
          visible={showOfferModal}
          onDismiss={() => {
            setShowOfferModal(false);
            setNewOffer({ title: '', description: '', originalPrice: '', discountPrice: '', validUntil: '', active: true });
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Agregar Oferta</Text>
          
          <TextInput
            style={styles.modalInput}
            value={newOffer.title}
            onChangeText={(text) => setNewOffer({...newOffer, title: text})}
            placeholder="Título de la oferta *"
          />
          
          <TextInput
            style={styles.modalInput}
            value={newOffer.description}
            onChangeText={(text) => setNewOffer({...newOffer, description: text})}
            placeholder="Descripción *"
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            style={styles.modalInput}
            value={newOffer.originalPrice}
            onChangeText={(text) => setNewOffer({...newOffer, originalPrice: text})}
            placeholder="Precio original (opcional)"
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.modalInput}
            value={newOffer.discountPrice}
            onChangeText={(text) => setNewOffer({...newOffer, discountPrice: text})}
            placeholder="Precio con descuento (opcional)"
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.modalInput}
            value={newOffer.validUntil}
            onChangeText={(text) => setNewOffer({...newOffer, validUntil: text})}
            placeholder="Válida hasta (YYYY-MM-DD)"
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setShowOfferModal(false);
                setNewOffer({ title: '', description: '', originalPrice: '', discountPrice: '', validUntil: '', active: true });
              }}
              style={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleAddOffer}
              style={styles.saveButton}
            >
              Agregar
            </Button>
          </View>
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
  settingsButton: {
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
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
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
  description: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 5,
  },
  schedule: {
    fontSize: 11,
    color: '#888888',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    padding: 5,
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
  productsCard: {
    marginBottom: 20,
    elevation: 2,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  productDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 5,
  },
  productCategory: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteButton: {
    padding: 5,
  },
  offersCard: {
    marginBottom: 20,
    elevation: 2,
  },
  offerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  offerDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  originalPrice: {
    fontSize: 12,
    color: '#888888',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  validUntil: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  offerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  ordersButton: {
    backgroundColor: '#FF6B35',
    marginBottom: 15,
  },
  logoutButton: {
    borderColor: '#FF6B35',
  },
  logoutButtonText: {
    color: '#FF6B35',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333333',
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#DDDDDD',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
});

export default BusinessProfileScreen;