import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export const initFirebase = async () => {
  if (app) return { app, auth: auth!, db: db! };

  try {
    const config = {
      apiKey: "AIzaSyCf5mbe7tib9Jgh6Kzmq-ENorMfhF392ug",
      authDomain: "egrfdg-814e8.firebaseapp.com",
      projectId: "egrfdg-814e8",
      storageBucket: "egrfdg-814e8.firebasestorage.app",
      messagingSenderId: "727110927173",
      appId: "1:727110927173:web:c28fff92c1e68b3068742c",
      measurementId: "G-NZXWKCTCEL"
    };
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    return { app, auth, db };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

export const getFirebaseAuth = async () => {
  const instances = await initFirebase();
  return instances.auth;
};

export const getFirebaseDb = async () => {
  const instances = await initFirebase();
  return instances.db;
};
