let canvas = document.getElementById("theCanvas");
let context = canvas.getContext("2d");

context.canvas.width = window.innerWidth - 50;
context.canvas.height = window.innerHeight - 200;

const baseSpeed = 300;
const gravityPower = 5;

let start, previousTimeStamp;

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
    velocity: { x: 1, y: 1 },
    // mass: 400,
    index: 0,
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

function calculateVelocity(elapsed) {
  moving.forEach(({ x, y, velocity, index, radius }) => {
    //#region Bouncing
    if (
      y + radius + (velocity.y * elapsed) / 1000 >= context.canvas.height &&
      velocity.y >= 0
    ) {
      moving[index].velocity.y = -1 * moving[index].velocity.y;
    }

    if (y - radius + (velocity.y * elapsed) / 1000 <= 0 && velocity.y <= 0) {
      y = radius;
      moving[index].velocity.y = -moving[index].velocity.y;
    }
    if (
      x + radius + (velocity.x * elapsed) / 1000 >= context.canvas.width &&
      velocity.x >= 0
    ) {
      x = context.canvas.width - radius;
      moving[index].velocity.x = -moving[index].velocity.x;
    }

    if (x - radius + (velocity.x * elapsed) / 1000 <= 0 && velocity.x <= 0) {
      x = radius;
      moving[index].velocity.x = -moving[index].velocity.x;
    }
    //#endregion
    //#region Gravity
    // This is DOWNWARDS gravity at the moment
    if (
      !(y + (velocity.y * elapsed) / 1000 + radius >= context.canvas.height) &&
      !(y + (velocity.y * elapsed) / 1000 + radius <= 0) &&
      !(x + (velocity.x * elapsed) / 1000 + radius >= context.canvas.width) &&
      !(x + (velocity.x * elapsed) / 1000 + radius <= 0)
    ) {
      velocity.y += (gravityPower * elapsed) / 1000;
    }
    if (velocity.y + y >= context.canvas.height) {
      console.log(velocity.y, y, context.canvas.height);
    }

    ////#endregion
  });
}

function calculateMotion(elapsed) {
  moving.forEach(function ({ velocity, index }) {
    moving[index].x += (velocity.x * baseSpeed * elapsed) / 1000;
    moving[index].y += (velocity.y * baseSpeed * elapsed) / 1000;
  });
}

function updateCanvas(timestamp) {
  if (start === undefined) {
    start = timestamp;
  }

  let elapsed = timestamp - start;
  if (elapsed > 500) {
    elapsed = 10;
  }
  start = timestamp;

  clearCanvas();
  calculateMotion(elapsed);
  calculateVelocity(elapsed);

  drawAll();
  window.requestAnimationFrame(updateCanvas);
}

window.requestAnimationFrame(updateCanvas);
// theContext.beginPath();
// theContext.arc(300, 50, 5, 0, 2 * Math.PI);
// theContext.fillStyle = "#f7f7f7";
// theContext.fill();
