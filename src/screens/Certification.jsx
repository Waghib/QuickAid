import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Certification = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState('');
  const currentUser = auth().currentUser;

  // Load user's training progress from Firestore
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userRef = firestore()
      .collection('users')
      .doc(currentUser.phoneNumber || currentUser.uid);
    
    // Get certification request status if exists
    const fetchCertificationStatus = async () => {
      try {
        const certDoc = await userRef.collection('certifications').doc('request').get();
        if (certDoc.exists) {
          setHasPendingRequest(true);
          setRequestStatus(certDoc.data().status || 'pending');
        }
      } catch (error) {
        console.error("Error fetching certification status:", error);
      }
    };

    // Subscribe to training progress updates
    const unsubscribe = userRef
      .collection('trainingProgress')
      .onSnapshot(async snapshot => {
        // Count completed videos
        const completedVideosData = {};
        snapshot.forEach(doc => {
          completedVideosData[doc.id] = doc.data().completed;
        });
        
        // Get total number of training videos
        const trainingRef = await firestore().collection('trainingVideos').get();
        const totalVideos = trainingRef.size > 0 ? trainingRef.size : 21; // Default to 21 if collection is empty
        
        const completedCount = Object.values(completedVideosData).filter(Boolean).length;
        const progressPercentage = (completedCount / totalVideos) * 100;
        
        setProgress(progressPercentage);
        setIsEligible(progressPercentage === 100);
        
        await fetchCertificationStatus();
        setLoading(false);
      }, error => {
        console.error("Error loading training progress:", error);
        setLoading(false);
      });
    
    return () => unsubscribe();
  }, [currentUser]);

  const handleRequestCertification = async () => {
    if (!currentUser) return;
    
    if (!isEligible) {
      Alert.alert(
        "Training Incomplete",
        "You need to complete all training videos before requesting certification.",
        [
          {
            text: "Go to Training",
            onPress: () => navigation.navigate('Training')
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
      return;
    }
    
    try {
      setLoading(true);
      const userRef = firestore()
        .collection('users')
        .doc(currentUser.phoneNumber || currentUser.uid);
      
      await userRef
        .collection('certifications')
        .doc('request')
        .set({
          status: 'pending',
          requestedAt: firestore.FieldValue.serverTimestamp(),
          completedTraining: true,
          progress: progress
        });
      
      setHasPendingRequest(true);
      setRequestStatus('pending');
      setLoading(false);
      
      Alert.alert(
        "Request Submitted",
        "Your certification request has been submitted successfully. You will receive an email with details about your onsite assessment venue and date.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error submitting certification request:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to submit certification request. Please try again later.");
    }
  };

  const renderCertificationStatus = () => {
    if (hasPendingRequest) {
      let statusColor = '#FFA000'; // Default orange for pending
      let statusText = 'Your certification request is pending. You will receive an email with test venue and date details.';
      
      if (requestStatus === 'approved') {
        statusColor = '#4CAF50'; // Green for approved
        statusText = 'Congratulations! Your certification has been approved.';
      } else if (requestStatus === 'rejected') {
        statusColor = '#F44336'; // Red for rejected
        statusText = 'Your certification request has been rejected. Please contact support for more information.';
      }
      
      return (
        <View style={[styles.statusContainer, { borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{"❮"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certification</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2B95E1" />
        </View>
      ) : (
        <ScrollView style={styles.contentContainer}>
          <Image 
            source={require('../assets/aid.jpg')} 
            style={styles.certificationImage}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>First Aid Certification</Text>
          
          <Text style={styles.description}>
            Becoming certified in first aid demonstrates your commitment to safety and preparedness.
            Our certification process ensures that you have the knowledge and skills needed to respond
            effectively in emergency situations.
          </Text>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Training Progress:</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{`${Math.round(progress)}% Complete`}</Text>
          </View>
          
          {renderCertificationStatus()}
          
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Certification Requirements:</Text>
            <View style={styles.requirementItem}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>Complete all training videos (100%)</Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>Attend an onsite assessment (you'll receive an email with venue and date details)</Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>Demonstrate practical skills during the onsite assessment</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.requestButton, 
              (!isEligible || hasPendingRequest) && styles.disabledButton
            ]}
            onPress={handleRequestCertification}
            disabled={!isEligible || hasPendingRequest}
          >
            <Text style={styles.requestButtonText}>
              {hasPendingRequest ? "Request Pending" : "Request Certification"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
    elevation: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  certificationImage: {
    width: '100%',
    height: 200,
    marginVertical: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'justify',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressText: {
    marginTop: 4,
    fontSize: 14,
    color: '#757575',
    textAlign: 'right',
  },
  statusContainer: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  requirementsContainer: {
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  requirementBullet: {
    fontSize: 16,
    color: '#2B95E1',
    marginRight: 8,
    fontWeight: 'bold',
  },
  requirementText: {
    fontSize: 16,
    color: '#666666',
    flex: 1,
  },
  requestButton: {
    backgroundColor: '#2B95E1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Certification;
