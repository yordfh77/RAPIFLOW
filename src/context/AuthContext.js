import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange } from '../services/authService';

// Crear el contexto de autenticación
const AuthContext = createContext({});

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChange((userData) => {
      setUser(userData);
      if (initializing) {
        setInitializing(false);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [initializing]);

  // Función para actualizar los datos del usuario en el contexto
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Función para limpiar el usuario (logout)
  const clearUser = () => {
    setUser(null);
  };

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return user !== null;
  };

  // Función para obtener el tipo de usuario
  const getUserType = () => {
    return user?.userType || null;
  };

  // Función para verificar si el usuario es de un tipo específico
  const isUserType = (type) => {
    return user?.userType === type;
  };

  // Función para obtener el nombre del usuario
  const getUserName = () => {
    return user?.name || 'Usuario';
  };

  // Función para obtener el email del usuario
  const getUserEmail = () => {
    return user?.email || '';
  };

  // Función para obtener el ID del usuario
  const getUserId = () => {
    return user?.uid || null;
  };

  const value = {
    user,
    loading,
    initializing,
    updateUser,
    clearUser,
    isAuthenticated,
    getUserType,
    isUserType,
    getUserName,
    getUserEmail,
    getUserId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;