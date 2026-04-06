const GRID_SIZE = 4;
const START_TILES = 2;
const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const messageElement = document.getElementById("message");
const messageText = document.getElementById("message-text");
const restartButton = document.getElementById("restart");
const playAgainButton = document.getElementById("play-again");

let grid = [];
let score = 0;
let gameOver = false;

function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function randomEmptyCell() {
  const empty = [];
  grid.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 0) empty.push({ x, y });
    });
  });
  return empty[Math.floor(Math.random() * empty.length)];
}

function addTile() {
  const cell = randomEmptyCell();
  if (cell) {
    grid[cell.y][cell.x] = Math.random() < 0.9 ? 2 : 4;
  }
}

function updateGrid() {
  gridElement.innerHTML = "";

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const value = grid[y][x];
      const cell = document.createElement("div");
      cell.className = "cell" + (value ? ` tile-${value}` : "");
      cell.textContent = value || "";
      gridElement.appendChild(cell);
    }
  }

  scoreElement.textContent = score;
}

function slide(row) {
  const filtered = row.filter((value) => value !== 0);
  const missing = GRID_SIZE - filtered.length;
  return filtered.concat(Array(missing).fill(0));
}

function combine(row) {
  const newRow = [...row];
  for (let i = 0; i < GRID_SIZE - 1; i += 1) {
    if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      newRow[i + 1] = 0;
      score += newRow[i];
    }
  }
  return newRow;
}

function moveLeft() {
  let moved = false;
  for (let y = 0; y < GRID_SIZE; y += 1) {
    const row = grid[y];
    const slid = slide(row);
    const combined = combine(slid);
    const finalRow = slide(combined);
    if (!moved && finalRow.some((value, x) => value !== row[x])) moved = true;
    grid[y] = finalRow;
  }
  return moved;
}

function moveRight() {
  grid = grid.map((row) => row.reverse());
  const moved = moveLeft();
  grid = grid.map((row) => row.reverse());
  return moved;
}

function transpose(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

function moveUp() {
  grid = transpose(grid);
  const moved = moveLeft();
  grid = transpose(grid);
  return moved;
}

function moveDown() {
  grid = transpose(grid);
  const moved = moveRight();
  grid = transpose(grid);
  return moved;
}

function movesAvailable() {
  if (grid.some((row) => row.includes(0))) return true;

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const value = grid[y][x];
      if (x < GRID_SIZE - 1 && grid[y][x + 1] === value) return true;
      if (y < GRID_SIZE - 1 && grid[y + 1][x] === value) return true;
    }
  }
  return false;
}

function showMessage(text) {
  messageText.textContent = text;
  messageElement.classList.remove("hidden");
}

function hideMessage() {
  messageElement.classList.add("hidden");
}

function restartGame() {
  grid = createEmptyGrid();
  score = 0;
  gameOver = false;
  hideMessage();
  for (let i = 0; i < START_TILES; i += 1) addTile();
  updateGrid();
}

function handleMove(directionFn) {
  if (gameOver) return;
  const moved = directionFn();
  if (!moved) return;
  addTile();
  updateGrid();
  if (!movesAvailable()) {
    gameOver = true;
    showMessage("Game over!");
  }
}

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      handleMove(moveLeft);
      break;
    case "ArrowRight":
      event.preventDefault();
      handleMove(moveRight);
      break;
    case "ArrowUp":
      event.preventDefault();
      handleMove(moveUp);
      break;
    case "ArrowDown":
      event.preventDefault();
      handleMove(moveDown);
      break;
    default:
      return;
  }
});

restartButton.addEventListener("click", restartGame);
playAgainButton.addEventListener("click", restartGame);

restartGame();
