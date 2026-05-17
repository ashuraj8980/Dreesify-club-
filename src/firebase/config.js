import { initializeApp } from "firebase/app";

// Firebase configuration from your project
const firebaseConfig = {
  apiKey: "AIzaSyCkIuCEPA6rN_b-Cynomso1B-4mSxnACUo",
  authDomain: "dressify-b3b82.firebaseapp.com",
  projectId: "dressify-b3b82",
  storageBucket: "dressify-b3b82.firebasestorage.app",
  messagingSenderId: "337593906590",
  appId: "1:337593906590:web:366f8e3d79d96a7ad9128f",
  measurementId: "G-QZQZPK6C5C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
