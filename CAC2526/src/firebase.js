import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export { ref, getBlob } from "firebase/storage";
export {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from "firebase/firestore";
export { onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD71mDZwBVhUQEgQwfySt45JRBCbV2hkho",
  authDomain: "inspect-game.firebaseapp.com",
  projectId: "inspect-game",
  storageBucket: "inspect-game.firebasestorage.app",
  messagingSenderId: "1097946602453",
  appId: "1:1097946602453:web:a6e30073cdc6f59db4bb5c",
  measurementId: "G-XL9GQB1FW2"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app, "gs://inspect-game.firebasestorage.app");
