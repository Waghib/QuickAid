import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const OTPVerificationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      console.log('Verifying OTP:', otpString);
      // Add your OTP verification logic here
      // For example:
      // verifyOTP(otpString).then(() => {
      //   navigation.navigate('Home');
      // });
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

  // Calculate responsive sizes
  const getFontSize = (size) => (width * size) / 430;
  const getVerticalSpacing = (size) => (height * size) / 900;

  const dynamicStyles = {
    topSection: {
      height: height * 0.25,
    },
    title: {
      fontSize: getFontSize(24),
      marginTop: getVerticalSpacing(70),
    },
    subtitle: {
      fontSize: getFontSize(14),
    },
    otpContainer: {
      marginTop: getVerticalSpacing(60),
      gap: width * 0.02,
    },
    otpInput: {
      width: width * 0.12,
      height: width * 0.12,
      borderWidth: 2,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      textAlign: 'center',
      fontSize: getFontSize(24),
      fontWeight: 'bold',
      backgroundColor: '#F5F5F5',
      paddingTop: 8,
      paddingBottom: 0,
      textAlignVertical: 'center',
      includeFontPadding: false,
      lineHeight: width * 0.12 - 10,
    },
    verifyButton: {
      marginTop: getVerticalSpacing(40),
      padding: width * 0.035,
    },
    verifyText: {
      fontSize: getFontSize(16),
    },
    resendText: {
      fontSize: getFontSize(14),
      marginTop: getVerticalSpacing(20),
    },
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[styles.topSection, dynamicStyles.topSection]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Text style={styles.backArrow}>{"❮"}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, dynamicStyles.title]}>
          Phone Verification
        </Text>
        <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
          Enter your OTP code sent to {phoneNumber}
        </Text>
      </View>

      <View style={[styles.otpContainer, dynamicStyles.otpContainer]}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[styles.otpInput, dynamicStyles.otpInput]}
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
          styles.verifyButton,
          dynamicStyles.verifyButton,
          !otp.every(digit => digit) && styles.disabledButton
        ]}
        onPress={handleVerify}
        disabled={!otp.every(digit => digit)}
      >
        <Text style={[styles.verifyButtonText, dynamicStyles.verifyText]}>
          Verify Now
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendContainer}>
        <Text style={[styles.resendText, dynamicStyles.resendText]}>
          Didn't receive code?{' '}
        </Text>
        <Text style={[styles.resendLink, dynamicStyles.resendText]}>
          Resend
        </Text>
      </TouchableOpacity>
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
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.95,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: '5%',
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#F5F5F5',
    paddingTop: 8,
    paddingBottom: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 40,
  },
  verifyButton: {
    backgroundColor: '#2B95E1',
    marginHorizontal: '5%',
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#B0BEC5',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    color: '#666666',
  },
  resendLink: {
    color: '#2B95E1',
    fontWeight: '600',
  },
});

export default OTPVerificationScreen;
