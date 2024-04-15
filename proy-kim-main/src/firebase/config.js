// Importa las funciones que necesitas de los SDK que necesitas
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Configuración de tu aplicación web de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCgvxNFUdg8OQXmjSnfEARfsnO0iPQNH74",
  authDomain: "db-proykim.firebaseapp.com",
  databaseURL: "https://db-proykim-default-rtdb.firebaseio.com",
  projectId: "db-proykim",
  storageBucket: "db-proykim.appspot.com",
  messagingSenderId: "364070619730",
  appId: "1:364070619730:web:3ed46d3f6da28285302d8b"
};

// Inicializa Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage(firebaseApp, "gs://db-proykim.appspot.com");

export { db, storage };
