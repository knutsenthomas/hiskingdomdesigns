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

const affiliates = [
  {
    id: "18cf516e-0caa-430c-9bb5-6150854fcd6f",
    name: "Thomas Knutsen",
    email: "knutsenthomas@gmail.com",
    address: "Løkkeveien 3B, 4580 Lyngdal",
    socialMedia: "Instagram: @hiskingdomdesigns",
    motivation: "Importert godkjent affiliate markedsfører fra GoAffPro",
    status: "approved",
    appliedAt: new Date().toISOString()
  },
  {
    id: "969a22c1-88fb-4a4b-8a33-efe9014c17e8",
    name: "Thomas Knutsen",
    email: "thomas@tk-design.no",
    address: "Løkkeveien 3B, 4580 Lyngdal",
    socialMedia: "Instagram: @hiskingdomdesigns",
    motivation: "Importert godkjent affiliate markedsfører fra GoAffPro",
    status: "approved",
    appliedAt: new Date().toISOString()
  },
  {
    id: "9ef24759-8437-47f4-af5b-475d8a78885d",
    name: "Thomas Knutsen",
    email: "thomas@hiskingdomministry.no",
    address: "Løkkeveien 3B, 4580 Lyngdal",
    socialMedia: "Instagram: @hiskingdomdesigns",
    motivation: "Importert godkjent affiliate markedsfører fra GoAffPro",
    status: "approved",
    appliedAt: new Date().toISOString()
  },
  {
    id: "4657956d-9bc7-4d41-8cc5-a4ad65df7073",
    name: "Hilde Karin Knutsen",
    email: "hildekarin@gmail.com",
    address: "Løkkeveien 3B, 4580 Lyngdal",
    socialMedia: "Instagram: @hiskingdomdesigns",
    motivation: "Importert godkjent affiliate markedsfører fra GoAffPro",
    status: "approved",
    appliedAt: new Date().toISOString()
  },
  {
    id: "c46c6fab-01cb-4fa7-82b7-2b16b7f7f3d7",
    name: "Hilde Karin Knutsen",
    email: "hildekarin@hiskingdomministry.no",
    address: "Løkkeveien 3B, 4580 Lyngdal",
    socialMedia: "Instagram: @hiskingdomdesigns",
    motivation: "Importert godkjent affiliate markedsfører fra GoAffPro",
    status: "approved",
    appliedAt: new Date().toISOString()
  },
  {
    id: "607110c8-fce5-40ea-9ef8-406b1e0eb119",
    name: "Tina Birkeland",
    email: "konvall@icloud.com",
    address: "N/A",
    socialMedia: "Instagram: N/A",
    motivation: "Importert godkjent affiliate markedsfører fra GoAffPro",
    status: "approved",
    appliedAt: new Date().toISOString()
  },
  {
    id: "f8e374b4-3ab4-45bd-9850-19b19f9d048b",
    name: "Brit-Silje Fremmegård",
    email: "britty1254@hotmail.com",
    address: "N/A",
    socialMedia: "Instagram: N/A",
    motivation: "Importert godkjent affiliate markedsfører fra GoAffPro",
    status: "approved",
    appliedAt: new Date().toISOString()
  }
];

async function seed() {
  console.log("Seeding approved affiliates into Firestore...");
  for (const aff of affiliates) {
    const { id, ...data } = aff;
    const docRef = doc(db, 'affiliate_applications', id);
    await setDoc(docRef, data);
    console.log(`- Seeded: ${aff.name} (${aff.email}) [ID: ${id}]`);
  }
  console.log("Seeding completed successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Error seeding affiliates:", err);
  process.exit(1);
});
