// Script para crear usuarios de prueba
// Este script debe ejecutarse desde la consola del navegador

// Función para crear usuarios de prueba
const createTestUsers = async () => {
  // Importar authService desde la ventana global (si está disponible)
  const { registerUser, USER_TYPES } = window.authService || {};
  
  if (!registerUser) {
    console.error('authService no está disponible. Asegúrate de que la aplicación esté cargada.');
    return;
  }

  const testUsers = [
    {
      email: 'cliente@test.com',
      password: 'test123',
      name: 'Cliente de Prueba',
      phone: '+53 12345678',
      address: 'Calle Principal #123, Mayarí Arriba',
      userType: USER_TYPES.CLIENT
    },
    {
      email: 'negocio@test.com',
      password: 'test123',
      name: 'Propietario Negocio',
      phone: '+53 87654321',
      address: 'Avenida Central #456, Mayarí Arriba',
      userType: USER_TYPES.BUSINESS,
      businessName: 'Restaurante El Cubano',
      businessType: 'Restaurante'
    },
    {
      email: 'repartidor@test.com',
      password: 'test123',
      name: 'Repartidor de Prueba',
      phone: '+53 11223344',
      address: 'Calle Secundaria #789, Mayarí Arriba',
      userType: USER_TYPES.DRIVER,
      vehicleType: 'Motocicleta',
      licenseNumber: 'ABC123'
    }
  ];

  console.log('🚀 Iniciando creación de usuarios de prueba...');
  
  for (const userData of testUsers) {
    try {
      console.log(`📝 Creando usuario: ${userData.name} (${userData.userType})...`);
      const result = await registerUser(userData);
      
      if (result.success) {
        console.log(`✅ Usuario creado exitosamente: ${userData.email}`);
      } else {
        console.log(`❌ Error creando usuario ${userData.email}:`, result.error);
      }
    } catch (error) {
      console.error(`💥 Error inesperado creando ${userData.email}:`, error);
    }
  }
  
  console.log('🏁 Proceso de creación de usuarios completado.');
};

// Instrucciones para usar este script
console.log(`
🔧 INSTRUCCIONES PARA CREAR USUARIOS DE PRUEBA:

1. Abre la aplicación RapiFlow en el navegador
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña 'Console'
4. Copia y pega este código completo
5. Ejecuta: createTestUsers()

Esto creará 3 usuarios de prueba:
- cliente@test.com (Cliente)
- negocio@test.com (Negocio)
- repartidor@test.com (Repartidor)

Todos con contraseña: test123
`);

// Exportar para uso en consola
if (typeof window !== 'undefined') {
  window.createTestUsers = createTestUsers;
}