// Utilidades para testing y desarrollo
import { auth, db } from '../config/firebase';
import { deleteUser, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

// Función para limpiar usuarios de prueba
export const cleanupTestUser = async (email, password) => {
  try {
    console.log('Intentando limpiar usuario de prueba:', email);
    
    // Intentar iniciar sesión con el usuario de prueba
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Usuario encontrado, eliminando...');
    
    // Eliminar documento de Firestore
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      console.log('Documento de Firestore eliminado');
    } catch (firestoreError) {
      console.log('Error eliminando documento de Firestore:', firestoreError.message);
    }
    
    // Eliminar usuario de Authentication
    await deleteUser(user);
    console.log('Usuario eliminado de Authentication');
    
    return { success: true, message: 'Usuario de prueba eliminado exitosamente' };
  } catch (error) {
    console.log('Error limpiando usuario de prueba:', error.message);
    return { success: false, error: error.message };
  }
};

// Función para generar email único para pruebas
export const generateTestEmail = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test${timestamp}${random}@rapiflow.test`;
};

// Función para generar datos de prueba
export const generateTestUserData = (userType = 'client') => {
  const email = generateTestEmail();
  const baseData = {
    name: 'Usuario de Prueba',
    email: email,
    phone: '+53 5123 4567',
    password: 'test123456',
    confirmPassword: 'test123456',
    userType: userType,
    address: 'Calle de Prueba 123, La Habana'
  };
  
  // Agregar datos específicos según el tipo de usuario
  if (userType === 'business') {
    baseData.businessName = 'Negocio de Prueba';
    baseData.businessType = 'Restaurante';
  } else if (userType === 'driver') {
    baseData.vehicleType = 'Motocicleta';
    baseData.licenseNumber = 'TEST123456';
  }
  
  return baseData;
};

// Función para verificar conectividad con Firebase
export const checkFirebaseConnection = async () => {
  try {
    console.log('Verificando conexión con Firebase...');
    console.log('Auth:', auth);
    console.log('DB:', db);
    console.log('Auth currentUser:', auth.currentUser);
    
    return {
      success: true,
      auth: !!auth,
      db: !!db,
      currentUser: auth.currentUser
    };
  } catch (error) {
    console.error('Error verificando Firebase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Hacer funciones disponibles globalmente para debugging
if (typeof window !== 'undefined') {
  window.cleanupTestUser = cleanupTestUser;
  window.generateTestEmail = generateTestEmail;
  window.generateTestUserData = generateTestUserData;
  window.checkFirebaseConnection = checkFirebaseConnection;
  console.log('Funciones de testing disponibles en window:', {
    cleanupTestUser: 'cleanupTestUser(email, password)',
    generateTestEmail: 'generateTestEmail()',
    generateTestUserData: 'generateTestUserData(userType)',
    checkFirebaseConnection: 'checkFirebaseConnection()'
  });
}