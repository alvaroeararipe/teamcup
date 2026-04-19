// 🔹 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 CONFIG FIREBASE (COLE A SUA AQUI)
const firebaseConfig = {
  apiKey: "AIzaSyDhOIXYBqBELD0LDuGamKotPeW_qBu70WY",
  authDomain: "teamcup-a3af2.firebaseapp.com",
  projectId: "teamcup-a3af2",
  storageBucket: "teamcup-a3af2.appspot.com",
  messagingSenderId: "49913899541",
  appId: "1:49913899541:web:817c26257e72f307d7fc1c",
  measurementId: "G-Z0VTN373FN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 VARIÁVEIS
let user = null;
let carregando = false;

// 🔹 LOGIN GOOGLE
window.login = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    user = result.user;

    document.getElementById("userInfo").innerText = user.email;

    mostrarToast("🔥 Logado com sucesso");

  } catch (err) {
    mostrarToast("Erro no login");
    console.error(err);
  }
};

// 🔹 ENTRAR / CRIAR TIME (VERSÃO LIMPA PRO)
window.entrarTime = async () => {
  
  if(carregando) return;
  carregando = true;

  const btn = document.getElementById("btnEntrar");
  btn.innerText = "PROCESSANDO...";
  btn.disabled = true;

  try {

    if(!user){
      throw new Error("Faça login primeiro");
    }

    const nomeInput = document.getElementById("nome").value.trim();
    const generoInput = document.getElementById("genero").value;
    const categoriaInput = document.getElementById("categoria").value;

    if(!nomeInput){
      throw new Error("Digite seu nome");
    }

    const snapshot = await getDocs(collection(db, "times"));

    let timesCategoria = [];

    snapshot.forEach(d=>{
      if(d.data().categoria === categoriaInput){
        timesCategoria.push({id:d.id, ...d.data()});
      }
    });

    // 🔒 impedir duplicação
    for(let t of timesCategoria){
      const todos = [...t.homens, ...t.mulheres];

      if(todos.find(p => p.uid === user.uid)){
        throw new Error("Você já está em um time dessa categoria");
      }
    }

    // 🔄 tentar entrar em time existente
    for(let t of timesCategoria){

      if(generoInput === "M" && t.homens.length < 2){
        t.homens.push({nome:nomeInput, uid:user.uid});
        await updateDoc(doc(db,"times",t.id), t);

        sucessoEntrada("⚡ Você entrou no time!");
        return;
      }

      if(generoInput === "F" && t.mulheres.length < 2){
        t.mulheres.push({nome:nomeInput, uid:user.uid});
        await updateDoc(doc(db,"times",t.id), t);

        sucessoEntrada("⚡ Você entrou no time!");
        return;
      }
    }

    // 🆕 criar novo time
    if(timesCategoria.length < 3){

      let novo = {
        categoria: categoriaInput,
        homens: generoInput==="M" ? [{nome:nomeInput, uid:user.uid}] : [],
        mulheres: generoInput==="F" ? [{nome:nomeInput, uid:user.uid}] : []
      };

      await addDoc(collection(db,"times"), novo);

      sucessoEntrada("🔥 Novo time criado!");

    } else {
      throw new Error("Limite de times atingido");
    }

  } catch(err) {

    mostrarToast("⚠️ " + err.message);
    console.error(err);

  } finally {

    carregando = false;
    btn.innerText = "ENTRAR / CRIAR TIME";
    btn.disabled = false;

  }
};

// 🔹 SUCESSO (som + toast + reload)
function sucessoEntrada(msg){
  mostrarToast(msg);
  document.getElementById("enterSound").play();
  carregar();
}

// 🔹 SAIR DO TIME
window.sairTime = async (timeId) => {

  const ref = doc(db, "times", timeId);
  const snapshot = await getDocs(collection(db, "times"));

  snapshot.forEach(async d => {
    if(d.id === timeId){
      let t = d.data();

      t.homens = t.homens.filter(p => p.uid !== user.uid);
      t.mulheres = t.mulheres.filter(p => p.uid !== user.uid);

      await updateDoc(ref, t);
      mostrarToast("Saiu do time");
      carregar();
    }
  });
};

// 🔹 TOAST
function mostrarToast(msg){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.opacity = 1;

  setTimeout(()=>{
    t.style.opacity = 0;
  },2000);
}

// 🔹 CARREGAR TIMES (UI GAMER)
async function carregar(){

  const snapshot = await getDocs(collection(db, "times"));

  let html = "<h3>⚔️ TIMES FORMADOS</h3>";

  snapshot.forEach(d=>{

    const t = d.data();

    const total = t.homens.length + t.mulheres.length;
    const completo = total === 4;

    const render = (lista) => {
      return lista.map(p=>{
        if(p.uid === user?.uid){
          return `<span class="me">🔥 ${p.nome} (VOCÊ)</span>`;
        }
        return p.nome;
      }).join(", ") || "-";
    };

    html += `
    <div class="card fade">
      <h3>Categoria ${t.categoria}</h3>

      👨 ${render(t.homens)}<br>
      👩 ${render(t.mulheres)}<br><br>

      <div class="${completo ? 'status-ok' : 'status-wait'}">
        ${completo ? 'TIME COMPLETO 🔥' : 'AGUARDANDO ⏳'}
      </div><br>

      ${
        [...t.homens, ...t.mulheres].some(p=>p.uid === user?.uid)
        ? `<button onclick="sairTime('${d.id}')" class="btn">SAIR DO TIME</button>`
        : ""
      }
    </div>
    `;
  });

  document.getElementById("times").innerHTML = html;
}

// 🔹 EFEITO CLICK ENERGIA
document.addEventListener("click", e => {
  const el = document.createElement("div");
  el.className = "energy";
  el.style.left = e.clientX + "px";
  el.style.top = e.clientY + "px";
  document.body.appendChild(el);

  setTimeout(()=>el.remove(),600);
});

// 🔹 INICIAR
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnLogin").addEventListener("click", login);
  carregar();
});
