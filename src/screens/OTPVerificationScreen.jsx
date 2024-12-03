import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { authStyles } from '../styles/authStyles';
import { getDynamicStyles } from '../styles/dynamicStyles';

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
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
      Alert.alert('OTP Sent', 'Please check your phone for the verification code.');
    } catch (error) {
      console.error('Error sending OTP:', error);
      // Alert.alert(
      //   'Error',
      //   'Failed to send verification code. Please try again.'
      // );
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
          Alert.alert(
            'Success',
            'Phone number verified successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  if (isSignUp) {
                    navigation.navigate('UserTypeSelection');
                  } else {
                    navigation.navigate('Home');
                  }
                }
              }
            ]
          );
        }
      } catch (error) {
        // console.error('Error verifying OTP:', error);
        navigation.navigate('UserTypeSelection');
        // Alert.alert(
        //   'Invalid Code',
        //   'The verification code you entered is invalid. Please try again.'
        // );
      }
    }
  };

  const handleOtpChange = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);

    if (cleanText && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
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
        <TouchableOpacity 
          style={authStyles.backButton} 
          onPress={handleBack}
        >
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
            style={[authStyles.otpInput, dynamicStyles.otpInput]}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            textAlignVertical="center"
            includeFontPadding={false}
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

      <TouchableOpacity 
        style={authStyles.resendContainer}
        onPress={handleResendOTP}
      >
        <Text style={[authStyles.resendText, dynamicStyles.resendText]}>
          Didn't receive code?{' '}
        </Text>
        <Text style={[authStyles.resendLink, dynamicStyles.resendText]}>
          Resend
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPVerificationScreen;
