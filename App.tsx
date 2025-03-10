import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import SignUpScreen from './src/screens/SignUpScreen';
import SignInScreen from './src/screens/SignInScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import UserTypeSelectionScreen from './src/screens/UserTypeSelectionScreen';
import FirstResponderScreen from './src/screens/FirstResponderScreen';
import Home from './src/screens/Home';
import Training from './src/screens/Training';
import ResponderHome from './src/screens/ResponderHome';
import AccountScreen from './src/screens/AccountScreen';
import ResponderAccount from './src/screens/ResponderAccount';
import Help from './src/screens/Help';
import Certification from './src/screens/Certification';

// Define the type for the navigation stack
type RootStackParamList = {
  SignUp: { prefillPhone?: string } | undefined;
  SignIn: undefined;
  OTPVerification: { phoneNumber: string; name?: string; isSignUp: boolean };
  UserTypeSelection: undefined;
  FirstResponder: undefined;
  Home: undefined;
  Training: undefined;
  ResponderHome: undefined;
  AccountScreen: undefined;
  ResponderAccount: undefined;
  Help: undefined;
  Certification: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [initializing, setInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Handle user state changes
  async function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    
    if (user) {
      // Fetch user role from Firestore
      try {
        const userDoc = await firestore().collection('users').doc(user.phoneNumber || '').get();
        if (userDoc.exists) {
          setUserRole(userDoc.data()?.role);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    // Subscribe to auth state changes
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);


  // Show loading screen while initializing
  if (initializing) {
    return null; // Or a loading spinner
  }

  // Determine initial route based on authentication state
  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!user) {
      return 'SignUp';
    } else if (userRole === 'responder') {
      return 'ResponderHome';
    } else if (userRole === 'emergency') {
      return 'Home';
    } else {
      return 'UserTypeSelection';
    }
  };

  return (
    <NavigationContainer>
      {/* 
        Navigation structure prevents users from returning to authentication screens
        after login, as per the app's security design
      */}
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false
        }}
      >
        {!user ? (
          // Auth screens - only shown to unauthenticated users
          <>
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          </>
        ) : (
          // App screens - only shown to authenticated users
          <>
            <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
            <Stack.Screen name="FirstResponder" component={FirstResponderScreen} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Training" component={Training} />
            <Stack.Screen name="ResponderHome" component={ResponderHome} />
            <Stack.Screen name="AccountScreen" component={AccountScreen} />
            <Stack.Screen name="ResponderAccount" component={ResponderAccount} />
            <Stack.Screen name="Help" component={Help} />
            <Stack.Screen name="Certification" component={Certification} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;