import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TrainingVideo = ({ title, description, thumbnail, videoUrl }) => {
  const handleVideoPress = () => {
    Linking.openURL(videoUrl);
  };

  return (
    <TouchableOpacity style={styles.videoCard} onPress={handleVideoPress}>
      <Image 
        source={{ uri: thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{title}</Text>
        <Text style={styles.videoDescription} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const Training = () => {
  const navigation = useNavigation();

  // Sample video data - replace with your actual video content
  const trainingVideos = [
    {
      id: 1,
      title: "Basic First Aid Training",
      description: "Learn the fundamentals of first aid including CPR, wound care, and emergency response procedures.",
      thumbnail: "https://img.youtube.com/vi/YOUTUBE_VIDEO_ID/hqdefault.jpg", // Replace YOUTUBE_VIDEO_ID with actual ID
      videoUrl: "https://www.youtube.com/watch?v=YOUTUBE_VIDEO_ID" // Replace with actual URL
    },
    {
      id: 2,
      title: "CPR Tutorial",
      description: "Step-by-step guide on performing CPR correctly in emergency situations.",
      thumbnail: "https://img.youtube.com/vi/YOUTUBE_VIDEO_ID/hqdefault.jpg",
      videoUrl: "https://www.youtube.com/watch?v=YOUTUBE_VIDEO_ID"
    },
    // Add more videos as needed
  ];

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

      {/* Video List */}
      <ScrollView style={styles.videoList}>
        {trainingVideos.map((video) => (
          <TrainingVideo
            key={video.id}
            title={video.title}
            description={video.description}
            thumbnail={video.thumbnail}
            videoUrl={video.videoUrl}
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
  },
});

export default Training; 