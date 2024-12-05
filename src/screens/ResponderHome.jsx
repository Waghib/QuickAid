import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Image,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ResponderHome = () => {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleTraining = () => {
    setIsMenuVisible(false);
    setTimeout(() => {
      navigation.navigate('Training');
    }, 300);
  };

  const getFontSize = (size) => (width * size) / 430;
  const getVerticalSpacing = (size) => (height * size) / 900;

  const dynamicStyles = {
    mapContainer: {
      height: height * 0.75,
    },
    helpButton: {
      padding: width * 0.04,
      marginHorizontal: width * 0.05,
      marginBottom: getVerticalSpacing(20),
    },
    helpButtonText: {
      fontSize: getFontSize(16),
    },
  };

  const Menu = () => (
    <Modal
      visible={isMenuVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsMenuVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsMenuVisible(false)}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderText}>Menu</Text>
            </View>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleTraining}
            >
              <Text style={styles.menuItemText}>Training Videos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsMenuVisible(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.mapContainer, dynamicStyles.mapContainer]}>
        <Image
          source={require('../assets/map.png')}
          style={styles.mapImage}
          resizeMode="stretch"
        />
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.helpButton, dynamicStyles.helpButton]}
        >
          <Text style={[styles.helpButtonText, dynamicStyles.helpButtonText]}>
            View Requests
          </Text>
        </TouchableOpacity>
      </View>

      <Menu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#2B95E1',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingVertical: 20,
  },
  helpButton: {
    backgroundColor: '#2B95E1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: '70%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  menu: {
    flex: 1,
  },
  menuHeader: {
    backgroundColor: '#2B95E1',
    padding: 20,
    marginBottom: 20,
  },
  menuHeaderText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default ResponderHome; 