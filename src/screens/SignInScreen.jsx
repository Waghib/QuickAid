import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const SignInScreen = () => {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Calculate responsive sizes
  const getFontSize = (size) => (width * size) / 430; // Increased base width
  const getVerticalSpacing = (size) => (height * size) / 900; // Increased base height

  const dynamicStyles = {
    topSection: {
      height: height * 0.25, // Reduced from 0.28
    },
    logoText: {
      fontSize: getFontSize(38), // Reduced from 42
    },
    tagline: {
      fontSize: getFontSize(16), // Reduced from 18
      marginTop: getVerticalSpacing(12),
    },
    toggleContainer: {
      marginTop: -getVerticalSpacing(20),
      padding: width * 0.012, // Reduced from 0.015
    },
    toggleButton: {
      padding: width * 0.03, // Reduced from 0.04
    },
    toggleText: {
      fontSize: getFontSize(14), // Reduced from 16
    },
    inputContainer: {
      padding: width * 0.04, // Reduced from 0.05
      gap: getVerticalSpacing(14),
    },
    input: {
      fontSize: getFontSize(14), // Reduced from 16
      padding: width * 0.035,
    },
    buttonText: {
      fontSize: getFontSize(14), // Reduced from 16
    },
    termsText: {
      fontSize: getFontSize(12), // Reduced from 14
      marginTop: getVerticalSpacing(18),
    },
  };

  // Phone validation function
  const validatePhone = (text) => {
    // Pakistan mobile format: 3XX-XXXXXXX (10 digits total)
    const phoneRegex = /^3\d{2}-\d{7}$/;
    
    if (text.length === 0) {
      setPhoneError('Phone number is required');
      return false;
    } else if (!phoneRegex.test(text)) {
      setPhoneError('Enter a valid mobile number (3XX-XXXXXXX)');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };

  const handlePhoneChange = (text) => {
    // Remove any non-digit characters from input
    const digitsOnly = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10);
    
    // Format the number with hyphen
    let formattedNumber = '';
    if (limitedDigits.length > 0) {
      // First 3 digits
      formattedNumber = limitedDigits.slice(0, 3);
      // Add remaining digits with hyphen
      if (limitedDigits.length > 3) {
        formattedNumber += '-' + limitedDigits.slice(3);
      }
    }
    
    setPhoneNumber(formattedNumber);
    validatePhone(formattedNumber);
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleSignIn = async () => {
    const isPhoneValid = validatePhone(phoneNumber);

    if (isPhoneValid) {
      try {
        // Remove hyphen before sending
        const cleanNumber = phoneNumber.replace(/-/g, '');
        const fullPhoneNumber = `+92${cleanNumber}`;

        // Check if user exists in Firestore
        const userDoc = await firestore()
          .collection('users')
          .doc(fullPhoneNumber)
          .get();

        if (!userDoc.exists) {
          Alert.alert(
            'Account Not Found', 
            'This phone number is not registered. Please sign up first.'
          );
          navigation.navigate('SignUp');
          return;
        }

        // Update last login timestamp
        await firestore()
          .collection('users')
          .doc(fullPhoneNumber)
          .update({
            lastLogin: firestore.FieldValue.serverTimestamp()
          });

        console.log('User signed in successfully');

        // If user exists, proceed to OTP verification
        navigation.navigate('OTPVerification', { 
          phoneNumber: fullPhoneNumber,
          name: userDoc.data().name // Pass the user's name from Firestore
        });

      } catch (error) {
        console.error('Sign in error:', error);
        Alert.alert(
          'Error',
          'Unable to sign in. Please check your internet connection and try again.'
        );
      }
    } else {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
    }
  };

  // Add this function to check if phone number is complete
  const isPhoneComplete = (number) => {
    return number.length === 11; // 10 digits + 1 hyphen
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[styles.topSection, dynamicStyles.topSection]}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, dynamicStyles.logoText]}>
            <Text style={styles.quickText}>QUICK</Text>
            <Text style={styles.quickText}>AID</Text>
          </Text>
          <Text style={[styles.tagline, dynamicStyles.tagline]}>
            Your Health Companion
          </Text>
        </View>
      </View>

      <View style={[styles.toggleContainer, dynamicStyles.toggleContainer]}>
        <TouchableOpacity 
          style={[styles.inactiveToggle, dynamicStyles.toggleButton]}
          onPress={handleSignUp}
        >
          <Text style={[styles.inactiveToggleText, dynamicStyles.toggleText]}>
            Sign Up
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.activeToggle, dynamicStyles.toggleButton]}>
          <Text style={[styles.activeToggleText, dynamicStyles.toggleText]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={[styles.inputContainer, dynamicStyles.inputContainer]}>
        <View>
          <View style={styles.phoneContainer}>
            <View style={styles.countryCode}>
              <Text>🇵🇰</Text>
              <Text style={styles.countryCodeText}>+92</Text>
            </View>
            <TextInput
              style={[styles.phoneInput, phoneError ? styles.inputError : null]}
              placeholder="3XX-XXXXXXX"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={11}
            />
          </View>
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.signInButton,
          !isPhoneComplete(phoneNumber) ? styles.disabledButton : null
        ]}
        onPress={handleSignIn}
        disabled={!isPhoneComplete(phoneNumber)}
      >
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Google Sign In */}
      <TouchableOpacity style={styles.googleButton}>
        <Text style={styles.googleButtonText}>Connect with Google</Text>
      </TouchableOpacity>

      {/* Terms and Conditions */}
      <Text style={[styles.termsText, dynamicStyles.termsText]}>
        By clicking sign in you agree to our Terms and Conditions
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    height: '25%',
    backgroundColor: '#2B95E1',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '700',
    letterSpacing: 2,
  },
  quickText: {
    color: '#FFFFFF',
  },
  tagline: {
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: '5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeToggle: {
    flex: 1,
    backgroundColor: '#2B95E1',
    borderRadius: 8,
    alignItems: 'center',
  },
  inactiveToggle: {
    flex: 1,
    alignItems: 'center',
  },
  activeToggleText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inactiveToggleText: {
    color: '#666666',
  },
  inputContainer: {
    padding: 20,
    gap: 15,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: '3.5%',
    fontSize: 14,
    color: '#666666',
  },
  signInButton: {
    backgroundColor: '#2B95E1',
    marginHorizontal: '5%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleButtonText: {
    color: '#666666',
    fontSize: 14,
  },
  termsText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 12,
    marginTop: '5%',
    marginHorizontal: '5%',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#B0BEC5',
  },
});

export default SignInScreen; 