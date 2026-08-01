import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const config = {
  apiKey: "AIzaSyCf5mbe7tib9Jgh6Kzmq-ENorMfhF392ug",
  authDomain: "egrfdg-814e8.firebaseapp.com",
  projectId: "egrfdg-814e8",
  storageBucket: "egrfdg-814e8.firebasestorage.app",
  messagingSenderId: "727110927173",
  appId: "1:727110927173:web:c28fff92c1e68b3068742c",
  measurementId: "G-NZXWKCTCEL"
};

export const app: FirebaseApp = initializeApp(config);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export const initFirebase = async () => {
  return { app, auth, db };
};

export const getFirebaseAuth = () => auth;
export const getFirebaseDb = () => db;
