// efeito entrada tipo jogo
window.onload = () => {
  setTimeout(()=>{
    console.log("Game Loaded");
  }, 500);
};

// easter egg
let code = "";

document.addEventListener("keydown", e => {

  code += e.key.toLowerCase();

  if(code.includes("proplayer")){
    alert("🔥 MODO PRO ATIVADO");

    document.body.style.background = "black";
    document.body.style.color = "#00ffe1";
  }

});
