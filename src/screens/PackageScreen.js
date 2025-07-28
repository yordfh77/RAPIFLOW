import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, RadioButton, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';

const PackageScreen = ({ navigation }) => {
  const [packageData, setPackageData] = useState({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    packageType: 'document',
    packageSize: 'small',
    description: '',
    value: '',
    urgent: false,
    fragile: false,
    paymentMethod: 'cash_sender'
  });
  const [loading, setLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const packageTypes = [
    { id: 'document', name: 'Documento', icon: 'document-text', basePrice: 20 },
    { id: 'clothing', name: 'Ropa', icon: 'shirt', basePrice: 30 },
    { id: 'food', name: 'Comida', icon: 'restaurant', basePrice: 25 },
    { id: 'electronics', name: 'Electrónicos', icon: 'phone-portrait', basePrice: 50 },
    { id: 'medicine', name: 'Medicina', icon: 'medical', basePrice: 35 },
    { id: 'other', name: 'Otro', icon: 'cube', basePrice: 40 }
  ];

  const packageSizes = [
    { id: 'small', name: 'Pequeño', description: 'Hasta 1kg', multiplier: 1 },
    { id: 'medium', name: 'Mediano', description: '1-5kg', multiplier: 1.5 },
    { id: 'large', name: 'Grande', description: '5-15kg', multiplier: 2 },
    { id: 'extra_large', name: 'Extra Grande', description: 'Más de 15kg', multiplier: 3 }
  ];

  const paymentMethods = [
    { id: 'cash_sender', name: 'Efectivo - Remitente paga', description: 'Tú pagas al enviar' },
    { id: 'cash_recipient', name: 'Efectivo - Destinatario paga', description: 'El destinatario paga al recibir' }
  ];

  const popularAddresses = [
    'Hospital Municipal, Calle Principal',
    'Escuela Primaria, Calle Martí',
    'Mercado Central, Plaza Central',
    'Iglesia, Calle Independencia',
    'Estación de Ómnibus, Carretera Central',
    'Policlínico, Avenida Central',
    'Farmacia Popular, Calle Maceo'
  ];

  React.useEffect(() => {
    calculatePrice();
  }, [packageData.packageType, packageData.packageSize, packageData.urgent, packageData.fragile]);

  const calculatePrice = () => {
    const typeData = packageTypes.find(t => t.id === packageData.packageType);
    const sizeData = packageSizes.find(s => s.id === packageData.packageSize);
    
    if (!typeData || !sizeData) return;

    let price = typeData.basePrice * sizeData.multiplier;
    
    if (packageData.urgent) price *= 1.5;
    if (packageData.fragile) price += 20;
    
    setEstimatedPrice(Math.round(price));
  };

  const updatePackageData = (field, value) => {
    setPackageData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = [
      'senderName', 'senderPhone', 'senderAddress',
      'recipientName', 'recipientPhone', 'recipientAddress',
      'description'
    ];

    for (let field of required) {
      if (!packageData[field].trim()) {
        Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
        return false;
      }
    }

    if (packageData.senderPhone.length < 8) {
      Alert.alert('Error', 'El teléfono del remitente debe tener al menos 8 dígitos');
      return false;
    }

    if (packageData.recipientPhone.length < 8) {
      Alert.alert('Error', 'El teléfono del destinatario debe tener al menos 8 dígitos');
      return false;
    }

    return true;
  };

  const handleSendPackage = () => {
    if (!validateForm()) return;

    setLoading(true);

    // Simular procesamiento
    setTimeout(() => {
      setLoading(false);
      
      Alert.alert(
        'Paquete Programado',
        `Tu paquete ha sido programado para envío.\n\nPrecio: $${estimatedPrice}\nTipo: ${packageTypes.find(t => t.id === packageData.packageType)?.name}\nTamaño: ${packageSizes.find(s => s.id === packageData.packageSize)?.name}\n\n¿Confirmar envío?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: () => {
              navigation.navigate('OrderTracking', {
                orderId: Date.now(),
                type: 'package',
                recipient: packageData.recipientName,
                address: packageData.recipientAddress,
                price: estimatedPrice,
                packageType: packageTypes.find(t => t.id === packageData.packageType)?.name
              });
            }
          }
        ]
      );
    }, 1500);
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.container}>
        {/* Header con precio estimado */}
        <Card style={styles.priceCard}>
          <Card.Content>
            <View style={styles.priceContent}>
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>Precio estimado:</Text>
                <Text style={styles.priceAmount}>${estimatedPrice}</Text>
              </View>
              <Ionicons name="cube" size={40} color="#FF6B35" />
            </View>
          </Card.Content>
        </Card>

        {/* Información del remitente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 Información del remitente</Text>
          
          <TextInput
            label="Nombre completo *"
            value={packageData.senderName}
            onChangeText={(value) => updatePackageData('senderName', value)}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Teléfono *"
            value={packageData.senderPhone}
            onChangeText={(value) => updatePackageData('senderPhone', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />

          <TextInput
            label="Dirección completa *"
            value={packageData.senderAddress}
            onChangeText={(value) => updatePackageData('senderAddress', value)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
            left={<TextInput.Icon icon="map-marker" />}
          />
        </View>

        {/* Información del destinatario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📥 Información del destinatario</Text>
          
          <TextInput
            label="Nombre completo *"
            value={packageData.recipientName}
            onChangeText={(value) => updatePackageData('recipientName', value)}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Teléfono *"
            value={packageData.recipientPhone}
            onChangeText={(value) => updatePackageData('recipientPhone', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />

          <TextInput
            label="Dirección completa *"
            value={packageData.recipientAddress}
            onChangeText={(value) => updatePackageData('recipientAddress', value)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
            left={<TextInput.Icon icon="map-marker" />}
          />

          {/* Direcciones populares */}
          <Text style={styles.suggestionsTitle}>Direcciones populares:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
            {popularAddresses.map((address, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={styles.suggestionChip}
                onPress={() => updatePackageData('recipientAddress', address)}
              >
                {address}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Detalles del paquete */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Detalles del paquete</Text>
          
          {/* Tipo de paquete */}
          <Text style={styles.fieldLabel}>Tipo de paquete:</Text>
          <View style={styles.optionsGrid}>
            {packageTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.optionCard,
                  packageData.packageType === type.id && styles.optionCardSelected
                ]}
                onPress={() => updatePackageData('packageType', type.id)}
              >
                <Ionicons 
                  name={type.icon} 
                  size={24} 
                  color={packageData.packageType === type.id ? '#FF6B35' : '#666666'} 
                />
                <Text style={[
                  styles.optionText,
                  packageData.packageType === type.id && styles.optionTextSelected
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tamaño del paquete */}
          <Text style={styles.fieldLabel}>Tamaño del paquete:</Text>
          {packageSizes.map((size) => (
            <TouchableOpacity
              key={size.id}
              style={[
                styles.sizeOption,
                packageData.packageSize === size.id && styles.sizeOptionSelected
              ]}
              onPress={() => updatePackageData('packageSize', size.id)}
            >
              <RadioButton
                value={size.id}
                status={packageData.packageSize === size.id ? 'checked' : 'unchecked'}
                onPress={() => updatePackageData('packageSize', size.id)}
                color="#FF6B35"
              />
              <View style={styles.sizeInfo}>
                <Text style={[
                  styles.sizeName,
                  packageData.packageSize === size.id && styles.sizeNameSelected
                ]}>
                  {size.name}
                </Text>
                <Text style={styles.sizeDescription}>{size.description}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Descripción */}
          <TextInput
            label="Descripción del contenido *"
            value={packageData.description}
            onChangeText={(value) => updatePackageData('description', value)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Describe brevemente el contenido del paquete"
          />

          {/* Valor declarado */}
          <TextInput
            label="Valor declarado (opcional)"
            value={packageData.value}
            onChangeText={(value) => updatePackageData('value', value)}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            left={<TextInput.Icon icon="cash" />}
            placeholder="Valor en pesos cubanos"
          />
        </View>

        {/* Opciones especiales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Opciones especiales</Text>
          
          <TouchableOpacity
            style={styles.checkboxOption}
            onPress={() => updatePackageData('urgent', !packageData.urgent)}
          >
            <RadioButton
              value="urgent"
              status={packageData.urgent ? 'checked' : 'unchecked'}
              onPress={() => updatePackageData('urgent', !packageData.urgent)}
              color="#FF6B35"
            />
            <View style={styles.checkboxInfo}>
              <Text style={styles.checkboxLabel}>Envío urgente (+50%)</Text>
              <Text style={styles.checkboxDescription}>Entrega prioritaria en el día</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxOption}
            onPress={() => updatePackageData('fragile', !packageData.fragile)}
          >
            <RadioButton
              value="fragile"
              status={packageData.fragile ? 'checked' : 'unchecked'}
              onPress={() => updatePackageData('fragile', !packageData.fragile)}
              color="#FF6B35"
            />
            <View style={styles.checkboxInfo}>
              <Text style={styles.checkboxLabel}>Frágil (+$20)</Text>
              <Text style={styles.checkboxDescription}>Manejo especial y cuidadoso</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Método de pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Método de pago</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                packageData.paymentMethod === method.id && styles.paymentOptionSelected
              ]}
              onPress={() => updatePackageData('paymentMethod', method.id)}
            >
              <RadioButton
                value={method.id}
                status={packageData.paymentMethod === method.id ? 'checked' : 'unchecked'}
                onPress={() => updatePackageData('paymentMethod', method.id)}
                color="#FF6B35"
              />
              <View style={styles.paymentInfo}>
                <Text style={[
                  styles.paymentName,
                  packageData.paymentMethod === method.id && styles.paymentNameSelected
                ]}>
                  {method.name}
                </Text>
                <Text style={styles.paymentDescription}>{method.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón de enviar */}
        <View style={styles.submitSection}>
          <Button
            mode="contained"
            onPress={handleSendPackage}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
          >
            {loading ? 'Procesando...' : `Enviar Paquete - $${estimatedPrice}`}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  priceCard: {
    marginBottom: 20,
    elevation: 3,
    backgroundColor: '#FFF5F0',
  },
  priceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 10,
    marginTop: 5,
  },
  suggestionsContainer: {
    marginBottom: 10,
  },
  suggestionChip: {
    marginRight: 10,
    backgroundColor: '#F5F5F5',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionCard: {
    width: '30%',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  optionCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  optionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    marginTop: 5,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#FF6B35',
  },
  sizeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  sizeOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  sizeInfo: {
    flex: 1,
    marginLeft: 10,
  },
  sizeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  sizeNameSelected: {
    color: '#FF6B35',
  },
  sizeDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  checkboxInfo: {
    flex: 1,
    marginLeft: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  checkboxDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  paymentOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  paymentNameSelected: {
    color: '#FF6B35',
  },
  paymentDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  submitSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
});

export default PackageScreen;