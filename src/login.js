import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object

// Configuraciones necesarias para Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const UserEmail = document.getElementById("Usuario");
const UserPassword = document.getElementById("Contrasena");

const Message = document.getElementById("Message");
const Boton_Login = document.getElementById("Login");
Boton_Login.addEventListener("click", Loggear);

function Loggear() {
  signInWithEmailAndPassword(auth, UserEmail.value, UserPassword.value)
    .then((userCredential) => {
      window.location.href = "https://lista-seas.firebaseapp.com/lista.html";
    })
    .catch((error) => {
      Message.innerHTML = "Error de autenticacion";
    });
}
