import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Card, Button, Switch, Avatar, Modal, Portal, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { theme, styles as globalStyles } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { USER_TYPES } from '../services/authService';
import BusinessProfileScreen from './BusinessProfileScreen';
import DriverProfileScreen from './DriverProfileScreen';

const ProfileScreen = ({ navigation }) => {
  const { getUserType } = useAuth();
  const userType = getUserType();
  
  // Si es negocio, mostrar BusinessProfileScreen
  if (userType === USER_TYPES.BUSINESS) {
    return <BusinessProfileScreen navigation={navigation} />;
  }
  
  // Si es repartidor, mostrar DriverProfileScreen
  if (userType === USER_TYPES.DRIVER) {
    return <DriverProfileScreen navigation={navigation} />;
  }
  const [userInfo, setUserInfo] = useState({
    name: 'Juan Pérez',
    email: 'cliente@rapiflow.cu',
    phone: '+53 5234 5678',
    address: 'Calle Martí #123, Mayarí Arriba',
    joinDate: '2024-01-01',
    avatar: null
  });

  const [settings, setSettings] = useState({
    notifications: true,
    locationSharing: true,
    emailUpdates: false,
    smsNotifications: true,
    darkMode: false
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [stats] = useState({
    [USER_TYPES.CLIENT]: {
      totalOrders: 24,
      totalSpent: 1250,
      favoriteRestaurant: 'Restaurante El Cubano',
      avgRating: 4.8
    },
    [USER_TYPES.BUSINESS]: {
      totalSales: 156,
      totalRevenue: 8450,
      avgRating: 4.6,
      productsCount: 12
    },
    [USER_TYPES.DRIVER]: {
      totalDeliveries: 89,
      totalEarnings: 2340,
      avgRating: 4.9,
      totalDistance: 234.5
    }
  });

  const getUserTypeText = () => {
    switch (userType) {
      case USER_TYPES.CLIENT:
        return 'Cliente';
      case USER_TYPES.BUSINESS:
        return 'Negocio';
      case USER_TYPES.DRIVER:
        return 'Repartidor';
      default:
        return 'Usuario';
    }
  };

  const getUserInitials = () => {
    return userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleEditField = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
    setShowEditModal(true);
  };

  const saveEdit = () => {
    if (!editValue.trim()) {
      Alert.alert('Error', 'El campo no puede estar vacío.');
      return;
    }

    if (editingField === 'email' && !editValue.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido.');
      return;
    }

    if (editingField === 'phone' && editValue.length < 8) {
      Alert.alert('Error', 'Por favor ingresa un número de teléfono válido.');
      return;
    }

    setUserInfo({
      ...userInfo,
      [editingField]: editValue.trim()
    });

    setShowEditModal(false);
    setEditingField(null);
    setEditValue('');
    
    Alert.alert('Información actualizada', 'Tus datos han sido actualizados exitosamente.');
  };

  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente.');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar tu cuenta permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Cuenta eliminada',
              'Tu cuenta ha sido eliminada. Lamentamos verte partir.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Welcome' }],
                    });
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const getFieldLabel = (field) => {
    const labels = {
      name: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Número de teléfono',
      address: 'Dirección'
    };
    return labels[field] || field;
  };

  const currentStats = stats[userType];

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Configuración', 'Próximamente disponible')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Información del usuario */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={80} 
                label={getUserInitials()} 
                backgroundColor="#FF6B35" 
                color="#FFFFFF"
              />
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={() => Alert.alert('Cambiar foto', 'Próximamente podrás cambiar tu foto de perfil')}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userInfo.name}</Text>
              <Text style={styles.userType}>{getUserTypeText()}</Text>
              <Text style={styles.joinDate}>Miembro desde {userInfo.joinDate}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Estadísticas del usuario */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            <View style={styles.statsGrid}>
              {userType === USER_TYPES.CLIENT && (
                <>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{currentStats.totalOrders}</Text>
                    <Text style={styles.statLabel}>Pedidos</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>${currentStats.totalSpent}</Text>
                    <Text style={styles.statLabel}>Gastado</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{currentStats.avgRating}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>🏆</Text>
                    <Text style={styles.statLabel}>VIP</Text>
                  </View>
                </>
              )}
              
              {userType === USER_TYPES.BUSINESS && (
                <>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{currentStats.totalSales}</Text>
                    <Text style={styles.statLabel}>Ventas</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>${currentStats.totalRevenue}</Text>
                    <Text style={styles.statLabel}>Ingresos</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{currentStats.avgRating}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{currentStats.productsCount}</Text>
                    <Text style={styles.statLabel}>Productos</Text>
                  </View>
                </>
              )}
              
              {userType === USER_TYPES.DRIVER && (
                <>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{currentStats.totalDeliveries}</Text>
                    <Text style={styles.statLabel}>Entregas</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>${currentStats.totalEarnings}</Text>
                    <Text style={styles.statLabel}>Ganado</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{currentStats.avgRating}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{currentStats.totalDistance} km</Text>
                    <Text style={styles.statLabel}>Recorrido</Text>
                  </View>
                </>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Información personal */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <TouchableOpacity 
              style={styles.infoItem}
              onPress={() => handleEditField('name', userInfo.name)}
            >
              <View style={styles.infoItemContent}>
                <Ionicons name="person" size={20} color="#666666" />
                <View style={styles.infoItemText}>
                  <Text style={styles.infoLabel}>Nombre completo</Text>
                  <Text style={styles.infoValue}>{userInfo.name}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.infoItem}
              onPress={() => handleEditField('email', userInfo.email)}
            >
              <View style={styles.infoItemContent}>
                <Ionicons name="mail" size={20} color="#666666" />
                <View style={styles.infoItemText}>
                  <Text style={styles.infoLabel}>Correo electrónico</Text>
                  <Text style={styles.infoValue}>{userInfo.email}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.infoItem}
              onPress={() => handleEditField('phone', userInfo.phone)}
            >
              <View style={styles.infoItemContent}>
                <Ionicons name="call" size={20} color="#666666" />
                <View style={styles.infoItemText}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{userInfo.phone}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.infoItem}
              onPress={() => handleEditField('address', userInfo.address)}
            >
              <View style={styles.infoItemContent}>
                <Ionicons name="location" size={20} color="#666666" />
                <View style={styles.infoItemText}>
                  <Text style={styles.infoLabel}>Dirección</Text>
                  <Text style={styles.infoValue}>{userInfo.address}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Configuraciones */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Configuraciones</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemContent}>
                <Ionicons name="notifications" size={20} color="#666666" />
                <View style={styles.settingItemText}>
                  <Text style={styles.settingLabel}>Notificaciones push</Text>
                  <Text style={styles.settingDescription}>Recibir notificaciones de pedidos</Text>
                </View>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => handleSettingChange('notifications', value)}
                color="#FF6B35"
              />
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemContent}>
                <Ionicons name="location" size={20} color="#666666" />
                <View style={styles.settingItemText}>
                  <Text style={styles.settingLabel}>Compartir ubicación</Text>
                  <Text style={styles.settingDescription}>Permitir seguimiento en tiempo real</Text>
                </View>
              </View>
              <Switch
                value={settings.locationSharing}
                onValueChange={(value) => handleSettingChange('locationSharing', value)}
                color="#FF6B35"
              />
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemContent}>
                <Ionicons name="mail" size={20} color="#666666" />
                <View style={styles.settingItemText}>
                  <Text style={styles.settingLabel}>Emails promocionales</Text>
                  <Text style={styles.settingDescription}>Recibir ofertas y promociones</Text>
                </View>
              </View>
              <Switch
                value={settings.emailUpdates}
                onValueChange={(value) => handleSettingChange('emailUpdates', value)}
                color="#FF6B35"
              />
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingItemContent}>
                <Ionicons name="chatbubble" size={20} color="#666666" />
                <View style={styles.settingItemText}>
                  <Text style={styles.settingLabel}>SMS</Text>
                  <Text style={styles.settingDescription}>Notificaciones por mensaje de texto</Text>
                </View>
              </View>
              <Switch
                value={settings.smsNotifications}
                onValueChange={(value) => handleSettingChange('smsNotifications', value)}
                color="#FF6B35"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Acciones */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Soporte y Ayuda</Text>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('Soporte', 'Contacta con nosotros:\nTeléfono: +53 5123 4567\nEmail: soporte@rapiflow.cu')}
            >
              <Ionicons name="help-circle" size={20} color="#2196F3" />
              <Text style={styles.actionText}>Centro de ayuda</Text>
              <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('Términos', 'Términos y condiciones de uso de RAPIFLOW.')}
            >
              <Ionicons name="document-text" size={20} color="#2196F3" />
              <Text style={styles.actionText}>Términos y condiciones</Text>
              <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('Privacidad', 'Política de privacidad de RAPIFLOW.')}
            >
              <Ionicons name="shield-checkmark" size={20} color="#2196F3" />
              <Text style={styles.actionText}>Política de privacidad</Text>
              <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('Acerca de', 'RAPIFLOW v1.0\nServicio de entregas para Mayarí Arriba\n\nDesarrollado con ❤️ en Cuba')}
            >
              <Ionicons name="information-circle" size={20} color="#2196F3" />
              <Text style={styles.actionText}>Acerca de RAPIFLOW</Text>
              <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonText}
            icon="logout"
          >
            Cerrar sesión
          </Button>
          
          <Button
            mode="text"
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
            labelStyle={styles.deleteButtonText}
          >
            Eliminar cuenta
          </Button>
        </View>
      </ScrollView>

      {/* Modal para editar información */}
      <Portal>
        <Modal
          visible={showEditModal}
          onDismiss={() => {
            setShowEditModal(false);
            setEditingField(null);
            setEditValue('');
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Editar {getFieldLabel(editingField)}</Text>
          
          <TextInput
            style={styles.modalInput}
            value={editValue}
            onChangeText={setEditValue}
            placeholder={`Ingresa tu ${getFieldLabel(editingField).toLowerCase()}`}
            keyboardType={editingField === 'email' ? 'email-address' : editingField === 'phone' ? 'phone-pad' : 'default'}
            multiline={editingField === 'address'}
            numberOfLines={editingField === 'address' ? 3 : 1}
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setShowEditModal(false);
                setEditingField(null);
                setEditValue('');
              }}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonText}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={saveEdit}
              style={styles.saveButton}
              labelStyle={styles.saveButtonText}
            >
              Guardar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    marginBottom: 20,
    elevation: 3,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  userType: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 5,
  },
  joinDate: {
    fontSize: 12,
    color: '#666666',
  },
  statsCard: {
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  infoCard: {
    marginBottom: 20,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  infoItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoItemText: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  settingsCard: {
    marginBottom: 20,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemText: {
    marginLeft: 15,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 11,
    color: '#666666',
  },
  actionsCard: {
    marginBottom: 20,
    elevation: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  actionText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    marginLeft: 15,
    flex: 1,
  },
  divider: {
    backgroundColor: '#EEEEEE',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  logoutButton: {
    borderColor: '#FF6B35',
    marginBottom: 15,
  },
  logoutButtonText: {
    color: '#FF6B35',
  },
  deleteButton: {
    marginBottom: 10,
  },
  deleteButtonText: {
    color: '#F44336',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333333',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#DDDDDD',
  },
  cancelButtonText: {
    color: '#666666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
});

export default ProfileScreen;