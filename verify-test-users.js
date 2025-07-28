// Script para verificar el estado de los usuarios de prueba en Firebase
// Este script debe ejecutarse desde la consola del navegador

const verifyTestUsers = async () => {
  console.log('🔍 Verificando usuarios de prueba en Firebase...');
  
  // Importar servicios desde la ventana global
  const { loginUser } = window.authService || {};
  const { auth, db } = window.firebase || {};
  
  if (!loginUser || !auth || !db) {
    console.error('❌ Firebase o authService no están disponibles.');
    console.log('Asegúrate de que la aplicación esté cargada y Firebase inicializado.');
    return;
  }
  
  const testUsers = [
    { email: 'cliente@test.com', password: 'test123', type: 'Cliente' },
    { email: 'negocio@test.com', password: 'test123', type: 'Negocio' },
    { email: 'repartidor@test.com', password: 'test123', type: 'Repartidor' }
  ];
  
  for (const user of testUsers) {
    console.log(`\n📧 Verificando: ${user.email} (${user.type})`);
    
    try {
      // Intentar login
      console.log('  🔐 Intentando login...');
      const loginResult = await loginUser(user.email, user.password);
      
      if (loginResult.success) {
        console.log('  ✅ Login exitoso');
        console.log('  👤 Datos del usuario:', {
          uid: loginResult.user.uid,
          email: loginResult.user.email,
          name: loginResult.user.name,
          userType: loginResult.user.userType,
          isActive: loginResult.user.isActive,
          profileComplete: loginResult.user.profileComplete
        });
        
        // Verificar documento en Firestore
        try {
          const { getDoc, doc } = window.firebase;
          const userDoc = await getDoc(doc(db, 'users', loginResult.user.uid));
          
          if (userDoc.exists()) {
            console.log('  📄 Documento en Firestore: ✅ Existe');
            const userData = userDoc.data();
            console.log('  📊 Datos en Firestore:', {
              userType: userData.userType,
              isActive: userData.isActive,
              profileComplete: userData.profileComplete,
              createdAt: userData.createdAt
            });
          } else {
            console.log('  📄 Documento en Firestore: ❌ No existe');
          }
        } catch (firestoreError) {
          console.log('  📄 Error verificando Firestore:', firestoreError.message);
        }
        
      } else {
        console.log('  ❌ Login falló:', loginResult.error);
        
        // Verificar si el usuario existe en Auth pero no puede hacer login
        try {
          const { signInWithEmailAndPassword } = window.firebase;
          await signInWithEmailAndPassword(auth, user.email, user.password);
        } catch (authError) {
          console.log('  🔍 Error de Firebase Auth:', {
            code: authError.code,
            message: authError.message
          });
          
          if (authError.code === 'auth/user-not-found') {
            console.log('  ❌ Usuario NO existe en Firebase Auth');
          } else if (authError.code === 'auth/wrong-password') {
            console.log('  ⚠️ Usuario existe pero contraseña incorrecta');
          } else if (authError.code === 'auth/invalid-credential') {
            console.log('  ⚠️ Credenciales inválidas - posible problema de configuración');
          }
        }
      }
      
    } catch (error) {
      console.log('  💥 Error inesperado:', error.message);
    }
  }
  
  console.log('\n🏁 Verificación completada.');
};

// Función para verificar la configuración de Firebase
const verifyFirebaseConfig = () => {
  console.log('🔧 Verificando configuración de Firebase...');
  
  const { auth, db } = window.firebase || {};
  
  if (!auth) {
    console.log('❌ Firebase Auth no está inicializado');
    return false;
  }
  
  if (!db) {
    console.log('❌ Firestore no está inicializado');
    return false;
  }
  
  console.log('✅ Firebase Auth y Firestore están inicializados');
  console.log('📱 App actual:', auth.app.name);
  console.log('🔗 Proyecto:', auth.app.options.projectId);
  
  return true;
};

// Instrucciones
console.log(`
🔧 INSTRUCCIONES PARA VERIFICAR USUARIOS DE PRUEBA:

1. Abre la aplicación RapiFlow en el navegador
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña 'Console'
4. Copia y pega este código completo
5. Ejecuta: verifyFirebaseConfig()
6. Ejecuta: verifyTestUsers()

Esto verificará si los usuarios de prueba existen y pueden hacer login.
`);

// Exportar para uso en consola
if (typeof window !== 'undefined') {
  window.verifyTestUsers = verifyTestUsers;
  window.verifyFirebaseConfig = verifyFirebaseConfig;
}