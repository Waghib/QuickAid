import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authStyles } from '../styles/authStyles';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';

const ResponderAccount = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.phoneNumber)
          .get();

        if (userDoc.exists) {
          const data = userDoc.data();
          setUserData(data);
          setProfileImage(data.profileImageUrl || null);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const selectImage = async () => {
    const options = {
      maxWidth: 2000,
      maxHeight: 2000,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    try {
      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', 'ImagePicker Error: ' + result.errorMessage);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const source = { uri: result.assets[0].uri };
        uploadImage(source.uri);
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('User not logged in');
      }

      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const storageRef = storage().ref(`profile_images/${currentUser.uid}/${filename}`);
      
      // Upload file
      const task = storageRef.putFile(uri);
      
      // Monitor upload progress
      task.on('state_changed', snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      });

      await task;
      
      // Get download URL
      const downloadUrl = await storageRef.getDownloadURL();
      
      // Update Firestore with image URL
      await firestore()
        .collection('users')
        .doc(currentUser.phoneNumber)
        .update({
          profileImageUrl: downloadUrl,
        });
      
      setProfileImage(downloadUrl);
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      // No need to navigate - the auth state change will automatically
      // trigger the navigation in App.tsx through the onAuthStateChanged listener
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const getFontSize = (size) => (width * size) / 430;
  const getVerticalSpacing = (size) => (height * size) / 900;

  const dynamicStyles = {
    topSection: {
      height: height * 0.2,
      paddingTop: getVerticalSpacing(40),
    },
    title: {
      fontSize: getFontSize(20),
    },
    itemText: {
      fontSize: getFontSize(16),
    },
    valueText: {
      fontSize: getFontSize(14),
    },
  };

  const AccountItem = ({ label, value }) => (
    <View style={styles.accountItem}>
      <Text style={[styles.itemText, dynamicStyles.itemText]}>{label}</Text>
      <Text style={[styles.valueText, dynamicStyles.valueText]}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2B95E1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2B95E1" barStyle="light-content" />
      
      <View style={[authStyles.topSection, dynamicStyles.topSection]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>{"❮"}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, dynamicStyles.title]}>My Account</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{userData?.name?.[0] || '?'}</Text>
            </View>
          )}
          
          {uploading ? (
            <View style={styles.uploadProgressContainer}>
              <ActivityIndicator size="small" color="#2B95E1" />
              <Text style={styles.uploadProgressText}>{`${Math.round(uploadProgress)}%`}</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={selectImage}
            >
              <Text style={styles.uploadButtonText}>
                {profileImage ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <AccountItem label="Name" value={userData?.name || 'N/A'} />
        <AccountItem label="Phone number" value={userData?.phoneNumber || 'N/A'} />
        <AccountItem label="CNIC" value={userData?.cnic || 'N/A'} />
        <AccountItem label="Worker ID" value={userData?.workerId || 'N/A'} />
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
    padding: 10,
  },
  backArrow: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 45,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 36,
    color: '#888888',
    fontWeight: 'bold',
  },
  uploadButton: {
    marginTop: 5,
    padding: 8,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: '#2B95E1',
    fontWeight: '500',
  },
  uploadProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  uploadProgressText: {
    marginLeft: 10,
    color: '#2B95E1',
  },
  accountItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemText: {
    color: '#666666',
    marginBottom: 5,
  },
  valueText: {
    color: '#333333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ResponderAccount; 