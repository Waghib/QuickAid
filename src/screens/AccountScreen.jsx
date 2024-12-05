import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authStyles } from '../styles/authStyles';

const AccountScreen = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignUp' }],
    });
  };

  const getFontSize = (size) => (width * size) / 430;
  const getVerticalSpacing = (size) => (height * size) / 900;

  const dynamicStyles = {
    topSection: {
      height: height * 0.2,
      paddingTop: getVerticalSpacing(40),
    },
    title: {
      fontSize: getFontSize(20),
    },
    itemText: {
      fontSize: getFontSize(16),
    },
    valueText: {
      fontSize: getFontSize(14),
    },
  };

  const AccountItem = ({ label, value }) => (
    <View style={styles.accountItem}>
      <Text style={[styles.itemText, dynamicStyles.itemText]}>{label}</Text>
      <Text style={[styles.valueText, dynamicStyles.valueText]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[authStyles.topSection, dynamicStyles.topSection]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>{"❮"}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, dynamicStyles.title]}>My Account</Text>
      </View>

      <ScrollView style={styles.content}>
        <AccountItem label="Name" value="Sarim khalil" />
        <AccountItem label="Phone number" value="+923187791013" />
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
    padding: 10,
  },
  backArrow: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 45,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  accountItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemText: {
    color: '#666666',
    marginBottom: 5,
  },
  valueText: {
    color: '#333333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AccountScreen; 