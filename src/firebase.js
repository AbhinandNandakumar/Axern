import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD0y6vA8LjstecMMLShl2Q8iFTpiL2vSLg",
  authDomain: "axern-ai.firebaseapp.com",
  projectId: "axern-ai",
  storageBucket: "axern-ai.firebasestorage.app",
  messagingSenderId: "139002332171",
  appId: "1:139002332171:web:38b77078ef2d2063f6b30e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();



export {
  auth,
  provider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
};