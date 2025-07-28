import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const PRODUCTS_COLLECTION = 'products';

export const productService = {
  // Obtener todos los productos de un negocio
  async getBusinessProducts(businessId) {
    try {
      console.log('=== PRODUCT SERVICE: Cargando productos ===');
      console.log('Business ID:', businessId);
      
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('businessId', '==', businessId)
      );
      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      
      // Ordenar por nombre en el cliente
      products.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log('Productos cargados:', products.length);
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Agregar un nuevo producto
  async addProduct(businessId, productData) {
    try {
      console.log('=== PRODUCT SERVICE: Agregando producto ===');
      console.log('Datos del producto:', productData);
      console.log('Usuario actual en Firebase:', auth.currentUser);
      
      // Crear una copia sin businessId duplicado
      const { businessId: _, ...cleanProductData } = productData;
      
      const productToSave = {
        ...cleanProductData,
        businessId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Guardando en Firestore:', productToSave);
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productToSave);
      console.log('Producto guardado exitosamente con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  },

  // Actualizar un producto
  async updateProduct(productId, productData) {
    try {
      console.log('=== PRODUCT SERVICE: Actualizando producto ===');
      console.log('Product ID:', productId);
      console.log('Datos del producto:', productData);
      
      // Crear una copia sin businessId duplicado si existe
      const { businessId: _, id: __, ...cleanProductData } = productData;
      
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      await updateDoc(productRef, {
        ...cleanProductData,
        updatedAt: new Date()
      });
      
      console.log('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Eliminar un producto
  async deleteProduct(productId) {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Actualizar disponibilidad de un producto
  async updateProductAvailability(productId, available) {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      await updateDoc(productRef, {
        available,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating product availability:', error);
      throw error;
    }
  },

  // Obtener productos disponibles de todos los negocios (para clientes)
  async getAvailableProducts() {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('available', '==', true)
      );
      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      
      // Ordenar por nombre en el cliente
      products.sort((a, b) => a.name.localeCompare(b.name));
      
      return products;
    } catch (error) {
      console.error('Error getting available products:', error);
      throw error;
    }
  }
};

export default productService;