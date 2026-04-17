// efeito entrada tipo jogo
window.onload = () => {
  setTimeout(()=>{
    console.log("Game Loaded");
  }, 500);
};

// easter egg
let code = "";

document.addEventListener("keydown", e => {
  code += e.key;

  if(code.includes("teamcup")){
    alert("🔥 MODO CAMPEÃO ATIVADO");
    document.body.style.background = "black";
  }
});
