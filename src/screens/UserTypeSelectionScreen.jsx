import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authStyles } from '../styles/authStyles';
import { getDynamicStyles } from '../styles/dynamicStyles';
import { AuthLogo } from '../components/authComponents';

const UserTypeSelectionScreen = () => {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const dynamicStyles = getDynamicStyles(width, height);

  const handleEmergencyUser = () => {
    navigation.navigate('EmergencyUser');
  };

  const handleFirstResponder = () => {
    navigation.navigate('FirstResponder');
  };

  return (
    <View style={authStyles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[authStyles.topSection, dynamicStyles.topSection]}>
        <AuthLogo dynamicStyles={dynamicStyles} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Select User Type</Text>
        <TouchableOpacity style={styles.button} onPress={handleEmergencyUser}>
          <Text style={styles.buttonText}>Emergency User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleFirstResponder}>
          <Text style={styles.buttonText}>First Responder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2B95E1',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserTypeSelectionScreen;
