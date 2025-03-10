import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const ProgressBar = ({ progress }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{`${Math.round(progress)}% Complete`}</Text>
    </View>
  );
};

const TrainingVideo = ({ title, description, thumbnail, videoUrl, startTime, endTime, isCompleted, onVideoComplete, videoId }) => {
  const handleVideoPress = () => {
    // Format the URL with start and end times
    // YouTube uses 't' or 'start' parameter for start time in seconds
    // and 'end' parameter for end time in seconds
    const formattedUrl = `${videoUrl}&start=${startTime}&end=${endTime}`;
    Linking.openURL(formattedUrl);
    
    // Mark this video as completed after a short delay (simulating watching)
    // In a real app, you might want to implement a more sophisticated way to track completion
    setTimeout(() => {
      onVideoComplete(videoId);
    }, 2000);
  };

  return (
    <TouchableOpacity 
      style={[styles.videoCard, isCompleted && styles.completedVideoCard]} 
      onPress={handleVideoPress}
    >
      <Image 
        source={thumbnail}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{title}</Text>
        <Text style={styles.videoDescription} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.timeStamp}>
          {formatTime(startTime)} - {formatTime(endTime)}
        </Text>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Completed</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Helper function to format seconds into MM:SS format
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const Training = () => {
  const navigation = useNavigation();
  const [completedVideos, setCompletedVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const currentUser = auth().currentUser;
  
  // Base YouTube video URL
  const baseVideoUrl = "https://www.youtube.com/watch?v=ErxKDbH-iiI";

  // Training videos with accurate timestamps from the provided video
  const trainingVideos = [
    {
      id: 1,
      title: "What is First Aid?",
      description: "Learn the basics of first aid, including its purpose and importance in emergency situations.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 68,    // 1:08
      endTime: 166,     // 2:46
    },
    {
      id: 2,
      title: "First Aid Kit",
      description: "Discover the essential items that should be in every first aid kit and how to use them properly.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 166,   // 2:46
      endTime: 262,     // 4:22
    },
    {
      id: 3,
      title: "Primary Survey",
      description: "Learn how to conduct a primary survey to assess a casualty's condition using the DRSABC method.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 262,   // 4:22
      endTime: 401,     // 6:41
    },
    {
      id: 4,
      title: "Recovery Position",
      description: "Step-by-step guide on how to place an unconscious but breathing person in the recovery position.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 401,   // 6:41
      endTime: 607,     // 10:07
    },
    {
      id: 5,
      title: "Secondary Survey",
      description: "Learn how to perform a thorough secondary assessment after the primary survey is complete.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 607,   // 10:07
      endTime: 680,     // 11:20
    },
    {
      id: 6,
      title: "Resuscitation (CPR)",
      description: "Comprehensive guide on performing CPR correctly on adults, including chest compressions and rescue breaths.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 680,   // 11:20
      endTime: 1011,    // 16:51
    },
    {
      id: 7,
      title: "Automated External Defibrillator (AED)",
      description: "Learn how to use an AED device to help someone experiencing cardiac arrest.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 1011,  // 16:51
      endTime: 1301,    // 21:41
    },
    {
      id: 8,
      title: "Non-Breathing Casualty",
      description: "How to respond when someone is not breathing, including assessment and immediate actions.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 1301,  // 21:41
      endTime: 1403,    // 23:23
    },
    {
      id: 9,
      title: "Chain of Survival",
      description: "Understanding the critical steps in the chain of survival that can save lives during cardiac emergencies.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 1403,  // 23:23
      endTime: 1490,    // 24:50
    },
    {
      id: 10,
      title: "Child CPR",
      description: "Learn the specific techniques and modifications needed when performing CPR on children.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 1490,  // 24:50
      endTime: 1646,    // 27:26
    },
    {
      id: 11,
      title: "Infant CPR",
      description: "Special techniques for performing CPR on infants under one year of age.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 1646,  // 27:26
      endTime: 1802,    // 30:02
    },
    {
      id: 12,
      title: "Child and Infant AED",
      description: "How to use an AED on children and infants, including proper pad placement and safety considerations.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 1802,  // 30:02
      endTime: 1911,    // 31:51
    },
    {
      id: 13,
      title: "Adult Choking",
      description: "Learn how to help an adult who is choking, including back blows and abdominal thrusts.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 1911,  // 31:51
      endTime: 2123,    // 35:23
    },
    {
      id: 14,
      title: "Child Choking",
      description: "Techniques for helping a choking child between the ages of 1 and puberty.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 2123,  // 35:23
      endTime: 2332,    // 38:52
    },
    {
      id: 15,
      title: "Infant Choking",
      description: "Specialized techniques for helping a choking infant under one year of age.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 2332,  // 38:52
      endTime: 2510,    // 41:50
    },
    {
      id: 16,
      title: "Seizures",
      description: "How to recognize and provide first aid for someone experiencing different types of seizures.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 2510,  // 41:50
      endTime: 2829,    // 47:09
    },
    {
      id: 17,
      title: "Burns and Scalds",
      description: "Learn how to assess burn severity and provide appropriate first aid for different types of burns.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 2829,  // 47:09
      endTime: 3058,    // 50:58
    },
    {
      id: 18,
      title: "Foreign Objects",
      description: "How to safely remove foreign objects from the body, including splinters, objects in the eye, and more.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 3058,  // 50:58
      endTime: 3328,    // 55:28
    },
    {
      id: 19,
      title: "Heart Conditions",
      description: "Recognizing and responding to various heart conditions, including heart attacks and angina.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 3328,  // 55:28
      endTime: 3508,    // 58:28
    },
    {
      id: 20,
      title: "Strokes",
      description: "How to identify the signs of a stroke using the FAST method and provide immediate assistance.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 3508,  // 58:28
      endTime: 3572,    // 59:32
    },
    {
      id: 21,
      title: "Applying a Sling",
      description: "Step-by-step guide on how to properly apply an arm sling for injuries to the arm, shoulder, or collarbone.",
      thumbnail: require('../assets/aid.jpg'),
      videoUrl: baseVideoUrl,
      startTime: 3572,  // 59:32
      endTime: 3900,    // End of video (approx. 65:00)
    }
  ];

  // Load user's training progress from API
  useEffect(() => {
    setLoading(true);
    
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Safety timeout to ensure loading state ends
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.log('Safety timeout triggered - forcing loading state to false');
        setLoading(false);
      }
    }, 5000);

    const userId = currentUser.phoneNumber || currentUser.uid;
    
    // Fire-and-forget approach - don't await, use promises
    axios.get(`${API_BASE_URL}/api/users/${userId}/training-progress`, {
      timeout: 5000 // 5 second timeout
    })
      .then(response => {
        if (response.data && response.data.success) {
          // Convert array of progress items to an object with videoId as key
          const completedVideosData = {};
          
          // Process the progress data
          response.data.data.progress.forEach(item => {
            completedVideosData[item.videoId] = item.completed;
          });
          
          setCompletedVideos(completedVideosData);
          
          // Set progress percentage
          setProgress(response.data.data.stats.progressPercentage);
        } else {
          // Set default values if response is not successful
          setCompletedVideos({});
          setProgress(0);
        }
      })
      .catch(error => {
        console.error("Error loading training progress:", error);
        // Set default values on error
        setCompletedVideos({});
        setProgress(0);
      })
      .finally(() => {
        setLoading(false);
        clearTimeout(safetyTimeout);
      });

    return () => clearTimeout(safetyTimeout);
  }, [currentUser]);

  // Handle marking a video as completed
  const handleVideoComplete = (videoId) => {
    if (!currentUser) return;
    
    const userId = currentUser.phoneNumber || currentUser.uid;
    
    // Update local state immediately for responsive UI
    setCompletedVideos(prev => ({
      ...prev,
      [videoId]: true
    }));
    
    // Update progress percentage immediately
    const totalVideos = trainingVideos.length;
    const completedCount = Object.values({...completedVideos, [videoId]: true}).filter(Boolean).length;
    const progressPercentage = (completedCount / totalVideos) * 100;
    setProgress(progressPercentage);
    
    // Fire-and-forget API call - don't await
    axios.post(`${API_BASE_URL}/api/users/${userId}/training-progress`, {
      videoId,
      completed: true
    })
    .then(response => {
      console.log('Training progress updated successfully');
    })
    .catch(error => {
      console.error("Error updating training progress:", error);
      // If the API fails, we could revert the UI change, but for simplicity, 
      // we'll keep the optimistic UI update
    });
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
        <Text style={styles.headerTitle}>Training Videos</Text>
      </View>

      {/* Progress Bar */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2B95E1" />
        </View>
      ) : (
        <ProgressBar progress={progress} />
      )}

      {/* Video List */}
      <ScrollView style={styles.videoList}>
        {trainingVideos.map((video) => (
          <TrainingVideo
            key={video.id}
            videoId={video.id}
            title={video.title}
            description={video.description}
            thumbnail={video.thumbnail}
            videoUrl={video.videoUrl}
            startTime={video.startTime}
            endTime={video.endTime}
            isCompleted={!!completedVideos[video.id]}
            onVideoComplete={handleVideoComplete}
          />
        ))}
      </ScrollView>
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
    padding: 10,
    alignItems: 'center',
  },
  progressBarContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: '#757575',
    textAlign: 'right',
  },
  videoList: {
    flex: 1,
    padding: 16,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  completedVideoCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  thumbnail: {
    width: 120,
    height: 90,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  videoInfo: {
    flex: 1,
    padding: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 4,
  },
  timeStamp: {
    fontSize: 12,
    color: '#2B95E1',
    marginTop: 4,
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default Training;