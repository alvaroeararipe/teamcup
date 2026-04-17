import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  // COLE SUA CONFIG AQUI
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

  const nome = nome.value;
  const genero = genero.value;
  const categoria = categoria.value;

  const snapshot = await getDocs(collection(db, "times"));

  let timesCategoria = [];
  snapshot.forEach(d=>{
    if(d.data().categoria === categoria){
      timesCategoria.push({id:d.id, ...d.data()});
    }
  });

  // tentar entrar em time incompleto
  for(let t of timesCategoria){

    if(genero === "M" && t.homens.length < 2){
      t.homens.push({nome, uid:user.uid});
      await updateDoc(doc(db,"times",t.id), t);
      carregar();
      return;
    }

    if(genero === "F" && t.mulheres.length < 2){
      t.mulheres.push({nome, uid:user.uid});
      await updateDoc(doc(db,"times",t.id), t);
      carregar();
      return;
    }
  }

  // criar novo time se puder
  if(timesCategoria.length < 3){
    let novo = {
      categoria,
      homens: genero==="M" ? [{nome, uid:user.uid}] : [],
      mulheres: genero==="F" ? [{nome, uid:user.uid}] : []
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
