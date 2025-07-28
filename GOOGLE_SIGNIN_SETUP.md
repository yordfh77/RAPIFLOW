# Configuración de Google Sign-In para RapiFlow

## Pasos para configurar Google Sign-In

### 1. Obtener el Web Client ID desde Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto RapiFlow
3. Ve a **Project Settings** (⚙️ > Project Settings)
4. En la pestaña **General**, busca la sección "Your apps"
5. Si ya tienes una app web configurada:
   - Busca tu app web en la lista
   - Copia el **Web client ID**
6. Si no tienes una app web:
   - Haz clic en "Add app" > "Web"
   - Dale un nombre a tu app (ej: "RapiFlow Web")
   - Registra la app
   - Copia el **Web client ID** generado

### 2. Configurar Google Cloud Console (si es necesario)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto Firebase
3. Ve a **APIs & Services** > **Credentials**
4. Busca el "Web client" que fue creado automáticamente por Firebase
5. Copia el **Client ID**

### 3. Actualizar la configuración en la app

1. Abre el archivo `src/config/googleConfig.js`
2. Reemplaza `'TU_WEB_CLIENT_ID_AQUI.apps.googleusercontent.com'` con tu Web Client ID real
3. Ejemplo:
   ```javascript
   export const GOOGLE_CONFIG = {
     WEB_CLIENT_ID: '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
     // ... resto de la configuración
   };
   ```

### 4. Verificar que Google Sign-In esté habilitado en Firebase

1. En Firebase Console, ve a **Authentication** > **Sign-in method**
2. Busca "Google" en la lista de proveedores
3. Asegúrate de que esté **habilitado**
4. Si no está habilitado:
   - Haz clic en "Google"
   - Activa el toggle "Enable"
   - Selecciona un email de soporte del proyecto
   - Guarda los cambios

### 5. Configuración adicional para producción

Para usar en producción, también necesitarás:

#### Para Android:
1. Obtener el SHA-1 fingerprint de tu app
2. Agregarlo en Firebase Console > Project Settings > Your apps > Android app
3. Descargar el nuevo `google-services.json`

#### Para iOS:
1. Configurar el Bundle ID en Firebase Console
2. Descargar el nuevo `GoogleService-Info.plist`

### 6. Probar la funcionalidad

1. Ejecuta la app: `npm start`
2. Ve a la pantalla de login
3. Haz clic en "Continuar con Google"
4. Debería abrir el navegador para autenticación
5. Después de autenticarte, debería regresar a la app

## Solución de problemas comunes

### Error: "Invalid client ID"
- Verifica que el Web Client ID esté correctamente copiado
- Asegúrate de que no haya espacios extra al inicio o final
- Confirma que el proyecto en Google Cloud Console sea el mismo que Firebase

### Error: "Redirect URI mismatch"
- Este error es normal en desarrollo con Expo
- Expo maneja automáticamente los redirect URIs
- En producción, necesitarás configurar los URIs específicos

### La autenticación no regresa a la app
- Verifica que `expo-web-browser` esté instalado
- Asegúrate de que `WebBrowser.maybeCompleteAuthSession()` esté llamado

### Advertencia en consola sobre configuración
- Si ves "⚠️ ADVERTENCIA: Debes configurar el Web Client ID real"
- Significa que aún tienes el valor placeholder en `googleConfig.js`
- Reemplázalo con tu Client ID real

## Archivos modificados

- `src/services/authService.js` - Lógica de autenticación con Google
- `src/screens/LoginScreen.js` - Botón de Google Sign-In
- `src/screens/UserTypeSelectionScreen.js` - Selección de tipo de usuario para nuevos usuarios
- `src/config/googleConfig.js` - Configuración de Google OAuth
- `App.js` - Navegación actualizada

¡Una vez completada la configuración, los usuarios podrán registrarse e iniciar sesión con sus cuentas de Google!