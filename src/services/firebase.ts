import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyWVaRbsbN8qpzqac4kAPEENb_ofUeza0",
  authDomain: "mezr-5e2fd.firebaseapp.com",
  projectId: "mezr-5e2fd",
  storageBucket: "mezr-5e2fd.firebasestorage.app",
  messagingSenderId: "861713438070",
  appId: "1:861713438070:web:9616294771096813e01657"
};

// Initialize Firebase with error handling
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  // Check if Firebase app is already initialized to prevent duplicate initialization
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    app = getApp();
    console.log('Firebase app already initialized');
  }

  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error(`Failed to initialize Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

/**
 * Known subcollections under users/{uid}.
 * Add new subcollection names here as features are added.
 */
const USER_SUBCOLLECTIONS = ['activity'] as const;

/**
 * Delete ALL Firestore data for a user.
 * Removes every document in every known subcollection, then the user document.
 * Must be called while the user is still authenticated (security rules).
 */
export async function deleteAllUserFirestoreData(uid: string): Promise<void> {
  for (const sub of USER_SUBCOLLECTIONS) {
    const subRef = collection(db, 'users', uid, sub);
    const snapshot = await getDocs(subRef);
    await Promise.all(
      snapshot.docs.map((d) => deleteDoc(doc(db, 'users', uid, sub, d.id)))
    );
  }
  await deleteDoc(doc(db, 'users', uid));
}

/** @deprecated Use deleteAllUserFirestoreData instead */
export const deleteUserFirestoreData = deleteAllUserFirestoreData;

export { app, auth, db };
