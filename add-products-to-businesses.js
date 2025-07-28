const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCUVic76jZTqX6Ij0r-2FBrTWd9wNSio3o",
  authDomain: "rapiflow-b31de.firebaseapp.com",
  projectId: "rapiflow-b31de",
  storageBucket: "rapiflow-b31de.firebasestorage.app",
  messagingSenderId: "339489341161",
  appId: "1:339489341161:web:b385b41394b67d153bfa78",
  measurementId: "G-1G5B4M00XN"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Productos para cada negocio
const businessProducts = {
  // Pizzería Don Mario
  'H5EkxJOgTp1wkDak3ekq': [
    {
      name: 'Pizza Margherita',
      description: 'Pizza clásica con tomate, mozzarella y albahaca fresca',
      price: 180,
      category: 'Pizzas',
      available: true,
      preparationTime: 25
    },
    {
      name: 'Pizza Pepperoni',
      description: 'Pizza con pepperoni y mozzarella',
      price: 200,
      category: 'Pizzas',
      available: true,
      preparationTime: 25
    },
    {
      name: 'Pizza Hawaiana',
      description: 'Pizza con jamón, piña y mozzarella',
      price: 190,
      category: 'Pizzas',
      available: true,
      preparationTime: 25
    },
    {
      name: 'Lasaña de Carne',
      description: 'Lasaña casera con carne molida y queso',
      price: 220,
      category: 'Pastas',
      available: true,
      preparationTime: 30
    }
  ],
  
  // Farmacia Central
  '0pmrppWNz7J3Qyo9jbuc': [
    {
      name: 'Paracetamol 500mg',
      description: 'Analgésico y antipirético - Caja con 20 tabletas',
      price: 25,
      category: 'Medicamentos',
      available: true,
      preparationTime: 5
    },
    {
      name: 'Ibuprofeno 400mg',
      description: 'Antiinflamatorio - Caja con 20 tabletas',
      price: 35,
      category: 'Medicamentos',
      available: true,
      preparationTime: 5
    },
    {
      name: 'Vitamina C',
      description: 'Suplemento vitamínico - Frasco con 60 tabletas',
      price: 45,
      category: 'Suplementos',
      available: true,
      preparationTime: 5
    },
    {
      name: 'Alcohol en Gel',
      description: 'Desinfectante para manos - 250ml',
      price: 20,
      category: 'Higiene',
      available: true,
      preparationTime: 5
    }
  ],
  
  // Tienda La Moderna
  'r9xopEyEtJesOFSWemNc': [
    {
      name: 'Arroz Blanco',
      description: 'Arroz de grano largo - Bolsa de 1kg',
      price: 30,
      category: 'Granos',
      available: true,
      preparationTime: 10
    },
    {
      name: 'Frijoles Negros',
      description: 'Frijoles negros secos - Bolsa de 500g',
      price: 25,
      category: 'Granos',
      available: true,
      preparationTime: 10
    },
    {
      name: 'Aceite de Cocina',
      description: 'Aceite vegetal para cocinar - Botella de 1L',
      price: 40,
      category: 'Condimentos',
      available: true,
      preparationTime: 10
    },
    {
      name: 'Leche en Polvo',
      description: 'Leche en polvo entera - Bolsa de 400g',
      price: 55,
      category: 'Lácteos',
      available: true,
      preparationTime: 10
    }
  ],
  
  // Cafetería El Aroma
  '7i8ul5kXhFT0HttmGGNJ': [
    {
      name: 'Café Cubano',
      description: 'Café expreso tradicional cubano',
      price: 15,
      category: 'Bebidas',
      available: true,
      preparationTime: 5
    },
    {
      name: 'Cortadito',
      description: 'Café con leche espumosa',
      price: 20,
      category: 'Bebidas',
      available: true,
      preparationTime: 8
    },
    {
      name: 'Sandwich Cubano',
      description: 'Sandwich con jamón, queso, pepinillos y mostaza',
      price: 65,
      category: 'Comida',
      available: true,
      preparationTime: 15
    },
    {
      name: 'Flan de Leche',
      description: 'Flan casero con caramelo',
      price: 35,
      category: 'Postres',
      available: true,
      preparationTime: 10
    }
  ]
};

async function addProductsToBusinesses() {
  try {
    console.log('=== AGREGANDO PRODUCTOS A LOS NEGOCIOS ===');
    
    for (const [businessId, products] of Object.entries(businessProducts)) {
      console.log(`\nAgregando productos para negocio: ${businessId}`);
      
      for (const product of products) {
        const productData = {
          ...product,
          businessId: businessId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const docRef = await addDoc(collection(db, 'products'), productData);
        console.log(`✅ Producto agregado: ${product.name} (ID: ${docRef.id})`);
      }
    }
    
    console.log('\n🎉 ¡Todos los productos han sido agregados exitosamente!');
    console.log('\n📱 Ahora puedes refrescar la aplicación para ver los productos en cada negocio.');
    
  } catch (error) {
    console.error('❌ Error agregando productos:', error);
  }
}

addProductsToBusinesses();