import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';
import { loginUser, validateEmail, USER_TYPES, signInWithGoogle } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();

  const handleLogin = async () => {
    // Validar campos
    if (!email.trim()) {
      setEmailError('Por favor ingresa tu email');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Por favor ingresa un email válido');
      return;
    }
    setEmailError('');

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      const result = await loginUser(email.trim(), password);
      
      if (result.success) {
        // Actualizar el usuario en el contexto
        updateUser(result.user);
        
        // Navegar a la pantalla correspondiente según el tipo de usuario
        const userType = result.user.userType;
        let targetScreen = 'ClientMain'; // Por defecto
        
        if (userType === USER_TYPES.BUSINESS) {
          targetScreen = 'BusinessMain';
        } else if (userType === USER_TYPES.DRIVER) {
          targetScreen = 'DriverMain';
        }
        
        // Navegar y mostrar mensaje de bienvenida
        navigation.reset({
          index: 0,
          routes: [{ name: targetScreen }],
        });
        
        Alert.alert('Éxito', `¡Bienvenido ${result.user.name}!`);
      } else {
        Alert.alert('Error de inicio de sesión', result.error);
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Ha ocurrido un error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        if (result.isNewUser) {
          // Nuevo usuario de Google - navegar a selección de tipo de usuario
          navigation.navigate('UserTypeSelection', { 
            googleUserData: result.user 
          });
        } else {
          // Usuario existente
          updateUser(result.user);
          
          // Navegar a la pantalla correspondiente según el tipo de usuario
          const userType = result.user.userType;
          let targetScreen = 'ClientMain'; // Por defecto
          
          if (userType === USER_TYPES.BUSINESS) {
            targetScreen = 'BusinessMain';
          } else if (userType === USER_TYPES.DRIVER) {
            targetScreen = 'DriverMain';
          }
          
          navigation.reset({
            index: 0,
            routes: [{ name: targetScreen }],
          });
          
          Alert.alert('Éxito', `¡Bienvenido ${result.user.name}!`);
        }
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      Alert.alert('Error', 'Ha ocurrido un error con Google Sign-In. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.container}>
        {/* Logo con ícono y texto */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIconContainer}>
            <Ionicons name="flash" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>RapiFlow</Text>
          <Text style={styles.logoSubtext}>Rapidez con estilo cubano</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          
          <TextInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={globalStyles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email" />}
            id="email-input"
            name="email"
            autoComplete="email"
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
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
            id="password-input"
            name="password"
            autoComplete="current-password"
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          {/* Separador */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>o</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Botón de Google Sign-In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              ¿No tienes cuenta? <Text style={styles.registerTextBold}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Información de ayuda */}
        <Card style={styles.helpCard}>
          <Card.Content>
            <Text style={styles.helpTitle}>¿Necesitas ayuda?</Text>
            <TouchableOpacity 
              style={styles.helpItem}
              onPress={() => Alert.alert('Recuperar contraseña', 'Próximamente podrás recuperar tu contraseña por email.')}
            >
              <Ionicons name="key" size={16} color="#FF6B35" />
              <Text style={styles.helpText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.helpItem}
              onPress={() => Alert.alert('Soporte', 'Contacta con nosotros:\nTeléfono: +53 5123 4567\nEmail: soporte@rapiflow.cu')}
            >
              <Ionicons name="help-circle" size={16} color="#FF6B35" />
              <Text style={styles.helpText}>Contactar soporte</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 30,
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#666666',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginLeft: 12,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  registerText: {
    fontSize: 14,
    color: '#666666',
  },
  registerTextBold: {
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  helpCard: {
    marginTop: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default LoginScreen;