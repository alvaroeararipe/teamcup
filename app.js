// 🔹 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDhOIXYBqBELD0LDuGamKotPeW_qBu70WY",
  authDomain: "teamcup-a3af2.firebaseapp.com",
  projectId: "teamcup-a3af2",
  storageBucket: "teamcup-a3af2.appspot.com",
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
    console.error(err);
  }
};

// 🔹 ENTRAR TIME
window.entrarTime = async () => {

  if (carregando) return;

  try {

    if (!user) {
      alert("Faça login primeiro");
      return;
    }

    carregando = true;

    const nome = document.getElementById("nome").value.trim();
    const genero = document.getElementById("genero").value;
    const categoria = document.getElementById("categoria").value;

    if (!nome) {
      alert("Digite seu nome");
      return;
    }

    const snapshot = await getDocs(collection(db, "times"));

    let timesCategoria = [];

    snapshot.forEach(d => {
      let t = d.data();

// 🔥 blindagem contra dados quebrados
t.homens = Array.isArray(t.homens) ? t.homens : [];
t.mulheres = Array.isArray(t.mulheres) ? t.mulheres : [];

      if (t.categoria === categoria) {
        timesCategoria.push({ id: d.id, ...t });
      }
    });

    // 🔒 evitar duplicado
    for (let t of timesCategoria) {
      const todos = [...t.homens, ...t.mulheres];

      if (todos.find(p => p.uid === user.uid)) {
        alert("Você já está em um time");
        carregando = false;
        return;
      }
    }

    // 🔄 entrar em time existente
    for (let t of timesCategoria) {

      if (genero === "M" && t.homens.length < 2) {
        t.homens.push({ nome, uid: user.uid });

        await updateDoc(doc(db, "times", t.id), {
          homens: t.homens
        });

        alert("Entrou no time!");
        carregar();
        carregando = false;
        return;
      }

      if (genero === "F" && t.mulheres.length < 2) {
        t.mulheres.push({ nome, uid: user.uid });

        await updateDoc(doc(db, "times", t.id), {
          mulheres: t.mulheres
        });

        alert("Entrou no time!");
        carregar();
        carregando = false;
        return;
      }
    }

    // 🆕 criar novo time
    if (timesCategoria.length < 3) {

      let novo = {
        categoria,
        homens: genero === "M" ? [{ nome, uid: user.uid }] : [],
        mulheres: genero === "F" ? [{ nome, uid: user.uid }] : []
      };

      await addDoc(collection(db, "times"), novo);

      alert("Novo time criado!");
      carregar();

    } else {
      alert("Limite de times atingido");
    }

  } catch (err) {
    alert("ERRO: " + err.message);
    console.error(err);
  }

  carregando = false;
};

// 🔹 SAIR TIME
window.sairTime = async (id) => {

  const ref = doc(db, "times", id);
  const snap = await getDocs(collection(db, "times"));

  snap.forEach(async d => {
    if (d.id === id) {

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

// 🔹 CARREGAR
async function carregar() {

  const snapshot = await getDocs(collection(db, "times"));

  let html = "";

  snapshot.forEach(d => {

    let t = d.data();

    t.homens = t.homens || [];
    t.mulheres = t.mulheres || [];

    html += `
      <div style="border:1px solid white; margin:10px; padding:10px;">
        <b>Categoria ${t.categoria}</b><br>
        👨 ${t.homens.map(p=>p.nome).join(", ") || "-"}<br>
        👩 ${t.mulheres.map(p=>p.nome).join(", ") || "-"}<br>
        <button onclick="sairTime('${d.id}')">Sair</button>
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
