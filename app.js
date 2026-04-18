alert("JS OK");
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhOIXYBqBELD0LDuGamKotPeW_qBu70WY",
  authDomain: "teamcup-a3af2.firebaseapp.com",
  projectId: "teamcup-a3af2",
  storageBucket: "teamcup-a3af2.firebasestorage.app",
  messagingSenderId: "49913899541",
  appId: "1:49913899541:web:817c26257e72f307d7fc1c",
  measurementId: "G-Z0VTN373FN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let user = null;

window.login = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  user = result.user;
  alert("Logado!");
};

window.entrarTime = async () => {

  const nomeInput = document.getElementById("nome").value;
  const generoInput = document.getElementById("genero").value;
  const categoriaInput = document.getElementById("categoria").value;

  if(!nomeInput){
    alert("Digite seu nome");
    return;
  }

  const snapshot = await getDocs(collection(db, "times"));

  let timesCategoria = [];

  snapshot.forEach(d=>{
    if(d.data().categoria === categoriaInput){
      timesCategoria.push({id:d.id, ...d.data()});
    }
  });

  // tentar entrar em time existente
  for(let t of timesCategoria){

    if(generoInput === "M" && t.homens.length < 2){
      t.homens.push({nome:nomeInput, uid:user.uid});
      await updateDoc(doc(db,"times",t.id), t);
      carregar();
      return;
    }

    if(generoInput === "F" && t.mulheres.length < 2){
      t.mulheres.push({nome:nomeInput, uid:user.uid});
      await updateDoc(doc(db,"times",t.id), t);
      carregar();
      return;
    }
  }

  // criar novo time
  if(timesCategoria.length < 3){

    let novo = {
      categoria: categoriaInput,
      homens: generoInput==="M" ? [{nome:nomeInput, uid:user.uid}] : [],
      mulheres: generoInput==="F" ? [{nome:nomeInput, uid:user.uid}] : []
    };

    await addDoc(collection(db,"times"), novo);
    carregar();

  } else {
    alert("Limite de times atingido nessa categoria");
  }
};

async function carregar(){
  const snapshot = await getDocs(collection(db, "times"));

  let html = "<h3>Times</h3>";

  snapshot.forEach(d=>{
    const t = d.data();

    html += `<div class="card">
    <b>Categoria ${t.categoria}</b><br>
    Homens: ${t.homens.map(h=>h.nome).join(", ")}<br>
    Mulheres: ${t.mulheres.map(m=>m.nome).join(", ")}
    </div>`;
  });

  document.getElementById("times").innerHTML = html;
}

carregar();
