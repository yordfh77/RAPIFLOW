import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';
import { USER_TYPES, completeGoogleUserRegistration } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const UserTypeSelectionScreen = ({ navigation, route }) => {
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const { googleUserData } = route.params;

  const userTypes = [
    {
      type: USER_TYPES.CLIENT,
      title: 'Cliente',
      description: 'Ordena comida y productos de tus negocios favoritos',
      icon: 'person',
      color: '#4CAF50'
    },
    {
      type: USER_TYPES.BUSINESS,
      title: 'Negocio',
      description: 'Vende tus productos y gestiona tu negocio',
      icon: 'storefront',
      color: '#FF6B35'
    },
    {
      type: USER_TYPES.DRIVER,
      title: 'Repartidor',
      description: 'Entrega pedidos y gana dinero',
      icon: 'bicycle',
      color: '#2196F3'
    }
  ];

  const handleContinue = async () => {
    if (!selectedUserType) {
      Alert.alert('Error', 'Por favor selecciona un tipo de usuario');
      return;
    }

    setLoading(true);

    try {
      const result = await completeGoogleUserRegistration(googleUserData, selectedUserType);
      
      if (result.success) {
        // Actualizar el usuario en el contexto
        updateUser(result.user);
        
        // Navegar a la pantalla correspondiente según el tipo de usuario
        let targetScreen = 'ClientMain'; // Por defecto
        
        if (selectedUserType === USER_TYPES.BUSINESS) {
          targetScreen = 'BusinessMain';
        } else if (selectedUserType === USER_TYPES.DRIVER) {
          targetScreen = 'DriverMain';
        }
        
        // Navegar y mostrar mensaje de bienvenida
        navigation.reset({
          index: 0,
          routes: [{ name: targetScreen }],
        });
        
        Alert.alert('¡Bienvenido!', `Tu cuenta ha sido creada exitosamente como ${userTypes.find(ut => ut.type === selectedUserType)?.title}`);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      Alert.alert('Error', 'Ha ocurrido un error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="person-add" size={60} color="#FF6B35" />
          <Text style={styles.title}>¡Bienvenido a RAPIFLOW!</Text>
          <Text style={styles.subtitle}>
            Hola {googleUserData.name}, selecciona cómo quieres usar la aplicación:
          </Text>
        </View>

        {/* Opciones de tipo de usuario */}
        <View style={styles.optionsContainer}>
          {userTypes.map((userType) => (
            <TouchableOpacity
              key={userType.type}
              style={[
                styles.userTypeCard,
                selectedUserType === userType.type && styles.selectedCard
              ]}
              onPress={() => setSelectedUserType(userType.type)}
            >
              <Card style={[
                styles.card,
                selectedUserType === userType.type && { borderColor: userType.color, borderWidth: 2 }
              ]}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Ionicons 
                      name={userType.icon} 
                      size={40} 
                      color={selectedUserType === userType.type ? userType.color : '#666'} 
                    />
                    <Text style={[
                      styles.cardTitle,
                      selectedUserType === userType.type && { color: userType.color }
                    ]}>
                      {userType.title}
                    </Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    {userType.description}
                  </Text>
                  {selectedUserType === userType.type && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={24} color={userType.color} />
                    </View>
                  )}
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón continuar */}
        <Button
          mode="contained"
          onPress={handleContinue}
          style={[
            styles.continueButton,
            !selectedUserType && styles.disabledButton
          ]}
          contentStyle={styles.buttonContent}
          loading={loading}
          disabled={loading || !selectedUserType}
        >
          {loading ? 'Creando cuenta...' : 'Continuar'}
        </Button>

        {/* Botón volver */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  userTypeCard: {
    marginBottom: 15,
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
  },
  card: {
    backgroundColor: '#fff',
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    padding: 20,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 15,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  continueButton: {
    marginBottom: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'underline',
  },
});

export default UserTypeSelectionScreen;