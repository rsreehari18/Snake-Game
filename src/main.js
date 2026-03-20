import {
  GRID_SIZE,
  TICK_MS,
  createInitialState,
  getCellType,
  setDirection,
  stepGame,
  togglePause,
} from "./gameLogic.js";

const boardElement = document.querySelector("#game-board");
const scoreElement = document.querySelector("#score");
const bestScoreElement = document.querySelector("#best-score");
const statusElement = document.querySelector("#status");
const restartButton = document.querySelector("#restart-button");
const pauseButton = document.querySelector("#pause-button");
const controlButtons = document.querySelectorAll("[data-direction]");

const bestScoreKey = "snake-best-score";

let state = createInitialState();
let intervalId = null;
let bestScore = Number(window.localStorage.getItem(bestScoreKey) || 0);

function init() {
  renderBoard();
  syncHud();
  bindEvents();
  startLoop();
}

function startLoop() {
  stopLoop();
  intervalId = window.setInterval(() => {
    if (state.status === "ready") {
      state = {
        ...state,
        status: "running",
      };
    }

    state = stepGame(state);
    persistBestScore();
    syncHud();
    renderBoard();
  }, TICK_MS);
}

function stopLoop() {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}

function restartGame() {
  state = createInitialState();
  syncHud();
  renderBoard();
}

function persistBestScore() {
  if (state.score > bestScore) {
    bestScore = state.score;
    window.localStorage.setItem(bestScoreKey, String(bestScore));
  }
}

function syncHud() {
  scoreElement.textContent = String(state.score);
  bestScoreElement.textContent = String(bestScore);
  statusElement.textContent = formatStatus(state.status);
  pauseButton.textContent = state.status === "paused" ? "Resume" : "Pause";
}

function renderBoard() {
  const cells = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const type = getCellType(state, x, y);
      const classNames = ["cell"];

      if (type === "head") {
        classNames.push("cell--snake", "cell--head");
      } else if (type === "snake") {
        classNames.push("cell--snake");
      } else if (type === "food") {
        classNames.push("cell--food");
      }

      cells.push(`<div class="${classNames.join(" ")}" role="gridcell"></div>`);
    }
  }

  boardElement.innerHTML = cells.join("");
}

function bindEvents() {
  window.addEventListener("keydown", (event) => {
    const direction = keyToDirection(event.key);

    if (event.key === " ") {
      event.preventDefault();
      state = togglePause(state);
      syncHud();
      return;
    }

    if (!direction) {
      return;
    }

    event.preventDefault();

    if (state.status === "game-over") {
      restartGame();
    }

    state = setDirection(state, direction);

    if (state.status === "ready") {
      state = {
        ...state,
        status: "running",
      };
    }

    syncHud();
  });

  restartButton.addEventListener("click", restartGame);
  pauseButton.addEventListener("click", () => {
    state = togglePause(state);
    syncHud();
  });

  controlButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.direction;

      if (state.status === "game-over") {
        restartGame();
      }

      state = setDirection(state, direction);

      if (state.status === "ready") {
        state = {
          ...state,
          status: "running",
        };
      }

      syncHud();
    });
  });
}

function keyToDirection(key) {
  const normalized = key.toLowerCase();

  if (normalized === "arrowup" || normalized === "w") {
    return "up";
  }

  if (normalized === "arrowdown" || normalized === "s") {
    return "down";
  }

  if (normalized === "arrowleft" || normalized === "a") {
    return "left";
  }

  if (normalized === "arrowright" || normalized === "d") {
    return "right";
  }

  return null;
}

function formatStatus(status) {
  if (status === "game-over") {
    return "Game Over";
  }

  if (status === "paused") {
    return "Paused";
  }

  if (status === "running") {
    return "Running";
  }

  return "Ready";
}

init();
