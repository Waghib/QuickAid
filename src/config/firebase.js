import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase, auth, firestore };