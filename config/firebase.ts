import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6rmNDyXR3uYKawNfBGUhsdSNE22xnbh8",
  authDomain: "news-86407.firebaseapp.com",
  databaseURL: "https://news-86407.firebaseio.com",
  projectId: "news-86407",
  storageBucket: "news-86407.appspot.com",
  messagingSenderId: "75789875754",
  appId: "1:75789875754:android:af74fca48650fdc7bf6153"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Get Firebase services
const db = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

export const REGISTRATION_COMPLETED_KEY = 'registration_completed';

export { app, db, database, storage, auth };
