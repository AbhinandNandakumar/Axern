import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc,
  setDoc, 
  query, 
  getDocs,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
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
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Function to save chat to Firebase
export const saveChat = async (input, response) => {
  const user = auth.currentUser;
  if (!user) {
    console.error('User not logged in!');
    return;
  }

  const timestamp = new Date().toISOString();
  const chatRef = doc(collection(db, 'users', user.uid, 'chats'));
  
  try {
    await setDoc(chatRef, {
      input,
      response,
      timestamp,
      userId: user.uid // Adding userId for extra reference
    });
    console.log('Chat saved successfully');
  } catch (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
};

// Function to fetch chat history
export const getChatHistory = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error('User not logged in!');
    return [];
  }

  try {
    const chatsRef = collection(db, 'users', user.uid, 'chats');
    const q = query(chatsRef, orderBy('timestamp', 'desc')); // Sort by timestamp in descending order
    
    const querySnapshot = await getDocs(q);
    const chatHistory = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('Retrieved chat history:', chatHistory);
    return chatHistory;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};

export const deleteChat = async (chatId) => {
  const user = auth.currentUser;
  if (!user) {
    console.error('User not logged in!');
    return;
  }

  try {
    const chatRef = doc(db, 'users', user.uid, 'chats', chatId);
    await deleteDoc(chatRef);
    console.log('Chat deleted successfully');
  } catch (error) {
    console.error('Error deleting chat:', error);
  }
};



export {
  auth,
  provider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
};