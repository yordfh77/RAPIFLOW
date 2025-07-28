// Versión web del authService con Google OAuth nativo
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { GOOGLE_CONFIG } from '../config/googleConfig';

// Tipos de usuario disponibles
export const USER_TYPES = {
  CLIENT: 'client',
  BUSINESS: 'business',
  DRIVER: 'driver'
};

// Función para registrar un nuevo usuario
export const registerUser = async (email, password, name, userType, additionalData = {}) => {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar el perfil con el nombre
    await updateProfile(user, {
      displayName: name
    });

    // Preparar datos del usuario según el tipo
    let userData = {
      uid: user.uid,
      email: user.email,
      name: name,
      userType: userType,
      createdAt: new Date().toISOString(),
      ...additionalData
    };

    // Agregar campos específicos según el tipo de usuario
    switch (userType) {
      case USER_TYPES.CLIENT:
        userData = {
          ...userData,
          address: additionalData.address || '',
          phone: additionalData.phone || ''
        };
        break;
      case USER_TYPES.BUSINESS:
        userData = {
          ...userData,
          businessName: additionalData.businessName || '',
          businessType: additionalData.businessType || '',
          address: additionalData.address || '',
          phone: additionalData.phone || '',
          description: additionalData.description || ''
        };
        break;
      case USER_TYPES.DRIVER:
        userData = {
          ...userData,
          vehicleType: additionalData.vehicleType || '',
          licensePlate: additionalData.licensePlate || '',
          phone: additionalData.phone || '',
          isAvailable: true
        };
        break;
    }

    // Guardar datos del usuario en Firestore
    await setDoc(doc(db, 'users', user.uid), userData);

    return {
      success: true,
      user: userData
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Función para iniciar sesión con email y contraseña
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Obtener datos adicionales del usuario desde Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: userData.name,
          userType: userData.userType,
          ...userData
        }
      };
    } else {
      return {
        success: false,
        error: 'No se encontraron datos del usuario'
      };
    }
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Función para iniciar sesión con Google (versión web)
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Verificar si el usuario ya existe en Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      // Usuario existente
      const userData = userDoc.data();
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: userData.name,
          userType: userData.userType,
          ...userData
        }
      };
    } else {
      // Nuevo usuario - necesita completar registro
      return {
        success: true,
        isNewUser: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL
        }
      };
    }
  } catch (error) {
    console.error('Error with Google Sign-In:', error);
    return {
      success: false,
      error: 'Error al iniciar sesión con Google'
    };
  }
};

// Función para completar el registro de usuarios de Google
export const completeGoogleUserRegistration = async (user, userType, additionalData = {}) => {
  try {
    // Preparar datos del usuario según el tipo
    let userData = {
      uid: user.uid,
      email: user.email,
      name: user.name,
      userType: userType,
      photoURL: user.photoURL || '',
      createdAt: new Date().toISOString(),
      ...additionalData
    };

    // Agregar campos específicos según el tipo de usuario
    switch (userType) {
      case USER_TYPES.CLIENT:
        userData = {
          ...userData,
          address: '',
          phone: ''
        };
        break;
      case USER_TYPES.BUSINESS:
        userData = {
          ...userData,
          businessName: '',
          businessType: '',
          address: '',
          phone: '',
          description: ''
        };
        break;
      case USER_TYPES.DRIVER:
        userData = {
          ...userData,
          vehicleType: '',
          licensePlate: '',
          phone: '',
          isAvailable: true
        };
        break;
    }

    // Guardar datos del usuario en Firestore
    await setDoc(doc(db, 'users', user.uid), userData);

    return {
      success: true,
      user: userData
    };
  } catch (error) {
    console.error('Error completing Google user registration:', error);
    return {
      success: false,
      error: 'Error al completar el registro'
    };
  }
};

// Función para cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    return {
      success: false,
      error: 'Error al cerrar sesión'
    };
  }
};

// Función para obtener el usuario actual
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Función para escuchar cambios en el estado de autenticación
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Usuario autenticado, obtener datos adicionales
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          callback({
            uid: user.uid,
            email: user.email,
            name: userData.name,
            userType: userData.userType,
            ...userData
          });
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        callback(null);
      }
    } else {
      // Usuario no autenticado
      callback(null);
    }
  });
};

// Función para actualizar el perfil del usuario
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    // Si se actualiza el nombre, también actualizar en Auth
    if (updates.name && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updates.name
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: 'Error al actualizar el perfil'
    };
  }
};

// Función para obtener datos de un usuario por ID
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return {
        success: true,
        user: userDoc.data()
      };
    } else {
      return {
        success: false,
        error: 'Usuario no encontrado'
      };
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      success: false,
      error: 'Error al obtener datos del usuario'
    };
  }
};

// Función para obtener mensajes de error en español
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'El email ya está en uso',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Usuario deshabilitado',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión',
    'auth/popup-closed-by-user': 'Ventana de autenticación cerrada',
    'auth/popup-blocked': 'Ventana emergente bloqueada por el navegador'
  };
  
  return errorMessages[errorCode] || 'Error desconocido';
};

// Funciones de validación
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateCubanPhone = (phone) => {
  const cubanPhoneRegex = /^(\+53)?[5-8]\d{7}$/;
  return cubanPhoneRegex.test(phone.replace(/\s/g, ''));
};