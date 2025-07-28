// ===================================================================
// COMANDOS DE TESTING PARA LA CONSOLA DEL NAVEGADOR
// ===================================================================
// Copia y pega estos comandos en la consola del navegador (F12)
// para probar y resolver los errores de Firebase

// 1. VERIFICAR CONEXIÓN CON FIREBASE
console.log('🔥 Verificando conexión con Firebase...');
if (typeof checkFirebaseConnection !== 'undefined') {
  checkFirebaseConnection();
} else {
  console.error('❌ testUtils no está disponible. Verifica que esté importado en RegisterScreen.js');
}

// 2. GENERAR EMAIL ÚNICO PARA TESTING
console.log('📧 Generando email único para testing...');
if (typeof generateTestEmail !== 'undefined') {
  const testEmail = generateTestEmail();
  console.log('✅ Email de prueba:', testEmail);
  console.log('💡 Usa este email en el formulario de registro');
} else {
  console.error('❌ generateTestEmail no está disponible');
}

// 3. GENERAR DATOS COMPLETOS DE USUARIO
console.log('👤 Generando datos completos de usuario...');
if (typeof generateTestUserData !== 'undefined') {
  const clientData = generateTestUserData('client');
  const businessData = generateTestUserData('business');
  const driverData = generateTestUserData('driver');
  
  console.log('✅ Datos de Cliente:', clientData);
  console.log('✅ Datos de Negocio:', businessData);
  console.log('✅ Datos de Repartidor:', driverData);
  
  console.log('💡 Copia cualquiera de estos objetos y úsalos en el formulario');
} else {
  console.error('❌ generateTestUserData no está disponible');
}

// 4. LIMPIAR USUARIO DE PRUEBA (usar después de testing)
// NOTA: Descomenta y modifica el email/password según necesites
/*
console.log('🧹 Limpiando usuario de prueba...');
if (typeof cleanupTestUser !== 'undefined') {
  cleanupTestUser('test@example.com', 'password123')
    .then(() => console.log('✅ Usuario de prueba eliminado'))
    .catch(err => console.error('❌ Error limpiando usuario:', err));
} else {
  console.error('❌ cleanupTestUser no está disponible');
}
*/

// 5. VERIFICAR ESTADO DE FIREBASE AUTH
console.log('🔐 Verificando estado de autenticación...');
if (typeof firebase !== 'undefined' && firebase.auth) {
  const user = firebase.auth().currentUser;
  if (user) {
    console.log('✅ Usuario autenticado:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
  } else {
    console.log('ℹ️ No hay usuario autenticado');
  }
} else {
  console.log('ℹ️ Firebase Auth no está disponible en el scope global');
}

// 6. VERIFICAR ERRORES COMUNES
console.log('🔍 Verificando errores comunes...');

// Verificar si hay errores de permisos en la consola
const hasPermissionErrors = console.error.toString().includes('permission') || 
                           document.body.innerHTML.includes('Missing or insufficient permissions');

if (hasPermissionErrors) {
  console.warn('⚠️ Se detectaron errores de permisos de Firestore');
  console.log('💡 Solución: Configura las reglas de Firestore usando el archivo firestore-rules.txt');
  console.log('📋 Pasos:');
  console.log('   1. Ve a https://console.firebase.google.com/');
  console.log('   2. Selecciona el proyecto rapiflow-b31de');
  console.log('   3. Ve a Firestore Database > Rules');
  console.log('   4. Copia las reglas del archivo firestore-rules.txt');
  console.log('   5. Haz clic en Publish');
}

// 7. COMANDOS RÁPIDOS PARA COPIAR
console.log('📋 COMANDOS RÁPIDOS:');
console.log('// Generar email único:');
console.log('generateTestEmail()');
console.log('');
console.log('// Generar datos de cliente:');
console.log('generateTestUserData("client")');
console.log('');
console.log('// Verificar conexión:');
console.log('checkFirebaseConnection()');
console.log('');
console.log('// Limpiar usuario (modifica email/password):');
console.log('cleanupTestUser("email@test.com", "password123")');

console.log('\n🎯 TESTING COMPLETADO - Revisa los resultados arriba');
console.log('📖 Para más información, consulta FIREBASE_ERRORS_SOLUTION.md');