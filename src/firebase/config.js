import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6yEkC6Hvprs6yTM1bFBOLj6uHakpQaag",
  authDomain: "real-time-chat-app-dffc1.firebaseapp.com",
  projectId: "real-time-chat-app-dffc1",
  storageBucket: "real-time-chat-app-dffc1.appspot.com",
  messagingSenderId: "951672063566",
  appId: "1:951672063566:web:ce6d330791c4af6b90a51f",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
