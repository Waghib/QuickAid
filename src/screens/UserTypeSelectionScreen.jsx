import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, useWindowDimensions, Alert, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { authStyles } from '../styles/authStyles';
import { getDynamicStyles } from '../styles/dynamicStyles';
import { AuthLogo } from '../components/authComponents';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { API_BASE_URL } from '../config/api';

const UserTypeSelectionScreen = () => {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const dynamicStyles = getDynamicStyles(width, height);

  // Handle hardware back button press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Navigate to SignIn screen instead of exiting the app
        navigation.navigate('SignIn');
        return true; // Prevent default behavior (app exit)
      };

      // Add event listener for back button press
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Clean up event listener when component unmounts or loses focus
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
  );

  const handleEmergencyUser = async () => {
    try {
      const currentUser = auth().currentUser;
      
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const userId = currentUser.phoneNumber || currentUser.uid;

      // Update user document with emergency role in Firebase
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          role: 'emergency',
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
        
      // True fire and forget - don't use await, don't use promises
      // This will run in the background without blocking or waiting for completion
      fetch(`${API_BASE_URL}/api/users/${userId}/type`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType: 'emergency_user'
        })
      })
      .then(response => console.log('User type update response:', response.status))
      .catch(error => console.error('Error updating user type in PostgreSQL:', error));
      
      // Navigate immediately without waiting
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert(
        'Error',
        'Failed to set user type. Please try again.'
      );
    }
  };

  const handleFirstResponder = async () => {
    try {
      const currentUser = auth().currentUser;
      
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      
      const userId = currentUser.phoneNumber || currentUser.uid;
      
      // Update user document with first responder role in Firebase
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          role: 'responder',
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      
      // True fire and forget - don't use await, don't use promises
      // This will run in the background without blocking or waiting for completion
      fetch(`${API_BASE_URL}/api/users/${userId}/type`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType: 'first_responder'
        })
      })
      .then(response => console.log('User type update response:', response.status))
      .catch(error => console.error('Error updating user type in PostgreSQL:', error));
      
      // Navigate immediately without waiting
      navigation.navigate('FirstResponder');
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert(
        'Error',
        'Failed to set user type. Please try again.'
      );
    }
  };

  return (
    <View style={authStyles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[authStyles.topSection, dynamicStyles.topSection]}>
        <AuthLogo dynamicStyles={dynamicStyles} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Select User Type</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleEmergencyUser}
        >
          <Text style={styles.buttonText}>Emergency User</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleFirstResponder}
        >
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
    marginTop: -50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
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
