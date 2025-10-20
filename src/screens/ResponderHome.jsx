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
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import auth from '@react-native-firebase/auth';

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

const ResponderHome = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [requestStatus, setRequestStatus] = useState('pending'); // 'pending', 'accepted', 'declined'
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportDetails, setReportDetails] = useState({
    incidentDescription: '',
    actionsTaken: '',
    requiredFollowUp: '',
  });
  const [userLocation, setUserLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [locationError, setLocationError] = useState(null);
  
  const emergencyRequester = {
    name: "waghib",
    phoneNumber: "+923137003522",
    role: "emergency"
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
      navigation.navigate('ResponderAccount');
    }, 300);
  };

  const handleAcceptRequest = () => {
    setRequestStatus('accepted');
    Alert.alert(
      'Request Accepted',
      `You have accepted ${emergencyRequester.name}'s request for help.`,
      [{ text: 'OK' }]
    );
  };

  const handleDeclineRequest = () => {
    setRequestStatus('declined');
    Alert.alert(
      'Request Declined',
      'You have declined the request for help.',
      [{ text: 'OK', onPress: () => setIsRequestModalVisible(false) }]
    );
  };

  // Function to handle submit report button
  const handleSubmitReportClick = () => {
    setIsReportModalVisible(true);
  };

  // Function to submit the report
  const handleSubmitReport = () => {
    // Here you would typically send this data to your backend
    console.log('Report submitted:', reportDetails);
    
    Alert.alert(
      'Report Submitted',
      'Thank you for your report. It has been successfully submitted.',
      [
        { 
          text: 'OK', 
          onPress: () => {
            setIsReportModalVisible(false);
            setIsRequestModalVisible(false);
            setRequestStatus('pending');
            // Reset report form
            setReportDetails({
              incidentDescription: '',
              actionsTaken: '',
              requiredFollowUp: '',
            });
          } 
        }
      ]
    );
  };

  // Function to reset request status when modal is closed
  const handleCloseRequestModal = () => {
    setIsRequestModalVisible(false);
    // We don't reset the status immediately to allow for animation
    setTimeout(() => {
      if (!isRequestModalVisible) {
        setRequestStatus('pending');
      }
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
    logoutIcon: {
      fontSize: Math.min(width, height) * 0.04,
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
          <Text style={styles.headerTitle}>QuickAid Responder</Text>
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
        {/* <Text style={styles.placeholderText}>Map functionality temporarily disabled</Text> */}
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.statusButton, dynamicStyles.bottomButton]}
          onPress={() => navigation.navigate('ResponderRequest')}
        >
          <Text style={[styles.statusButtonText, dynamicStyles.buttonText]}>
            📋 View Emergency Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Request Modal */}
      <Modal
        visible={isRequestModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseRequestModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.requestModalContent}>
            <Text style={styles.requestModalTitle}>
              {requestStatus === 'accepted' ? 'Accepted Request' : 'Emergency Request'}
            </Text>
            
            <View style={styles.requestInfoContainer}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestDetailLabel}>Name:</Text>
                <Text style={styles.requestDetailValue}>{emergencyRequester.name}</Text>
              </View>
              
              <View style={styles.requestInfo}>
                <Text style={styles.requestDetailLabel}>Phone:</Text>
                <Text style={styles.requestDetailValue}>{emergencyRequester.phoneNumber}</Text>
              </View>
              
              <View style={styles.requestInfo}>
                <Text style={styles.requestDetailLabel}>Request Type:</Text>
                <Text style={styles.requestDetailValue}>{emergencyRequester.role}</Text>
              </View>
              
              {requestStatus === 'accepted' && (
                <View style={styles.requestInfo}>
                  <Text style={styles.requestDetailLabel}>Status:</Text>
                  <Text style={styles.acceptedStatus}>Accepted</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.callButton}
              onPress={() => Linking.openURL(`tel:${emergencyRequester.phoneNumber}`)}
            >
              <Text style={styles.buttonText}>Call Requester</Text>
            </TouchableOpacity>
            
            {requestStatus === 'pending' ? (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={handleAcceptRequest}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.declineButton}
                  onPress={handleDeclineRequest}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            ) : requestStatus === 'accepted' ? (
              <>
                <TouchableOpacity 
                  style={styles.reportButton}
                  onPress={handleSubmitReportClick}
                >
                  <Text style={styles.buttonText}>Submit Report</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleCloseRequestModal}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Report Submission Modal */}
      <Modal
        visible={isReportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsReportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.reportModalContent}>
              <Text style={styles.reportModalTitle}>Submit Report</Text>
              
              <View style={styles.reportFormContainer}>
                <Text style={styles.reportInputLabel}>Incident Description:</Text>
                <TextInput
                  style={styles.reportTextInput}
                  multiline={true}
                  numberOfLines={4}
                  value={reportDetails.incidentDescription}
                  onChangeText={(text) => setReportDetails({...reportDetails, incidentDescription: text})}
                  placeholder="Describe the incident..."
                />
                
                <Text style={styles.reportInputLabel}>Actions Taken:</Text>
                <TextInput
                  style={styles.reportTextInput}
                  multiline={true}
                  numberOfLines={3}
                  value={reportDetails.actionsTaken}
                  onChangeText={(text) => setReportDetails({...reportDetails, actionsTaken: text})}
                  placeholder="What actions did you take?"
                />
                
                <Text style={styles.reportInputLabel}>Required Follow-up:</Text>
                <TextInput
                  style={styles.reportTextInput}
                  multiline={true}
                  numberOfLines={3}
                  value={reportDetails.requiredFollowUp}
                  onChangeText={(text) => setReportDetails({...reportDetails, requiredFollowUp: text})}
                  placeholder="Is any follow-up required?"
                />
              </View>
              
              <View style={styles.reportButtonsContainer}>
                <TouchableOpacity 
                  style={styles.submitReportButton}
                  onPress={handleSubmitReport}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cancelReportButton}
                  onPress={() => setIsReportModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

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
  statusButton: {
    backgroundColor: '#2B95E1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  requestModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  requestModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B95E1',
    marginBottom: 15,
    alignSelf: 'center',
  },
  requestInfoContainer: {
    width: '100%',
    marginBottom: 10,
  },
  requestInfo: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 6,
    alignItems: 'center',
  },
  requestDetailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    width: 110,
  },
  requestDetailValue: {
    fontSize: 16,
    color: '#555555',
    flex: 1,
  },
  acceptedStatus: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    flex: 1,
  },
  callButton: {
    backgroundColor: '#4CAF50', // green
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  acceptButton: {
    backgroundColor: '#2B95E1', // blue
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#FF3B30', // red
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#2B95E1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  reportButton: {
    backgroundColor: '#FFA500', // orange color for the report button
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  reportModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reportModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B95E1',
    marginBottom: 20,
    alignSelf: 'center',
  },
  reportFormContainer: {
    width: '100%',
  },
  reportInputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
    marginTop: 10,
  },
  reportTextInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
    textAlignVertical: 'top',
    backgroundColor: '#F9F9F9',
  },
  reportButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  submitReportButton: {
    backgroundColor: '#4CAF50', // green
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelReportButton: {
    backgroundColor: '#FF3B30', // red
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ResponderHome; 