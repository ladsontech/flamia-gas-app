import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBrHl_DCQ3IG3B8Fah7nwM_TC31-bnuG8M",
  authDomain: "flamia-d69dd.firebaseapp.com",
  projectId: "flamia-d69dd",
  storageBucket: "flamia-d69dd.firebasestorage.app",
  messagingSenderId: "148091057599",
  appId: "1:148091057599:web:e1a997bd3c0153b28a9d0a",
  measurementId: "G-4031DNBFR5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: ReturnType<typeof getMessaging> | null = null;

export const getFirebaseMessaging = () => {
  if (!messaging && typeof window !== 'undefined') {
    messaging = getMessaging(app);
  }
  return messaging;
};

export { getToken, onMessage };
