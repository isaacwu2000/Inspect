import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Firebase imports, exports and config
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
export { collection, doc, addDoc, updateDoc, setDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
export { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAV7FgcAZlVueothF6ij4uqppxl7eKX2aE",
  authDomain: "app-challenge-2526-dev.firebaseapp.com",
  projectId: "app-challenge-2526-dev",
  storageBucket: "app-challenge-2526-dev.firebasestorage.app",
  messagingSenderId: "363511042243",
  appId: "1:363511042243:web:e311e2fd92cfac22751276"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

// Intializing the react app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
