import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  Dimensions
} from 'react-native';
import { Card, Button, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const DriverDeliveryScreen = ({ route, navigation }) => {
  const { orderData } = route.params;
  const [currentStep, setCurrentStep] = useState('pickup'); // pickup, delivering, delivered
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [pickupLocation, setPickupLocation] = useState({
    latitude: 37.78925,
    longitude: -122.4334,
  });
  const [deliveryLocation, setDeliveryLocation] = useState({
    latitude: 37.78725,
    longitude: -122.4314,
  });

  useEffect(() => {
    // Simular actualización de ubicación
    const locationInterval = setInterval(() => {
      setCurrentLocation(prev => ({
        latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
      }));
    }, 5000);

    return () => clearInterval(locationInterval);
  }, []);

  const handleCallCustomer = () => {
    const phoneNumber = orderData.customerPhone;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleCallBusiness = () => {
    const phoneNumber = orderData.restaurantPhone || orderData.businessPhone;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleNavigateToPickup = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pickupLocation.latitude},${pickupLocation.longitude}`;
    Linking.openURL(url);
  };

  const handleNavigateToDelivery = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${deliveryLocation.latitude},${deliveryLocation.longitude}`;
    Linking.openURL(url);
  };

  const handlePickupComplete = () => {
    Alert.alert(
      'Confirmar recogida',
      '¿Has recogido el pedido?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, recogido',
          onPress: () => setCurrentStep('delivering')
        }
      ]
    );
  };

  const handleDeliveryComplete = () => {
    Alert.alert(
      'Confirmar entrega',
      '¿Has entregado el pedido al cliente?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, entregado',
          onPress: () => {
            setCurrentStep('delivered');
            setTimeout(() => {
              navigation.navigate('DriverMain');
            }, 2000);
          }
        }
      ]
    );
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'pickup': return 0.33;
      case 'delivering': return 0.66;
      case 'delivered': return 1.0;
      default: return 0;
    }
  };

  const getStepText = () => {
    switch (currentStep) {
      case 'pickup': return 'Dirigiéndose al punto de recogida';
      case 'delivering': return 'Entregando pedido';
      case 'delivered': return 'Pedido entregado';
      default: return 'Iniciando entrega';
    }
  };

  const getCurrentDestination = () => {
    return currentStep === 'pickup' ? pickupLocation : deliveryLocation;
  };

  return (
    <View style={styles.container}>
      {/* Header con progreso */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Entrega en curso</Text>
          <Text style={styles.headerSubtitle}>{getStepText()}</Text>
          <ProgressBar
            progress={getStepProgress()}
            color="#FFFFFF"
            style={styles.progressBar}
          />
        </View>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Marcador de ubicación actual */}
          <Marker
            coordinate={currentLocation}
            title="Tu ubicación"
            pinColor="blue"
          />
          
          {/* Marcador de recogida */}
          {currentStep === 'pickup' && (
            <Marker
              coordinate={pickupLocation}
              title={orderData.type === 'food' ? orderData.restaurant : 'Punto de recogida'}
              description={orderData.pickup}
              pinColor="green"
            />
          )}
          
          {/* Marcador de entrega */}
          {currentStep === 'delivering' && (
            <Marker
              coordinate={deliveryLocation}
              title="Punto de entrega"
              description={orderData.delivery}
              pinColor="red"
            />
          )}
        </MapView>
      </View>

      {/* Información del pedido */}
      <ScrollView style={styles.orderInfo}>
        <Card style={styles.orderCard}>
          <Card.Content>
            <View style={styles.orderHeader}>
              <Ionicons
                name={orderData.type === 'food' ? 'restaurant' : orderData.type === 'transport' ? 'car' : 'cube'}
                size={24}
                color="#FF6B35"
              />
              <Text style={styles.orderType}>
                {orderData.type === 'food' ? 'Pedido de comida' :
                 orderData.type === 'transport' ? 'Viaje' : 'Envío de paquete'}
              </Text>
            </View>

            {/* Información del negocio/origen */}
            {currentStep === 'pickup' && (
              <View style={styles.locationSection}>
                <Text style={styles.sectionTitle}>📍 Recoger en:</Text>
                <Text style={styles.businessName}>
                  {orderData.restaurant || orderData.businessName || 'Punto de recogida'}
                </Text>
                <Text style={styles.address}>{orderData.pickup}</Text>
                {(orderData.restaurantPhone || orderData.businessPhone) && (
                  <TouchableOpacity
                    style={styles.phoneButton}
                    onPress={handleCallBusiness}
                  >
                    <Ionicons name="call" size={16} color="#FF6B35" />
                    <Text style={styles.phoneText}>
                      {orderData.restaurantPhone || orderData.businessPhone}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Información del cliente */}
            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>
                {currentStep === 'pickup' ? '🏁 Entregar a:' : '👤 Cliente:'}
              </Text>
              <Text style={styles.customerName}>{orderData.customer}</Text>
              <Text style={styles.address}>{orderData.delivery}</Text>
              <TouchableOpacity
                style={styles.phoneButton}
                onPress={handleCallCustomer}
              >
                <Ionicons name="call" size={16} color="#FF6B35" />
                <Text style={styles.phoneText}>{orderData.customerPhone}</Text>
              </TouchableOpacity>
            </View>

            {/* Detalles del pedido */}
            {orderData.items && orderData.items.length > 0 && (
              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>📦 Productos:</Text>
                {orderData.items.map((item, index) => (
                  <Text key={index} style={styles.itemText}>
                    • {item.name} x{item.quantity}
                  </Text>
                ))}
              </View>
            )}

            {orderData.specialInstructions && (
              <View style={styles.instructionsSection}>
                <Text style={styles.sectionTitle}>💬 Instrucciones especiales:</Text>
                <Text style={styles.instructionsText}>{orderData.specialInstructions}</Text>
              </View>
            )}

            {/* Información de pago */}
            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>💰 Pago:</Text>
              <Text style={styles.paymentAmount}>${orderData.payment}</Text>
              <Text style={styles.paymentMethod}>Método: {orderData.paymentMethod || 'Efectivo'}</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        {currentStep === 'pickup' && (
          <>
            <Button
              mode="outlined"
              onPress={handleNavigateToPickup}
              style={styles.navigateButton}
              icon="navigation"
            >
              Navegar al negocio
            </Button>
            <Button
              mode="contained"
              onPress={handlePickupComplete}
              style={styles.completeButton}
              buttonColor="#4CAF50"
            >
              Pedido recogido
            </Button>
          </>
        )}
        
        {currentStep === 'delivering' && (
          <>
            <Button
              mode="outlined"
              onPress={handleNavigateToDelivery}
              style={styles.navigateButton}
              icon="navigation"
            >
              Navegar al cliente
            </Button>
            <Button
              mode="contained"
              onPress={handleDeliveryComplete}
              style={styles.completeButton}
              buttonColor="#4CAF50"
            >
              Pedido entregado
            </Button>
          </>
        )}
        
        {currentStep === 'delivered' && (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
            <Text style={styles.completedText}>¡Entrega completada!</Text>
            <Text style={styles.completedSubtext}>Regresando al menú principal...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  mapContainer: {
    height: height * 0.4,
  },
  map: {
    flex: 1,
  },
  orderInfo: {
    flex: 1,
    padding: 15,
  },
  orderCard: {
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  locationSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 5,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F0',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  phoneText: {
    marginLeft: 8,
    color: '#FF6B35',
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: 15,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  instructionsSection: {
    marginBottom: 15,
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  paymentSection: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navigateButton: {
    marginBottom: 10,
    borderColor: '#FF6B35',
  },
  completeButton: {
    marginBottom: 10,
  },
  completedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
    marginBottom: 5,
  },
  completedSubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default DriverDeliveryScreen;