import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function readCMS() {
  try {
    const cmsDocRef = doc(db, "cms_configs", "designs");
    const snapshot = await getDoc(cmsDocRef);
    if (snapshot.exists()) {
      console.log("CMS content from Firestore:", JSON.stringify(snapshot.data(), null, 2));
    } else {
      console.log("No document found!");
    }
  } catch (err) {
    console.error("Error reading CMS:", err);
  }
}

readCMS();
