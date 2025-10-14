import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBrHl_DCQ3IG3B8Fah7nwM_TC31-bnuG8M",
  authDomain: "flamia-d69dd.firebaseapp.com",
  projectId: "flamia-d69dd",
  storageBucket: "flamia-d69dd.firebasestorage.app",
  messagingSenderId: "148091057599",
  appId: "1:148091057599:web:9381e131defae2078a9d0a",
  measurementId: "G-TQFJ2LRX7J"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
let analytics: ReturnType<typeof getAnalytics> | null = null;

export const getFirebaseAnalytics = () => {
  if (!analytics && typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  return analytics;
};

// Initialize Firebase Cloud Messaging
let messaging: ReturnType<typeof getMessaging> | null = null;

export const getFirebaseMessaging = () => {
  if (!messaging && typeof window !== 'undefined') {
    messaging = getMessaging(app);
  }
  return messaging;
};

export { getToken, onMessage };
