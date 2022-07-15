let canvas = document.getElementById("theCanvas");
let context = canvas.getContext("2d");

context.canvas.width = window.innerWidth - 50;
context.canvas.height = window.innerHeight - 200;

const gravityPower = 6.6743 * 5;
const bounceReduction = 1 / 3;
let paused = true;
const speedSlider = document.getElementById("speedSlider");
let baseSpeed = ((speedSlider.min + speedSlider.max) / 2) * 0.2;

let start, previousTimeStamp;

const initialStationaries = [
  {
    name: "sun",
    x: (1 / 2) * context.canvas.width,
    y: (1 / 2) * context.canvas.height,
    mass: 10 * 10 ** 2,
    radius: 30,
    // color: "#f7f7f7",
    color: "#ddff66",
  },
  {
    name: "noice",
    x: (3 / 4) * context.canvas.width,
    y: (1 / 2) * context.canvas.height,
    mass: 5 * 10 ** 2,
    radius: 20,
    // color: "#f7f7f7",
    color: "#ddff66",
  },
  {
    name: "noice2mee2",
    x: (1 / 4) * context.canvas.width,
    y: (1 / 2) * context.canvas.height,
    mass: 5 * 10 ** 2,
    radius: 20,
    // color: "#f7f7f7",
    color: "#ddff66",
  },
];

const initialMoving = [
  {
    name: "main",
    x: (3 / 4) * context.canvas.width,
    y: (1 / 4) * context.canvas.height,
    radius: 15,
    // color: "#d3d3d3",
    color: "#55aabb",
    velocity: { x: 0, y: 0 },
    mass: 200,
    index: 0,
  },
  {
    name: "secondary",
    x: (1 / 4) * context.canvas.width,
    y: (3 / 4) * context.canvas.height,
    radius: 15,
    // color: "#800020",
    color: "#bb3388",
    velocity: { x: 0, y: 0 },
    mass: 350,
    index: 1,
  },
];

let stationaries = JSON.parse(JSON.stringify(initialStationaries));

//#800020

let moving = JSON.parse(JSON.stringify(initialMoving));

function updateInput() {
  baseSpeed = 0.2 * speedSlider.value;
}

function reset() {
  paused = true;
  moving = JSON.parse(JSON.stringify(initialMoving));
  stationaries = JSON.parse(JSON.stringify(initialStationaries));
  clearCanvas();
  drawAll();
  console.log((speedSlider.min + speedSlider.max) / 2);
  baseSpeed = ((speedSlider.min + speedSlider.max) / 2) * 0.2;
  speedSlider.value = (speedSlider.min + speedSlider.max) / 2;
}

function calculateDistance([x1, y1], [x2, y2]) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

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
  moving.forEach(
    ({ x: movingX, y: movingY, velocity, index, radius, mass: movingMass }) => {
      //#region Bouncing
      if (
        movingY + radius + (velocity.y * elapsed) / 1000 >=
          context.canvas.height &&
        velocity.y >= 0
      ) {
        moving[index].velocity.y *= bounceReduction;

        moving[index].velocity.y = -1 * moving[index].velocity.y;
      }

      if (
        movingY - radius + (velocity.y * elapsed) / 1000 <= 0 &&
        velocity.y <= 0
      ) {
        moving[index].velocity.y *= bounceReduction;

        moving[index].velocity.y = -moving[index].velocity.y;
      }
      if (
        movingX + radius + (velocity.x * elapsed) / 1000 >=
          context.canvas.width &&
        velocity.x >= 0
      ) {
        moving[index].velocity.x *= bounceReduction;

        moving[index].velocity.x = -moving[index].velocity.x;
      }

      if (
        movingX - radius + (velocity.x * elapsed) / 1000 <= 0 &&
        velocity.x <= 0
      ) {
        moving[index].velocity.x *= bounceReduction;

        moving[index].velocity.x = -moving[index].velocity.x;
      }
      //#endregion
      //#region Gravity

      // if (
      //   !(y + (velocity.y * elapsed) / 1000 + radius >= context.canvas.height) &&
      //   !(y + (velocity.y * elapsed) / 1000 + radius <= 0) &&
      //   !(x + (velocity.x * elapsed) / 1000 + radius >= context.canvas.width) &&
      //   !(x + (velocity.x * elapsed) / 1000 + radius <= 0)
      // ) {
      //   velocity.y += (gravityPower * elapsed) / 1000;
      // }
      // if (velocity.y + y >= context.canvas.height) {
      //   console.log(velocity.y, y, context.canvas.height);
      // }
      //#endregion
      //#region Object Gravity

      stationaries.forEach(({ x: fixedX, y: fixedY, mass: fixedMass }) => {
        distance = calculateDistance([fixedX, fixedY], [movingX, movingY]);
        xDistance = fixedX - movingX;
        yDistance = fixedY - movingY;
        const gravForce =
          (gravityPower * fixedMass * movingMass) / distance ** 2;

        // Apply gravity force in proportion to the x/y distances
        moving[index].velocity.x +=
          (xDistance / (Math.abs(xDistance) + Math.abs(yDistance))) *
          gravForce *
          baseSpeed;
        moving[index].velocity.y +=
          (yDistance / (Math.abs(xDistance) + Math.abs(yDistance))) *
          gravForce *
          baseSpeed;
      });
      //#endregion
      //#endregion
      //#region Velocity Cap
      const velocityMagnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      if (velocityMagnitude >= 10000) {
        velocity.x *= 10000 / velocityMagnitude;
        velocity.y *= 10000 / velocityMagnitude;
      }
      //#endregion
    }
  );
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
  if (elapsed > 100) {
    elapsed = 10;
  }
  start = timestamp;

  if (!paused) {
    clearCanvas();
    calculateMotion(elapsed);
    calculateVelocity(elapsed);
    drawAll();
    window.requestAnimationFrame(updateCanvas);
  }
}

drawAll();

// theContext.beginPath();
// theContext.arc(300, 50, 5, 0, 2 * Math.PI);
// theContext.fillStyle = "#f7f7f7";
// theContext.fill();
