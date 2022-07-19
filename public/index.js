let canvas = document.getElementById("theCanvas");
let context = canvas.getContext("2d");
let whoosh = new Audio("whoosh.wav");
let whooshIsPlaying = false;
let doesBounce = true;
let frameCount = 0;
let showTrails = true;
let blackHoleMode = false;

whoosh.addEventListener(
  "ended",
  function () {
    whooshIsPlaying = false;
  },
  false
);

context.canvas.width = window.innerWidth - 50;
context.canvas.height = window.innerHeight - 150;

const bounceReduction = 1 / 3;
const wrapReduction = 1 / 2;
const bounceBuffer = 10;
const velocityCap = 10000;
const velocityHistoryLength = 10;
const velocityCapExceptionRadius = 3 / 4;
const velocityToSound = 3000;
let paused = true;
const speedSlider = document.getElementById("speedSlider");
const gravitySlider = document.getElementById("gravitySlider");

let gravityPower = (gravitySlider.min + gravitySlider.max) / 2;
let baseSpeed = ((speedSlider.min + speedSlider.max) / 2) * 0.2;

const trailSlider = document.getElementById("trailSlider");

const positionHistoryDotRadius = 3;
const positionHistoryFrameGap = 1;
const defaultPositionHistoryLength = trailSlider.value;
const positionHistoryMaxLength = trailSlider.max;
let positionHistoryLength = defaultPositionHistoryLength;

let start, previousTimeStamp;

const elapsedCap = 16 * 4;
const elapsedCapTo = 16;

const fpsCounter = document.getElementById("fpsCounter");

let elapsedHistory = [];
const fpsLogFrameGap = 30;
let fps = 60;
const fpsRoundToPlace = 1;

const configSelect = document.getElementById("configSelect");

const stationaryConfigs = [
  [
    {
      name: "sun",
      x: (1 / 2) * context.canvas.width,
      y: (1 / 2) * context.canvas.height,
      mass: 1000,
      radius: 30,
      // color: "#f7f7f7",
      // should be rgba(221, 255, 102, 1)
      // rgba(0, 0, 0, 0)
      // 000
      color: "rgba(221, 255, 102, 1)",
    },
  ],
  [
    {
      name: "dual1",
      x: (3 / 4) * context.canvas.width,
      y: (1 / 2) * context.canvas.height,
      mass: 750,
      radius: 25,
      // color: "#f7f7f7",
      color: "rgba(221, 255, 102, 1)",
    },
    {
      name: "dual2",
      x: (1 / 4) * context.canvas.width,
      y: (1 / 2) * context.canvas.height,
      mass: 750,
      radius: 25,
      // color: "#f7f7f7",
      color: "rgba(221, 255, 102, 1)",
    },
  ],
  [
    {
      name: "quad1",
      x: (2 / 7) * context.canvas.width,
      y: (2 / 7) * context.canvas.height,
      mass: 600,
      radius: 20,
      // color: "#f7f7f7",
      color: "rgba(221, 255, 102, 1)",
    },
    {
      name: "quad2",
      x: (5 / 7) * context.canvas.width,
      y: (2 / 7) * context.canvas.height,
      mass: 600,
      radius: 20,
      // color: "#f7f7f7",
      color: "rgba(221, 255, 102, 1)",
    },
    {
      name: "quad3",
      x: (2 / 7) * context.canvas.width,
      y: (5 / 7) * context.canvas.height,
      mass: 600,
      radius: 20,
      // color: "#f7f7f7",
      color: "rgba(221, 255, 102, 1)",
    },
    {
      name: "quad3",
      x: (5 / 7) * context.canvas.width,
      y: (5 / 7) * context.canvas.height,
      mass: 600,
      radius: 20,
      // color: "#f7f7f7",
      color: "rgba(221, 255, 102, 1)",
    },
  ],
  [],
];
// Keep last array empty

const initialMoving = [
  {
    name: "main",
    x: (1 / 4) * context.canvas.width,
    y: (1 / 4) * context.canvas.height,
    radius: 10,
    // color: "#d3d3d3",
    color: "rgba(85, 170, 187, 1)",
    velocity: { x: 0, y: 1000 },
    mass: 200,
    index: 0,
    active: true,
    velocityHistory: [],
    positionHistory: [],
  },
  {
    name: "second",
    x: (3 / 4) * context.canvas.width,
    y: (1 / 4) * context.canvas.height,
    radius: 12,
    // color: "#800020",
    color: "rgba(187, 51, 136, 1)",
    velocity: { x: 0, y: 1000 },
    mass: 300,
    index: 1,
    active: false,
    velocityHistory: [],
    positionHistory: [],
  },
  {
    name: "third",
    x: (1 / 4) * context.canvas.width,
    y: (3 / 4) * context.canvas.height,
    radius: 13,
    // color: "#800020",
    color: "rgba(247, 247, 247, 1)",
    velocity: { x: 0, y: -1000 },
    mass: 400,
    index: 2,
    active: false,
    velocityHistory: [],
    positionHistory: [],
  },
  {
    name: "fourth",
    x: (3 / 4) * context.canvas.width,
    y: (3 / 4) * context.canvas.height,
    radius: 15,
    // color: "#800020",
    color: "rgba(108, 11, 169, 1)",
    velocity: { x: 0, y: -1000 },
    mass: 500,
    index: 3,
    active: true,
    velocityHistory: [],
    positionHistory: [],
  },
];

let stationaries = JSON.parse(JSON.stringify(stationaryConfigs[0]));

let moving = JSON.parse(JSON.stringify(initialMoving));

function changeConfig(config) {
  stationaries = JSON.parse(JSON.stringify(stationaryConfigs[config]));
  clearCanvas();
  drawAll();
}

function toggleBlackHoleMode() {
  blackHoleMode = !blackHoleMode;
}

function toggleBounce() {
  doesBounce = !doesBounce;
}

function toggleTrails() {
  showTrails = !showTrails;
}

function toggleMoving(index) {
  moving[index].active = !moving[index].active;
  clearCanvas();
  drawAll();
}

function updateTrailInput() {
  positionHistoryLength = trailSlider.value;
}

function updateSpeedInput() {
  baseSpeed = 0.2 * speedSlider.value;
}

function updateGravityInput() {
  gravityPower = gravitySlider.value;
}

function updateFPS(fps) {
  fpsCounter.innerHTML = fps.toString() + " FPS";
}

function clearFPS() {
  fpsCounter.innerHTML = "";
}

function reset() {
  paused = true;
  moving = JSON.parse(JSON.stringify(initialMoving));
  stationaries = JSON.parse(JSON.stringify(stationaryConfigs[0]));
  clearCanvas();
  drawAll();
  baseSpeed = ((speedSlider.min + speedSlider.max) / 2) * 0.2;
  speedSlider.value = (speedSlider.min + speedSlider.max) / 2;
  gravityPower = (gravitySlider.min + gravitySlider.max) / 2;
  gravitySlider.value = (gravitySlider.min + gravitySlider.max) / 2;
  doesBounce = true;
  trailSlider.value = defaultPositionHistoryLength;
  positionHistoryLength = defaultPositionHistoryLength;
  configSelect.value = 0;
  clearFPS();
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

function drawHistory(positionHistory, color) {
  //   if (positionHistory.length > 0) {
  //     positionHistory.forEach(([x, y]) => {
  //       drawCircle(x, y, positionHistoryDotRadius, color);
  //     });
  //   }
  let newPosHistory = JSON.parse(JSON.stringify(positionHistory));
  newPosHistory.reverse();
  newPosHistory = newPosHistory.slice(0, positionHistoryLength);
  for (let i = 0; i < positionHistoryLength; i++) {
    let dotFade = 1 - i / newPosHistory.length;
    if (newPosHistory[i]) {
      drawCircle(
        newPosHistory[i][0],
        newPosHistory[i][1],
        positionHistoryDotRadius,
        color.replace(/[^,]+(?=\))/, dotFade.toString())
      );
    }
  }
}

function drawAll() {
  stationaries.forEach(function ({ x, y, radius, color, active }) {
    if (!active && active != undefined) {
      return;
    }
    if (blackHoleMode) {
      drawCircle(x, y, radius, "rgba(0, 0, 0, 0)");
      return;
    }
    drawCircle(x, y, radius, color);
  });
  moving.forEach(function ({ x, y, radius, color, active, positionHistory }) {
    if (!active) {
      return;
    }
    if (showTrails) {
      drawHistory(positionHistory, color);
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
        }

        if (movingY - radius <= 0 && velocity.y <= 0) {
          moving[index].velocity.y *= wrapReduction;
          moving[index].y += context.canvas.height;
        }
        if (movingX + radius >= context.canvas.width && velocity.x >= 0) {
          moving[index].velocity.x *= wrapReduction;
          moving[index].x -= context.canvas.width;
        }

        if (movingX - radius <= 0 && velocity.x <= 0) {
          moving[index].velocity.x *= wrapReduction;
          moving[index].x += context.canvas.width;
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
      let isNearStationary = false;
      stationaries.forEach(({ x: fixedX, y: fixedY, radius: fixedRadius }) => {
        if (
          calculateDistance([movingX, movingY], [fixedX, fixedY]) <
          velocityCapExceptionRadius * fixedRadius
        ) {
          isNearStationary = true;
        } else {
        }
      });
      const velocityMagnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

      if (
        !isNearStationary &&
        velocityMagnitude < context.canvas.height / 2 &&
        velocityMagnitude < context.canvas.width / 2
      ) {
        if (velocityMagnitude >= velocityCap) {
          velocity.x *= velocityCap / velocityMagnitude;
          velocity.y *= velocityCap / velocityMagnitude;
        }
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
    if (frameCount % positionHistoryFrameGap === 0) {
      moving[index].positionHistory.push([moving[index].x, moving[index].y]);
      if (moving[index].positionHistory.length > positionHistoryMaxLength) {
        moving[index].positionHistory.shift();
      }
    }
  });
}

function updateCanvas(timestamp) {
  if (start === undefined) {
    start = timestamp;
  }

  let elapsed = timestamp - start;
  if (elapsed > elapsedCap) {
    elapsed = elapsedCapTo;
  }
  start = timestamp;

  if (!paused) {
    frameCount += 1;
    elapsedHistory.push(elapsed);
    if (frameCount % fpsLogFrameGap === 0) {
      fps =
        1000 / (elapsedHistory.reduce((a, b) => a + b) / elapsedHistory.length);
      updateFPS(
        Math.round(fps * 10 ** fpsRoundToPlace) / 10 ** fpsRoundToPlace
      );
      elapsedHistory = [];
    }
    clearCanvas();
    calculateMotion(elapsed);
    calculateVelocity(elapsed);
    drawAll();
    window.requestAnimationFrame(updateCanvas);
  } else {
    clearFPS();
  }
}

drawAll();

// theContext.beginPath();
// theContext.arc(300, 50, 5, 0, 2 * Math.PI);
// theContext.fillStyle = "#f7f7f7";
// theContext.fill();
