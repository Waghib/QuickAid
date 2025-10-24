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
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import auth from '@react-native-firebase/auth';

// Separate Menu component
const SideMenu = ({ visible, onClose, onTraining, onAccount, onHelp, onCertification }) => {
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
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={onCertification}
          >
            <Text style={styles.menuItemText}>Certification</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={onHelp}
          >
            <Text style={styles.menuItemText}>Help</Text>
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
  const { width, height } = useWindowDimensions();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [userLocation, setUserLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [locationError, setLocationError] = useState(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  
  const responderUser = {
    name: "aarish",
    phoneNumber: "+923130000001",
  };

  // Handle request submission
  const handleSubmitRequest = () => {
    setRequestSubmitted(true);
    Alert.alert(
      'Request Submitted',
      'Your help request has been submitted successfully.',
      [{ text: 'OK' }]
    );
  };

  // Reset request status when modal is closed
  const handleCloseModal = () => {
    setIsUserModalVisible(false);
    // Reset the request status after a delay to allow modal animation to complete
    setTimeout(() => {
      if (!isUserModalVisible) {
        setRequestSubmitted(false);
      }
    }, 300);
  };

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            onPress: async () => {
              try {
                await auth().signOut();
                // No need to navigate - App.tsx onAuthStateChanged will handle navigation
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout');
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') {
          getCurrentLocation();
        }
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location to show you on the map.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setLocationError('Location permission denied');
          Alert.alert('Permission Denied', 'Please enable location services to use this feature');
        }
      }
    } catch (err) {
      console.warn(err);
      setLocationError('Error requesting location permission');
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setLocationError(null);
      },
      (error) => {
        console.log('Location error:', error);
        setLocationError(error.message);
        
        // Check if location services are enabled
        if (error.code === error.POSITION_UNAVAILABLE) {
          Alert.alert(
            'Location Services Disabled',
            'Please enable location services in your device settings.',
            [
              {
                text: 'OK',
              }
            ]
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Set up location tracking when component mounts
  useEffect(() => {
    requestLocationPermission();
    
    // Set up location watching
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setLocationError(null);
      },
      (error) => {
        console.log('Watch position error:', error);
        setLocationError(error.message);
      },
      { enableHighAccuracy: true, distanceFilter: 10, interval: 5000, fastestInterval: 2000 }
    );
    
    // Clean up when component unmounts
    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

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

  const handleHelp = () => {
    setIsMenuVisible(false);
    setTimeout(() => {
      navigation.navigate('Help');
    }, 300);
  };

  const handleCertification = () => {
    setIsMenuVisible(false);
    setTimeout(() => {
      navigation.navigate('Certification');
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
    logoutButton: {
      padding: 8,
      backgroundColor: '#FF3B30',
      borderRadius: 5,
      marginRight: 5,
    },
    logoutText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 12,
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
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>QuickAid</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.mapContainer, dynamicStyles.mapContainer]}>
        <MapView
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
        />
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.helpButton, dynamicStyles.bottomButton]}
          onPress={() => navigation.navigate('EmergencyRequest')}
        >
          <Text style={[styles.helpButtonText, dynamicStyles.buttonText]}>
            🚨 Request Emergency Help
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Modal */}
      <Modal
        visible={isUserModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.userModalContainer}>
          <View style={styles.userModalContent}>
            <Text style={styles.userModalTitle}>Help Request</Text>
            <Text style={styles.responderInfoLabel}>Responder Information:</Text>
            
            <View style={styles.responderInfoRow}>
              <Text style={styles.responderInfoLabel}>Name:</Text>
              <Text style={styles.responderInfoValue}>{responderUser.name}</Text>
            </View>
            
            <View style={styles.responderInfoRow}>
              <Text style={styles.responderInfoLabel}>Phone:</Text>
              <Text style={styles.responderInfoValue}>{responderUser.phoneNumber}</Text>
            </View>
            
            {requestSubmitted && (
              <View style={styles.responderInfoRow}>
                <Text style={styles.responderInfoLabel}>Status:</Text>
                <Text style={styles.submittedStatus}>Request Submitted</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.callButton}
              onPress={() => Linking.openURL(`tel:${responderUser.phoneNumber}`)}
            >
              <Text style={styles.buttonText}>Call</Text>
            </TouchableOpacity>
            
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.submitRequestButton,
                  requestSubmitted && styles.disabledButton
                ]}
                onPress={handleSubmitRequest}
                disabled={requestSubmitted}
              >
                <Text style={styles.buttonText}>
                  {requestSubmitted ? 'Request Submitted' : 'Submit Request'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SideMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onTraining={handleTraining}
        onAccount={handleAccount}
        onHelp={handleHelp}
        onCertification={handleCertification}
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
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    color: '#FFFFFF',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 5,
    marginRight: 5,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
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
  userModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  userModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B95E1',
    marginBottom: 15,
    alignSelf: 'center',
  },
  responderInfoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    width: 70,
  },
  responderInfoValue: {
    fontSize: 16,
    color: '#555555',
    flex: 1,
  },
  responderInfoRow: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 6,
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 10,
  },
  submitRequestButton: {
    backgroundColor: '#FFA500', // Orange
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#2B95E1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submittedStatus: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9', // Gray color for disabled state
    opacity: 0.7,
  },
});

export default Home;