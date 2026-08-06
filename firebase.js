// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4xlXz693Hok0lT8UwPsPLVBBXAwGtcEA",
  authDomain: "engai-ceo.firebaseapp.com",
  projectId: "engai-ceo",
  storageBucket: "engai-ceo.firebasestorage.app",
  messagingSenderId: "117685301740",
  appId: "1:117685301740:web:db27982eeb0302367690c9",
  measurementId: "G-V1P437WVG9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// @ts-nocheck
