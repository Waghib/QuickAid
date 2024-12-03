import React from 'react';
import { View, Text } from 'react-native';
import { authStyles } from '../styles/authStyles';

export const AuthLogo = React.memo(({ dynamicStyles }) => (
  <View style={authStyles.logoContainer}>
    <Text style={[authStyles.logoText, dynamicStyles.logoText]}>
      <Text style={authStyles.quickText}>QUICKAID</Text>
    </Text>
    <Text style={[authStyles.tagline, dynamicStyles.tagline]}>
      Your Health Companion
    </Text>
  </View>
));
