import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { authStyles } from '../styles/authStyles';
import { getDynamicStyles } from '../styles/dynamicStyles';
import firestore from '@react-native-firebase/firestore';

const OTPVerificationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const { phoneNumber, name, isSignUp } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirm, setConfirm] = useState(null);
  const inputRefs = useRef([]);

  const dynamicStyles = getDynamicStyles(width, height);

  useEffect(() => {
    signInWithPhoneNumber();
  }, []);

  const signInWithPhoneNumber = async () => {
    try {
      Alert.alert('OTP Sent', 'Please check your phone for the verification code.');
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (!isSignUp) {
        Alert.alert(
          'Error',
          'Failed to send verification code. Please try again.'
        );
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      try {
        const credential = await confirm.confirm(otpString);
        if (credential) {
          await handleSuccessfulVerification();
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
        Alert.alert(
          'Invalid Code',
          'The verification code you entered is invalid. Please try again.',
          [
            {
              text: 'OK',
              // onPress: () => navigation.navigate('SignIn')
            }
          ]
        );
      }
    }
  };


  const handleSuccessfulVerification = async () => {
    try {
      // Check user role in Firestore if not signing up
      if (!isSignUp) {
        const userDoc = await firestore()
          .collection('users')
          .doc(phoneNumber)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          
          // Show alert and navigate after user confirms
          Alert.alert(
            'Success',
            'Phone number verified successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate based on role after alert confirmation
                  if (userData.role === 'responder') {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'ResponderHome' }],
                    });
                  } else if (userData.role === 'emergency') {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Home' }],
                    });
                  } else {
                    // If role is not set, send to UserTypeSelection
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'UserTypeSelection' }],
                    });
                  }
                }
              }
            ],
            { cancelable: false }
          );
        }
      } else {
        // For new sign ups, always go to UserTypeSelection
        Alert.alert(
          'Success',
          'Phone number verified successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'UserTypeSelection' }],
              })
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Error in handleSuccessfulVerification:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.'
      );
    }
  };

  const handleOtpChange = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    
    if (cleanText.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = cleanText;
      setOtp(newOtp);
      
      // Auto-focus next input if a digit was entered
      if (cleanText.length === 1 && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      const newOtp = [...otp];
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      await signInWithPhoneNumber();
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert(
        'Error',
        'Failed to resend verification code. Please try again.'
      );
    }
  };

  return (
    <View style={authStyles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[authStyles.topSection, dynamicStyles.topSection]}>
        <TouchableOpacity onPress={handleBack} style={authStyles.backButton}>
          <Text style={authStyles.backArrow}>{"❮"}</Text>
        </TouchableOpacity>
        <Text style={[authStyles.title, dynamicStyles.title]}>
          Phone Verification
        </Text>
        <Text style={[authStyles.subtitle, dynamicStyles.subtitle]}>
          Enter your OTP code sent to {phoneNumber}
        </Text>
      </View>
      
      <View style={[authStyles.otpContainer, dynamicStyles.otpContainer]}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              authStyles.otpInput, 
              dynamicStyles.otpInput,
              {
                textAlign: 'center',
                textAlignVertical: 'center',
                includeFontPadding: false,
                padding: 0,
                lineHeight: undefined
              }
            ]}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            editable={true}
            selectTextOnFocus={true}
            caretHidden={true}
          />
        ))}
      </View>
      
      <TouchableOpacity 
        style={[
          authStyles.verifyButton,
          dynamicStyles.verifyButton,
          !otp.every(digit => digit) && authStyles.disabledButton
        ]}
        onPress={handleVerify}
        disabled={!otp.every(digit => digit)}
      >
        <Text style={[authStyles.verifyButtonText, dynamicStyles.verifyText]}>
          Verify Now
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={authStyles.resendContainer} onPress={handleResendOTP}>
        <Text style={[authStyles.resendText, dynamicStyles.resendText]}>
          Didn't receive code?{' '}
          <Text style={authStyles.resendLink}>Resend</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPVerificationScreen;
