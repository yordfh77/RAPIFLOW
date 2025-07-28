// Configuración de Google OAuth para Firebase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase

// Para obtener el Web Client ID:
// 1. Ve a Firebase Console > Project Settings > General
// 2. En la sección "Your apps", busca tu app web
// 3. Copia el "Web client ID" de la configuración de Firebase
// 
// Alternativamente:
// 1. Ve a Google Cloud Console > APIs & Services > Credentials
// 2. Busca el "Web client" creado automáticamente por Firebase
// 3. Copia el Client ID

export const GOOGLE_CONFIG = {
  // Web Client ID obtenido de Firebase Console
  WEB_CLIENT_ID: '339489341161-b385b41394b67d153bfa78.apps.googleusercontent.com',
  
  // Scopes que necesitamos para la autenticación
  SCOPES: ['openid', 'profile', 'email'],
  
  // Endpoints de Google OAuth
  AUTH_ENDPOINT: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_ENDPOINT: 'https://oauth2.googleapis.com/token'
};

// Función helper para validar la configuración
export const validateGoogleConfig = () => {
  if (GOOGLE_CONFIG.WEB_CLIENT_ID === 'TU_WEB_CLIENT_ID_AQUI.apps.googleusercontent.com') {
    console.warn('⚠️ ADVERTENCIA: Debes configurar el Web Client ID real en googleConfig.js');
    return false;
  }
  return true;
};