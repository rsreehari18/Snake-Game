export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 140;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function createInitialSnake() {
  return [
    { x: 2, y: 8 },
    { x: 1, y: 8 },
    { x: 0, y: 8 },
  ];
}

export function createInitialState(random = Math.random) {
  const snake = createInitialSnake();

  return {
    gridSize: GRID_SIZE,
    snake,
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    food: placeFood(snake, GRID_SIZE, random),
    score: 0,
    status: "ready",
  };
}

export function setDirection(state, requestedDirection) {
  if (!DIRECTION_VECTORS[requestedDirection]) {
    return state;
  }

  const blockedDirection = OPPOSITES[state.direction];

  if (requestedDirection === blockedDirection && state.snake.length > 1) {
    return state;
  }

  return {
    ...state,
    nextDirection: requestedDirection,
  };
}

export function stepGame(state, random = Math.random) {
  if (state.status === "game-over" || state.status === "paused") {
    return state;
  }

  const direction = state.nextDirection;
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };

  const ateFood = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;
  const collisionBody = ateFood ? state.snake : state.snake.slice(0, -1);

  if (isOutOfBounds(nextHead, state.gridSize) || hitsSnake(nextHead, collisionBody)) {
    return {
      ...state,
      direction,
      status: "game-over",
    };
  }

  const nextSnake = [nextHead, ...state.snake];

  if (!ateFood) {
    nextSnake.pop();
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    nextDirection: direction,
    food: ateFood ? placeFood(nextSnake, state.gridSize, random) : state.food,
    score: ateFood ? state.score + 1 : state.score,
    status: "running",
  };
}

export function togglePause(state) {
  if (state.status === "game-over" || state.status === "ready") {
    return state;
  }

  return {
    ...state,
    status: state.status === "paused" ? "running" : "paused",
  };
}

export function placeFood(snake, gridSize, random = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const available = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;

      if (!occupied.has(key)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(random() * available.length);
  return available[index];
}

export function getCellType(state, x, y) {
  if (state.food && state.food.x === x && state.food.y === y) {
    return "food";
  }

  const segmentIndex = state.snake.findIndex((segment) => segment.x === x && segment.y === y);

  if (segmentIndex === 0) {
    return "head";
  }

  if (segmentIndex > 0) {
    return "snake";
  }

  return "empty";
}

function isOutOfBounds(position, gridSize) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= gridSize ||
    position.y >= gridSize
  );
}

function hitsSnake(position, snake) {
  return snake.some((segment) => segment.x === position.x && segment.y === position.y);
}
