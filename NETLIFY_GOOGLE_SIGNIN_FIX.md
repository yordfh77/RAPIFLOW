# Solución: Google Sign-In no funciona en Netlify

## Problema
El registro con Google funciona en `http://localhost:19006/` pero no en el enlace de Netlify, y los registros no aparecen en Firebase.

## Causa
Google OAuth requiere que los dominios estén autorizados en Google Cloud Console. Netlify usa un dominio diferente que no está en la lista de dominios autorizados.

## Solución

### Paso 1: Obtener la URL de Netlify
1. Ve a tu dashboard de Netlify
2. Copia la URL completa de tu aplicación (ej: `https://tu-app-name.netlify.app`)

### Paso 2: Configurar dominios autorizados en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto Firebase (`rapiflow-b31de`)
3. Ve a **APIs & Services** > **Credentials**
4. Busca tu "Web client" (el que tiene tu Client ID)
5. Haz clic en el nombre del cliente para editarlo
6. En la sección **Authorized JavaScript origins**, agrega:
   - `https://tu-app-name.netlify.app` (reemplaza con tu URL real)
   - `https://*.netlify.app` (para subdominios)
7. En la sección **Authorized redirect URIs**, agrega:
   - `https://tu-app-name.netlify.app/__/auth/handler`
   - `https://tu-app-name.netlify.app`
8. Haz clic en **Save**

### Paso 3: Configurar dominios autorizados en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `rapiflow-b31de`
3. Ve a **Authentication** > **Settings** > **Authorized domains**
4. Haz clic en **Add domain**
5. Agrega tu dominio de Netlify: `tu-app-name.netlify.app`
6. Guarda los cambios

### Paso 4: Verificar configuración de CORS

Asegúrate de que tu aplicación tenga las configuraciones correctas para CORS:

```javascript
// En tu archivo de configuración de Firebase
const firebaseConfig = {
  // ... tu configuración actual
  authDomain: "rapiflow-b31de.firebaseapp.com", // Debe coincidir con tu proyecto
};
```

### Paso 5: Redesplegar en Netlify

1. Haz commit de cualquier cambio pendiente
2. Push al repositorio
3. Netlify redesplegará automáticamente
4. Espera 5-10 minutos para que los cambios de Google se propaguen

## Verificación

### Probar Google Sign-In en Netlify:
1. Ve a tu URL de Netlify
2. Intenta registrarte con Google
3. Debería funcionar sin errores

### Verificar que los datos lleguen a Firebase:
1. Ve a Firebase Console > Authentication
2. Deberías ver los nuevos usuarios registrados
3. Ve a Firestore Database
4. Deberías ver los documentos de usuario creados

## Solución de problemas adicionales

### Si aún no funciona:

1. **Verifica la consola del navegador** en Netlify:
   - Abre DevTools (F12)
   - Busca errores relacionados con CORS o dominios

2. **Verifica las reglas de Firestore**:
   - Asegúrate de que las reglas permitan escritura
   - Usa las reglas del archivo `firestore-rules.txt`

3. **Limpia caché**:
   - Limpia caché del navegador
   - Prueba en modo incógnito

4. **Verifica variables de entorno**:
   - Asegúrate de que Netlify tenga las mismas variables de entorno que localhost

### Comandos útiles para debugging:

```javascript
// En la consola del navegador de Netlify
console.log('Firebase config:', firebase.app().options);
console.log('Auth domain:', firebase.auth().app.options.authDomain);

// Verificar conexión
await checkFirebaseConnection();
```

## Notas importantes

- Los cambios en Google Cloud Console pueden tardar hasta 10 minutos en propagarse
- Asegúrate de usar HTTPS en producción (Netlify lo hace automáticamente)
- Mantén localhost en la lista para desarrollo local
- En producción, considera remover localhost por seguridad

## URLs de ejemplo a autorizar

```
# JavaScript origins
https://tu-app-rapiflow.netlify.app
https://localhost:19006
http://localhost:19006

# Redirect URIs
https://tu-app-rapiflow.netlify.app/__/auth/handler
https://tu-app-rapiflow.netlify.app
```

Una vez completados estos pasos, Google Sign-In debería funcionar correctamente tanto en localhost como en Netlify, y los registros aparecerán en Firebase.