import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>{"❮"}</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2B95E1',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: width * 0.06,
    fontWeight: 'bold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 0.05,
    backgroundColor: '#fff',
    marginVertical: height * 0.01,
    marginHorizontal: width * 0.04,
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
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberStatus: {
    fontSize: width * 0.035,
    color: '#666',
    fontWeight: '500',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: width * 0.04,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: height * 0.02,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: width * 0.04,
    color: '#333',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backArrow: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  rightArrow: {
    fontSize: width * 0.07,
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