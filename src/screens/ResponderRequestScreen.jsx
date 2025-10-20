import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { API_BASE_URL } from '../config/api';

const ResponderRequestScreen = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const currentUser = auth().currentUser;
      const userId = currentUser.phoneNumber || currentUser.uid;

      const response = await fetch(`${API_BASE_URL}/api/first-responders/${userId}/requests`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, action) => {
    setRespondingTo(requestId);
    try {
      const currentUser = auth().currentUser;
      const userId = currentUser.phoneNumber || currentUser.uid;

      const response = await fetch(`${API_BASE_URL}/api/emergency-requests/${requestId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          responderId: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (action === 'accept') {
          Alert.alert(
            'Request Accepted',
            'You have accepted the emergency request. Please proceed to the location immediately.',
            [
              {
                text: 'Navigate',
                onPress: () => openNavigation(requests.find(r => r.id === requestId)),
              },
              { text: 'OK' }
            ]
          );
        } else {
          Alert.alert('Request Declined', 'You have declined the emergency request.');
        }
        fetchRequests(); // Refresh the list
      } else {
        Alert.alert('Error', data.message || 'Failed to respond to request');
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      Alert.alert('Error', 'Failed to respond to request. Please try again.');
    } finally {
      setRespondingTo(null);
    }
  };

  const openNavigation = (request) => {
    if (request) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}&travelmode=driving`;
      Linking.openURL(url);
    }
  };

  const callEmergencyUser = (request) => {
    if (request.EmergencyUser?.contactInfo) {
      const phoneNumber = request.EmergencyUser.contactInfo.replace(/\D/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const getEmergencyTypeInfo = (type) => {
    const types = {
      medical: { icon: '🏥', label: 'Medical Emergency', color: '#FF4444' },
      fire: { icon: '🔥', label: 'Fire Emergency', color: '#FF8800' },
      accident: { icon: '🚗', label: 'Accident', color: '#FF6600' },
      crime: { icon: '🚨', label: 'Crime/Security', color: '#8800FF' },
      general: { icon: '⚠️', label: 'General Emergency', color: '#2B95E1' },
    };
    return types[type] || types.general;
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const requestTime = new Date(dateString);
    const diffInMinutes = Math.floor((now - requestTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return requestTime.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2B95E1" />
        <Text style={styles.loadingText}>Loading emergency requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Requests</Text>
        <Text style={styles.subtitle}>
          {requests.length} active request{requests.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView style={styles.requestsList}>
        {requests.length === 0 ? (
          <View style={styles.noRequestsContainer}>
            <Text style={styles.noRequestsIcon}>📱</Text>
            <Text style={styles.noRequestsTitle}>No Active Requests</Text>
            <Text style={styles.noRequestsText}>
              You don't have any emergency requests at the moment. 
              We'll notify you when someone needs help in your area.
            </Text>
          </View>
        ) : (
          requests.map((request) => {
            const emergencyInfo = getEmergencyTypeInfo(request.emergencyType);
            const isResponding = respondingTo === request.requestId;
            
            return (
              <View key={request.requestId} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.emergencyTypeContainer}>
                    <Text style={styles.emergencyIcon}>{emergencyInfo.icon}</Text>
                    <View>
                      <Text style={[styles.emergencyType, { color: emergencyInfo.color }]}>
                        {emergencyInfo.label}
                      </Text>
                      <Text style={styles.requestTime}>
                        {formatTimeAgo(request.time)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: request.status === 'accepted' ? '#4CAF50' : '#FF8800' }]}>
                    <Text style={styles.statusText}>
                      {request.status === 'accepted' ? 'Accepted' : 'Pending'}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <Text style={styles.userName}>
                    👤 {request.EmergencyUser?.name || 'Emergency User'}
                  </Text>
                  
                  <Text style={styles.location}>
                    📍 Location: {request.latitude?.toFixed(6)}, {request.longitude?.toFixed(6)}
                  </Text>
                </View>

                {request.status === 'sent_to_responder' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.acceptButton, isResponding && styles.disabledButton]}
                      onPress={() => respondToRequest(request.requestId, 'accept')}
                      disabled={isResponding}
                    >
                      {isResponding ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text style={styles.acceptButtonText}>✅ Accept</Text>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.declineButton, isResponding && styles.disabledButton]}
                      onPress={() => respondToRequest(request.requestId, 'reject')}
                      disabled={isResponding}
                    >
                      <Text style={styles.declineButtonText}>❌ Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {request.status === 'accepted' && (
                  <View style={styles.acceptedActions}>
                    <TouchableOpacity
                      style={styles.navigateButton}
                      onPress={() => openNavigation(request)}
                    >
                      <Text style={styles.navigateButtonText}>🗺️ Navigate</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => callEmergencyUser(request)}
                    >
                      <Text style={styles.callButtonText}>📞 Call</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchRequests}
      >
        <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  requestsList: {
    flex: 1,
    padding: 10,
  },
  noRequestsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  noRequestsIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  noRequestsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noRequestsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  requestCard: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  emergencyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  emergencyType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  location: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#FF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  acceptedActions: {
    flexDirection: 'row',
    gap: 10,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: '#2B95E1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#2B95E1',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResponderRequestScreen;
