// Script temporal para debuggear Firebase
import { auth, db } from './src/config/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Función para probar la autenticación y Firestore
export const testFirebaseConnection = async () => {
  console.log('=== TESTING FIREBASE CONNECTION ===');
  
  // Verificar autenticación
  const user = auth.currentUser;
  console.log('Usuario autenticado:', user);
  
  if (user) {
    console.log('UID:', user.uid);
    console.log('Email:', user.email);
    console.log('Token:', await user.getIdToken());
  } else {
    console.log('No hay usuario autenticado');
    return;
  }
  
  // Probar escritura en Firestore
  try {
    console.log('Probando escritura en Firestore...');
    const testDoc = {
      test: true,
      timestamp: new Date(),
      userId: user.uid
    };
    
    const docRef = await addDoc(collection(db, 'test'), testDoc);
    console.log('Documento de prueba creado con ID:', docRef.id);
  } catch (error) {
    console.error('Error escribiendo en Firestore:', error);
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
  }
};

// Llamar la función de prueba
if (typeof window !== 'undefined') {
  window.testFirebaseConnection = testFirebaseConnection;
}