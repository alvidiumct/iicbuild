import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyA-YVYwleUjdWGWbiDXjKq4C7JO8ESLv0w",
  authDomain: "iicambasa.firebaseapp.com",
  projectId: "iicambasa",
  storageBucket: "iicambasa.firebasestorage.app",
  messagingSenderId: "262162457548",
  appId: "1:262162457548:web:439232ef78b9ad8181b369",
  measurementId: "G-5QLDBFQXP9"
};

// Initialize Firebase singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(firebaseApp);
