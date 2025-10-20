import React, { useState } from 'react';
import { 
  View, 
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet, 
  StatusBar, 
  useWindowDimensions, 
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authStyles } from '../styles/authStyles';
import { getDynamicStyles } from '../styles/dynamicStyles';
import { AuthLogo } from '../components/authComponents';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const FirstResponderScreen = () => {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const dynamicStyles = getDynamicStyles(width, height);

  const [cnic, setCnic] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [cnicError, setCnicError] = useState('');
  const [workerIdError, setWorkerIdError] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const formatCNIC = (text) => {
    // Remove any non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // Add hyphens after 5 and 12 digits
    let formatted = cleaned;
    if (cleaned.length > 5) {
      formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    if (cleaned.length > 12) {
      formatted = `${formatted.slice(0, 13)}-${formatted.slice(13)}`;
    }
    
    return formatted;
  };

  const handleCNICChange = (text) => {
    const formatted = formatCNIC(text);
    setCnic(formatted);
    
    // Validate CNIC format
    if (formatted.length > 0 && formatted.replace(/-/g, '').length !== 13) {
      setCnicError('CNIC must be 13 digits (XXXXX-XXXXXXX-X)');
    } else {
      setCnicError('');
    }
  };

  const handleWorkerIdChange = (text) => {
    // Only allow numbers and limit to 6 digits
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setWorkerId(cleaned);
    
    if (cleaned.length > 0 && cleaned.length !== 6) {
      setWorkerIdError('Worker ID must be 6 digits');
    } else {
      setWorkerIdError('');
    }
  };

  const handleVerify = async () => {
    // Validate both fields before proceeding
    if (!cnic || !workerId) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const cleanedCNIC = cnic.replace(/-/g, '');
    if (cleanedCNIC.length !== 13) {
      setCnicError('CNIC must be 13 digits');
      return;
    }

    if (workerId.length !== 6) {
      setWorkerIdError('Worker ID must be 6 digits');
      return;
    }

    try {
      const currentUser = auth().currentUser;
      
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Update user document in Firestore
      await firestore()
        .collection('users')
        .doc(currentUser.phoneNumber)
        .update({
          role: 'responder',
          cnic: cnic,
          workerId: workerId,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });

      Alert.alert(
        'Success', 
        'Verification successful!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ResponderHome')
          }
        ]
      );
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert(
        'Error',
        'Failed to verify. Please try again later.'
      );
    }
  };

  const isFormComplete = () => {
    const cleanedCNIC = cnic.replace(/-/g, '');
    return cleanedCNIC.length === 13 && workerId.length === 6;
  };

  const handleTrainingModules = () => {
    navigation.navigate('Training'); // You'll need to create this screen
  };

  return (
    <View style={authStyles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[authStyles.topSection, dynamicStyles.topSection]}>
        <TouchableOpacity 
          style={authStyles.backButton} 
          onPress={handleBack}
        >
          <Text style={authStyles.backArrow}>{"❮"}</Text>
        </TouchableOpacity>
        <AuthLogo dynamicStyles={dynamicStyles} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, cnicError ? styles.inputError : null]}
            value={cnic}
            onChangeText={handleCNICChange}
            placeholder="CNIC (XXXXX-XXXXXXX-X)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={15}
          />
          {cnicError ? <Text style={styles.errorText}>{cnicError}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, workerIdError ? styles.inputError : null]}
            value={workerId}
            onChangeText={handleWorkerIdChange}
            placeholder="Worker ID (6 digits)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={6}
          />
          {workerIdError ? <Text style={styles.errorText}>{workerIdError}</Text> : null}
        </View>

        <TouchableOpacity 
          style={[styles.button, !isFormComplete() && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={!isFormComplete()}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.trainingButton}
          onPress={handleTrainingModules}
        >
          <Text style={styles.trainingButtonText}>Access Training Modules</Text>
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
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: '#666666',
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#2B95E1',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  trainingButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#45A049',
  },
  trainingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FirstResponderScreen; 