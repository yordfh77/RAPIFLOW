import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>¡RAPIFLOW está funcionando!</Text>
      <Text style={styles.subtext}>Si puedes ver esto, la aplicación se está cargando correctamente.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtext: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default TestScreen;