// Versión web del authService con Google OAuth nativo
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
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
  CLIENT: 'cliente',
  BUSINESS: 'negocio',
  DRIVER: 'repartidor'
};

// Función para registrar un nuevo usuario
export const registerUser = async (userData) => {
  try {
    console.log('=== AUTHSERVICE.WEB: Iniciando registro ===');
    console.log('Datos recibidos:', userData);
    
    const { email, password, name, phone, address, userType, businessName, businessType, vehicleType, licenseNumber } = userData;
    
    console.log('Creando usuario en Firebase Auth...');
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Usuario creado en Auth:', user.uid);
    
    console.log('Actualizando perfil del usuario...');
    // Actualizar el perfil con el nombre
    await updateProfile(user, {
      displayName: name
    });
    
    console.log('Preparando datos para Firestore...');
    // Crear documento del usuario en Firestore
    const userDocData = {
      uid: user.uid,
      name,
      email,
      phone,
      address,
      userType,
      createdAt: new Date().toISOString(),
      isActive: true,
      profileComplete: true
    };
    
    // Agregar campos específicos según el tipo de usuario
    if (userType === USER_TYPES.BUSINESS) {
      userDocData.businessName = businessName;
      userDocData.businessType = businessType;
      userDocData.businessInfo = {
        isOpen: false,
        rating: 0,
        totalOrders: 0,
        totalRevenue: 0,
        categories: [],
        description: '',
        deliveryFee: 0,
        minOrderValue: 0
      };
    } else if (userType === USER_TYPES.DRIVER) {
      userDocData.vehicleType = vehicleType;
      userDocData.licenseNumber = licenseNumber;
      userDocData.driverInfo = {
        isOnline: false,
        rating: 0,
        totalDeliveries: 0,
        totalEarnings: 0,
        isVerified: false
      };
    } else if (userType === USER_TYPES.CLIENT) {
      userDocData.clientInfo = {
        totalOrders: 0,
        totalSpent: 0,
        favoriteRestaurants: [],
        addresses: [address],
        paymentMethods: []
      };
    }
    
    console.log('Guardando documento en Firestore...');
    console.log('Datos del documento:', userDocData);
    await setDoc(doc(db, 'users', user.uid), userDocData);
    console.log('Documento guardado exitosamente en Firestore');
    
    const successResult = {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name,
        userType
      }
    };
    console.log('=== AUTHSERVICE.WEB: Registro completado exitosamente ===');
    console.log('Resultado:', successResult);
    return successResult;
  } catch (error) {
    console.error('=== AUTHSERVICE.WEB: Error en el registro ===');
    console.error('Error completo:', error);
    console.error('Código de error:', error.code);
    console.error('Mensaje de error:', error.message);
    const errorResult = {
      success: false,
      error: getErrorMessage(error.code)
    };
    console.log('Resultado de error:', errorResult);
    return errorResult;
  }
};

// Función para registrar un nuevo usuario (versión legacy para compatibilidad)
export const registerUserLegacy = async (email, password, name, userType, additionalData = {}) => {
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
      error: getErrorMessage(error.code)
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
        console.error('Error getting user data:', error);
        callback(null);
      }
    } else {
      // Usuario no autenticado
      callback(null);
    }
  });
};

// Función para obtener mensajes de error en español
export const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'No se encontró una cuenta con este correo electrónico',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Ya existe una cuenta con este correo electrónico',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/invalid-credential': 'Credenciales inválidas'
  };
  
  return errorMessages[errorCode] || 'Ha ocurrido un error inesperado';
};

// Función para validar email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para validar contraseña
export const validatePassword = (password) => {
  return password.length >= 6;
};

// Función para validar teléfono cubano
export const validateCubanPhone = (phone) => {
  const cubanPhoneRegex = /^(\+53)?[5-8]\d{7}$/;
  return cubanPhoneRegex.test(phone.replace(/\s/g, ''));
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
      error: getErrorMessage(error.code)
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
      error: getErrorMessage(error.code)
    };
  }
};