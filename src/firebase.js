// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHkj3XzuXgkv2WhsPTjbN8a4ktKzoheV8",
  authDomain: "skill-barter-platform-d77ef.firebaseapp.com",
  projectId: "skill-barter-platform-d77ef",
  storageBucket: "skill-barter-platform-d77ef.firebasestorage.app",
  messagingSenderId: "299487188452",
  appId: "1:299487188452:web:504a6de7b2006465f2a3f1",
  measurementId: "G-THJPM5VPCW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
