// 🔹 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDhOIXYBqBELD0LDuGamKotPeW_qBu70WY",
  authDomain: "teamcup-a3af2.firebaseapp.com",
  projectId: "teamcup-a3af2",
  storageBucket: "teamcup-a3af2.appspot.com", // 🔥 CORRETO
  messagingSenderId: "49913899541",
  appId: "1:49913899541:web:817c26257e72f307d7fc1c"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let user = null;
let carregando = false;

// 🔹 LOGIN
window.login = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    user = result.user;
    document.getElementById("userInfo").innerText = user.email;

    alert("Login OK");

  } catch (err) {
    alert("Erro login: " + err.message);
  }
};

// 🔹 CRIAR NOVO TIME (SEM ENTRAR AUTOMÁTICO)
window.entrarTime = async () => {

  if (carregando) return;

  try {

    if (!user) return alert("Faça login primeiro");

    carregando = true;

    const nome = document.getElementById("nome").value.trim();
    const genero = document.getElementById("genero").value;
    const categoria = document.getElementById("categoria").value;

    if (!nome) return alert("Digite seu nome");

    const snapshot = await getDocs(collection(db, "times"));

    let timesCategoria = [];

    snapshot.forEach(d => {
      const t = d.data();

      t.homens = Array.isArray(t.homens) ? t.homens : [];
      t.mulheres = Array.isArray(t.mulheres) ? t.mulheres : [];

      if (t.categoria === categoria) {
        timesCategoria.push({ id: d.id, ...t });
      }
    });

    // 🔒 impedir duplicação
    for (let t of timesCategoria) {
      const todos = [...t.homens, ...t.mulheres];
      if (todos.find(p => p.uid === user.uid)) {
        carregando = false;
        return alert("Você já está em um time. Já se inscreveu no LetzPlay?");
      }
    }

    // 🆕 criar novo time SEM tentar entrar em outro
    if (timesCategoria.length < 3) {

      let novo = {
        categoria,
        homens: genero === "M" ? [{ nome, uid: user.uid }] : [],
        mulheres: genero === "F" ? [{ nome, uid: user.uid }] : []
      };

      await addDoc(collection(db, "times"), novo);

      alert("Novo time criado! Você já se inscreveu no LetzPlay?");
      carregar();

    } else {
      alert("Limite de times atingido");
    }

  } catch (err) {
    alert("ERRO: " + err.message);
  }

  carregando = false;
};

// 🔹 ENTRAR EM TIME EXISTENTE
window.entrarTimeExistente = async (timeId) => {

  try {

    if (!user) return alert("Faça login primeiro");

    const nome = document.getElementById("nome").value.trim();
    const genero = document.getElementById("genero").value;

    if (!nome) return alert("Digite seu nome");

    const ref = doc(db, "times", timeId);
    const snapshot = await getDocs(collection(db, "times"));

    snapshot.forEach(async d => {

      if (d.id === timeId) {

        let t = d.data();

        t.homens = Array.isArray(t.homens) ? t.homens : [];
        t.mulheres = Array.isArray(t.mulheres) ? t.mulheres : [];

        const todos = [...t.homens, ...t.mulheres];

        if (todos.find(p => p.uid === user.uid)) {
          return alert("Você já está neste time. Você já se inscreveu no LetzPlay?");
        }

        if (genero === "M" && t.homens.length < 2) {
          t.homens.push({ nome, uid: user.uid });
        }

        if (genero === "F" && t.mulheres.length < 2) {
          t.mulheres.push({ nome, uid: user.uid });
        }

        await updateDoc(ref, {
          homens: t.homens,
          mulheres: t.mulheres
        });

        alert("Entrou no time!");
        carregar();
      }
    });

  } catch (err) {
    alert(err.message);
  }
};

// 🔹 SAIR DO TIME (CORRIGIDO)
window.sairTime = async (timeId) => {

  const ref = doc(db, "times", timeId);
  const snapshot = await getDocs(collection(db, "times"));

  snapshot.forEach(async d => {

    if (d.id === timeId) {

      let t = d.data();

      t.homens = (t.homens || []).filter(p => p.uid !== user.uid);
      t.mulheres = (t.mulheres || []).filter(p => p.uid !== user.uid);

      await updateDoc(ref, {
        homens: t.homens,
        mulheres: t.mulheres
      });

      alert("Saiu do time");
      carregar();
    }
  });
};

// 🔹 CARREGAR TIMES (TOTALMENTE CORRIGIDO)
async function carregar() {

  const snapshot = await getDocs(collection(db, "times"));

  let lista = [];

  snapshot.forEach(d => {
    const t = d.data();

    lista.push({
      id: d.id,
      categoria: t.categoria,
      homens: Array.isArray(t.homens) ? t.homens : [],
      mulheres: Array.isArray(t.mulheres) ? t.mulheres : []
    });
  });

  // 🔥 ordenar categorias
  const ordem = ["B", "C", "D", "E"];
  lista.sort((a, b) => ordem.indexOf(a.categoria) - ordem.indexOf(b.categoria));

  let html = "<h3>⚔️ TIMES FORMADOS</h3>";

  lista.forEach(t => {

    const total = t.homens.length + t.mulheres.length;
    const completo = total === 4;

    const render = (arr) =>
      arr.map(p =>
        p.uid === user?.uid
          ? `<span class="me">🔥 ${p.nome} (VOCÊ)</span>`
          : p.nome
      ).join(", ") || "-";

    const estouNoTime = [...t.homens, ...t.mulheres]
  .some(p => p.uid === user?.uid || p.nome === document.getElementById("nome").value.trim());
    html += `
    <div class="card fade">
      <h3>Categoria ${t.categoria}</h3>

      👨 ${render(t.homens)}<br>
      👩 ${render(t.mulheres)}<br><br>

      <div class="${completo ? 'status-ok' : 'status-wait'}">
        ${completo ? 'TIME COMPLETO 🔥' : 'AGUARDANDO ⏳'}
      </div><br>

      ${
        !estouNoTime
          ? `<button 
                onclick="entrarTimeExistente('${t.id}')"
                class="btn ${completo ? 'btn-disabled' : ''}"
                ${completo ? 'disabled' : ''}
             >
                ${completo ? 'TIME LOTADO 🔒' : 'ENTRAR NESTE TIME'}
             </button>`
          : `<button onclick="sairTime('${t.id}')" class="btn">SAIR DO TIME</button>`
      }

    </div>
    `;
  });

  document.getElementById("times").innerHTML = html;
}

// 🔹 INIT
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnLogin").addEventListener("click", login);
  document.getElementById("btnEntrar").addEventListener("click", entrarTime);
  carregar();
});
