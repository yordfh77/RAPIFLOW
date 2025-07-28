// Script de prueba para verificar el login de usuarios
import { loginUser, registerUser, USER_TYPES } from './src/services/authService';

// Usuarios de prueba
const testUsers = {
  cliente: {
    email: 'cliente@test.com',
    password: 'test123',
    name: 'Cliente Test',
    phone: '+53 5234 5678',
    address: 'Calle 1, Mayarí Arriba',
    userType: USER_TYPES.CLIENT
  },
  negocio: {
    email: 'negocio@test.com',
    password: 'test123',
    name: 'Negocio Test',
    phone: '+53 5345 6789',
    address: 'Calle 2, Mayarí Arriba',
    userType: USER_TYPES.BUSINESS,
    businessName: 'Restaurante Test',
    businessType: 'Restaurante'
  },
  repartidor: {
    email: 'repartidor@test.com',
    password: 'test123',
    name: 'Repartidor Test',
    phone: '+53 5456 7890',
    address: 'Calle 3, Mayarí Arriba',
    userType: USER_TYPES.DRIVER,
    vehicleType: 'Bicicleta',
    licenseNumber: 'ABC123'
  }
};

// Función para registrar usuarios de prueba
export const registerTestUsers = async () => {
  console.log('=== REGISTRANDO USUARIOS DE PRUEBA ===');
  
  for (const [type, userData] of Object.entries(testUsers)) {
    try {
      console.log(`Registrando ${type}...`);
      const result = await registerUser(userData);
      
      if (result.success) {
        console.log(`✅ ${type} registrado exitosamente:`, result.user);
      } else {
        console.log(`❌ Error registrando ${type}:`, result.error);
      }
    } catch (error) {
      console.log(`❌ Error inesperado registrando ${type}:`, error.message);
    }
  }
};

// Función para probar login de usuarios
export const testUserLogins = async () => {
  console.log('=== PROBANDO LOGIN DE USUARIOS ===');
  
  for (const [type, userData] of Object.entries(testUsers)) {
    try {
      console.log(`Probando login de ${type}...`);
      const result = await loginUser(userData.email, userData.password);
      
      if (result.success) {
        console.log(`✅ ${type} login exitoso:`);
        console.log(`   - Nombre: ${result.user.name}`);
        console.log(`   - Email: ${result.user.email}`);
        console.log(`   - Tipo: ${result.user.userType}`);
        console.log(`   - UID: ${result.user.uid}`);
      } else {
        console.log(`❌ Error en login de ${type}:`, result.error);
      }
    } catch (error) {
      console.log(`❌ Error inesperado en login de ${type}:`, error.message);
    }
  }
};

// Función para ejecutar todas las pruebas
export const runAllTests = async () => {
  console.log('🚀 INICIANDO PRUEBAS DE AUTENTICACIÓN');
  
  // Primero registrar usuarios
  await registerTestUsers();
  
  // Esperar un poco
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Luego probar login
  await testUserLogins();
  
  console.log('✨ PRUEBAS COMPLETADAS');
};

// Exportar usuarios de prueba para uso en otros archivos
export { testUsers };