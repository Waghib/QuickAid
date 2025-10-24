import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Geolocation from '@react-native-community/geolocation';
import { API_BASE_URL } from '../config/api';
import socketService from '../services/SocketService';

const EmergencyRequestScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [availableResponders, setAvailableResponders] = useState([]);
  const [selectedResponder, setSelectedResponder] = useState(null);
  const [emergencyType, setEmergencyType] = useState('general');
  const [description, setDescription] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [showResponderModal, setShowResponderModal] = useState(false);
  const [sendingToResponder, setSendingToResponder] = useState(null);

  const emergencyTypes = [
    { id: 'medical', label: '🏥 Medical Emergency', color: '#FF4444' },
    { id: 'fire', label: '🔥 Fire Emergency', color: '#FF8800' },
    { id: 'accident', label: '🚗 Accident', color: '#FF6600' },
    { id: 'crime', label: '🚨 Crime/Security', color: '#8800FF' },
    { id: 'general', label: '⚠️ General Emergency', color: '#2B95E1' },
  ];

  useEffect(() => {
    getCurrentLocation();
    
    // Connect to Socket.IO for real-time status updates (optional)
    try {
      socketService.connect();
    } catch (error) {
      console.log('Socket connection failed, continuing without real-time features');
    }
    
    // Listen for request status updates
    const handleStatusUpdate = (updateData) => {
      if (updateData.requestId === requestId) {
        if (updateData.action === 'accept') {
          Alert.alert(
            '✅ Request Accepted!',
            'A first responder has accepted your emergency request and is on their way to help you.',
            [
              {
                text: 'Track Responder',
                onPress: () => navigation.navigate('RequestStatus', { 
                  requestId: updateData.requestId,
                  responderId: updateData.responderId 
                })
              },
              {
                text: 'OK',
                style: 'cancel'
              }
            ]
          );
        } else if (updateData.action === 'reject') {
          Alert.alert(
            'Request Update',
            'The responder was unable to accept your request. We are finding another responder for you.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    socketService.addEventListener('request_status_update', handleStatusUpdate);
    
    return () => {
      socketService.removeEventListener('request_status_update', handleStatusUpdate);
    };
  }, [requestId]);

  useEffect(() => {
    console.log('Modal state changed:', showResponderModal);
    console.log('Available responders count:', availableResponders.length);
  }, [showResponderModal, availableResponders]);

  useEffect(() => {
    console.log('Loading state changed:', loading);
  }, [loading]);

  const getCurrentLocation = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const createEmergencyRequest = async () => {
    if (!currentLocation) {
      Alert.alert('Location Required', 'Please wait while we get your location.');
      return;
    }

    setLoading(true);
    
    const currentUser = auth().currentUser;
    const userId = currentUser.phoneNumber || currentUser.uid;

    // Create emergency request and fetch responders
    try {
      const response = await fetch(`${API_BASE_URL}/api/emergency-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          emergencyType,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setRequestId(data.data.requestId);
        setLoading(false);
        
        // Now fetch available responders
        fetchAndShowResponders();
      } else {
        setLoading(false);
        Alert.alert('Error', 'Failed to create emergency request');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', `Request failed: ${error.message}`);
    }
  };

  const fetchAndShowResponders = () => {
    // Fetch responders from real API
    fetch(`${API_BASE_URL}/api/emergency-requests/find-responders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      }),
    })
    .then(response => response.json())
    .then(responderData => {
      if (responderData.success && responderData.data.length > 0) {
        setAvailableResponders(responderData.data);
        setShowResponderModal(true);
      } else {
        Alert.alert(
          'No Responders Available',
          'No first responders are currently available in your area. Emergency services have been notified.',
          [
            { 
              text: 'Call Emergency Services', 
              onPress: () => {
                Linking.openURL('tel:15');
                navigation.goBack();
              }
            },
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      }
    })
    .catch(error => {
      Alert.alert('Error', `Failed to find responders: ${error.message}`);
    });
  };

  const sendRequestToResponder = async (responder) => {
    setSendingToResponder(responder.userId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/emergency-requests/${requestId}/send-to-responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responderId: responder.userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedResponder(responder);
        setShowResponderModal(false);
        Alert.alert(
          '✅ Request Sent Successfully!',
          `Your emergency request has been assigned to ${responder.name}. They will receive the request and respond shortly.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to send request to responder');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setSendingToResponder(null);
    }
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const ResponderModal = () => {
    const responder = availableResponders[0]; // Show first available responder
    
    if (!responder) return null;
    
    return (
      <Modal
        visible={showResponderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResponderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🚨 Emergency Request Created</Text>
            <Text style={styles.modalSubtitle}>Nearest available first responder found</Text>
            
            <View style={styles.responderCard}>
              <View style={styles.responderInfo}>
                <Text style={styles.responderName}>{responder.name}</Text>
                <Text style={styles.responderDistance}>
                  📍 {formatDistance(responder.distance)}
                </Text>
                <Text style={styles.responderStatus}>
                  ✅ Available • Certified First Responder
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.selectButton, styles.primaryButton]}
              onPress={() => sendRequestToResponder(responder)}
              disabled={sendingToResponder !== null}
            >
              {sendingToResponder === responder.userId ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.selectButtonText}>✅ Send Request to {responder.name}</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowResponderModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Request</Text>
        <Text style={styles.subtitle}>Get help from nearby first responders</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Type</Text>
        <View style={styles.emergencyTypes}>
          {emergencyTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.emergencyTypeButton,
                { backgroundColor: emergencyType === type.id ? type.color : '#f0f0f0' }
              ]}
              onPress={() => setEmergencyType(type.id)}
            >
              <Text style={[
                styles.emergencyTypeText,
                { color: emergencyType === type.id ? 'white' : '#333' }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Location</Text>
        <View style={styles.locationInfo}>
          {currentLocation ? (
            <>
              <Text style={styles.locationText}>
                📍 Lat: {currentLocation.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                📍 Lng: {currentLocation.longitude.toFixed(6)}
              </Text>
            </>
          ) : (
            <Text style={styles.locationText}>Getting your location...</Text>
          )}
          <TouchableOpacity style={styles.refreshLocationButton} onPress={getCurrentLocation}>
            <Text style={styles.refreshLocationText}>Refresh Location</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.emergencyButton, !currentLocation && styles.disabledButton]}
        onPress={createEmergencyRequest}
        disabled={!currentLocation || loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.emergencyButtonText}>🚨 REQUEST HELP NOW</Text>
        )}
      </TouchableOpacity>


      <ResponderModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2B95E1',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  emergencyTypes: {
    flexDirection: 'column',
    gap: 10,
  },
  emergencyTypeButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyTypeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
  locationInfo: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  refreshLocationButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  refreshLocationText: {
    color: '#2B95E1',
    fontWeight: '600',
  },
  emergencyButton: {
    backgroundColor: '#FF4444',
    margin: 20,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  responderList: {
    maxHeight: 300,
  },
  responderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  responderCardSending: {
    backgroundColor: '#f0f8ff',
    borderColor: '#2B95E1',
    opacity: 0.8,
  },
  responderInfo: {
    flex: 1,
  },
  responderName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  responderDistance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  responderStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  selectButton: {
    backgroundColor: '#2B95E1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default EmergencyRequestScreen;
