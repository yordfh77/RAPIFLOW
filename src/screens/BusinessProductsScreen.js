import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Image, ActivityIndicator } from 'react-native';
import { Card, Button, Switch, FAB, Modal, Portal, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme, styles as globalStyles } from '../theme/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';

const BusinessProductsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  const [categories] = useState([
    'Platos principales',
    'Acompañantes',
    'Postres',
    'Bebidas',
    'Entradas'
  ]);

  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Platos principales',
    preparationTime: '',
    ingredients: '',
    available: true,
    image: null
  });

  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Cargar productos desde Firebase
  const loadProducts = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const businessProducts = await productService.getBusinessProducts(user.uid);
      setProducts(businessProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, [user?.uid]);

  const toggleProductAvailability = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      await productService.updateProductAvailability(productId, !product.available);
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, available: !product.available }
          : product
      ));
    } catch (error) {
      console.error('Error updating product availability:', error);
      Alert.alert('Error', 'No se pudo actualizar la disponibilidad del producto');
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
          onPress: async () => {
            try {
              await productService.deleteProduct(productId);
              setProducts(products.filter(product => product.id !== productId));
              Alert.alert('Producto eliminado', 'El producto ha sido eliminado exitosamente.');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      preparationTime: product.preparationTime.toString(),
      ingredients: product.ingredients.join(', '),
      available: product.available,
      image: product.image
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: 'Platos principales',
      preparationTime: '',
      ingredients: '',
      available: true,
      image: null
    });
    setEditingProduct(null);
  };

  const selectImage = () => {
    console.log('selectImage called');
    // Para React Native Web, usamos un input de archivo HTML
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          console.log('Setting image from file');
          setNewProduct({...newProduct, image: e.target.result});
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const openCamera = () => {
    console.log('openCamera called - using file input for web');
    selectImage();
  };

  const openGallery = () => {
    console.log('openGallery called - using file input for web');
    selectImage();
  };

  const removeImage = () => {
    setNewProduct({...newProduct, image: null});
  };

  const saveProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price.trim()) {
      Alert.alert('Error', 'Por favor completa al menos el nombre y precio del producto.');
      return;
    }

    console.log('Usuario actual:', user);
    if (!user?.uid) {
      console.log('No hay usuario autenticado');
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }
    console.log('Usuario autenticado:', user.uid);

    const price = parseFloat(newProduct.price);
    const preparationTime = parseInt(newProduct.preparationTime) || 15;
    const ingredients = newProduct.ingredients.split(',').map(ing => ing.trim()).filter(ing => ing);

    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Por favor ingresa un precio válido.');
      return;
    }

    try {
      setSaving(true);
      
      const productData = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price: price,
        category: newProduct.category,
        preparationTime: preparationTime,
        ingredients: ingredients,
        available: newProduct.available,
        image: newProduct.image,
        orders: 0,
        businessId: user.uid
      };

      // Si estamos editando, mantener el número de pedidos existente
      if (editingProduct) {
        productData.orders = editingProduct.orders;
      }

      let savedProduct;
      if (editingProduct) {
        // Editar producto existente
        await productService.updateProduct(editingProduct.id, productData);
        setProducts(products.map(product => 
          product.id === editingProduct.id 
            ? { ...product, ...productData }
            : product
        ));
        Alert.alert('Producto actualizado', 'El producto ha sido actualizado exitosamente.');
      } else {
        // Agregar nuevo producto
        const productId = await productService.addProduct(user.uid, productData);
        const newProductWithId = { ...productData, id: productId };
        setProducts([...products, newProductWithId]);
        Alert.alert('Producto agregado', 'El producto ha sido agregado exitosamente.');
      }

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'No se pudo guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryStats = () => {
    const stats = {};
    categories.forEach(category => {
      const categoryProducts = products.filter(p => p.category === category);
      stats[category] = {
        total: categoryProducts.length,
        available: categoryProducts.filter(p => p.available).length
      };
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  // Abrir modal automáticamente si se pasa el parámetro
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.openAddModal) {
        setShowAddModal(true);
        // Limpiar el parámetro para evitar que se abra nuevamente
        navigation.setParams({ openAddModal: false });
      }
    }, [route.params?.openAddModal])
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
        <Text style={styles.headerTitle}>Gestión de Productos</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filtros por categoría */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === 'Todos' && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory('Todos')}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === 'Todos' && styles.categoryChipTextActive
            ]}>
              Todos ({products.length})
            </Text>
          </TouchableOpacity>
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive
              ]}>
                {category} ({categoryStats[category]?.available || 0}/{categoryStats[category]?.total || 0})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de productos */}
      <ScrollView style={styles.content}>
        {loading ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.emptyText}>Cargando productos...</Text>
            </Card.Content>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="restaurant-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No hay productos en esta categoría</Text>
              <Text style={styles.emptySubtext}>Agrega productos para comenzar a vender</Text>
            </Card.Content>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} style={styles.productCard}>
              <Card.Content>
                <View style={styles.productHeader}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                  </View>
                  <View style={styles.productActions}>
                    <Switch
                      value={product.available}
                      onValueChange={() => toggleProductAvailability(product.id)}
                      color="#FF6B35"
                    />
                  </View>
                </View>
                
                {product.image && (
                  <View style={styles.productImageContainer}>
                    <Image source={{ uri: product.image }} style={styles.productCardImage} />
                  </View>
                )}
                
                <Text style={styles.productDescription}>{product.description}</Text>
                
                <View style={styles.productDetails}>
                  <View style={styles.productDetailItem}>
                    <Ionicons name="cash" size={16} color="#FF6B35" />
                    <Text style={styles.productDetailText}>${product.price}</Text>
                  </View>
                  <View style={styles.productDetailItem}>
                    <Ionicons name="time" size={16} color="#666666" />
                    <Text style={styles.productDetailText}>{product.preparationTime} min</Text>
                  </View>
                  <View style={styles.productDetailItem}>
                    <Ionicons name="bag-outline" size={16} color="#4CAF50" />
                    <Text style={styles.productDetailText}>{product.orders} pedidos</Text>
                  </View>
                </View>
                
                {product.ingredients && product.ingredients.length > 0 && (
                  <View style={styles.ingredientsContainer}>
                    <Text style={styles.ingredientsLabel}>Ingredientes:</Text>
                    <View style={styles.ingredientsList}>
                      {product.ingredients.slice(0, 3).map((ingredient, index) => (
                        <Chip key={index} style={styles.ingredientChip} textStyle={styles.ingredientChipText}>
                          {ingredient}
                        </Chip>
                      ))}
                      {product.ingredients.length > 3 && (
                        <Chip style={styles.ingredientChip} textStyle={styles.ingredientChipText}>
                          +{product.ingredients.length - 3} más
                        </Chip>
                      )}
                    </View>
                  </View>
                )}
                
                <View style={styles.productFooter}>
                  <View style={[
                    styles.availabilityBadge,
                    { backgroundColor: product.available ? '#4CAF50' : '#F44336' }
                  ]}>
                    <Text style={styles.availabilityText}>
                      {product.available ? 'Disponible' : 'No disponible'}
                    </Text>
                  </View>
                  
                  <View style={styles.productCardActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => openEditModal(product)}
                    >
                      <Ionicons name="pencil" size={16} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteProduct(product.id)}
                    >
                      <Ionicons name="trash" size={16} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Modal para agregar/editar producto */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => {
            setShowAddModal(false);
            resetForm();
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre del producto *</Text>
              <TextInput
                style={styles.formInput}
                value={newProduct.name}
                onChangeText={(text) => setNewProduct({...newProduct, name: text})}
                placeholder="Ej: Ropa Vieja"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={newProduct.description}
                onChangeText={(text) => setNewProduct({...newProduct, description: text})}
                placeholder="Describe tu producto..."
                multiline
                numberOfLines={3}
              />
            </View>
            
            {/* Sección de imagen */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Imagen del producto</Text>
              {newProduct.image ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: newProduct.image }} style={styles.productImage} />
                  <View style={styles.imageActions}>
                    <Button
                      mode="outlined"
                      onPress={selectImage}
                      style={styles.changeImageButton}
                      labelStyle={styles.changeImageText}
                      icon="camera"
                      compact
                    >
                      Cambiar
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={removeImage}
                      style={styles.removeImageButton}
                      labelStyle={styles.removeImageText}
                      icon="trash-can"
                      compact
                    >
                      Eliminar
                    </Button>
                  </View>
                </View>
              ) : (
                <>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      console.log('Add image button pressed');
                      selectImage();
                    }}
                    style={styles.addImageButton}
                    contentStyle={{ height: 80, flexDirection: 'column' }}
                    labelStyle={styles.addImageText}
                    icon="camera"
                  >
                    Agregar imagen
                  </Button>
                  <Text style={styles.addImageSubtext}>Toca para tomar foto o seleccionar de galería</Text>
                </>
              )}
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Precio *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newProduct.price}
                  onChangeText={(text) => setNewProduct({...newProduct, price: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Tiempo (min)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newProduct.preparationTime}
                  onChangeText={(text) => setNewProduct({...newProduct, preparationTime: text})}
                  placeholder="15"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Categoría</Text>
              <View style={styles.categorySelector}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categorySelectorItem,
                      newProduct.category === category && styles.categorySelectorItemActive
                    ]}
                    onPress={() => setNewProduct({...newProduct, category: category})}
                  >
                    <Text style={[
                      styles.categorySelectorText,
                      newProduct.category === category && styles.categorySelectorTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ingredientes</Text>
              <TextInput
                style={styles.formInput}
                value={newProduct.ingredients}
                onChangeText={(text) => setNewProduct({...newProduct, ingredients: text})}
                placeholder="Separados por comas: Carne, Cebolla, Tomate..."
              />
            </View>
            
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.formLabel}>Producto disponible</Text>
                <Switch
                  value={newProduct.available}
                  onValueChange={(value) => setNewProduct({...newProduct, available: value})}
                  color="#FF6B35"
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonText}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  console.log('Save button pressed');
                  saveProduct();
                }}
                style={styles.saveButton}
                labelStyle={styles.saveButtonText}
                loading={saving}
                disabled={saving}
              >
                {saving ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Aceptar')}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* FAB para agregar producto */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddModal(true)}
        color="#FFFFFF"
      />
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
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoryChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#FF6B35',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  categoryChipTextActive: {
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
  productCard: {
    marginBottom: 15,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  productCategory: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  productActions: {
    alignItems: 'flex-end',
  },
  productImageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  productCardImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  productDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 15,
    lineHeight: 18,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productDetailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 5,
  },
  ingredientsContainer: {
    marginBottom: 15,
  },
  ingredientsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientChip: {
    backgroundColor: '#F5F5F5',
    marginRight: 5,
    marginBottom: 5,
    height: 24,
  },
  ingredientChipText: {
    fontSize: 10,
    color: '#666666',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 5,
  },
  deleteButton: {
    padding: 8,
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
  formGroup: {
    marginBottom: 15,
  },
  formGroupHalf: {
    flex: 1,
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categorySelectorItem: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  categorySelectorItemActive: {
    backgroundColor: '#FF6B35',
  },
  categorySelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  categorySelectorTextActive: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#DDDDDD',
  },
  cancelButtonText: {
    color: '#666666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF6B35',
  },
  // Estilos para imágenes
  imageContainer: {
    alignItems: 'center',
  },
  productImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 5,
  },
  changeImageText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 5,
  },
  removeImageText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
  },
  addImageButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: 8,
  },
  addImageSubtext: {
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default BusinessProductsScreen;