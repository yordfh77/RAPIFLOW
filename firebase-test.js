// Archivo de prueba para verificar la conexión con Firebase
import { auth, db } from './src/config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Función de prueba para verificar Firebase
export const testFirebaseConnection = async () => {
  try {
    console.log('Probando conexión con Firebase...');
    
    // Verificar que auth y db estén inicializados
    console.log('Auth:', auth);
    console.log('DB:', db);
    
    // Intentar crear un usuario de prueba
    const testEmail = `test${Date.now()}@test.com`;
    const testPassword = 'test123456';
    
    console.log('Intentando crear usuario de prueba...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    
    console.log('Usuario creado exitosamente:', user.uid);
    
    // Intentar escribir en Firestore
    console.log('Intentando escribir en Firestore...');
    await setDoc(doc(db, 'test', user.uid), {
      email: testEmail,
      createdAt: new Date().toISOString(),
      test: true
    });
    
    console.log('Documento creado exitosamente en Firestore');
    
    return {
      success: true,
      message: 'Firebase funciona correctamente'
    };
  } catch (error) {
    console.error('Error en prueba de Firebase:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

// Ejecutar la prueba automáticamente si estamos en el navegador
if (typeof window !== 'undefined') {
  window.testFirebase = testFirebaseConnection;
  console.log('Función testFirebase disponible en window.testFirebase()');
}