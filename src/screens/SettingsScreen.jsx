import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const settingsOptions = [
    { title: 'Notifications', group: 1 },
    { title: 'Security', group: 1 },
    { title: 'Language', group: 1 },
    { title: 'Clear cache', group: 2 },
    { title: 'Terms & Privacy Policy', group: 2 },
    { title: 'Contact us', group: 2 },
  ];

  const handleOptionPress = (option) => {
    navigation.navigate(option.replace(/\s+/g, ''));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Account Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Profile Card */}
      <TouchableOpacity 
        style={styles.profileSection}
        onPress={() => navigation.navigate('Profile')}
      >
        <Image
          source={require('../assets/profile.png')}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Aly Khan</Text>
          <Text style={styles.memberStatus}>Gold Member</Text>
        </View>
        <Text style={styles.rightArrow}>→</Text>
      </TouchableOpacity>

      {/* Preferences */}
      <View style={styles.optionsContainer}>
        {settingsOptions
          .filter(option => option.group === 1)
          .map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionItem}
              onPress={() => handleOptionPress(option.title)}
            >
              <Text style={styles.optionText}>{option.title}</Text>
              <Text style={styles.rightArrow}>→</Text>
            </TouchableOpacity>
          ))}
      </View>

      {/* Other Settings */}
      <View style={styles.optionsContainer}>
        {settingsOptions
          .filter(option => option.group === 2)
          .map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionItem}
              onPress={() => handleOptionPress(option.title)}
            >
              <Text style={styles.optionText}>{option.title}</Text>
              <Text style={styles.rightArrow}>→</Text>
            </TouchableOpacity>
          ))}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light gray background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberStatus: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  backButton: {
    fontSize: 30,
    color: 'white',
    paddingHorizontal: 8,
  },
  rightArrow: {
    fontSize: 30,
    color: '#666',
    paddingHorizontal: 8,
  },
  separator: {
    height: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  groupSeparator: {
    height: 8,
    backgroundColor: '#f5f5f5',
    marginVertical: 8,
  },
});

export default SettingsScreen; 