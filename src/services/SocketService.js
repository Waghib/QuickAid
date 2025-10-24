// Simple polling-based service without Socket.IO
import { API_BASE_URL } from '../config/api';
import auth from '@react-native-firebase/auth';

class PollingService {
  constructor() {
    this.isConnected = false;
    this.listeners = new Map();
    this.pollingIntervals = new Map();
    this.lastRequestCount = 0;
  }

  connect() {
    console.log('Using polling-based notifications (no Socket.IO)');
    this.isConnected = true;
    
    // Start polling for first responders
    this.startPollingForRequests();
  }

  disconnect() {
    console.log('Stopping polling service');
    this.isConnected = false;
    
    // Clear all polling intervals
    this.pollingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();
  }

  cleanup() {
    this.disconnect();
  }

  // Start polling for new emergency requests (for first responders)
  startPollingForRequests() {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const userId = currentUser.phoneNumber || currentUser.uid;
    
    // Poll every 5 seconds for new requests
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/first-responders/${userId}/requests`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const currentRequestCount = data.data.length;
          
          // Check if there are new requests
          if (currentRequestCount > this.lastRequestCount) {
            console.log('New emergency request detected via polling');
            this.notifyListeners('new_emergency_request', {
              message: 'New emergency request available',
              count: currentRequestCount
            });
          }
          
          this.lastRequestCount = currentRequestCount;
        }
      } catch (error) {
        console.log('Polling error (normal):', error.message);
      }
    }, 5000); // Poll every 5 seconds

    this.pollingIntervals.set('requests', interval);
    console.log('Started polling for emergency requests');
  }

  // Add event listener
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    console.log('Added polling listener for:', event);
  }

  // Remove event listener
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in polling listener:', error);
        }
      });
    }
  }

  // Check if service is connected
  isSocketConnected() {
    return this.isConnected;
  }

  // Emit event (no-op for polling service)
  emit(event, data) {
    console.log('Polling service emit (no-op):', event);
  }
}

// Create singleton instance
const socketService = new PollingService();

export default socketService;
