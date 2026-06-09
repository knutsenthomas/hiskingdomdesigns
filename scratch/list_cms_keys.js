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

async function run() {
  try {
    const docRef = doc(db, "cms_configs", "designs");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log("All keys in CMS configs designs:", Object.keys(data).sort());
    } else {
      console.log("Document does not exist.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

run();
