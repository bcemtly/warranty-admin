import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Mobil uygulamayla aynı Firebase projesi kullanılmalıdır
const firebaseConfig = {
  apiKey: "AIzaSyDyCC4wei_rxFVNb6K2fYrw6fEkogC90d8",
  authDomain: "delphi-e686e.firebaseapp.com",
  projectId: "delphi-e686e",
  storageBucket: "delphi-e686e.firebasestorage.app",
  messagingSenderId: "347752485231",
  appId: "1:347752485231:web:fa5404a8995f864f8fd89a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
