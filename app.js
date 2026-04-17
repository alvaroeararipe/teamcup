import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { firebaseConfig } from "./firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

window.login = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
  alert("Logado!");
};

window.enviar = async () => {
  const nome = document.getElementById("nome").value;

  await addDoc(collection(db, "jogadores"), {
    nome: nome
  });

  carregar();
};

async function carregar(){
  const snapshot = await getDocs(collection(db, "jogadores"));

  let html = "<h3>Inscritos</h3>";

  snapshot.forEach(doc=>{
    html += "<p>" + doc.data().nome + "</p>";
  });

  document.getElementById("lista").innerHTML = html;
}

carregar();
