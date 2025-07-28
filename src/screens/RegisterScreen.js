import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { TextInput, Button, RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';
import { registerUser, validateEmail, validateCubanPhone, USER_TYPES } from '../services/authService';
import { useAuth } from '../context/AuthContext';
// Importar utilidades de testing para desarrollo
import '../utils/testUtils';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: USER_TYPES.CLIENT,
    address: '',
    businessName: '',
    businessType: '',
    vehicleType: '',
    licenseNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { updateUser } = useAuth();

  const roles = [
    { value: USER_TYPES.CLIENT, label: 'Cliente', icon: 'person', description: 'Pedir comida, transporte y enviar paquetes' },
    { value: USER_TYPES.BUSINESS, label: 'Negocio', icon: 'business', description: 'Vender productos y recibir pedidos' },
    { value: USER_TYPES.DRIVER, label: 'Repartidor/Chofer', icon: 'bicycle', description: 'Realizar entregas y transportar pasajeros' }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor ingresa un email válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!validateCubanPhone(formData.phone)) {
      newErrors.phone = 'Por favor ingresa un número de teléfono cubano válido (+53 XXXXXXXX)';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }

    // Validaciones específicas por tipo de usuario
    if (formData.userType === USER_TYPES.BUSINESS) {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'El nombre del negocio es obligatorio';
      }
      if (!formData.businessType.trim()) {
        newErrors.businessType = 'El tipo de negocio es obligatorio';
      }
    }

    if (formData.userType === USER_TYPES.DRIVER) {
      if (!formData.vehicleType.trim()) {
        newErrors.vehicleType = 'El tipo de vehículo es obligatorio';
      }
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'El número de licencia es obligatorio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    console.log('=== INICIO DEL REGISTRO ===');
    console.log('Datos del formulario:', formData);
    
    if (!validateForm()) {
      console.log('Validación del formulario falló');
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    console.log('Validación del formulario exitosa');
    setLoading(true);

    try {
      console.log('Llamando a registerUser...');
      const result = await registerUser(formData);
      console.log('Resultado del registro:', result);
      
      if (result.success) {
        console.log('Registro exitoso, actualizando usuario...');
        updateUser(result.user);
        Alert.alert(
          'Registro exitoso',
          `¡Bienvenido ${result.user.name}! Tu cuenta ha sido creada correctamente.`,
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Usuario confirmó el registro exitoso');
                // El AuthContext manejará automáticamente la navegación
                // basada en el tipo de usuario
              }
            }
          ]
        );
      } else {
        console.log('Error en el registro:', result.error);
        Alert.alert('Error de registro', result.error);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Error', 'Ha ocurrido un error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
      console.log('=== FIN DEL REGISTRO ===');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.container}>
        {/* Logo con ícono y texto */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIconContainer}>
            <Ionicons name="flash" size={40} color="#FF6B35" />
          </View>
          <Text style={styles.logoText}>RapiFlow</Text>
          <Text style={styles.logoSubtext}>Rapidez con estilo cubano</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Crear Cuenta</Text>
          
          <TextInput
            label="Nombre completo"
            value={formData.name}
            onChangeText={(text) => {
              setFormData({...formData, name: text});
              if (errors.name) setErrors({...errors, name: ''});
            }}
            mode="outlined"
            style={globalStyles.input}
            left={<TextInput.Icon icon="account" />}
            error={!!errors.name}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <TextInput
            label="Correo electrónico"
            value={formData.email}
            onChangeText={(text) => {
              setFormData({...formData, email: text});
              if (errors.email) setErrors({...errors, email: ''});
            }}
            mode="outlined"
            style={globalStyles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email" />}
            error={!!errors.email}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            label="Teléfono (+53 XXXXXXXX)"
            value={formData.phone}
            onChangeText={(text) => {
              setFormData({...formData, phone: text});
              if (errors.phone) setErrors({...errors, phone: ''});
            }}
            mode="outlined"
            style={globalStyles.input}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
            error={!!errors.phone}
            placeholder="+53 5123 4567"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          <TextInput
            label="Dirección"
            value={formData.address}
            onChangeText={(text) => {
              setFormData({...formData, address: text});
              if (errors.address) setErrors({...errors, address: ''});
            }}
            mode="outlined"
            style={globalStyles.input}
            left={<TextInput.Icon icon="map-marker" />}
            error={!!errors.address}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

          <TextInput
            label="Contraseña"
            value={formData.password}
            onChangeText={(text) => {
              setFormData({...formData, password: text});
              if (errors.password) setErrors({...errors, password: ''});
            }}
            mode="outlined"
            style={globalStyles.input}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            error={!!errors.password}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TextInput
            label="Confirmar contraseña"
            value={formData.confirmPassword}
            onChangeText={(text) => {
              setFormData({...formData, confirmPassword: text});
              if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
            }}
            mode="outlined"
            style={globalStyles.input}
            secureTextEntry={!showConfirmPassword}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon 
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          {/* Selección de rol */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleTitle}>Tipo de cuenta:</Text>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleOption,
                  formData.userType === role.value && styles.roleOptionSelected
                ]}
                onPress={() => setFormData({...formData, userType: role.value})}
              >
                <View style={styles.roleContent}>
                  <View style={styles.roleHeader}>
                    <Ionicons 
                      name={role.icon} 
                      size={24} 
                      color={formData.userType === role.value ? '#FF6B35' : '#666666'} 
                    />
                    <Text style={[
                      styles.roleLabel,
                      formData.userType === role.value && styles.roleLabelSelected
                    ]}>
                      {role.label}
                    </Text>
                    <RadioButton
                      value={role.value}
                      status={formData.userType === role.value ? 'checked' : 'unchecked'}
                      onPress={() => setFormData({...formData, userType: role.value})}
                      color="#FF6B35"
                    />
                  </View>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Campos específicos para negocios */}
          {formData.userType === USER_TYPES.BUSINESS && (
            <>
              <Text style={styles.sectionTitle}>Información del negocio</Text>
              <TextInput
                label="Nombre del negocio"
                value={formData.businessName}
                onChangeText={(text) => {
                  setFormData({...formData, businessName: text});
                  if (errors.businessName) setErrors({...errors, businessName: ''});
                }}
                style={globalStyles.input}
                mode="outlined"
                left={<TextInput.Icon icon="store" />}
                error={!!errors.businessName}
              />
              {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}

              <TextInput
                label="Tipo de negocio"
                value={formData.businessType}
                onChangeText={(text) => {
                  setFormData({...formData, businessType: text});
                  if (errors.businessType) setErrors({...errors, businessType: ''});
                }}
                style={globalStyles.input}
                mode="outlined"
                left={<TextInput.Icon icon="tag" />}
                error={!!errors.businessType}
                placeholder="Ej: Restaurante, Farmacia, Supermercado"
              />
              {errors.businessType && <Text style={styles.errorText}>{errors.businessType}</Text>}
            </>
          )}

          {/* Campos específicos para repartidores */}
          {formData.userType === USER_TYPES.DRIVER && (
            <>
              <Text style={styles.sectionTitle}>Información del vehículo</Text>
              <TextInput
                label="Tipo de vehículo"
                value={formData.vehicleType}
                onChangeText={(text) => {
                  setFormData({...formData, vehicleType: text});
                  if (errors.vehicleType) setErrors({...errors, vehicleType: ''});
                }}
                style={globalStyles.input}
                mode="outlined"
                left={<TextInput.Icon icon="car" />}
                error={!!errors.vehicleType}
                placeholder="Ej: Motocicleta, Bicicleta, Auto"
              />
              {errors.vehicleType && <Text style={styles.errorText}>{errors.vehicleType}</Text>}

              <TextInput
                label="Número de licencia"
                value={formData.licenseNumber}
                onChangeText={(text) => {
                  setFormData({...formData, licenseNumber: text});
                  if (errors.licenseNumber) setErrors({...errors, licenseNumber: ''});
                }}
                style={globalStyles.input}
                mode="outlined"
                left={<TextInput.Icon icon="card" />}
                error={!!errors.licenseNumber}
                placeholder="Número de licencia de conducir"
              />
              {errors.licenseNumber && <Text style={styles.errorText}>{errors.licenseNumber}</Text>}
            </>
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
            contentStyle={styles.buttonContent}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </Button>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              ¿Ya tienes cuenta? <Text style={styles.loginTextBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  logoSubtext: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  formContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 25,
  },
  roleContainer: {
    marginVertical: 20,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  roleOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  roleOptionSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  roleContent: {
    flex: 1,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginLeft: 10,
  },
  roleLabelSelected: {
    color: '#FF6B35',
  },
  roleDescription: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 34,
  },
  registerButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  errorText: {
     color: '#FF6B35',
     fontSize: 12,
     marginTop: 4,
     marginLeft: 12,
   },
   sectionTitle: {
     fontSize: 16,
     fontWeight: 'bold',
     color: '#333',
     marginTop: 20,
     marginBottom: 10,
   },
});

export default RegisterScreen;