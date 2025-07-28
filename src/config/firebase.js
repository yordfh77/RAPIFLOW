// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUVic76jZTqX6Ij0r-2FBrTWd9wNSio3o",
  authDomain: "rapiflow-b31de.firebaseapp.com",
  projectId: "rapiflow-b31de",
  storageBucket: "rapiflow-b31de.firebasestorage.app",
  messagingSenderId: "339489341161",
  appId: "1:339489341161:web:b385b41394b67d153bfa78",
  measurementId: "G-1G5B4M00XN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the initialized services
export { app, auth, db, storage };
export default app;