// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "genwebai-3f6d9.firebaseapp.com",
  projectId: "genwebai-3f6d9",
  storageBucket: "genwebai-3f6d9.firebasestorage.app",
  messagingSenderId: "280896159130",
  appId: "1:280896159130:web:7d250c2ac02da626fe4e23",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
