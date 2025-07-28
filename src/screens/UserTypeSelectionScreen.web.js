import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { completeGoogleUserRegistration, USER_TYPES } from '../services/authService.web';
import { theme } from '../theme/theme';

const UserTypeSelectionScreen = ({ navigation, route }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const { googleUser } = route.params;

  const userTypes = [
    {
      type: USER_TYPES.CLIENT,
      title: 'Cliente',
      description: 'Solicita servicios de delivery y transporte',
      icon: 'person-outline',
      color: '#4CAF50'
    },
    {
      type: USER_TYPES.BUSINESS,
      title: 'Negocio',
      description: 'Ofrece productos y servicios de delivery',
      icon: 'storefront-outline',
      color: '#2196F3'
    },
    {
      type: USER_TYPES.DRIVER,
      title: 'Conductor',
      description: 'Realiza entregas y servicios de transporte',
      icon: 'car-outline',
      color: '#FF9800'
    }
  ];

  const handleContinue = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Por favor selecciona un tipo de usuario');
      return;
    }

    setLoading(true);
    try {
      const result = await completeGoogleUserRegistration(googleUser, selectedType);
      
      if (result.success) {
        updateUser(result.user);
        
        // Navegar según el tipo de usuario seleccionado
        switch (selectedType) {
          case USER_TYPES.CLIENT:
            navigation.replace('ClientMain');
            break;
          case USER_TYPES.BUSINESS:
            navigation.replace('BusinessMain');
            break;
          case USER_TYPES.DRIVER:
            navigation.replace('DriverMain');
            break;
        }
        
        Alert.alert('Éxito', `¡Bienvenido a RapiFlow, ${result.user.name}!`);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado al completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>¡Bienvenido a RapiFlow!</Text>
        <Text style={styles.subtitle}>
          Hola {googleUser.name}, selecciona cómo quieres usar la aplicación:
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {userTypes.map((userType) => (
          <TouchableOpacity
            key={userType.type}
            style={[
              styles.optionCard,
              selectedType === userType.type && styles.selectedCard
            ]}
            onPress={() => setSelectedType(userType.type)}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: userType.color }]}>
                <Ionicons name={userType.icon} size={30} color="white" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{userType.title}</Text>
                <Text style={styles.optionDescription}>{userType.description}</Text>
              </View>
              {selectedType === userType.type && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!selectedType || loading) && styles.disabledButton
        ]}
        onPress={handleContinue}
        disabled={!selectedType || loading}
      >
        <Text style={styles.continueButtonText}>
          {loading ? 'Configurando cuenta...' : 'Continuar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.large,
    paddingTop: theme.spacing.extraLarge,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.extraLarge,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: theme.spacing.extraLarge,
  },
  optionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    marginBottom: theme.spacing.medium,
    borderWidth: 2,
    borderColor: theme.colors.lightGray,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#f8f9ff',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.medium,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.gray,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.medium,
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
  },
  backButtonText: {
    color: theme.colors.gray,
    fontSize: 16,
  },
});

export default UserTypeSelectionScreen;