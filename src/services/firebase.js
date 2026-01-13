import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  deleteUser,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  arrayUnion,
  onSnapshot,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import {
  getMessaging,
  getToken,
  onMessage,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyAY9kqryV_1oUbR5N9tN2x-Kt5jY_ecQSE",
  authDomain: "seorganiza-d4ffd.firebaseapp.com",
  projectId: "seorganiza-d4ffd",
  storageBucket: "seorganiza-d4ffd.firebasestorage.app",
  messagingSenderId: "970910696116",
  appId: "1:970910696116:web:8298918a58a4be65578de1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Inicializar Firestore com Persistência Moderna (substitui enableIndexedDbPersistence)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
const googleProvider = new GoogleAuthProvider();
const messaging = getMessaging(app);

export {
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  googleProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  deleteUser,
  updateProfile,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  arrayUnion,
  onSnapshot,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  analytics,
  messaging,
  getToken,
  onMessage,
};
