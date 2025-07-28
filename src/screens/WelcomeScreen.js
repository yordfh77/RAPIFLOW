import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const WelcomeScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#FF6B35', '#FF8C42']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="bicycle" size={80} color="#FFFFFF" />
          <Text style={styles.logoText}>RAPIFLOW</Text>
          <Text style={styles.slogan}>Rapidez con estilo cubano</Text>
        </View>

        {/* Información del pueblo */}
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="#FFFFFF" />
          <Text style={styles.locationText}>Mayarí Arriba, Segundo Frente</Text>
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        {/* Servicios disponibles */}
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesTitle}>Servicios disponibles:</Text>
          <View style={styles.servicesRow}>
            <View style={styles.serviceItem}>
              <Ionicons name="car" size={24} color="#FFFFFF" />
              <Text style={styles.serviceText}>Transporte</Text>
            </View>
            <View style={styles.serviceItem}>
              <Ionicons name="restaurant" size={24} color="#FFFFFF" />
              <Text style={styles.serviceText}>Comida</Text>
            </View>
            <View style={styles.serviceItem}>
              <Ionicons name="cube" size={24} color="#FFFFFF" />
              <Text style={styles.serviceText}>Paquetes</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    letterSpacing: 2,
  },
  slogan: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5,
    fontStyle: 'italic',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  locationText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 5,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
  servicesContainer: {
    alignItems: 'center',
  },
  servicesTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 15,
    fontWeight: '600',
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  serviceItem: {
    alignItems: 'center',
    flex: 1,
  },
  serviceText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 5,
  },
});

export default WelcomeScreen;