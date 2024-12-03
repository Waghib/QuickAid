import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import UserTypeSelectionScreen from './src/screens/UserTypeSelectionScreen';
import FirstResponderScreen from './src/screens/FirstResponderScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName='SignUp'
        screenOptions={{ 
          headerShown: false,
        }}
      >
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
        <Stack.Screen name="FirstResponder" component={FirstResponderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;