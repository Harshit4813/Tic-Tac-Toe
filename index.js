const boxes = document.querySelectorAll(".box");
const playerNameEl = document.querySelector(".player-name");
const restartButton = document.querySelector(".restart-button");
const resetScoresButton = document.querySelector(".reset-scores-button");
const statusMessage = document.querySelector(".status-message");
const streakMessage = document.querySelector(".streak-message");
const confettiContainer = document.querySelector(".confetti-container");

const introOverlay = document.querySelector(".intro-overlay");
const startPvpButton = document.querySelector(".start-pvp");
const startBotButton = document.querySelector(".start-bot");
const nameInput1 = document.querySelector(".name-input-1");
const nameInput2 = document.querySelector(".name-input-2");

const welcomeTextEl = document.querySelector(".welcome-text");
const modeLabel = document.querySelector(".mode-label");

const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");
const scoreDrawEl = document.getElementById("score-draw");

const winningPosition = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let gameGrid = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let gameMode = "pvp"; // "pvp" or "bot"

let playerXName = "Player 1";
let playerOName = "Player 2";

let scores = {
  X: 0,
  O: 0,
  draw: 0,
};

function init() {
  boxes.forEach((box, index) => {
    box.addEventListener("click", () => handleClick(index));
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick(index);
      }
    });
  });

  restartButton.addEventListener("click", resetBoard);
  resetScoresButton.addEventListener("click", resetScores);

  startPvpButton.addEventListener("click", () => {
    gameMode = "pvp";
    const n1 = nameInput1.value.trim() || "Player 1";
    const n2 = nameInput2.value.trim() || "Player 2";
    playerXName = n1;
    playerOName = n2;
    modeLabel.textContent = "Player vs Friend";
    closeIntroAndStart();
  });

  startBotButton.addEventListener("click", () => {
    gameMode = "bot";
    const n1 = nameInput1.value.trim() || "Player 1";
    playerXName = n1;
    playerOName = "Bot";
    modeLabel.textContent = "You vs Bot";
    closeIntroAndStart();
  });

  updateUIForTurn();
}

function closeIntroAndStart() {
  introOverlay.classList.add("hidden");
  resetBoard();
  resetScores();

  if (gameMode === "bot") {
    streakMessage.textContent = `${playerXName}, you are X. Bot plays as O.`;
  } else {
    streakMessage.textContent = `${playerXName} vs ${playerOName}. X starts.`;
  }
}

function handleClick(index) {
  if (!gameActive) return;

  // in bot mode, ignore clicks when it's bot's turn
  if (gameMode === "bot" && currentPlayer === "O") return;
  if (gameGrid[index] !== "") return;

  makeMove(index, currentPlayer);

  let result = checkGameResult();
  if (result.status === "win") {
    handleWin(result.winner, result.combo);
    return;
  } else if (result.status === "draw") {
    handleDraw();
    return;
  }

  if (gameMode === "pvp") {
    switchPlayer();
  } else {
    switchPlayer(); // human X -> bot O
    botMove();
  }
}

function makeMove(index, player) {
  gameGrid[index] = player;
  const box = boxes[index];
  box.innerText = player;
  box.classList.add("filled", player.toLowerCase());
  box.style.pointerEvents = "none";
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateUIForTurn();
}

function updateUIForTurn() {
  playerNameEl.textContent = currentPlayer;
  playerNameEl.classList.toggle("x", currentPlayer === "X");
  playerNameEl.classList.toggle("o", currentPlayer === "O");

  if (gameMode === "bot") {
    // header: always player X name
    welcomeTextEl.textContent = `Welcome ${playerXName} 👋`;
    statusMessage.textContent =
      currentPlayer === "O"
        ? "Bot is thinking..."
        : `${playerXName}'s turn as X`;
  } else {
    const currentName = currentPlayer === "X" ? playerXName : playerOName;
    welcomeTextEl.textContent = `Welcome ${currentName} 👋`;
    statusMessage.textContent = `${currentName}'s turn (${currentPlayer})`;
  }
}

function checkGameResult() {
  for (const combo of winningPosition) {
    const [a, b, c] = combo;
    if (gameGrid[a] && gameGrid[a] === gameGrid[b] && gameGrid[a] === gameGrid[c]) {
      return { status: "win", winner: gameGrid[a], combo };
    }
  }

  const allFilled = gameGrid.every((cell) => cell !== "");
  if (allFilled) return { status: "draw" };

  return { status: "ongoing" };
}

function handleWin(winner, combo) {
  gameActive = false;

  combo.forEach((index) => {
    boxes[index].classList.add("active");
  });

  boxes.forEach((box) => {
    box.style.pointerEvents = "none";
  });

  scores[winner]++;
  updateScoreboard();

  if (gameMode === "bot") {
    if (winner === "O") {
      statusMessage.textContent = "Bot wins this round! 🤖";
      // keep header as human name
      welcomeTextEl.textContent = `Welcome ${playerXName} 👋`;
    } else {
      statusMessage.textContent = `${playerXName} wins! 🎉`;
      welcomeTextEl.textContent = `Congrats ${playerXName} 👋`;
    }
  } else {
    const winnerName = winner === "X" ? playerXName : playerOName;
    statusMessage.textContent = `${winnerName} wins! 🎉`;
    welcomeTextEl.textContent = `Congrats ${winnerName} 👋`;
  }

  updateStreakMessage();
  launchConfetti();
}

function handleDraw() {
  gameActive = false;
  scores.draw++;
  updateScoreboard();

  statusMessage.textContent = "It's a draw. Try again!";
  // keep welcome text as last player
}

function updateScoreboard() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.draw;
}

function updateStreakMessage() {
  const leader =
    scores.X > scores.O
      ? "X"
      : scores.O > scores.X
      ? "O"
      : null;

  if (!leader) {
    streakMessage.textContent = "It's balanced so far.";
    return;
  }

  const diff = Math.abs(scores.X - scores.O);
  if (diff >= 5) {
    streakMessage.textContent = `Player ${leader} is on fire.`;
  } else if (diff >= 3) {
    streakMessage.textContent = `Player ${leader} has a solid lead.`;
  } else {
    streakMessage.textContent = `Player ${leader} is slightly ahead.`;
  }
}

function resetBoard() {
  gameGrid = Array(9).fill("");
  gameActive = true;
  currentPlayer = "X";

  boxes.forEach((box) => {
    box.innerText = "";
    box.style.pointerEvents = "auto";
    box.classList.remove("active", "filled", "x", "o");
  });

  updateUIForTurn();
}

function resetScores() {
  scores = { X: 0, O: 0, draw: 0 };
  updateScoreboard();
}

/* BOT LOGIC */
function botMove() {
  if (!gameActive) return;

  setTimeout(() => {
    if (!gameActive) return;

    const index = chooseBotMove();
    if (index === -1) return;

    makeMove(index, currentPlayer); // currentPlayer is "O"

    const result = checkGameResult();
    if (result.status === "win") {
      handleWin(result.winner, result.combo);
    } else if (result.status === "draw") {
      handleDraw();
    } else {
      switchPlayer(); // back to human
    }
  }, 450);
}

function chooseBotMove() {
  const bot = "O";
  const human = "X";

  // 1. try to win
  for (let i = 0; i < 9; i++) {
    if (gameGrid[i] === "") {
      gameGrid[i] = bot;
      if (checkGameResult().status === "win") {
        gameGrid[i] = "";
        return i;
      }
      gameGrid[i] = "";
    }
  }

  // 2. block human win
  for (let i = 0; i < 9; i++) {
    if (gameGrid[i] === "") {
      gameGrid[i] = human;
      if (checkGameResult().status === "win") {
        gameGrid[i] = "";
        return i;
      }
      gameGrid[i] = "";
    }
  }

  // 3. center
  if (gameGrid[4] === "") return 4;

  // 4. corners
  const corners = [0, 2, 6, 8].filter((i) => gameGrid[i] === "");
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. sides
  const sides = [1, 3, 5, 7].filter((i) => gameGrid[i] === "");
  if (sides.length > 0) {
    return sides[Math.floor(Math.random() * sides.length)];
  }

  return -1;
}

/* CONFETTI */
function launchConfetti() {
  const count = 70;
  const colors = ["#ffffff", "#ffe082", "#ff9a9e", "#b3ffab"];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti-piece");
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.animationDuration = 0.9 + Math.random() * 0.7 + "s";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.opacity = 0.7 + Math.random() * 0.3;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, 2000);
  }
}

init();
