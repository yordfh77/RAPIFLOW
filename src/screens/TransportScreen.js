import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { theme, styles as globalStyles } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const TransportScreen = ({ navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [tripType, setTripType] = useState('standard');
  const [loading, setLoading] = useState(false);

  // Ubicaciones populares en Mayarí Arriba
  const popularDestinations = [
    { id: 1, name: 'Hospital Municipal', address: 'Calle Principal', coords: { latitude: 20.3847, longitude: -75.6794 }, icon: 'medical' },
    { id: 2, name: 'Escuela Primaria', address: 'Calle Martí', coords: { latitude: 20.3850, longitude: -75.6800 }, icon: 'school' },
    { id: 3, name: 'Mercado Central', address: 'Plaza Central', coords: { latitude: 20.3845, longitude: -75.6785 }, icon: 'storefront' },
    { id: 4, name: 'Iglesia', address: 'Calle Independencia', coords: { latitude: 20.3852, longitude: -75.6790 }, icon: 'business' },
    { id: 5, name: 'Estación de Ómnibus', address: 'Carretera Central', coords: { latitude: 20.3840, longitude: -75.6810 }, icon: 'bus' },
  ];

  const tripTypes = [
    { id: 'standard', name: 'Estándar', description: 'Viaje normal', multiplier: 1, icon: 'car' },
    { id: 'express', name: 'Express', description: 'Viaje rápido', multiplier: 1.5, icon: 'flash' },
    { id: 'shared', name: 'Compartido', description: 'Viaje compartido', multiplier: 0.7, icon: 'people' },
  ];

  // Choferes disponibles (datos dummy)
  const availableDrivers = [
    { id: 1, name: 'Carlos Rodríguez', rating: 4.8, vehicle: 'Lada Azul', eta: '5 min', distance: '0.8 km' },
    { id: 2, name: 'María González', rating: 4.9, vehicle: 'Geely Blanco', eta: '8 min', distance: '1.2 km' },
    { id: 3, name: 'José Martínez', rating: 4.7, vehicle: 'Hyundai Gris', eta: '12 min', distance: '2.1 km' },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (selectedDestination) {
      calculateEstimates();
    }
  }, [selectedDestination, tripType]);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación para usar esta función');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      // Usar ubicación por defecto de Mayarí Arriba
      setCurrentLocation({
        latitude: 20.3848,
        longitude: -75.6792,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const calculateEstimates = () => {
    if (!selectedDestination) return;

    // Cálculo simple de distancia y precio
    const baseDistance = Math.random() * 5 + 1; // 1-6 km
    const basePrice = Math.round((baseDistance * 15) * tripTypes.find(t => t.id === tripType).multiplier);
    const baseTime = Math.round(baseDistance * 3 + Math.random() * 10); // tiempo en minutos

    setEstimatedPrice(basePrice);
    setEstimatedTime(baseTime);
  };

  const selectDestination = (dest) => {
    setSelectedDestination(dest);
    setDestination(dest.name);
  };

  const requestTrip = () => {
    if (!selectedDestination) {
      Alert.alert('Error', 'Por favor selecciona un destino');
      return;
    }

    setLoading(true);

    // Simular búsqueda de chofer
    setTimeout(() => {
      setLoading(false);
      const driver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
      
      Alert.alert(
        'Viaje Confirmado',
        `Chofer: ${driver.name}\nVehículo: ${driver.vehicle}\nTiempo estimado: ${driver.eta}\nPrecio: $${estimatedPrice}\n\n¿Confirmar viaje?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: () => {
              navigation.navigate('OrderTracking', {
                orderId: Date.now(),
                type: 'transport',
                driver: driver.name,
                vehicle: driver.vehicle,
                destination: selectedDestination.name,
                price: estimatedPrice,
                eta: driver.eta
              });
            }
          }
        ]
      );
    }, 2000);
  };

  return (
    <View style={globalStyles.container}>
      {/* Mapa */}
      <View style={styles.mapContainer}>
        {currentLocation && (
          <MapView
            style={styles.map}
            initialRegion={currentLocation}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {/* Marcador de ubicación actual */}
            <Marker
              coordinate={currentLocation}
              title="Tu ubicación"
              pinColor="#FF6B35"
            />
            
            {/* Marcador de destino */}
            {selectedDestination && (
              <Marker
                coordinate={selectedDestination.coords}
                title={selectedDestination.name}
                description={selectedDestination.address}
                pinColor="#4CAF50"
              />
            )}
            
            {/* Marcadores de lugares populares */}
            {popularDestinations.map((place) => (
              <Marker
                key={place.id}
                coordinate={place.coords}
                title={place.name}
                description={place.address}
                onPress={() => selectDestination(place)}
              >
                <View style={styles.customMarker}>
                  <Ionicons name={place.icon} size={20} color="#FFFFFF" />
                </View>
              </Marker>
            ))}
          </MapView>
        )}
        
        {/* Botón de ubicación actual */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
        >
          <Ionicons name="locate" size={24} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Panel inferior */}
      <View style={styles.bottomPanel}>
        {/* Buscador de destino */}
        <View style={styles.searchSection}>
          <TextInput
            label="¿A dónde vas?"
            value={destination}
            onChangeText={setDestination}
            mode="outlined"
            style={styles.destinationInput}
            left={<TextInput.Icon icon="map-marker" />}
            right={<TextInput.Icon icon="close" onPress={() => {
              setDestination('');
              setSelectedDestination(null);
            }} />}
          />
        </View>

        {/* Destinos populares */}
        {!selectedDestination && (
          <View style={styles.popularSection}>
            <Text style={styles.sectionTitle}>Destinos populares:</Text>
            {popularDestinations.slice(0, 3).map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.popularDestination}
                onPress={() => selectDestination(place)}
              >
                <View style={styles.destinationIcon}>
                  <Ionicons name={place.icon} size={20} color="#FF6B35" />
                </View>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>{place.name}</Text>
                  <Text style={styles.destinationAddress}>{place.address}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tipos de viaje */}
        {selectedDestination && (
          <View style={styles.tripTypeSection}>
            <Text style={styles.sectionTitle}>Tipo de viaje:</Text>
            <View style={styles.tripTypes}>
              {tripTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.tripTypeCard,
                    tripType === type.id && styles.tripTypeCardSelected
                  ]}
                  onPress={() => setTripType(type.id)}
                >
                  <Ionicons 
                    name={type.icon} 
                    size={24} 
                    color={tripType === type.id ? '#FF6B35' : '#666666'} 
                  />
                  <Text style={[
                    styles.tripTypeName,
                    tripType === type.id && styles.tripTypeNameSelected
                  ]}>
                    {type.name}
                  </Text>
                  <Text style={styles.tripTypeDescription}>{type.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Estimaciones y botón de solicitar */}
        {selectedDestination && (
          <View style={styles.estimateSection}>
            <Card style={styles.estimateCard}>
              <Card.Content>
                <View style={styles.estimateContent}>
                  <View style={styles.estimateItem}>
                    <Ionicons name="time" size={20} color="#FF6B35" />
                    <Text style={styles.estimateText}>{estimatedTime} min</Text>
                  </View>
                  <View style={styles.estimateItem}>
                    <Ionicons name="cash" size={20} color="#FF6B35" />
                    <Text style={styles.estimateText}>${estimatedPrice}</Text>
                  </View>
                  <View style={styles.estimateItem}>
                    <Ionicons name="car" size={20} color="#FF6B35" />
                    <Text style={styles.estimateText}>{availableDrivers.length} disponibles</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
            
            <Button
              mode="contained"
              onPress={requestTrip}
              loading={loading}
              disabled={loading}
              style={styles.requestButton}
              contentStyle={styles.requestButtonContent}
            >
              {loading ? 'Buscando chofer...' : 'Solicitar Viaje'}
            </Button>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.6,
  },
  searchSection: {
    marginBottom: 20,
  },
  destinationInput: {
    backgroundColor: '#F5F5F5',
  },
  popularSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  popularDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  destinationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  destinationAddress: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  tripTypeSection: {
    marginBottom: 20,
  },
  tripTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripTypeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  tripTypeCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  tripTypeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 5,
  },
  tripTypeNameSelected: {
    color: '#FF6B35',
  },
  tripTypeDescription: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
    marginTop: 2,
  },
  estimateSection: {
    marginTop: 10,
  },
  estimateCard: {
    marginBottom: 15,
    elevation: 1,
  },
  estimateContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  estimateItem: {
    alignItems: 'center',
  },
  estimateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginTop: 5,
  },
  requestButton: {
    backgroundColor: '#FF6B35',
  },
  requestButtonContent: {
    paddingVertical: 8,
  },
});

export default TransportScreen;