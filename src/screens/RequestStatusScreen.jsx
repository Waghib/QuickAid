import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../config/api';

const RequestStatusScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { requestId, responder } = route.params;
  
  const [requestStatus, setRequestStatus] = useState('sent_to_responder');
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState(null);

  useEffect(() => {
    fetchRequestStatus();
    const interval = setInterval(fetchRequestStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRequestStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/emergency-requests/${requestId}`);
      const data = await response.json();

      if (data.success) {
        setRequestData(data.data);
        setRequestStatus(data.data.status);
      }
    } catch (error) {
      console.error('Error fetching request status:', error);
    } finally {
      setLoading(false);
    }
  };

  const callResponder = () => {
    if (responder?.contactInfo) {
      const phoneNumber = responder.contactInfo.replace(/\D/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const getStatusInfo = () => {
    switch (requestStatus) {
      case 'sent_to_responder':
        return {
          title: 'Request Sent',
          message: `Your emergency request has been sent to ${responder?.name}. Waiting for response...`,
          color: '#FF8800',
          icon: '⏳',
        };
      case 'accepted':
        return {
          title: 'Help is Coming!',
          message: `${responder?.name} has accepted your request and is on the way.`,
          color: '#4CAF50',
          icon: '✅',
        };
      case 'rejected':
        return {
          title: 'Request Declined',
          message: 'The responder is unavailable. We are finding another responder for you.',
          color: '#FF4444',
          icon: '❌',
        };
      case 'no_responders_available':
        return {
          title: 'No Responders Available',
          message: 'No first responders are currently available in your area. Please contact emergency services directly.',
          color: '#FF4444',
          icon: '⚠️',
        };
      case 'completed':
        return {
          title: 'Request Completed',
          message: 'Your emergency request has been completed. Stay safe!',
          color: '#2B95E1',
          icon: '✅',
        };
      default:
        return {
          title: 'Processing Request',
          message: 'Processing your emergency request...',
          color: '#666',
          icon: '⏳',
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (loading && !requestData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2B95E1" />
        <Text style={styles.loadingText}>Loading request status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Request Status</Text>
        <Text style={styles.requestId}>Request ID: {requestId}</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={[styles.statusIcon, { color: statusInfo.color }]}>
          {statusInfo.icon}
        </Text>
        <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
          {statusInfo.title}
        </Text>
        <Text style={styles.statusMessage}>
          {statusInfo.message}
        </Text>
      </View>

      {responder && (
        <View style={styles.responderCard}>
          <Text style={styles.responderTitle}>First Responder</Text>
          <View style={styles.responderInfo}>
            <Text style={styles.responderName}>{responder.name}</Text>
            <Text style={styles.responderDistance}>
              {responder.distance ? `${responder.distance.toFixed(1)}km away` : 'Distance calculating...'}
            </Text>
            <Text style={styles.responderStatus}>✅ Certified Responder</Text>
          </View>
          
          {requestStatus === 'accepted' && (
            <TouchableOpacity style={styles.callButton} onPress={callResponder}>
              <Text style={styles.callButtonText}>📞 Call Responder</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.emergencyInfo}>
        <Text style={styles.emergencyTitle}>Emergency Information</Text>
        {requestData && (
          <>
            <Text style={styles.emergencyDetail}>
              Type: {requestData.emergencyType || 'General'}
            </Text>
            <Text style={styles.emergencyDetail}>
              Time: {new Date(requestData.time).toLocaleString()}
            </Text>
            <Text style={styles.emergencyDetail}>
              Location: {requestData.latitude?.toFixed(6)}, {requestData.longitude?.toFixed(6)}
            </Text>
          </>
        )}
      </View>

      <View style={styles.actionButtons}>
        {requestStatus === 'rejected' && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Find Another Responder</Text>
          </TouchableOpacity>
        )}
        
        {requestStatus === 'no_responders_available' && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.emergencyCallCard}>
        <Text style={styles.emergencyCallTitle}>Emergency Services</Text>
        <Text style={styles.emergencyCallSubtitle}>
          For life-threatening emergencies, call:
        </Text>
        <TouchableOpacity
          style={styles.emergencyCallButton}
          onPress={() => Linking.openURL('tel:15')}
        >
          <Text style={styles.emergencyCallButtonText}>🚨 Call 15 (Emergency)</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  requestId: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.8,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  responderCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  responderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  responderInfo: {
    marginBottom: 15,
  },
  responderName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  responderDistance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  responderStatus: {
    fontSize: 14,
    color: '#4CAF50',
  },
  callButton: {
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
  emergencyInfo: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  emergencyDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  actionButtons: {
    margin: 15,
  },
  retryButton: {
    backgroundColor: '#FF8800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#2B95E1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyCallCard: {
    backgroundColor: '#FFE6E6',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },
  emergencyCallTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 5,
  },
  emergencyCallSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  emergencyCallButton: {
    backgroundColor: '#FF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyCallButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RequestStatusScreen;
