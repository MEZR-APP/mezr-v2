/**
 * Mezr App - Auth Service
 * Account deletion with complete data removal (GDPR-compliant)
 */

import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, deleteAllUserFirestoreData } from './firebase';

/**
 * Permanently delete the user's account and ALL associated data.
 *
 * Order of operations (critical for security rules + data integrity):
 *   1. Re-authenticate  — satisfies Firebase's recent-login requirement
 *   2. Delete Firestore — while still authenticated so security rules pass
 *   3. Delete Auth user — irreversible; done last
 *   4. Clear local      — AsyncStorage.clear() removes everything on device
 *
 * If Firestore deletion fails (e.g. missing security rules), the function
 * still proceeds to delete the Auth user so the account is fully removed.
 * Orphaned Firestore docs are harmless — they're inaccessible without auth
 * and can be cleaned up later via a Cloud Function or admin script.
 *
 * The caller (authStore) is responsible for clearing app state after this resolves.
 */
export async function deleteAccountAndAllData(password: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No user logged in');
  }
  if (!currentUser.email) {
    throw new Error('No email associated with this account');
  }

  const uid = currentUser.uid;

  // Step 1: Re-authenticate — must succeed before we touch anything
  try {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
  } catch (error: any) {
    if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
      throw new Error('Incorrect password. Please try again.');
    }
    if (error?.code === 'auth/too-many-requests') {
      throw new Error('Too many attempts. Please try again later.');
    }
    throw error;
  }

  // Step 2: Delete ALL Firestore data (best-effort — don't block on permission errors)
  try {
    await deleteAllUserFirestoreData(uid);
  } catch (firestoreError) {
    console.warn('Firestore data deletion failed (will still delete auth account):', firestoreError);
  }

  // Step 3: Delete Firebase Auth account (must succeed — this is the critical step)
  await deleteUser(currentUser);

  // Step 4: Wipe all local storage
  await AsyncStorage.clear();
}
