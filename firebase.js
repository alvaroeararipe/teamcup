// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhOIXYBqBELD0LDuGamKotPeW_qBu70WY",
  authDomain: "teamcup-a3af2.firebaseapp.com",
  projectId: "teamcup-a3af2",
  storageBucket: "teamcup-a3af2.firebasestorage.app",
  messagingSenderId: "49913899541",
  appId: "1:49913899541:web:817c26257e72f307d7fc1c",
  measurementId: "G-Z0VTN373FN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const firebaseConfig = {
  apiKey: "AIzaSyDhOIXYBqBELD0LDuGamKotPeW_qBu70WY",
  authDomain: "teamcup-a3af2.firebaseapp.com",
  projectId: "teamcup-a3af2",
};
