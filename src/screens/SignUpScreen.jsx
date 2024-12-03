import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase, auth } from '../config/firebase';
import firestore from '@react-native-firebase/firestore';
import { authStyles } from '../styles/authStyles';
import { getDynamicStyles } from '../styles/dynamicStyles';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const dynamicStyles = getDynamicStyles(width, height);

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
      const maxRetries = 3;
      let retryCount = 0;

      const attemptSignUp = async () => {
        try {
          // Remove hyphen before sending
          const cleanNumber = phoneNumber.replace(/-/g, '');
          const fullPhoneNumber = `+92${cleanNumber}`;
  
          // Use firestore() to get the instance
          const userDoc = await firestore()
            .collection('users')
            .doc(fullPhoneNumber)
            .get();
  
          if (userDoc.exists) {
            Alert.alert('Error', 'This phone number is already registered!');
            return;
          }
  
          // Use firestore() consistently
          await firestore()
            .collection('users')
            .doc(fullPhoneNumber)
            .set({
              name: name,
              phoneNumber: fullPhoneNumber,
              createdAt: firestore.FieldValue.serverTimestamp(),
              lastLogin: firestore.FieldValue.serverTimestamp()
            });
  
            Alert.alert(
              'Success', 
              'Account created successfully!',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.navigate('OTPVerification', { 
                      phoneNumber: fullPhoneNumber,
                      name: name,
                      isSignUp: true
                    });
                  }
                }
              ]
            );
  
        } catch (error) {
          console.error('Signup error:', error);
          
          if (error.code === 'firestore/unavailable' && retryCount < maxRetries) {
            retryCount++;
            const backoffDelay = Math.pow(2, retryCount) * 1000;
            
            console.log(`Retry attempt ${retryCount} of ${maxRetries}. Waiting ${backoffDelay/1000} seconds...`);
            
            return new Promise((resolve) => {
              setTimeout(async () => {
                try {
                  resolve(await attemptSignUp());
                } catch (retryError) {
                  console.error('Retry failed:', retryError);
                  resolve(null);
                }
              }, backoffDelay);
            });
          }

          Alert.alert(
            'Error',
            'Unable to connect to the server. Please check your internet connection and try again later.'
          );
          return null;
        }
      };

      await attemptSignUp();
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
        <View style={authStyles.logoContainer}>
          <Text style={[authStyles.logoText, dynamicStyles.logoText]}>
            <Text style={authStyles.quickText}>QUICKAID</Text>
          </Text>
          <Text style={[authStyles.tagline, dynamicStyles.tagline]}>
            Your Health Companion
          </Text>
        </View>
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
