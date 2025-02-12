import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Platform,
  Modal,
  PermissionsAndroid,
  Alert,
  Animated,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Separate Menu component
const SideMenu = ({ visible, onClose, onTraining, onAccount }) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.modalContainer,
          {
            opacity: fadeAnim
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }],
              opacity: fadeAnim
            }
          ]}
        >
          <View style={styles.menuHeader}>
            <Text style={styles.menuHeaderText}>Menu</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={onAccount}
          >
            <Text style={styles.menuItemText}>Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={onTraining}
          >
            <Text style={styles.menuItemText}>Training Videos</Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity 
          style={[styles.modalOverlay]}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>
    </Modal>
  );
};

const Home = () => {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [userLocation, setUserLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  // const [locationError, setLocationError] = useState(null);

  // const requestLocationPermission = async () => {
  //   try {
  //     if (Platform.OS === 'ios') {
  //       const auth = await Geolocation.requestAuthorization('whenInUse');
  //       if (auth === 'granted') {
  //         getCurrentLocation();
  //       }
  //     } else {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //         {
  //           title: "Location Permission",
  //           message: "This app needs access to your location to show you on the map.",
  //           buttonNeutral: "Ask Me Later",
  //           buttonNegative: "Cancel",
  //           buttonPositive: "OK"
  //         }
  //       );
  //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //         getCurrentLocation();
  //       } else {
  //         setLocationError('Location permission denied');
  //         Alert.alert('Permission Denied', 'Please enable location services to use this feature');
  //       }
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //     setLocationError('Error requesting location permission');
  //   }
  // };

  // const getCurrentLocation = () => {
  //   Geolocation.getCurrentPosition(
  //     (position) => {
  //       const { latitude, longitude } = position.coords;
  //       setUserLocation({
  //         latitude,
  //         longitude,
  //         latitudeDelta: 0.0922,
  //         longitudeDelta: 0.0421,
  //       });
  //       setLocationError(null);
  //     },
  //     (error) => {
  //       console.log('Location error:', error);
  //       setLocationError(error.message);
        
  //       // Check if location services are enabled
  //       if (error.code === error.POSITION_UNAVAILABLE) {
  //         Alert.alert(
  //           'Location Services Disabled',
  //           'Please enable location services in your device settings.',
  //           [
  //             {
  //               text: 'Open Settings',
  //               onPress: () => {
  //                 if (Platform.OS === 'ios') {
  //                   Linking.openURL('app-settings:');
  //                 } else {
  //                   Linking.openSettings();
  //                 }
  //               }
  //             },
  //             {
  //               text: 'Cancel',
  //               style: 'cancel'
  //             }
  //           ]
  //         );
  //       }
  //     },
  //     {
  //       enableHighAccuracy: true,
  //       timeout: 20000,
  //       maximumAge: 1000,
  //       distanceFilter: 10
  //     }
  //   );
  // };

  // useEffect(() => {
  //   const watchId = Geolocation.watchPosition(
  //     (position) => {
  //       const { latitude, longitude } = position.coords;
  //       setUserLocation({
  //         latitude,
  //         longitude,
  //         latitudeDelta: 0.0922,
  //         longitudeDelta: 0.0421,
  //       });
  //       setLocationError(null);
  //     },
  //     (error) => {
  //       console.log('Watch position error:', error);
  //       setLocationError(error.message);
  //     },
  //     {
  //       enableHighAccuracy: true,
  //       distanceFilter: 10,
  //       interval: 5000,
  //       fastestInterval: 2000
  //     }
  //   );

  //   // Request permission when component mounts
  //   requestLocationPermission();

  //   // Cleanup
  //   return () => {
  //     Geolocation.clearWatch(watchId);
  //   };
  // }, []);

  const handleTraining = () => {
    setIsMenuVisible(false);
    setTimeout(() => {
      navigation.navigate('Training');
    }, 300);
  };

  const handleAccount = () => {
    setIsMenuVisible(false);
    setTimeout(() => {
      navigation.navigate('AccountScreen');
    }, 300);
  };

  // Calculate dynamic styles based on screen dimensions
  const dynamicStyles = {
    header: {
      paddingVertical: height * 0.02,
      paddingHorizontal: width * 0.04,
    },
    menuIcon: {
      fontSize: Math.min(width, height) * 0.06,
    },
    mapContainer: {
      height: height * 0.75,
    },
    bottomButton: {
      paddingVertical: height * 0.02,
      paddingHorizontal: width * 0.04,
      marginHorizontal: width * 0.05,
      marginBottom: height * 0.02,
    },
    buttonText: {
      fontSize: Math.min(width, height) * 0.025,
    },
    menuHeaderText: {
      fontSize: Math.min(width, height) * 0.03,
    },
    menuItemText: {
      fontSize: Math.min(width, height) * 0.02,
    },
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsMenuVisible(true)}
        >
          <Text style={[styles.menuIcon, dynamicStyles.menuIcon]}>☰</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.mapContainer, dynamicStyles.mapContainer]}>
        {/* <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={userLocation}
          region={userLocation}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={true}
          onUserLocationChange={(event) => {
            const { latitude, longitude } = event.nativeEvent.coordinate;
            setUserLocation({
              latitude,
              longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          }}
        /> */}
        <Text style={styles.placeholderText}>Map functionality temporarily disabled</Text>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.helpButton, dynamicStyles.bottomButton]}
        >
          <Text style={[styles.helpButtonText, dynamicStyles.buttonText]}>
            Request for help
          </Text>
        </TouchableOpacity>
      </View>

      <SideMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onTraining={handleTraining}
        onAccount={handleAccount}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    color: '#FFFFFF',
  },
  mapContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: '70%',
    backgroundColor: '#FFFFFF',
    height: '100%',
    zIndex: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuHeader: {
    backgroundColor: '#2B95E1',
    padding: 20,
    marginBottom: 20,
  },
  menuHeaderText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuItemText: {
    color: '#333333',
  },
  retryButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#2B95E1',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  placeholderText: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    padding: 20,
  },
});

export default Home; 