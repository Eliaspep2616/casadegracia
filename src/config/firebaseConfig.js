import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// 🚨 ESTA ES LA LÍNEA QUE TE FALTA:
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyAs-VSm3zcq-Cnzh-Mx1MIjpaOAA4DHZMI",
  authDomain: "ticket-71d47.firebaseapp.com",
  projectId: "ticket-71d47",
  storageBucket: "ticket-71d47.firebasestorage.app",
  messagingSenderId: "764840624684",
  appId: "1:764840624684:web:8fd0a3ae0257c052918789",
  measurementId: "G-RVKDB7PMJV"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 🚀 EXPORTAR LA BASE DE DATOS
export const db = getFirestore(app);