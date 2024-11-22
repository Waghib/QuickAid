import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SignInScreen = () => {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Calculate responsive sizes
  const getFontSize = (size) => (width * size) / 400; // Base width of 400
  const getVerticalSpacing = (size) => (height * size) / 800; // Base height of 800

  const dynamicStyles = {
    topSection: {
      height: height * 0.28,
    },
    logoText: {
      fontSize: getFontSize(42),
    },
    tagline: {
      fontSize: getFontSize(18),
      marginTop: getVerticalSpacing(15),
    },
    toggleContainer: {
      marginTop: -getVerticalSpacing(20),
      padding: width * 0.015,
    },
    toggleButton: {
      padding: width * 0.04,
    },
    toggleText: {
      fontSize: getFontSize(16),
    },
    inputContainer: {
      padding: width * 0.05,
      gap: getVerticalSpacing(16),
    },
    input: {
      fontSize: getFontSize(16),
      padding: width * 0.04,
    },
    buttonText: {
      fontSize: getFontSize(16),
    },
    termsText: {
      fontSize: getFontSize(14),
      marginTop: getVerticalSpacing(20),
    },
  };

  // Phone validation function
  const validatePhone = (text) => {
    const phoneRegex = /^\d{10}$/;
    const cleanNumber = text.replace(/[-\s]/g, '');
    
    if (cleanNumber.length === 0) {
      setPhoneError('Phone number is required');
      return false;
    } else if (!phoneRegex.test(cleanNumber)) {
      setPhoneError('Enter 10 digit mobile number');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };

  const handlePhoneChange = (text) => {
    // Only allow numbers, limit to 10 digits
    const cleanNumber = text.replace(/[^\d]/g, '').slice(0, 10);
    setPhoneNumber(cleanNumber);
    validatePhone(cleanNumber);
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    const isPhoneValid = validatePhone(phoneNumber);

    if (isPhoneValid) {
      navigation.navigate('OTPVerification', { phoneNumber: `+92${phoneNumber}` });
    } else {
      Alert.alert('Validation Error', 'Please check your input fields');
    }
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
        <TouchableOpacity style={[styles.inactiveToggle, dynamicStyles.toggleButton]}>
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
              placeholder="Mobile Number"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.signInButton,
          !phoneNumber ? styles.disabledButton : null
        ]}
        onPress={handleSignIn}
        disabled={!phoneNumber}
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
    height: '28%',
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
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 5,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: '4%',
    fontSize: 16,
    color: '#666666',
  },
  signInButton: {
    backgroundColor: '#2B95E1',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleButtonText: {
    color: '#666666',
    fontSize: 16,
  },
  termsText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
    marginTop: '5%',
    marginHorizontal: '5%',
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
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#B0BEC5',
  },
});

export default SignInScreen; 