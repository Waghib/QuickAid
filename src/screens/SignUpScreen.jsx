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

const SignUpScreen = () => {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Calculate responsive sizes
  const getFontSize = (size) => (width * size) / 430;
  const getVerticalSpacing = (size) => (height * size) / 900;

  const dynamicStyles = {
    topSection: {
      height: height * 0.25,
    },
    logoText: {
      fontSize: getFontSize(38),
    },
    tagline: {
      fontSize: getFontSize(16),
      marginTop: getVerticalSpacing(12),
    },
    toggleContainer: {
      marginTop: -getVerticalSpacing(20),
      padding: width * 0.012,
    },
    toggleButton: {
      padding: width * 0.03,
    },
    toggleText: {
      fontSize: getFontSize(14),
    },
    inputContainer: {
      padding: width * 0.04,
      gap: getVerticalSpacing(14),
    },
    input: {
      fontSize: getFontSize(14),
      padding: width * 0.035,
    },
    buttonText: {
      fontSize: getFontSize(14),
    },
    termsText: {
      fontSize: getFontSize(12),
      marginTop: getVerticalSpacing(18),
    },
  };

  // Name validation
  const validateName = (text) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    
    if (text.length === 0) {
      setNameError('Name is required');
      return false;
    } else if (!nameRegex.test(text)) {
      setNameError('Name should only contain letters');
      return false;
    } else {
      setNameError('');
      return true;
    }
  };

  // Phone validation
  const validatePhone = (text) => {
    // Pakistan mobile format: 3XX-XXXXXXX (10 digits total)
    const phoneRegex = /^3\d{2}-\d{7}$/;
    
    if (text.length === 0) {
      setPhoneError('Phone number is required');
      return false;
    } else if (!phoneRegex.test(text)) {
      setPhoneError('Enter valid Pakistan mobile number (3XX-XXXXXXX)');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };

  const handleNameChange = (text) => {
    // Only allow letters and spaces
    const cleanName = text.replace(/[^A-Za-z\s]/g, '');
    setName(cleanName);
    validateName(cleanName);
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

  const handleSignIn = () => {
    navigation.navigate('SignIn', {
      transition: 'slide_from_right'
    });
  };

  const handleSignUp = () => {
    const isNameValid = validateName(name);
    const isPhoneValid = validatePhone(phoneNumber);

    if (isNameValid && isPhoneValid) {
      // Remove hyphen before sending
      const cleanNumber = phoneNumber.replace(/-/g, '');
      navigation.navigate('OTPVerification', { phoneNumber: `+92${cleanNumber}` });
    }
  };

  // Add this function to check if phone number is complete
  const isPhoneComplete = (number) => {
    return number.length === 11; // 10 digits + 1 hyphen
  };

  // Add this function to check if name is complete (at least 3 characters)
  const isNameComplete = (name) => {
    return name.trim().length >= 3;
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[styles.topSection, dynamicStyles.topSection]}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, dynamicStyles.logoText]}>
            <Text style={styles.quickText}>QUICKAID</Text>
          </Text>
          <Text style={[styles.tagline, dynamicStyles.tagline]}>
            Your Health Companion
          </Text>
        </View>
      </View>

      <View style={[styles.toggleContainer, dynamicStyles.toggleContainer]}>
        <TouchableOpacity style={[styles.activeToggle, dynamicStyles.toggleButton]}>
          <Text style={[styles.activeToggleText, dynamicStyles.toggleText]}>
            Sign Up
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.inactiveToggle, dynamicStyles.toggleButton]}
          onPress={handleSignIn}
        >
          <Text style={[styles.inactiveToggleText, dynamicStyles.toggleText]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.inputContainer, dynamicStyles.inputContainer]}>
        <TextInput
          style={[styles.input, nameError ? styles.inputError : null]}
          placeholder="Full Name"
          value={name}
          onChangeText={handleNameChange}
          placeholderTextColor="#999"
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

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

      <TouchableOpacity 
        style={[
          styles.signUpButton,
          (!isNameComplete(name) || !isPhoneComplete(phoneNumber)) ? styles.disabledButton : null
        ]}
        onPress={handleSignUp}
        disabled={!isNameComplete(name) || !isPhoneComplete(phoneNumber)}
      >
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton}>
        <Text style={styles.googleButtonText}>Connect with Google</Text>
      </TouchableOpacity>

      <Text style={[styles.termsText, dynamicStyles.termsText]}>
        By clicking sign up you agree to our Terms and Conditions
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
    marginTop: -20,
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
    padding: '5%',
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: '4%',
    fontSize: 16,
    color: '#666666',
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
  signUpButton: {
    backgroundColor: '#2B95E1',
    marginHorizontal: '5%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: '5%',
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

export default SignUpScreen;
