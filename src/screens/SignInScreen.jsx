import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { authStyles } from '../styles/authStyles';
import { getDynamicStyles } from '../styles/dynamicStyles';
import { AuthLogo, AuthInput, AuthButton } from '../components/authComponents';

const SignInScreen = () => {
  const { height, width } = useWindowDimensions();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const navigation = useNavigation();

  const dynamicStyles = getDynamicStyles(width, height);

  // Clean up resources when screen loses focus
  useFocusEffect(
    useCallback(() => {
      // This function runs when the screen comes into focus
      console.log('SignInScreen is now focused');
      
      // Return a cleanup function that runs when the screen loses focus
      return () => {
        console.log('SignInScreen lost focus - cleaning up resources');
        // Reset form state when screen is unfocused
        setPhoneNumber('');
        setPhoneError('');
      };
    }, [])
  );

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
        const cleanNumber = phoneNumber.replace(/-/g, '');
        const fullPhoneNumber = `+92${cleanNumber}`;

        // Check Firebase
        const userDoc = await firestore()
          .collection('users')
          .doc(fullPhoneNumber)
          .get();

        if (!userDoc.exists) {
          Alert.alert(
            'Account Not Found', 
            'This phone number is not registered. Please sign up first.'
          );
          
          // Format the phone number with a dash after 3 digits
          const formattedPhone = cleanNumber.length >= 3 
            ? `${cleanNumber.substring(0, 3)}-${cleanNumber.substring(3)}`
            : cleanNumber;
            
          // Pass the formatted phone number to SignUp screen
          navigation.navigate('SignUp', { 
            prefillPhone: formattedPhone 
          });
          return;
        }

        // Update Firebase last login
        await firestore()
          .collection('users')
          .doc(fullPhoneNumber)
          .update({
            lastLogin: firestore.FieldValue.serverTimestamp()
          });

        // Update PostgreSQL last login (fire and forget)
        fetch('http://10.0.2.2:5000/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: fullPhoneNumber
          })
        }).catch(error => {
          console.error('PostgreSQL login fetch error:', error);
          // We're ignoring errors here since Firebase authentication was successful
        });

        // Show success message and navigate
        Alert.alert(
          'Success',
          'Login successful!',
          [{
            text: 'OK',
            onPress: () => {
              navigation.navigate('OTPVerification', { 
                phoneNumber: fullPhoneNumber,
                isSignUp: false
              });
            }
          }]
        );
      } catch (error) {
        console.error('==== Error in Sign In ====');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        Alert.alert(
          'Error',
          'Unable to sign in. Please check your internet connection and try again.'
        );
      }
    } else {
      console.log('Phone validation failed');
      Alert.alert('Validation Error', 'Please enter a valid phone number');
    }
  };

  // Add this function to check if phone number is complete
  const isPhoneComplete = (number) => {
    return number.length === 11; // 10 digits + 1 hyphen
  };

  return (
    <View style={authStyles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[authStyles.topSection, dynamicStyles.topSection]}>
        <AuthLogo dynamicStyles={dynamicStyles} />
      </View>

      <View style={[authStyles.toggleContainer, dynamicStyles.toggleContainer]}>
        <TouchableOpacity 
          style={[authStyles.inactiveToggle, dynamicStyles.toggleButton]}
          onPress={handleSignUp}
        >
          <Text style={[authStyles.inactiveToggleText, dynamicStyles.toggleText]}>
            Sign Up
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[authStyles.activeToggle, dynamicStyles.toggleButton]}>
          <Text style={[authStyles.activeToggleText, dynamicStyles.toggleText]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={[authStyles.inputContainer, dynamicStyles.inputContainer]}>
        <View>
          <View style={authStyles.phoneContainer}>
            <View style={authStyles.countryCode}>
              <Text>🇵🇰</Text>
              <Text style={authStyles.countryCodeText}>+92</Text>
            </View>
            <TextInput
              style={[authStyles.phoneInput, phoneError ? authStyles.inputError : null]}
              placeholder="3XX-XXXXXXX"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={11}
            />
          </View>
          {phoneError ? <Text style={authStyles.errorText}>{phoneError}</Text> : null}
        </View>
      </View>

      <TouchableOpacity 
        style={[
          authStyles.actionButton,
          !isPhoneComplete(phoneNumber) ? authStyles.disabledButton : null
        ]}
        onPress={() => {
          handleSignIn();
        }}
        disabled={!isPhoneComplete(phoneNumber)}
      >
        <Text style={authStyles.actionButtonText}>Sign In</Text>
      </TouchableOpacity>

      {/* Google Sign In */}
      <TouchableOpacity style={authStyles.googleButton}>
        <Text style={authStyles.googleButtonText}>Connect with Google</Text>
      </TouchableOpacity>

      {/* Terms and Conditions */}
      <Text style={[authStyles.termsText, dynamicStyles.termsText]}>
        By clicking sign in you agree to our Terms and Conditions
      </Text>
    </View>
  );
};

export default SignInScreen; 