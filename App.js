import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { USER_TYPES } from './src/services/authService';
import TestScreen from './TestScreen';

// Importar pantallas
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import UserTypeSelectionScreen from './src/screens/UserTypeSelectionScreen';
import ClientMainScreen from './src/screens/ClientMainScreen';
import BusinessMainScreen from './src/screens/BusinessMainScreen';
import DriverMainScreen from './src/screens/DriverMainScreen';
import FoodOrderScreen from './src/screens/FoodOrderScreen';
import TransportScreen from './src/screens/TransportScreen';
import PackageScreen from './src/screens/PackageScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BusinessProfileScreen from './src/screens/BusinessProfileScreen';
import DriverProfileScreen from './src/screens/DriverProfileScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import BusinessProductsScreen from './src/screens/BusinessProductsScreen';
import DriverOrdersScreen from './src/screens/DriverOrdersScreen';
import BusinessProductsView from './src/screens/BusinessProductsView';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import DriverDeliveryScreen from './src/screens/DriverDeliveryScreen';

// Tema personalizado
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

// Componente de navegación principal
function AppNavigator() {
  const { user, loading, initializing, getUserType } = useAuth();

  // Mostrar loading mientras se inicializa la autenticación
  if (initializing || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF6B35' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  // Determinar la pantalla inicial basada en el estado de autenticación
  const getInitialRouteName = () => {
    // Siempre iniciar en Welcome para permitir al usuario elegir
    return 'Welcome';
  };

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#FF6B35" />
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B35',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ headerShown: false }}
          />

          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Iniciar Sesión' }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Registrarse' }}
          />
          <Stack.Screen 
            name="UserTypeSelection" 
            component={UserTypeSelectionScreen} 
            options={{ title: 'Seleccionar Tipo de Usuario' }}
          />
          <Stack.Screen 
            name="ClientMain" 
            component={ClientMainScreen} 
            options={{ title: 'RAPIFLOW', headerLeft: null }}
          />
          <Stack.Screen 
            name="BusinessMain" 
            component={BusinessMainScreen} 
            options={{ title: 'Panel de Negocio', headerLeft: null }}
          />
          <Stack.Screen 
            name="DriverMain" 
            component={DriverMainScreen} 
            options={{ title: 'Panel de Repartidor', headerLeft: null }}
          />
          <Stack.Screen 
            name="FoodOrder" 
            component={FoodOrderScreen} 
            options={{ title: 'Pedir Comida' }}
          />
          <Stack.Screen 
            name="Transport" 
            component={TransportScreen} 
            options={{ title: 'Solicitar Transporte' }}
          />
          <Stack.Screen 
            name="Package" 
            component={PackageScreen} 
            options={{ title: 'Enviar Paquete' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'Mi Perfil' }}
          />
          <Stack.Screen 
            name="BusinessProfile" 
            component={BusinessProfileScreen} 
            options={{ title: 'Perfil de Negocio' }}
          />
          <Stack.Screen 
            name="DriverProfile" 
            component={DriverProfileScreen} 
            options={{ title: 'Perfil de Repartidor' }}
          />
          <Stack.Screen 
            name="OrderTracking" 
            component={OrderTrackingScreen} 
            options={{ title: 'Seguir Pedido' }}
          />
          <Stack.Screen 
            name="BusinessProducts" 
            component={BusinessProductsScreen} 
            options={{ title: 'Mis Productos' }}
          />
          <Stack.Screen 
            name="DriverOrders" 
            component={DriverOrdersScreen} 
            options={{ title: 'Pedidos Disponibles' }}
          />
          <Stack.Screen 
            name="BusinessProductsView" 
            component={BusinessProductsView} 
            options={{ title: 'Productos del Negocio' }}
          />
          <Stack.Screen 
            name="OrderConfirmation" 
            component={OrderConfirmationScreen} 
            options={{ title: 'Confirmar Pedido' }}
          />
          <Stack.Screen 
            name="DriverDelivery" 
            component={DriverDeliveryScreen} 
            options={{ title: 'Entrega en Curso' }}
          />
        </Stack.Navigator>
    </NavigationContainer>
  );
}

// Componente principal de la aplicación
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}