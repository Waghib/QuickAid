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

const SignUpScreen = ({ route }) => {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(route.params?.prefillPhone || '');
  const [phoneError, setPhoneError] = useState('');

  const dynamicStyles = getDynamicStyles(width, height);

  // Validate prefilled phone number when component mounts
  useEffect(() => {
    if (route.params?.prefillPhone) {
      validatePhone(route.params.prefillPhone);
    }
  }, [route.params?.prefillPhone]);

  // Clean up resources when screen loses focus
  useFocusEffect(
    useCallback(() => {
      // This function runs when the screen comes into focus
      console.log('SignUpScreen is now focused');
      
      // Return a cleanup function that runs when the screen loses focus
      return () => {
        console.log('SignUpScreen lost focus - cleaning up resources');
        // Reset form state when screen is unfocused
        setName('');
        setPhoneNumber(route.params?.prefillPhone || '');
        setNameError('');
        setPhoneError('');
      };
    }, [route.params?.prefillPhone])
  );

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
      setPhoneError('Enter valid mobile number (3XX-XXXXXXX)');
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
    navigation.navigate('SignIn');
  };

  const handleSignUp = async () => {
    const isNameValid = validateName(name);
    const isPhoneValid = validatePhone(phoneNumber);
  
    if (isNameValid && isPhoneValid) {
      try {
        // Remove hyphen before sending
        const cleanNumber = phoneNumber.replace(/-/g, '');
        const fullPhoneNumber = `+92${cleanNumber}`;
  
        // Check if user exists in Firebase
        const userDoc = await firestore()
          .collection('users')
          .doc(fullPhoneNumber)
          .get();
  
        if (userDoc.exists) {
          Alert.alert('Error', 'This phone number is already registered!');
          return;
        }
  
        // Create user in Firebase
        await firestore()
          .collection('users')
          .doc(fullPhoneNumber)
          .set({
            name: name,
            phoneNumber: fullPhoneNumber,
            createdAt: firestore.FieldValue.serverTimestamp(),
            lastLogin: firestore.FieldValue.serverTimestamp()
          });
  
        // Create user in PostgreSQL
        try {
          // "Fire and forget" approach - don't wait for response
          fetch('http://10.0.2.2:5000/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: fullPhoneNumber,
              name: name,
              contactInfo: fullPhoneNumber,
              latitude: 0,
              longitude: 0
            })
          }).catch(error => {
            console.error('Fetch error:', error);
            // We're ignoring errors here since we know the user is created server-side
          });
          
          // Proceed immediately without waiting for response
          Alert.alert(
            'Success', 
            'Account created successfully!',
            [{
              text: 'OK',
              onPress: () => {
                navigation.navigate('OTPVerification', { 
                  phoneNumber: fullPhoneNumber,
                  name: name,
                  isSignUp: true
                });
              }
            }]
          );
        } catch (outerError) {
          // Handle any errors in the try block
          Alert.alert('Error', 'Outer error: ' + outerError.message, [{ 
            text: 'OK',
            onPress: () => {
              navigation.navigate('OTPVerification', { 
                phoneNumber: fullPhoneNumber,
                name: name,
                isSignUp: true
              });
            }
          }]);
        }
      } catch (error) {
        console.error('Signup error:', error);
        Alert.alert(
          'Error',
          'Unable to create account. Please try again later.'
        );
      }
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
    <View style={authStyles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[authStyles.topSection, dynamicStyles.topSection]}>
        <AuthLogo dynamicStyles={dynamicStyles} />
      </View>

      <View style={[authStyles.toggleContainer, dynamicStyles.toggleContainer]}>
        <TouchableOpacity style={[authStyles.activeToggle, dynamicStyles.toggleButton]}>
          <Text style={[authStyles.activeToggleText, dynamicStyles.toggleText]}>
            Sign Up
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[authStyles.inactiveToggle, dynamicStyles.toggleButton]}
          onPress={handleSignIn}
        >
          <Text style={[authStyles.inactiveToggleText, dynamicStyles.toggleText]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[authStyles.inputContainer, dynamicStyles.inputContainer]}>
        <TextInput
          style={[authStyles.input, nameError ? authStyles.inputError : null]}
          placeholder="Full Name"
          value={name}
          onChangeText={handleNameChange}
          placeholderTextColor="#999"
        />
        {nameError ? <Text style={authStyles.errorText}>{nameError}</Text> : null}

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

      <TouchableOpacity 
        style={[
          authStyles.actionButton,
          (!isNameComplete(name) || !isPhoneComplete(phoneNumber)) ? authStyles.disabledButton : null
        ]}
        onPress={handleSignUp}
        disabled={!isNameComplete(name) || !isPhoneComplete(phoneNumber)}
      >
        <Text style={authStyles.actionButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={authStyles.googleButton}>
        <Text style={authStyles.googleButtonText}>Connect with Google</Text>
      </TouchableOpacity>

      <Text style={[authStyles.termsText, dynamicStyles.termsText]}>
        By clicking sign up you agree to our Terms and Conditions
      </Text>
    </View>
  );
};

export default SignUpScreen;
