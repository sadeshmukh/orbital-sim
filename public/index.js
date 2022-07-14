let canvas = document.getElementById("theCanvas");
let context = canvas.getContext("2d");
const fps = 20;

context.canvas.width = window.innerWidth - 50;
context.canvas.height = window.innerHeight - 200;

const stationaries = [
  {
    name: "sun",
    x: (1 / 2) * context.canvas.width,
    y: (1 / 2) * context.canvas.height,

    radius: 50,
    color: "#f7f7f7",
  },
];

const moving = [
  {
    name: "main",
    x: (3 / 4) * context.canvas.width,
    y: (1 / 2) * context.canvas.height,
    radius: 20,
    color: "#d3d3d3",
  },
];

function drawCircle(x, y, radius, color) {
  context.beginPath();
  context.fillStyle = color;
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fill();
  context.closePath();
}

function drawAll() {
  stationaries.forEach(function ({ x, y, radius, color }) {
    drawCircle(x, y, radius, color);
  });
  moving.forEach(function ({ x, y, radius, color }) {
    drawCircle(x, y, radius, color);
  });
}

function clearCanvas() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function updateCanvas() {
  clearCanvas();
  drawAll();
  setTimeout(updateCanvas, 1000 / fps);
}

drawAll();

// theContext.beginPath();
// theContext.arc(300, 50, 5, 0, 2 * Math.PI);
// theContext.fillStyle = "#f7f7f7";
// theContext.fill();
