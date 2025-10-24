import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { API_BASE_URL } from '../config/api';
import socketService from '../services/SocketService';

const FirstResponderDashboard = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [respondingToRequest, setRespondingToRequest] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const emergencyTypeIcons = {
    medical: '🏥',
    fire: '🔥',
    accident: '🚗',
    crime: '🚨',
    general: '⚠️',
  };

  const emergencyTypeColors = {
    medical: '#FF4444',
    fire: '#FF8800',
    accident: '#FF6600',
    crime: '#8800FF',
    general: '#2B95E1',
  };

  useEffect(() => {
    fetchEmergencyRequests();
    
    // Connect to Socket.IO for real-time notifications (optional)
    try {
      socketService.connect();
    } catch (error) {
      console.log('Socket connection failed, using polling instead');
    }
    
    // Listen for new emergency requests
    const handleNewRequest = (requestData) => {
      Alert.alert(
        '🚨 New Emergency Request!',
        `New emergency request detected. Tap to refresh and view details.`,
        [
          {
            text: 'Refresh & View',
            onPress: () => {
              fetchEmergencyRequests(); // Refresh the list
            }
          },
          {
            text: 'Dismiss',
            style: 'cancel'
          }
        ]
      );
    };

    socketService.addEventListener('new_emergency_request', handleNewRequest);
    
    // Set up polling for new requests every 30 seconds (reduced frequency since we have real-time)
    const interval = setInterval(fetchEmergencyRequests, 30000);
    
    return () => {
      clearInterval(interval);
      socketService.removeEventListener('new_emergency_request', handleNewRequest);
    };
  }, []);

  const fetchEmergencyRequests = async () => {
    try {
      const currentUser = auth().currentUser;
      const responderId = currentUser.phoneNumber || currentUser.uid;

      // Use real API call (network is working now!)
      const response = await fetch(`${API_BASE_URL}/api/first-responders/${responderId}/requests`);
      const data = await response.json();

      if (data.success) {
        setEmergencyRequests(data.data);
      } else {
        console.error('Failed to fetch emergency requests:', data.message);
        setEmergencyRequests([]);
      }
    } catch (error) {
      console.error('Error fetching emergency requests:', error);
      // Show empty state on error
      setEmergencyRequests([]);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmergencyRequests();
  };

  const respondToRequest = async (requestId, action) => {
    setRespondingToRequest(requestId);
    
    try {
      const currentUser = auth().currentUser;
      const responderId = currentUser.phoneNumber || currentUser.uid;

      const response = await fetch(`${API_BASE_URL}/api/emergency-requests/${requestId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          responderId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the request status locally
        setEmergencyRequests(prevRequests =>
          prevRequests.map(request =>
            request.requestId === requestId
              ? { ...request, status: action === 'accept' ? 'accepted' : 'rejected' }
              : request
          )
        );

        Alert.alert(
          action === 'accept' ? '✅ Request Accepted!' : '❌ Request Rejected',
          action === 'accept' 
            ? 'You have accepted this emergency request. Please proceed to help the person in need.'
            : 'You have rejected this emergency request. It will be sent to other available responders.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', data.message || `Failed to ${action} request`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} request. Please try again.`);
    } finally {
      setRespondingToRequest(null);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const RequestDetailsModal = () => (
    <Modal
      visible={showRequestModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowRequestModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedRequest && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Emergency Request</Text>
                <Text style={[
                  styles.emergencyTypeBadge,
                  { backgroundColor: emergencyTypeColors[selectedRequest.emergencyType] }
                ]}>
                  {emergencyTypeIcons[selectedRequest.emergencyType]} {selectedRequest.emergencyType.toUpperCase()}
                </Text>
              </View>

              <View style={styles.requestDetails}>
                <Text style={styles.detailLabel}>Requester:</Text>
                <Text style={styles.detailValue}>
                  {selectedRequest.EmergencyUser?.name || 'Unknown User'}
                </Text>

                <Text style={styles.detailLabel}>Time:</Text>
                <Text style={styles.detailValue}>{formatTime(selectedRequest.time)}</Text>

                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>
                  📍 {selectedRequest.latitude.toFixed(6)}, {selectedRequest.longitude.toFixed(6)}
                </Text>

                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[
                  styles.detailValue,
                  styles.statusText,
                  { color: selectedRequest.status === 'accepted' ? '#4CAF50' : '#FF8800' }
                ]}>
                  {selectedRequest.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>

              {selectedRequest.status === 'sent_to_responder' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => respondToRequest(selectedRequest.requestId, 'accept')}
                    disabled={respondingToRequest === selectedRequest.requestId}
                  >
                    {respondingToRequest === selectedRequest.requestId ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>✅ Accept & Help</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => respondToRequest(selectedRequest.requestId, 'reject')}
                    disabled={respondingToRequest === selectedRequest.requestId}
                  >
                    {respondingToRequest === selectedRequest.requestId ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>❌ Cannot Help</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowRequestModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>First Responder Dashboard</Text>
        <Text style={styles.subtitle}>Emergency requests assigned to you</Text>
      </View>

      <ScrollView
        style={styles.requestsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2B95E1" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : emergencyRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No emergency requests at the moment</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        ) : (
          emergencyRequests.map((request) => (
            <TouchableOpacity
              key={request.requestId}
              style={[
                styles.requestCard,
                (request.status === 'pending' || request.status === 'sent_to_responder') && styles.pendingCard,
                request.status === 'accepted' && styles.acceptedCard,
              ]}
              onPress={() => openRequestDetails(request)}
            >
              <View style={styles.requestHeader}>
                <View style={styles.emergencyTypeContainer}>
                  <Text style={styles.emergencyIcon}>
                    {emergencyTypeIcons[request.emergencyType]}
                  </Text>
                  <Text style={styles.emergencyType}>
                    {request.emergencyType.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.requestTime}>{formatTime(request.time)}</Text>
              </View>

              <Text style={styles.requesterName}>
                From: {request.EmergencyUser?.name || 'Unknown User'}
              </Text>

              <View style={styles.requestFooter}>
                <Text style={[
                  styles.statusBadge,
                  (request.status === 'pending' || request.status === 'sent_to_responder') && styles.pendingStatus,
                  request.status === 'accepted' && styles.acceptedStatus,
                ]}>
                  {request.status === 'pending' ? '🆕 New Request' : 
                   request.status === 'sent_to_responder' ? '⏳ Pending Response' : 
                   '✅ Accepted'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <RequestDetailsModal />
    </View>
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
  requestsList: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  pendingCard: {
    borderLeftColor: '#FF8800',
    backgroundColor: '#FFF8F0',
  },
  acceptedCard: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F0F8F0',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emergencyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  emergencyType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  requestTime: {
    fontSize: 12,
    color: '#666',
  },
  requesterName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingStatus: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  acceptedStatus: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
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
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emergencyTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    color: 'white',
    fontWeight: 'bold',
  },
  requestDetails: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
  },
  statusText: {
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#FF4444',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default FirstResponderDashboard;
