import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Check if Firebase is not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp({
        // Your firebase config from google-services.json
        projectId: "quickaid-6ae26",
        appId: "1:1045206375708:android:153e577937a5d54b5e2ed9",
        storageBucket: "quickaid-6ae26.firebasestorage.app",
        apiKey: "AIzaSyB3XpZywQQES0s6jhVsi7xJgx412paJD2A",
        messagingSenderId: "1045206375708",
    });
}

export { firebase, auth, firestore };