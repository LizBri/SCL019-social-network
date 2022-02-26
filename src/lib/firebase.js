// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
// import { getDatabase } from "https://datos_de_usuario.southamerica-east1.firebaseio.com";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider,signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
import {firebaseConfig} from "./config.js"

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore();
// const analytics = getAnalytics(app);

//-----Login con Google ---------------
export const registerGoogle = () => {
   signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
};

// ------ Cerrar sesión ---------
export const logOut = () => {
  signOut(auth).then(() => {
    console.log('Usuario Cerro Sesión');
    
  }).catch((error) => {
    // An error happened.
  });
} 

// ------Permite verificar si hay un usuario conectado 
let currentUser;
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log('usuario Logeado', currentUser.displayName);
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    // ...
  } else {
      console.log('No hay Usuario logueado');
    // User is signed out
    // ...
  }
});

 //-------- Se guarda el Email y el password del usuario ----------
export const registerUser = (email, password) =>{
    createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log(user);
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
    // ..
  });
}

// import { collection, addDoc } from "firebase/firestore";
export async function insert (){
  try {
    const docRef = await addDoc(collection(db, "users"), {
      first: "Ada",
      last: "Lovelace",
      born: 1815
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}



// const database = getDatabase(app);
// export const dataUser = (nameLastname, dateOfbirth) =>{
//   // Constante original      const database = getDatabase(app);
//   //  getDatabase (database, nameLastname, dateOfbirth);
// }