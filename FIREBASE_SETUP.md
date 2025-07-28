# Configuración de Firebase para RAPIFLOW

## Problemas Identificados

Basándose en los errores mostrados en la consola del navegador, hay dos problemas principales:

### 1. Error: `auth/email-already-in-use`
Este error ocurre cuando intentas registrar un usuario con un email que ya existe.

**Solución:**
- Usa emails únicos para cada prueba
- Utiliza las funciones de testing incluidas en el proyecto

### 2. Error: `FirebaseError: Missing or insufficient permissions`
Este error indica que las reglas de Firestore no permiten escritura desde la aplicación web.

**Solución:** Configurar las reglas de Firestore

## Pasos para Solucionar

### Paso 1: Configurar Reglas de Firestore

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `rapiflow-b31de`
3. En el menú lateral, haz clic en "Firestore Database"
4. Haz clic en la pestaña "Rules"
5. Reemplaza las reglas existentes con el contenido del archivo `firestore-rules.txt`
6. Haz clic en "Publish" para aplicar los cambios

### Paso 2: Usar Funciones de Testing

En la consola del navegador, ahora tienes disponibles estas funciones:

```javascript
// Generar email único para pruebas
const email = generateTestEmail();
console.log(email); // test1703123456789@rapiflow.test

// Generar datos completos de usuario de prueba
const userData = generateTestUserData('client');
console.log(userData);

// Limpiar usuario de prueba (si ya existe)
await cleanupTestUser('test@example.com', 'password123');

// Verificar conexión con Firebase
await checkFirebaseConnection();
```

### Paso 3: Probar el Registro

1. Abre la consola del navegador (F12)
2. Ve a la pantalla de registro
3. Usa datos únicos o genera datos de prueba:
   ```javascript
   const testData = generateTestUserData('client');
   console.log('Usa estos datos:', testData);
   ```
4. Completa el formulario y registra el usuario
5. Observa los logs detallados en la consola

## Logs Disponibles

El sistema ahora incluye logs detallados que te mostrarán:

- ✅ Inicio del proceso de registro
- ✅ Validación del formulario
- ✅ Creación del usuario en Firebase Auth
- ✅ Actualización del perfil
- ✅ Guardado en Firestore
- ❌ Cualquier error que ocurra en el proceso

## Solución de Problemas Comunes

### Si el email ya existe:
```javascript
// Limpiar el usuario existente
await cleanupTestUser('email@example.com', 'password');
// Luego intentar registrar nuevamente
```

### Si persisten errores de permisos:
1. Verifica que las reglas de Firestore estén aplicadas
2. Asegúrate de que el usuario esté autenticado
3. Revisa la consola de Firebase para errores adicionales

### Si Firebase no se conecta:
```javascript
// Verificar estado de Firebase
await checkFirebaseConnection();
```

## Configuración de Producción

⚠️ **IMPORTANTE:** Las reglas actuales son permisivas para desarrollo. En producción:

1. Restringe las reglas de Firestore
2. Implementa validación del lado del servidor
3. Usa Firebase Security Rules más específicas
4. Elimina las funciones de testing

## Contacto

Si continúas teniendo problemas:
1. Revisa los logs en la consola del navegador
2. Verifica la configuración en Firebase Console
3. Asegúrate de que las reglas de Firestore estén aplicadas correctamente