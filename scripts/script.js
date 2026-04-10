const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const grafico = document.getElementById("grafico");
const gctx = grafico.getContext("2d");

const graficoContainer = document.getElementById("graficoContainer");

const btnUp = document.getElementById("btnUp");
const btnDown = document.getElementById("btnDown");
const toggleBtn = document.getElementById("toggleCodigo");
const codigo = document.getElementById("codigo");

let historicoY = [];
let historicoRef = [];
let maxPontos = 300; // FIXO (evita bug gráfico)
let erroAtivo = false;

let y = 0, 
    angle = 0, 
    thrustPower = 0,
    e0 = 0,
    e1 = 0,
    e2 = 0,
    u1 = 0,
    u2 = 0,
    u3 = 0; 
let execute = false;    
let ref = 150;
let refArr;
let cont = 0;
let i = 0;

/* ========================= */
/* RESPONSIVIDADE */
/* ========================= */
function ajustarCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientWidth;

  grafico.width = grafico.clientWidth;
  grafico.height = 200;
}

/* ========================= */
/* TECLADO */
/* ========================= */
document.addEventListener('keydown', (e) => {
  if (e.key === "ArrowUp") {
    thrustPower = Math.min(thrustPower + 1, 50);
  }

  if (e.key === "ArrowDown") {
    thrustPower = Math.max(thrustPower - 1, -50);   
  }
});

/* ========================= */
/* TOUCH */
/* ========================= */
let intervalUp, intervalDown;

function startUp() {
  intervalUp = setInterval(() => {
    thrustPower = Math.min(thrustPower + 1, 50);   
  }, 50);
}

function stopUp() {
  clearInterval(intervalUp);
  intervalUp = null;
}

function startDown() {
  intervalDown = setInterval(() => {
    thrustPower = Math.max(thrustPower - 1, -50);  
  }, 50);
}

function stopDown() {
  clearInterval(intervalDown);
  intervalDown = null;
}

btnUp.addEventListener("touchstart", startUp);
btnUp.addEventListener("touchend", stopUp);
btnUp.addEventListener("mousedown", startUp);
btnUp.addEventListener("mouseup", stopUp);

btnDown.addEventListener("touchstart", startDown);
btnDown.addEventListener("touchend", stopDown);
btnDown.addEventListener("mousedown", startDown);
btnDown.addEventListener("mouseup", stopDown);

/* ========================= */
/* TOGGLE EDITOR */
/* ========================= */
toggleBtn.addEventListener("click", () => {
  const visivel = codigo.style.display === "block";
  codigo.style.display = visivel ? "none" : "block";
  toggleBtn.textContent = visivel ? "Mostrar Código" : "Ocultar Código";
});

/* ========================= */
/* MODELO */
/* ========================= */
function modelDynamics(){
  if(!modelDynamics.y1) modelDynamics.y1 = 0;
  if(!modelDynamics.y2) modelDynamics.y2 = 0;
  if(!modelDynamics.x1) modelDynamics.x1 = 0;
  // Modelo da dinâmica do Drone:
  // G(S) = 1/S(S + 0.2), TS = 0.01s
  y = 1.998 * modelDynamics.y1 - 0.998 * modelDynamics.y2 
    + 4.997e-05 * thrustPower + 4.993e-05 * modelDynamics.x1;

  if (y > 530) y = 530;
  if (y < 0) y = 0;

  modelDynamics.y2 = modelDynamics.y1;
  modelDynamics.y1 = y;
  modelDynamics.x1 = thrustPower;
}

/* ========================= */
/* DESENHO DRONE */
/* ========================= */
function drawDrone(x, y, propellerAngle) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#2c3e50";
  ctx.fillRect(-20, -10, 40, 20);

  ctx.strokeStyle = "#555";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-20, -10);
  ctx.lineTo(-40, -30);
  ctx.moveTo(20, -10);
  ctx.lineTo(40, -30);
  ctx.stroke();

  ctx.fillStyle = "#000";

  ctx.save();
  ctx.translate(-40, -30);
  ctx.rotate(propellerAngle);
  ctx.fillRect(-10, -2, 20, 4);
  ctx.restore();

  ctx.save();
  ctx.translate(40, -30);
  ctx.rotate(-propellerAngle);
  ctx.fillRect(-10, -2, 20, 4);
  ctx.restore();

  ctx.restore();
}

/* ========================= */
/* EXECUÇÃO */
/* ========================= */
function executarCodigo() {
  const botao = document.getElementById('botao');
  const modoText = document.getElementById('modo');
  const graficoContainer = document.getElementById('graficoContainer');

  const codigoTexto = codigo.value.trim();

  // valida código vazio
  if (!execute && codigoTexto === "") {
    alert("Digite um código de controle antes de executar!");
    return;
  }

  // RESET DO ERRO AQUI
  if (!execute) {
    erroAtivo = false;
  }

  execute = !execute;

  botao.textContent = execute ? "Parar Controle" : "Executar Controle";
  modoText.textContent = execute 
    ? "Drone em modo automático" 
    : "Drone em modo manual";

  if (execute) {
    graficoContainer.classList.remove("hidden");
    ajustarCanvas();

    historicoY = [];
    historicoRef = [];
  } else {
    graficoContainer.classList.add("hidden");
    gctx.clearRect(0, 0, grafico.width, grafico.height);
  }
}

/* ========================= */
/* MODO MANUAL */
/* ========================= */
function ativarModoManual() {
  const modoText = document.getElementById('modo');
  modoText.textContent = "Drone em modo manual";
  graficoContainer.classList.add("hidden");
}

/* ========================= */
/* GRÁFICO */
/* ========================= */
function drawGraphic() {
  historicoY.push(y);
  historicoRef.push(ref);

  if (historicoY.length > maxPontos) {
    historicoY.shift();
    historicoRef.shift();
  }

  gctx.clearRect(0, 0, grafico.width, grafico.height);

  const escalaY = grafico.height / 600;
  const escalaX = grafico.width / maxPontos;

  // y
  gctx.beginPath();
  gctx.strokeStyle = "blue";

  historicoY.forEach((val, i) => {
    const px = i * escalaX;
    const py = grafico.height - val * escalaY;
    i === 0 ? gctx.moveTo(px, py) : gctx.lineTo(px, py);
  });

  gctx.stroke();

  // ref
  gctx.beginPath();
  gctx.strokeStyle = "red";
  gctx.setLineDash([5, 5]);

  historicoRef.forEach((val, i) => {
    const px = i * escalaX;
    const py = grafico.height - val * escalaY;
    i === 0 ? gctx.moveTo(px, py) : gctx.lineTo(px, py);
  });

  gctx.stroke();
  gctx.setLineDash([]);
}

/* ========================= */
/* LOOP */
/* ========================= */
function loop() {
  modelDynamics();

  if (execute && codigo.value.trim() !== "" && !erroAtivo) {

    try { 
      eval(codigo.value); 
      drawGraphic();
  
    } catch(e) {
      erroAtivo = true;
  
      execute = false;
  
      document.getElementById('modo').textContent = "Erro: " + e.message;
      document.getElementById('botao').textContent = "Executar Controle";
  
      graficoContainer.classList.add("hidden");
      gctx.clearRect(0, 0, grafico.width, grafico.height);
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const soloY = canvas.height - 20;

  // céu
  ctx.fillStyle = "#a0d0ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // solo
  ctx.fillStyle = "#6ab04c";
  ctx.fillRect(0, soloY, canvas.width, 20);

  // hélices
  angle += 0.3 + Math.abs(thrustPower) * 0.01;

  drawDrone(canvas.width / 2, soloY - y, angle);

  // barra lateral
  ctx.fillStyle = "#000";
  ctx.fillRect(20, 0, 10, canvas.height);

  let barHeight = (thrustPower / 50) * canvas.height;

  if (thrustPower >= 0) {
    ctx.fillStyle = "green";
    ctx.fillRect(20, canvas.height / 2 - barHeight, 10, barHeight);
  } else {
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(20, canvas.height / 2, 10, -barHeight);
  }

  // 🔒 Limite de segurança
  thrustPower = Math.max(-50, Math.min(50, thrustPower));

  // linha ref
  const refY = soloY - ref;

  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "red";
  ctx.moveTo(0, refY);
  ctx.lineTo(canvas.width, refY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "red";
  ctx.fillText("Ref: " + ref, canvas.width - 100, refY - 10);

  requestAnimationFrame(loop);
}

/* ========================= */
/* INIT */
/* ========================= */
window.addEventListener("load", () => {
  ajustarCanvas();
  loop();
});

window.addEventListener("resize", ajustarCanvas);