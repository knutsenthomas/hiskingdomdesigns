import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

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
      console.log("Current 'shipping-returns-title' in DB:", data["shipping-returns-title"]);
      if (data["shipping-returns-title"] !== "Enkel retur & kjøpsvilkår") {
        console.log("Updating DB value...");
        await updateDoc(docRef, {
          "shipping-returns-title": "Enkel retur & kjøpsvilkår"
        });
        console.log("Updated successfully!");
      } else {
        console.log("DB value is already correct.");
      }
    } else {
      console.log("Document does not exist.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

run();
