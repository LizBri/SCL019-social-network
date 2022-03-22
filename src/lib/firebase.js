// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  Timestamp,
  deleteDoc,
  updateDoc,
  getDoc,
  query,
  doc,
  arrayRemove,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
import { firebaseConfig } from "./config.js";


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore();
let currentUser;
const orderCollection = collection(db, "user");
// const analytics = getAnalytics(app);



//-------------------Login con Google ------------------------
export const registerGoogle = (callback) => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      const nameUser = user.displayName;
      userDataGoogle();
      console.log("holaaaaa user ", nameUser);
      callback(true);

      // const dataUser = document.getElementById('dataUser');
      // dataUser.innerHTML = `<span class="h4bold">Hola!</span> ${getUserData.displayName}`;
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      console.log('Buenos dias', error);
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      console.log(email);
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.log(credential);
      // ...
      callback(false);
    });

};
export const userDataGoogle = async () => {
  const user = auth.currentUser;
  const userName = user.displayName;
  if (user !== null) {
    const docRef = await addDoc(collection(db, "google"), {
      name: user.displayName,
      email: user.email,
      uid: user.uid,
    });

  }
};

export const getUserData = () => {
  return auth.currentUser;
}

// --------- Cerrar sesión --------------
export const logOut = () => {
  signOut(auth).then(() => {
    console.log('Usuario Cerro Sesión');
    window.location.hash = '#/login';
  }).catch((error) => {
    // An error happened.
  });
}

// -------- Permite verificar si hay un usuario conectado -----------
export const verification = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      console.log('usuario Logeado', currentUser.displayName);
      const uid = user.uid;
      return currentUser;
      
    } else if (window.location.hash = "#/Dashboard") {
      console.log('No hay Usuario logueado');
      logOut();
      // User is signed out
    }
  });
}
//-------- REGISTER Se guarda el Email y el password del usuario ----------
export const registerUser = (email, password, displayName, date) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log("Hola uid", user.uid);
      const userId = user.uid;
      emailVerification(auth);
      addNewDocument(userId, displayName, date);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
      alert('Este correo electrónico ya existe.')
    });
}

//------ Se ingresan los valores Firestore Datebase ----------
async function addNewDocument(userId, displayName, date) {
  const newDoc = await addDoc(orderCollection, {
    uid: userId,
    displayName: displayName,
    bithday: date,

  });
  console.log(`Tu cuenta ha sido creada en ${newDoc.path}`);
};

//--------- Enviar correo para Recuperar contraseña -------
export const resetPass = (email) => {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      // Password reset email sent!
      // ..
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
      //..
    });
}

//------ Enviar correo de validación de Google -------
function emailVerification(auth) {
  sendEmailVerification(auth.currentUser)
    .then(() => {
      //...
    });
}

//------------ Hacer el Login con correo y contraseña ---------------
export const loginEmailPassword = (email, password, callback) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      callback(true);
      // const user = userCredential.user.email.split('@');
      // const nameUser = user[0];
      // console.log('Hola User!!!!! ', user.uid);
      // const dataUser = document.getElementById('dataUser');
      // dataUser.innerHTML = `<span class="h4bold">Hola!</span> ${nameUser}`;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      if (errorCode === 'auth/user-not-found') {
        alert('usuario no regristrado');

      } else if (errorCode === 'auth/wrong-password') {
        alert('Contraseña incorrecta');
      }
      callback(false);
    });

}
// ------------- Almacenamos el post --------------------
export const savePost = (description) => {
  let userName;
  if (auth.currentUser.displayName == null) {
    let separateEmail = auth.currentUser.email.split('@');
    userName = separateEmail[0];
  } else {
    userName = auth.currentUser.displayName;
  }
  addDoc(collection(db, 'Post'), {
    uid: auth.currentUser.uid,
    name: userName,
    description: description,
    likes:[],
    likesCounter: 0,
    datepost: Timestamp.fromDate(new Date()),
  });
};

//---------- Publicamos en el Dashboard ----------------------
export const postOnTheWall = async () => {

  const allPost = query(collection(db, "Post"), orderBy('datepost', 'desc'));
  const querySnapshot = await getDocs(allPost);
  let html = '';
  querySnapshot.forEach((doc) => {
    const post = doc.data();

    html += `
    <div class="mainDash_board_publications_content">
      <div class="mainDash_board_publications_content_user">
        <h6>${post.name} publicó:</h6>`;

    if (post.uid === auth.currentUser.uid) {
      html += `
        <button type="btn" class="btnDelete" value="${doc.id}" data-id="myId"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <p class="mainDash_board_publications_content_text">${post.description}</p>
      <button class="btn-like mainDash_board_publications_content_starR"  value="${doc.id}">
      <i class="fa-regular fa-star"></i> ${post.likesCounter} Likes</button>
    </div>`;

    } else {
      html += `
      </div>
      <p class="mainDash_board_publications_content_text">${post.description}</p>
      <button class="btn-like mainDash_board_publications_content_starR" value="${doc.id}">
      <i class="fa-regular fa-star"></i> ${post.likesCounter} Likes</button>

      </div>`;
    }
  });
  document.getElementById('container_posts').innerHTML = html;

  const btnDelete = document.querySelectorAll('.btnDelete');
  btnDelete.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (confirm("¿Estás segura de eliminar esta publicación?")) {
        deletePost(btn.value);
      }
    });
  });
  const likeBtn = document.querySelectorAll('.btn-like');
  console.log(likeBtn);
  likeBtn.forEach((btnL) => {
    btnL.addEventListener('click', () => {
      const postId = btnL.value;
      updateLikes(postId);
    });
    });
  }


// -------------- DELETE POST---------------
export const deletePost = async (id) => {
  await deleteDoc(doc(db, 'Post', id));
};


// ------------ LIKES & DISLIKE ----------------
export const updateLikes = async (id) => {
  console.log('click');
  const userIdentifier = auth.currentUser.uid;
  console.log('Hola postData', userIdentifier);

  const postRef = doc(db, 'Post', id);
  const docSnap = await getDoc(postRef);
  const postData = docSnap.data();
  const likesCount = postData.likesCounter;

  if ((postData.likes).includes(userIdentifier)) {
    await updateDoc(postRef, {
      likes: arrayRemove(userIdentifier),
      likesCounter: likesCount - 1,
    });
  } else {
    await updateDoc(postRef, {
      likes: arrayUnion(userIdentifier),
      likesCounter: likesCount + 1,
    });
  }
};