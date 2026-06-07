import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyABoePYQM_Xpo-hC1AKKfN7ODJdDgbQi_k",
  authDomain: "his-kingdom-designs.firebaseapp.com",
  projectId: "his-kingdom-designs",
  storageBucket: "his-kingdom-designs.firebasestorage.app",
  messagingSenderId: "626968403342",
  appId: "1:626968403342:web:5f76bfe02d3ccfbfa198df",
  measurementId: "G-SPZCSBK1T5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateCMS() {
  try {
    const cmsDocRef = doc(db, "cms_configs", "designs");
    
    const updates = {
      "home-benefits-title-1": "Gratis frakt over 1500 kr"
    };

    await setDoc(cmsDocRef, updates, { merge: true });
    console.log("CMS content successfully updated in Firestore:", updates);
  } catch (err) {
    console.error("Error updating CMS:", err);
  }
}

updateCMS();
