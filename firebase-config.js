// ---------------------------------------------------------------
// CONFIGURACIÓN DE FIREBASE
// Reemplaza estos valores por los que te da la consola de Firebase
// en: Configuración del proyecto → Tus apps → (ícono </>)
// ---------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCYwoDq_LVa13c6a-VhkfdJmn2GQtVo2NA",
  authDomain: "catalogo-agropecuario.firebaseapp.com",
  projectId: "catalogo-agropecuario",
  storageBucket: "catalogo-agropecuario.firebasestorage.app",
  messagingSenderId: "394498050563",
  appId: "1:394498050563:web:d8e9be21c9327b0cfbdc36",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
