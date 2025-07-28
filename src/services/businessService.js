import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

const BUSINESSES_COLLECTION = 'businesses';

// Servicio para gestionar los negocios registrados
class BusinessService {
  constructor() {
    // Lista inicial de negocios (simulando una base de datos)
    this.businesses = [
      { 
        id: 1, 
        name: 'Restaurante El Cubano', 
        type: 'Comida criolla', 
        rating: 4.8, 
        delivery: '20-30 min',
        phone: '+53 5234 5678',
        address: 'Calle Martí #45, Mayarí Arriba',
        isOpen: true,
        deliveryType: 'both',
        description: 'Comida cubana tradicional con los mejores sabores de la isla',
        category: 'Restaurante',
        openTime: '08:00',
        closeTime: '22:00',
        products: [
          { id: 1, name: 'Ropa Vieja', description: 'Carne deshebrada con sofrito cubano', price: 150, category: 'Platos principales', available: true },
          { id: 2, name: 'Arroz con Pollo', description: 'Arroz amarillo con pollo y vegetales', price: 120, category: 'Platos principales', available: true },
          { id: 3, name: 'Flan de Leche', description: 'Postre tradicional cubano', price: 45, category: 'Postres', available: true }
        ],
        offers: [
          {
            id: 1,
            title: 'Combo Familiar',
            description: '2 platos principales + 2 bebidas + postre',
            originalPrice: 350,
            discountPrice: 280,
            validUntil: '2024-12-31',
            active: true
          }
        ]
      },
      { 
        id: 2, 
        name: 'Pizzería La Italiana', 
        type: 'Pizza y pasta', 
        rating: 4.6, 
        delivery: '25-35 min',
        phone: '+53 5345 6789',
        address: 'Calle Independencia #67, Mayarí Arriba',
        isOpen: true,
        deliveryType: 'delivery',
        description: 'Las mejores pizzas y pastas de la ciudad',
        category: 'Pizzería',
        openTime: '11:00',
        closeTime: '23:00',
        products: [
          { id: 4, name: 'Pizza Margherita', description: 'Pizza clásica con tomate, mozzarella y albahaca', price: 150, category: 'Pizzas', available: true },
          { id: 5, name: 'Pasta Carbonara', description: 'Pasta con salsa cremosa y panceta', price: 130, category: 'Pastas', available: true }
        ],
        offers: []
      },
      { 
        id: 3, 
        name: 'Cafetería Central', 
        type: 'Café y repostería', 
        rating: 4.7, 
        delivery: '15-25 min',
        phone: '+53 5456 7890',
        address: 'Calle Céspedes #89, Mayarí Arriba',
        isOpen: false,
        deliveryType: 'pickup',
        description: 'El mejor café y repostería de la ciudad',
        category: 'Cafetería',
        openTime: '06:00',
        closeTime: '18:00',
        products: [
          { id: 6, name: 'Café Cubano', description: 'Café fuerte y aromático', price: 25, category: 'Bebidas', available: true },
          { id: 7, name: 'Pastel de Tres Leches', description: 'Delicioso postre tradicional', price: 45, category: 'Postres', available: true }
        ],
        offers: []
      },
      {
        id: 4,
        name: 'Farmacia San José',
        type: 'Farmacia y medicamentos',
        rating: 4.9,
        delivery: '10-15 min',
        phone: '+53 5567 8901',
        address: 'Calle Maceo #123, Mayarí Arriba',
        isOpen: true,
        deliveryType: 'both',
        description: 'Medicamentos y productos de salud',
        category: 'Farmacia',
        openTime: '07:00',
        closeTime: '21:00',
        products: [
          { id: 8, name: 'Paracetamol', description: 'Analgésico y antipirético', price: 15, category: 'Medicamentos', available: true },
          { id: 9, name: 'Vitaminas', description: 'Complejo vitamínico', price: 35, category: 'Suplementos', available: true }
        ],
        offers: []
      }
    ];
    
    this.listeners = [];
  }

  // Obtener todos los negocios
  async getAllBusinesses() {
    try {
      // Intentar cargar desde Firebase primero
      const firebaseBusinesses = await this.getActiveBusinessesFromFirebase();
      
      // Si hay datos de Firebase, combinarlos con los locales
      if (firebaseBusinesses && firebaseBusinesses.length > 0) {
        // Crear un mapa de negocios de Firebase por ID
        const firebaseMap = new Map();
        firebaseBusinesses.forEach(business => {
          firebaseMap.set(business.id.toString(), business);
        });
        
        // Combinar con negocios locales, dando prioridad a Firebase
        const combinedBusinesses = [...firebaseBusinesses];
        
        // Agregar negocios locales que no estén en Firebase
        this.businesses.forEach(localBusiness => {
          if (!firebaseMap.has(localBusiness.id.toString())) {
            combinedBusinesses.push(localBusiness);
          }
        });
        
        // Actualizar la lista local con los datos combinados
        this.businesses = combinedBusinesses;
        return combinedBusinesses;
      }
    } catch (error) {
      console.error('Error loading businesses from Firebase:', error);
    }
    
    // Fallback a datos locales si Firebase falla
    return [...this.businesses];
  }

  // Obtener un negocio por ID
  getBusinessById(id) {
    return this.businesses.find(business => business.id === id);
  }

  // Agregar un nuevo negocio
  addBusiness(businessData) {
    const newBusiness = {
      id: Date.now(), // Generar ID único
      ...businessData,
      rating: 5.0, // Rating inicial
      isOpen: true,
      products: businessData.products || [],
      offers: businessData.offers || []
    };
    
    this.businesses.push(newBusiness);
    this.notifyListeners();
    return newBusiness;
  }

  // Actualizar un negocio existente
  updateBusiness(id, updates) {
    const index = this.businesses.findIndex(business => business.id === id);
    if (index !== -1) {
      this.businesses[index] = { ...this.businesses[index], ...updates };
      this.notifyListeners();
      return this.businesses[index];
    }
    return null;
  }

  // Agregar producto a un negocio
  addProductToBusiness(businessId, product) {
    const business = this.getBusinessById(businessId);
    if (business) {
      const newProduct = {
        id: Date.now(),
        ...product
      };
      business.products.push(newProduct);
      this.notifyListeners();
      return newProduct;
    }
    return null;
  }

  // Actualizar producto de un negocio
  updateBusinessProduct(businessId, productId, updates) {
    const business = this.getBusinessById(businessId);
    if (business) {
      const productIndex = business.products.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        business.products[productIndex] = { ...business.products[productIndex], ...updates };
        this.notifyListeners();
        return business.products[productIndex];
      }
    }
    return null;
  }

  // Eliminar producto de un negocio
  removeProductFromBusiness(businessId, productId) {
    const business = this.getBusinessById(businessId);
    if (business) {
      business.products = business.products.filter(p => p.id !== productId);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // Agregar oferta a un negocio
  addOfferToBusiness(businessId, offer) {
    const business = this.getBusinessById(businessId);
    if (business) {
      const newOffer = {
        id: Date.now(),
        ...offer
      };
      business.offers.push(newOffer);
      this.notifyListeners();
      return newOffer;
    }
    return null;
  }

  // Actualizar oferta de un negocio
  updateBusinessOffer(businessId, offerId, updates) {
    const business = this.getBusinessById(businessId);
    if (business) {
      const offerIndex = business.offers.findIndex(o => o.id === offerId);
      if (offerIndex !== -1) {
        business.offers[offerIndex] = { ...business.offers[offerIndex], ...updates };
        this.notifyListeners();
        return business.offers[offerIndex];
      }
    }
    return null;
  }

  // Eliminar oferta de un negocio
  removeOfferFromBusiness(businessId, offerId) {
    const business = this.getBusinessById(businessId);
    if (business) {
      business.offers = business.offers.filter(o => o.id !== offerId);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // Obtener negocios abiertos
  getOpenBusinesses() {
    return this.businesses.filter(business => business.isOpen);
  }

  // Obtener negocios por categoría
  getBusinessesByCategory(category) {
    return this.businesses.filter(business => 
      business.category.toLowerCase().includes(category.toLowerCase()) ||
      business.type.toLowerCase().includes(category.toLowerCase())
    );
  }

  // Buscar negocios
  searchBusinesses(query) {
    const searchTerm = query.toLowerCase();
    return this.businesses.filter(business => 
      business.name.toLowerCase().includes(searchTerm) ||
      business.type.toLowerCase().includes(searchTerm) ||
      business.category.toLowerCase().includes(searchTerm) ||
      business.description.toLowerCase().includes(searchTerm)
    );
  }

  // Suscribirse a cambios
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar a los listeners
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.businesses));
  }

  // Cambiar estado de apertura de un negocio
  toggleBusinessStatus(businessId) {
    const business = this.getBusinessById(businessId);
    if (business) {
      business.isOpen = !business.isOpen;
      this.notifyListeners();
      return business.isOpen;
    }
    return null;
  }

  // Obtener estadísticas de un negocio
  getBusinessStats(businessId) {
    const business = this.getBusinessById(businessId);
    if (business) {
      return {
        totalProducts: business.products.length,
        availableProducts: business.products.filter(p => p.available).length,
        totalOffers: business.offers.length,
        activeOffers: business.offers.filter(o => o.active).length,
        rating: business.rating
      };
    }
    return null;
  }

  // === MÉTODOS FIREBASE ===
  
  // Crear o actualizar perfil de negocio en Firebase
  async createOrUpdateBusinessInFirebase(businessData) {
    try {
      const businessRef = doc(db, BUSINESSES_COLLECTION, businessData.id.toString());
      await setDoc(businessRef, {
        ...businessData,
        createdAt: businessData.createdAt || new Date(),
        updatedAt: new Date(),
        isActive: businessData.isActive !== undefined ? businessData.isActive : true
      }, { merge: true });
      
      return { id: businessData.id, ...businessData };
    } catch (error) {
      console.error('Error creating/updating business in Firebase:', error);
      throw error;
    }
  }

  // Obtener productos de un negocio desde Firebase
  async getBusinessProductsFromFirebase(businessId) {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('businessId', '==', businessId),
        where('available', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const products = [];
      
      querySnapshot.forEach((doc) => {
        const productData = doc.data();
        
        // Validar que el producto tenga datos válidos
        if (productData.name && 
            typeof productData.name === 'string' && 
            productData.name.length < 100 && // Evitar nombres extremadamente largos
            productData.price && 
            typeof productData.price === 'number') {
          
          products.push({ 
            id: doc.id, 
            ...productData,
            // Asegurar que los campos tengan valores válidos
            description: productData.description || 'Sin descripción',
            category: productData.category || 'General'
          });
        } else {
          console.warn('Producto con datos inválidos ignorado:', doc.id, productData);
        }
      });
      
      return products;
    } catch (error) {
      console.error('Error getting products from Firebase:', error);
      return [];
    }
  }

  // Obtener negocios activos desde Firebase
  async getActiveBusinessesFromFirebase() {
    try {
      const businessesRef = collection(db, BUSINESSES_COLLECTION);
      // Removemos orderBy para evitar error de índice faltante
      // El ordenamiento se hará en el cliente
      const q = query(
        businessesRef, 
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const businesses = [];
      
      querySnapshot.forEach((doc) => {
        businesses.push({ id: doc.id, ...doc.data() });
      });
      
      // Cargar productos para cada negocio
      for (const business of businesses) {
        const products = await this.getBusinessProductsFromFirebase(business.id);
        business.products = products;
        
        // Agregar campos faltantes con valores por defecto
        business.rating = business.rating || 4.5;
        business.deliveryTime = business.deliveryTime || '20-30 min';
        business.deliveryFee = business.deliveryFee || 15;
        business.isOpen = business.isOpen !== undefined ? business.isOpen : true;
        business.phone = business.phone || '+53 5000 0000';
        business.address = business.address || 'Dirección no especificada';
        business.description = business.description || 'Descripción no disponible';
      }
      
      // Ordenar por nombre en el cliente
      businesses.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
      return businesses;
    } catch (error) {
      console.error('Error getting active businesses from Firebase:', error);
      // Fallback a datos locales si Firebase falla
      return this.getOpenBusinesses();
    }
  }

  // Actualizar estado del negocio en Firebase
  async updateBusinessStatusInFirebase(businessId, isOpen) {
    try {
      const businessRef = doc(db, BUSINESSES_COLLECTION, businessId.toString());
      await updateDoc(businessRef, {
        isOpen: isOpen,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating business status in Firebase:', error);
      throw error;
    }
  }
}

// Crear instancia singleton
const businessService = new BusinessService();

export default businessService;

// Exportar también la clase para testing
export { BusinessService };