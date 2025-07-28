const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkProducts() {
  try {
    console.log('=== VERIFICANDO PRODUCTOS EN FIREBASE ===');
    
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    console.log('Total productos en Firebase:', snapshot.size);
    
    if (snapshot.size === 0) {
      console.log('❌ No hay productos en Firebase');
      return;
    }
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('\n--- Producto ---');
      console.log('ID del documento:', doc.id);
      console.log('Business ID:', data.businessId);
      console.log('Nombre:', data.name);
      console.log('Precio:', data.price);
      console.log('Disponible:', data.available);
      console.log('Descripción:', data.description);
      console.log('Categoría:', data.category);
    });
    
    // Verificar negocios también
    console.log('\n=== VERIFICANDO NEGOCIOS EN FIREBASE ===');
    const businessesRef = collection(db, 'businesses');
    const businessSnapshot = await getDocs(businessesRef);
    
    console.log('Total negocios en Firebase:', businessSnapshot.size);
    
    businessSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('\n--- Negocio ---');
      console.log('ID del documento:', doc.id);
      console.log('Nombre:', data.name);
      console.log('Activo:', data.isActive);
      console.log('Categoría:', data.category);
    });
    
  } catch (error) {
    console.error('Error verificando datos:', error);
  }
}

checkProducts();