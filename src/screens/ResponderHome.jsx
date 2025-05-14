import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  Alert,
  FlatList,
  ActivityIndicator,
  Linking,
  Platform,
  PermissionsAndroid
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { API_URL } from '../config';

// Separate Menu component
const SideMenu = ({ isVisible, onClose, onMenuItemPress }) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuHeaderText}>Menu</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => onMenuItemPress('profile')}
          >
            <Text style={styles.menuItemText}>Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => onMenuItemPress('settings')}
          >
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => onMenuItemPress('logout')}
          >
            <Text style={styles.menuItemText}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
};

const ResponderHome = () => {
  // State for user location
  const [userLocation, setUserLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  // State for location error
  const [locationError, setLocationError] = useState(null);
  
  // State for side menu
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // State for emergency requests
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestsModalVisible, setRequestsModalVisible] = useState(false);
  
  // State for selected request
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  
  // State for active request
  const [activeRequest, setActiveRequest] = useState(null);
  const [acceptingRequest, setAcceptingRequest] = useState(false);
  
  // State for navigation
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  
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
    let watchId = null;
    
    const setupLocationTracking = async () => {
      try {
        await requestLocationPermission();
        
        // Set up location watching
        watchId = Geolocation.watchPosition(
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
      } catch (error) {
        console.error('Error setting up location tracking:', error);
      }
    };
    
    setupLocationTracking();
    
    // Clean up when component unmounts
    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const handleMenuItemPress = (menuItem) => {
    setIsMenuVisible(false);
    if (menuItem === 'profile') {
      // Navigate to profile
    } else if (menuItem === 'settings') {
      // Navigate to settings
    } else if (menuItem === 'logout') {
      // Logout
    }
  };

  const fetchEmergencyRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/emergency-requests`);
      setEmergencyRequests(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRequestAcceptance = async (requestId) => {
    try {
      setAcceptingRequest(true);
      const response = await axios.put(`${API_URL}/emergency-requests/${requestId}/accept`, {
        firstResponderId: 'FR-12345', // Hardcoded for now, should be from auth
      });
      setActiveRequest(response.data.data);
      setRequestModalVisible(false);
      setRequestsModalVisible(false);
      // Get directions to the emergency location
      getDirections(
        userLocation.latitude,
        userLocation.longitude,
        response.data.data.latitude,
        response.data.data.longitude
      );
      setAcceptingRequest(false);
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept the emergency request. Please try again.');
      setAcceptingRequest(false);
    }
  };

  const fetchNearbyRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/emergency-requests/nearby`, {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 20 // 20km radius
        }
      });
      setEmergencyRequests(response.data.data);
      setLoading(false);
      setRequestsModalVisible(true);
    } catch (error) {
      console.error('Error fetching nearby requests:', error);
      Alert.alert('Error', 'Failed to fetch nearby emergency requests. Please try again.');
      setLoading(false);
    }
  };

  const getDirections = async (startLat, startLng, endLat, endLng) => {
    try {
      // For demo purposes, create a simulated route
      // In a real app, you would use Google Directions API
      const simulatedRoute = createSimulatedRoute(
        { latitude: startLat, longitude: startLng },
        { latitude: endLat, longitude: endLng }
      );
      
      setRouteCoordinates(simulatedRoute);
      
      // Calculate approximate distance and duration
      const distanceInKm = calculateDistance(startLat, startLng, endLat, endLng);
      setDistance(distanceInKm);
      
      // Estimate duration (assuming average speed of 40 km/h)
      const durationInMinutes = Math.round((distanceInKm / 40) * 60);
      setDuration(durationInMinutes);
    } catch (error) {
      console.error('Error getting directions:', error);
      Alert.alert('Navigation Error', 'Could not calculate route to emergency location.');
    }
  };

  // Helper function to create a simulated route between two points
  const createSimulatedRoute = (start, end) => {
    // Create a simple route with 5 points
    const numPoints = 5;
    const route = [];
    
    for (let i = 0; i < numPoints; i++) {
      const fraction = i / (numPoints - 1);
      route.push({
        latitude: start.latitude + (end.latitude - start.latitude) * fraction,
        longitude: start.longitude + (end.longitude - start.longitude) * fraction
      });
    }
    
    return route;
  };

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return parseFloat(distance.toFixed(2));
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const openGoogleMapsNavigation = () => {
    if (activeRequest) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${activeRequest.latitude},${activeRequest.longitude}&travelmode=driving`;
      Linking.openURL(url);
    }
  };

  const completeEmergencyRequest = async () => {
    try {
      const response = await axios.put(`${API_URL}/emergency-requests/${activeRequest.requestId}/complete`);
      Alert.alert('Success', 'Emergency request marked as completed.');
      setActiveRequest(null);
      setRouteCoordinates([]);
      setDistance(null);
      setDuration(null);
    } catch (error) {
      console.error('Error completing request:', error);
      Alert.alert('Error', 'Failed to complete the emergency request. Please try again.');
    }
  };

  // For demo purposes, create a mock emergency request
  const createMockEmergencyRequest = () => {
    try {
      // Create a random location near the user's location
      const randomLat = userLocation.latitude + (Math.random() - 0.5) * 0.01;
      const randomLng = userLocation.longitude + (Math.random() - 0.5) * 0.01;
      
      const mockRequest = {
        requestId: `ER-${Date.now()}`,
        emergencyType: 'Medical Emergency',
        latitude: randomLat,
        longitude: randomLng,
        time: new Date().toISOString(),
        status: 'pending',
        emergencyUserId: 'EU-12345',
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, randomLat, randomLng)
      };
      
      setEmergencyRequests([mockRequest]);
      setRequestsModalVisible(true);
    } catch (error) {
      console.error('Error creating mock request:', error);
      Alert.alert('Error', 'Failed to create mock emergency request');
    }
  };

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

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={userLocation}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Show emergency request location if active */}
          {activeRequest && (
            <Marker
              coordinate={{
                latitude: activeRequest.latitude,
                longitude: activeRequest.longitude
              }}
              title="Emergency Location"
              description={activeRequest.emergencyType}
              pinColor="red"
            />
          )}
          
          {/* Show route to emergency location if available */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor="#2B95E1"
            />
          )}
        </MapView>
      </View>

      <View style={styles.bottomContainer}>
        {activeRequest ? (
          <View style={styles.activeRequestContainer}>
            <Text style={styles.activeRequestTitle}>Active Emergency</Text>
            <Text style={styles.activeRequestType}>{activeRequest.emergencyType}</Text>
            
            {distance && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Distance:</Text>
                <Text style={styles.infoValue}>{distance} km</Text>
              </View>
            )}
            
            {duration && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ETA:</Text>
                <Text style={styles.infoValue}>{duration} min</Text>
              </View>
            )}
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.navigationButton}
                onPress={openGoogleMapsNavigation}
              >
                <Text style={styles.buttonText}>Navigate</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={completeEmergencyRequest}
              >
                <Text style={styles.buttonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.statusButton}
            onPress={createMockEmergencyRequest}
          >
            <Text style={styles.statusButtonText}>
              View Requests
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Emergency Requests Modal */}
      <Modal
        visible={requestsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRequestsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.requestsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nearby Emergency Requests</Text>
              <TouchableOpacity onPress={() => setRequestsModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <ActivityIndicator size="large" color="#2B95E1" style={styles.loader} />
            ) : emergencyRequests.length === 0 ? (
              <Text style={styles.noRequestsText}>No emergency requests nearby</Text>
            ) : (
              <FlatList
                data={emergencyRequests}
                keyExtractor={(item) => item.requestId}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.requestItem}
                    onPress={() => {
                      setSelectedRequest(item);
                      setRequestModalVisible(true);
                    }}
                  >
                    <View style={styles.requestItemContent}>
                      <Text style={styles.requestType}>{item.emergencyType}</Text>
                      <Text style={styles.requestDistance}>{item.distance} km away</Text>
                    </View>
                    <Text style={styles.viewDetailsText}>View Details →</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Emergency Request Details Modal */}
      <Modal
        visible={requestModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRequestModalVisible(false)}
      >
        {selectedRequest && (
          <View style={styles.modalContainer}>
            <View style={styles.requestDetailModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Emergency Details</Text>
                <TouchableOpacity onPress={() => setRequestModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.requestDetailContent}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{selectedRequest.emergencyType}</Text>
                
                <Text style={styles.detailLabel}>Distance:</Text>
                <Text style={styles.detailValue}>{selectedRequest.distance} km</Text>
                
                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedRequest.time).toLocaleString()}
                </Text>
                
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => handleRequestAcceptance(selectedRequest.requestId)}
                  disabled={acceptingRequest}
                >
                  {acceptingRequest ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.acceptButtonText}>Accept Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>

      <SideMenu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onMenuItemPress={handleMenuItemPress}
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
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  mapContainer: {
    width: '100%',
    height: '70%',
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
    padding: 20,
  },
  statusButton: {
    backgroundColor: '#2B95E1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
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
  activeRequestContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  activeRequestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  activeRequestType: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navigationButton: {
    backgroundColor: '#2B95E1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    padding: 12,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  requestsModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666666',
  },
  loader: {
    marginTop: 20,
  },
  noRequestsText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
  },
  requestItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  requestItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestType: {
    fontSize: 16,
    color: '#333333',
  },
  requestDistance: {
    fontSize: 14,
    color: '#666666',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#2B95E1',
    textAlign: 'right',
    marginTop: 5,
  },
  requestDetailModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  requestDetailContent: {
    padding: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 15,
  },
  acceptButton: {
    backgroundColor: '#2B95E1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 20,
  },
  acceptButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default ResponderHome;