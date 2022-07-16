let canvas = document.getElementById("theCanvas");
let context = canvas.getContext("2d");
let whoosh = new Audio("whoosh.wav");
let whooshIsPlaying = false;
let doesBounce = true;

whoosh.addEventListener(
  "ended",
  function () {
    whooshIsPlaying = false;
  },
  false
);

context.canvas.width = window.innerWidth - 50;
context.canvas.height = window.innerHeight - 250;

const bounceReduction = 1 / 3;
const wrapReduction = 1 / 2;
const bounceBuffer = 10;
const velocityCap = 10000;
const velocityHistoryLength = 10;
const velocityToSound = 3000;
let paused = true;
const speedSlider = document.getElementById("speedSlider");
const gravitySlider = document.getElementById("gravitySlider");

let gravityPower = (gravitySlider.min + gravitySlider.max) / 2;
let baseSpeed = ((speedSlider.min + speedSlider.max) / 2) * 0.2;

let start, previousTimeStamp;

const initialStationaries = [
  {
    name: "sun",
    x: (1 / 2) * context.canvas.width,
    y: (1 / 2) * context.canvas.height,
    mass: 1000,
    radius: 30,
    // color: "#f7f7f7",
    color: "#ddff66",
  },
  {
    name: "noice",
    x: (3 / 4) * context.canvas.width,
    y: (1 / 2) * context.canvas.height,
    mass: 500,
    radius: 25,
    // color: "#f7f7f7",
    color: "#ddff66",
    active: false,
  },
  {
    name: "noice2mee2",
    x: (1 / 4) * context.canvas.width,
    y: (1 / 2) * context.canvas.height,
    mass: 500,
    radius: 25,
    // color: "#f7f7f7",
    color: "#ddff66",
    active: false,
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
    active: true,
    velocityHistory: [],
  },
  {
    name: "second",
    x: (1 / 4) * context.canvas.width,
    y: (3 / 4) * context.canvas.height,
    radius: 17.5,
    // color: "#800020",
    color: "#bb3388",
    velocity: { x: 0, y: 0 },
    mass: 300,
    index: 1,
    active: false,
    velocityHistory: [],
  },
  {
    name: "third",
    x: (1 / 4) * context.canvas.width,
    y: (1 / 4) * context.canvas.height,
    radius: 20,
    // color: "#800020",
    color: "#f7f7f7",
    velocity: { x: 0, y: 0 },
    mass: 400,
    index: 2,
    active: false,
    velocityHistory: [],
  },
  {
    name: "fourth",
    x: (3 / 4) * context.canvas.width,
    y: (3 / 4) * context.canvas.height,
    radius: 22.5,
    // color: "#800020",
    color: "#6C0BA9",
    velocity: { x: 0, y: 0 },
    mass: 500,
    index: 3,
    active: true,
    velocityHistory: [],
  },
];

let stationaries = JSON.parse(JSON.stringify(initialStationaries));

let moving = JSON.parse(JSON.stringify(initialMoving));

function toggleBounce() {
  doesBounce = !doesBounce;
}

function toggleSecondary() {
  stationaries[1].active = !stationaries[1].active;
  stationaries[2].active = !stationaries[2].active;
  clearCanvas();
  drawAll();
}

function toggleMoving(index) {
  moving[index].active = !moving[index].active;
  clearCanvas();
  drawAll();
}

function updateSpeedInput() {
  baseSpeed = 0.2 * speedSlider.value;
}

function updateGravityInput() {
  gravityPower = gravitySlider.value;
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
  gravityPower = (gravitySlider.min + gravitySlider.max) / 2;
  gravitySlider.value = (gravitySlider.min + gravitySlider.max) / 2;
  doesBounce = true;
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
  stationaries.forEach(function ({ x, y, radius, color, active }) {
    if (!active && active != undefined) {
      return;
    }
    drawCircle(x, y, radius, color);
  });
  moving.forEach(function ({ x, y, radius, color, active }) {
    if (!active) {
      return;
    }
    drawCircle(x, y, radius, color);
  });
}

function clearCanvas() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function calculateVelocity(elapsed) {
  moving.forEach(
    ({
      x: movingX,
      y: movingY,
      velocity,
      index,
      radius,
      mass: movingMass,
      active,
      velocityHistory,
    }) => {
      if (!active) {
        return;
      }
      if (doesBounce) {
        //#region Bouncing
        if (
          movingY + radius + bounceBuffer >= context.canvas.height &&
          velocity.y >= 0
        ) {
          moving[index].velocity.y *= bounceReduction;

          moving[index].velocity.y = -moving[index].velocity.y;
        }

        if (movingY - radius - bounceBuffer <= 0 && velocity.y <= 0) {
          moving[index].velocity.y *= bounceReduction;

          moving[index].velocity.y = -moving[index].velocity.y;
        }
        if (
          movingX + radius + bounceBuffer >= context.canvas.width &&
          velocity.x >= 0
        ) {
          moving[index].velocity.x *= bounceReduction;

          moving[index].velocity.x = -moving[index].velocity.x;
        }

        if (movingX - radius - bounceBuffer <= 0 && velocity.x <= 0) {
          moving[index].velocity.x *= bounceReduction;

          moving[index].velocity.x = -moving[index].velocity.x;
        }
        //#endregion
      } else {
        //#region Wrap
        if (movingY + radius >= context.canvas.height && velocity.y >= 0) {
          moving[index].velocity.y *= wrapReduction;
          moving[index].y -= context.canvas.height;
          moving[index].velocity.x = -moving[index].velocity.x;
        }

        if (movingY - radius <= 0 && velocity.y <= 0) {
          moving[index].velocity.y *= wrapReduction;
          moving[index].y += context.canvas.height;
          moving[index].velocity.x = -moving[index].velocity.x;
        }
        if (movingX + radius >= context.canvas.width && velocity.x >= 0) {
          moving[index].velocity.x *= wrapReduction;
          moving[index].x -= context.canvas.width;
          moving[index].velocity.y = -moving[index].velocity.y;
        }

        if (movingX - radius <= 0 && velocity.x <= 0) {
          moving[index].velocity.x *= wrapReduction;
          moving[index].x += context.canvas.width;
          moving[index].velocity.y = -moving[index].velocity.y;
        }
        //#endregion
      }
      //#region Object Gravity

      stationaries.forEach(
        ({
          x: fixedX,
          y: fixedY,
          mass: fixedMass,
          active: stationaryActive,
        }) => {
          if (!stationaryActive && stationaryActive != undefined) {
            return;
          }
          distance = calculateDistance([fixedX, fixedY], [movingX, movingY]);
          xDistance = fixedX - movingX;
          yDistance = fixedY - movingY;
          // Not technically gravitational force, but the movingMass cancels out since the force has to also move that mass
          const gravForce = (gravityPower * fixedMass) / distance ** 2;

          // Apply gravity force in proportion to the x/y distances
          moving[index].velocity.x +=
            (xDistance / (Math.abs(xDistance) + Math.abs(yDistance))) *
            gravForce *
            baseSpeed;
          moving[index].velocity.y +=
            (yDistance / (Math.abs(xDistance) + Math.abs(yDistance))) *
            gravForce *
            baseSpeed;
        }
      );

      moving.forEach(
        ({
          x: fixedX,
          y: fixedY,
          mass: fixedMass,
          index: fixedIndex,
          active,
        }) => {
          if (index === fixedIndex) {
            return;
          }
          if (!active) {
            return;
          }
          distance = calculateDistance([fixedX, fixedY], [movingX, movingY]);
          xDistance = fixedX - movingX;
          yDistance = fixedY - movingY;
          // Not technically gravitational force, but the fixedMass cancels out since the force has to also move that mass
          const gravForce = (gravityPower * fixedMass) / distance ** 2;

          // Apply gravity force in proportion to the x/y distances
          moving[index].velocity.x +=
            (xDistance / (Math.abs(xDistance) + Math.abs(yDistance))) *
            gravForce *
            baseSpeed;
          moving[index].velocity.y +=
            (yDistance / (Math.abs(xDistance) + Math.abs(yDistance))) *
            gravForce *
            baseSpeed;
        }
      );
      //#endregion
      //#region Velocity Cap
      const velocityMagnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      if (velocityMagnitude >= velocityCap) {
        velocity.x *= velocityCap / velocityMagnitude;
        velocity.y *= velocityCap / velocityMagnitude;
      }
      //#endregion
      //#region Play Whoosh
      //   moving[index].velocityHistory.push({ ...velocity });
      //   if (velocityHistory.length > 10) {
      //     moving[index].velocityHistory.shift();
      //     const firstVelocity = Math.sqrt(
      //       velocityHistory[9].x ** 2 + velocityHistory[9].y ** 2
      //     );
      //     const lastVelocity = Math.sqrt(
      //       velocityHistory[0].x ** 2 + velocityHistory[0].y ** 2
      //     );
      //     if (
      //       firstVelocity - lastVelocity >= velocityToSound &&
      //       !whooshIsPlaying
      //     ) {
      //       console.log("asfldkjasl;dkf");
      //       whoosh.play();
      //       whooshIsPlaying = true;
      //     } else {
      //       console.log(velocityHistory);
      //     }
      //   }

      //#endregion
    }
  );
}

function calculateMotion(elapsed) {
  moving.forEach(function ({ velocity, index, active }) {
    if (!active) {
      return;
    }
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
