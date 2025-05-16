
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const grafico = document.getElementById("grafico");
const gctx = grafico.getContext("2d");
let historicoY = [];
let historicoRef = [];
const maxPontos = 600; // largura do gráfico

let y = 0, 
    y1 = 0, 
    y2 = 0, 
    x0 = 50, 
    x1 = 0, 
    angle = 0,
    thrustPower = 0;   
let execute = false;    
let ref = 300;
let refArr;
let cont = 0;
let i = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === "ArrowUp") thrustPower = Math.min(thrustPower + 1, 50);
  if (e.key === "ArrowDown") thrustPower = Math.max(thrustPower - 1, -50);
});

function modelDynamics(){
  // Modelo da dinâmica do Drone:
  y = 1.998 * y1 - 0.998 * y2 + 4.997e-05 * thrustPower + 4.993e-05 * x1;
   
   // Restrições
  if (y > 570) { y = 570; }  
   
   // Atualizações:
  y2 = y1;
  y1 = y;
  x1 = thrustPower;
}

function update() { 
  modelDynamics();
}  

function drawDrone(x, y, propellerAngle) {
  ctx.save();
  ctx.translate(x, y);

  // Corpo
  ctx.fillStyle = "#2c3e50";
  ctx.fillRect(-20, -10, 40, 20);

  // Braços
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-20, -10);
  ctx.lineTo(-40, -30);
  ctx.moveTo(20, -10);
  ctx.lineTo(40, -30);
  ctx.stroke();

  // Hélices
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

function executarCodigo() {
  const botao = document.getElementById('botao');
  const textarea = document.getElementById('codigo');
  const flightMode = document.getElementById('modo');
  execute = !execute;
  botao.textContent = execute ? "Parar Controle" : "Executar Controle";
  flightMode.textContent = execute ? "Drone em modo automático" : "Drone em modo manual";
  textarea.disabled = !textarea.disabled;
}

function drawGraphic() {
  // Armazena valores
  historicoY.push(y);
  historicoRef.push(ref);

  if (historicoY.length > maxPontos) {
    historicoY.shift();
    historicoRef.shift();
  }

  // Desenha o gráfico
  gctx.clearRect(0, 0, grafico.width, grafico.height);

  // Escala vertical do gráfico (ajustável)
  const escalaY = grafico.height / 600;

  gctx.beginPath();
  gctx.strokeStyle = "blue";
  historicoY.forEach((val, i) => {
    const py = grafico.height - val * escalaY;
    if (i === 0) gctx.moveTo(i, py);
    else gctx.lineTo(i, py);
  });
  gctx.stroke();

  gctx.beginPath();
  gctx.strokeStyle = "red";
  historicoRef.forEach((val, i) => {
    const py = grafico.height - val * escalaY;
    if (i === 0) gctx.moveTo(i, py);
    else gctx.lineTo(i, py);
  });
  gctx.stroke();

}

function loop() {      
  setInterval(update(), 10);

  if(execute) {    
    const codigo = document.getElementById("codigo").value;  
    const resultado = eval(codigo);

    drawGraphic();
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fundo e solo
  ctx.fillStyle = "#a0d0ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#6ab04c";
  ctx.fillRect(0, 580, canvas.width, 20);

  angle += 0.3;
  drawDrone(canvas.width / 2, 570-y, angle);

  ctx.fillStyle = "#000";
  ctx.fillRect(20, 0, 10, canvas.height); // fundo preto em toda a altura

  let barHeight = (thrustPower / 50) * canvas.height; // normaliza thrustPower (-50 a 50)

  // Se for positivo, cresce para cima; se for negativo, cresce para baixo
  if (thrustPower >= 0) {
    ctx.fillStyle = "green";
    ctx.fillRect(20, canvas.height / 2 - barHeight, 10, barHeight);
  } else {
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(20, canvas.height / 2, 10, -barHeight);
  }

  // Linha de referência 
  ctx.beginPath();
  ctx.setLineDash([5, 5]); // linha tracejada
  ctx.strokeStyle = "red";
  ctx.moveTo(0, canvas.height - ref - 20); // ref está invertido em relação ao y do drone
  ctx.lineTo(canvas.width, canvas.height - ref - 20);
  ctx.stroke();
  ctx.setLineDash([]); // reseta o padrão da linha

  // Texto com valor de ref
  ctx.font = "14px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("Ref: " + ref, 500, canvas.height - ref - 25);

  requestAnimationFrame(loop);
}

loop();
