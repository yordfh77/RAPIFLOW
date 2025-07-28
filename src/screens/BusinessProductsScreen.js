import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator, Image } from 'react-native';
import { Card, Button, Switch, FAB, Modal, Portal, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker'; // Temporalmente deshabilitado
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
  
  // Debug: Log cuando cambia el estado del modal
  useEffect(() => {
    console.log('Modal state changed:', showAddModal);
  }, [showAddModal]);
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
    <>
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
        )}      </ScrollView>

      {/* FAB para agregar producto */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          console.log('FAB pressed, current showAddModal:', showAddModal);
          setShowAddModal(true);
          console.log('showAddModal set to true');
        }}
        color="#FFFFFF"
      />
    </View>

    {/* Modal para agregar/editar producto */}
    {showAddModal && (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: 20
      }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            width: '100%',
            maxWidth: 500,
            maxHeight: '90%'
          }}>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1001,
                backgroundColor: '#f0f0f0',
                borderRadius: 15,
                width: 30,
                height: 30,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          <ScrollView>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 20,
              color: '#333'
            }}>
              {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
            </Text>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Nombre del producto *</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16
                }}
                value={newProduct.name}
                onChangeText={(text) => setNewProduct({...newProduct, name: text})}
                placeholder="Ej: Ropa Vieja"
              />
            </View>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Descripción</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  height: 80,
                  textAlignVertical: 'top'
                }}
                value={newProduct.description}
                onChangeText={(text) => setNewProduct({...newProduct, description: text})}
                placeholder="Describe tu producto..."
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Imagen del producto</Text>
              {newProduct.image ? (
                <View style={{ alignItems: 'center' }}>
                  <Image source={{ uri: newProduct.image }} style={{ width: 200, height: 150, borderRadius: 8, marginBottom: 10 }} />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button mode="outlined" onPress={selectImage} icon="camera" compact>
                      Cambiar
                    </Button>
                    <Button mode="outlined" onPress={removeImage} icon="trash-can" compact>
                      Eliminar
                    </Button>
                  </View>
                </View>
              ) : (
                <Button
                  mode="outlined"
                  onPress={selectImage}
                  style={{
                    borderStyle: 'dashed',
                    borderColor: '#FF6B35',
                    padding: 20
                  }}
                  icon="camera"
                >
                  Agregar imagen
                </Button>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', gap: 15, marginBottom: 15 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Precio *</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16
                  }}
                  value={newProduct.price}
                  onChangeText={(text) => setNewProduct({...newProduct, price: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Tiempo (min)</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16
                  }}
                  value={newProduct.preparationTime}
                  onChangeText={(text) => setNewProduct({...newProduct, preparationTime: text})}
                  placeholder="15"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Categoría</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={{
                      backgroundColor: newProduct.category === category ? '#FF6B35' : '#f5f5f5',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 15,
                      marginRight: 8,
                      marginBottom: 8
                    }}
                    onPress={() => setNewProduct({...newProduct, category: category})}
                  >
                    <Text style={{
                      color: newProduct.category === category ? 'white' : '#666',
                      fontSize: 12,
                      fontWeight: '600'
                    }}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>Ingredientes</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16
                }}
                value={newProduct.ingredients}
                onChangeText={(text) => setNewProduct({...newProduct, ingredients: text})}
                placeholder="Separados por comas: Carne, Cebolla, Tomate..."
              />
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>Producto disponible</Text>
              <Switch
                value={newProduct.available}
                onValueChange={(value) => setNewProduct({...newProduct, available: value})}
                color="#FF6B35"
              />
            </View>
            
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                style={{ flex: 1 }}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={saveProduct}
                style={{ flex: 1, backgroundColor: '#FF6B35' }}
                loading={saving}
                disabled={saving}
              >
                {saving ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Guardar')}
              </Button>
            </View>
          </ScrollView>
          </View>
        </View>
      )}
    </>
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
  productImageContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  productCardImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
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