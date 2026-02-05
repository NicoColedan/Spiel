let reels = Array.from(document.querySelectorAll(".reel"));
const reelsContainer = document.getElementById("reels");
const paylineOverlay = document.getElementById("payline-overlay");
const payout = document.getElementById("payout");
const screen = document.getElementById("screen");
const autoButton = document.getElementById("auto");
const stopButton = document.getElementById("stop");
const lostOverlay = document.getElementById("lost");
const leverButton = document.getElementById("lever");
const winOverlay = document.getElementById("win");
const winAmount = document.getElementById("win-amount");
const stakeSelect = document.getElementById("stake");
const shopButton = document.getElementById("shop");
const shopOverlay = document.getElementById("shop-overlay");
const shopClose = document.getElementById("shop-close");
const rollCoinsButton = document.getElementById("roll-coins");
const rerollCoinsButton = document.getElementById("reroll-coins");
const coinResults = document.getElementById("coin-results");
const coinSpinner = document.getElementById("coin-spinner");
const inventorySlots = Array.from(document.querySelectorAll(".inventory-slot[data-slot]"));
const passiveSlots = Array.from(document.querySelectorAll(".inventory-slot[data-passive-slot]"));
const passiveCoins = document.getElementById("passive-coins");
const balanceLabel = document.getElementById("balance");
const timerLabel = document.getElementById("timer");
const confirmOverlay = document.getElementById("confirm-overlay");
const confirmText = document.getElementById("confirm-text");
const confirmBuy = document.getElementById("confirm-buy");
const confirmCancel = document.getElementById("confirm-cancel");
const restartButton = document.getElementById("restart");
const coinBonus = document.getElementById("coin-bonus");
const startScreen = document.getElementById("start-screen");
const gameLayout = document.getElementById("game");
const gameShell = document.getElementById("game-shell");
const levelButtons = Array.from(document.querySelectorAll(".level-card"));
const centerMessage = document.getElementById("center-message");
const levelCompleteOverlay = document.getElementById("level-complete");
const backToStartButton = document.getElementById("back-to-start");
const freePlayButton = document.getElementById("free-play");
const levelIndicator = document.getElementById("level-indicator");
const lostText = document.getElementById("lost-text");
const levelCompleteText = document.getElementById("level-complete-text");
const homeButton = document.getElementById("home-button");
const payoutList = document.getElementById("payout-list");

const levelSymbolSets = {
  1: [
    { icon: "🍒", twoMult: 1.2, threeMult: 4 },
    { icon: "🔔", twoMult: 1.4, threeMult: 4.8 },
    { icon: "⭐", twoMult: 1.6, threeMult: 6 },
    { icon: "💎", twoMult: 2.2, threeMult: 10 },
    { icon: "7️⃣", twoMult: 3, threeMult: 14 },
    { icon: "❌", twoMult: 0, threeMult: "refund" },
  ],
  2: [
    { icon: "10", threeMult: 3.5, fourMult: 7, fiveMult: 12 },
    { icon: "J", threeMult: 3.8, fourMult: 7.5, fiveMult: 13 },
    { icon: "Q", threeMult: 4.2, fourMult: 8.5, fiveMult: 14 },
    { icon: "K", threeMult: 4.6, fourMult: 9.5, fiveMult: 15 },
    { icon: "𓅃", threeMult: 5.4, fourMult: 11, fiveMult: 18 },
    { icon: "🧔", threeMult: 6.4, fourMult: 12, fiveMult: 22 },
    { icon: "🪲", threeMult: 7.4, fourMult: 14, fiveMult: 26 },
    { icon: "🤴", threeMult: 8.6, fourMult: 16, fiveMult: 30 },
  ],
};

const levelLayouts = {
  1: { reels: 3, rows: 3, paylines: [[1, 1, 1]] },
  2: {
    reels: 5,
    rows: 3,
    paylines: [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2],
      [0, 1, 2, 1, 0],
      [2, 1, 0, 1, 2],
    ],
  },
};

let spinCost = 5;
let balance = -50;
let isSpinning = false;
let autoSpin = false;
let spinInterval = null;
const reelIntervals = new Map();
let freeSpins = 0;
let winBonusMultiplier = 0;
let winBonusTurns = 0;
let doubleWinNext = false;
let doubleWinQueue = 0;
let luckyPunchArmed = false;
let luckyPunchReward = 25;
let luckyPunchQueue = 0;
let lastSpinWin = false;
let freeSpinQueued = false;
let hourglassCounter = 0;
let startTime = Date.now();
let pendingCoin = null;
let pendingAction = null;
let currentCoinResults = [];
let coinPrice = 25;
let currentRollPrice = 25;
let coinPurchased = false;
let coinRolled = false;
let gameOver = false;
let levelCompleted = false;
let level2Unlocked = true;
let freePlayMode = false;
let currentLevel = 1;
let audioContext = null;
let gameOverSoundPlayed = false;
let currentGrid = [];
let paylineAnimationRunning = false;
let skipPaylineAnimation = false;
let ambienceNodes = null;

const levelSettings = {
  1: { minStake: 1, gameOverLimit: -1000, winTarget: 300 },
  2: { minStake: 25, gameOverLimit: -200, winTarget: 750 },
};

const getLevelSettings = () => levelSettings[currentLevel] ?? levelSettings[1];

const getSymbolsForLevel = (level) => levelSymbolSets[level] ?? levelSymbolSets[1];
const getCurrentSymbols = () => getSymbolsForLevel(currentLevel);
const getLevelLayout = () => levelLayouts[currentLevel] ?? levelLayouts[1];

const renderPayoutTable = () => {
  if (!payoutList) return;
  payoutList.innerHTML = "";
  const symbols = getCurrentSymbols();
  symbols.forEach((symbol) => {
    const row = document.createElement("li");
    if (currentLevel === 2) {
      const three = document.createElement("span");
      const four = document.createElement("span");
      const five = document.createElement("span");
      three.dataset.multiplier = String(symbol.threeMult ?? 0);
      four.dataset.multiplier = String(symbol.fourMult ?? symbol.threeMult ?? 0);
      five.dataset.multiplier = String(symbol.fiveMult ?? symbol.fourMult ?? symbol.threeMult ?? 0);
      row.append(`${symbol.icon}x3 = `, three, `, ${symbol.icon}x4 = `, four, `, ${symbol.icon}x5 = `, five);
    } else {
      const two = document.createElement("span");
      two.dataset.multiplier = String(symbol.twoMult);
      const three = document.createElement("span");
      if (symbol.threeMult === "refund") {
        three.dataset.refund = "true";
        three.textContent = String(spinCost);
      } else {
        three.dataset.multiplier = String(symbol.threeMult);
      }
      row.append(`${symbol.icon}${symbol.icon} = `, two, `, ${symbol.icon}${symbol.icon}${symbol.icon} = `, three);
    }
    payoutList.appendChild(row);
  });

  const info = document.createElement("li");
  info.textContent =
    currentLevel === 2
      ? "Level 2: 5 Walzen, 3 Reihen + 2 diagonale Gewinnlinien. Gewinn zählt von links nach rechts ab 3 Symbolen."
      : "Level 1: klassische Linie in der mittleren Reihe.";
  payoutList.appendChild(info);
};

const ensureAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  startAmbience();
  syncAmbience();
};

const playTone = (frequency, duration, type = "sine", gainValue = 0.12) => {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = gainValue;
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
};

const syncAmbience = () => {
  if (!audioContext || !ambienceNodes) return;
  ambienceNodes.master.gain.setTargetAtTime(currentLevel === 2 ? 0.035 : 0.008, audioContext.currentTime, 0.25);
};

const startAmbience = () => {
  if (!audioContext || ambienceNodes) return;
  const master = audioContext.createGain();
  master.gain.value = 0;
  master.connect(audioContext.destination);

  const drone = audioContext.createOscillator();
  const droneGain = audioContext.createGain();
  drone.type = "triangle";
  drone.frequency.value = 94;
  droneGain.gain.value = 0.08;
  drone.connect(droneGain);
  droneGain.connect(master);
  drone.start();

  const shimmer = audioContext.createOscillator();
  const shimmerGain = audioContext.createGain();
  shimmer.type = "sine";
  shimmer.frequency.value = 188;
  shimmerGain.gain.value = 0.025;
  shimmer.connect(shimmerGain);
  shimmerGain.connect(master);
  shimmer.start();

  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  lfo.type = "sine";
  lfo.frequency.value = 0.09;
  lfoGain.gain.value = 20;
  lfo.connect(lfoGain);
  lfoGain.connect(shimmer.frequency);
  lfo.start();

  ambienceNodes = { master, drone, droneGain, shimmer, shimmerGain, lfo, lfoGain };
  syncAmbience();
};

const playClickSound = () => {
  ensureAudio();
  playTone(320, 0.03, "triangle", 0.08);
};

const playLeverSound = () => {
  ensureAudio();
  playTone(180, 0.12, "triangle", 0.08);
  setTimeout(() => playTone(130, 0.14, "sine", 0.06), 90);
};

const playSpinSound = () => {
  ensureAudio();
  playTone(currentLevel === 2 ? 170 : 260, 0.28, currentLevel === 2 ? "triangle" : "sine", 0.05);
};

const playCoinActivateSound = () => {
  ensureAudio();
  playTone(640, 0.07, "triangle", 0.1);
  setTimeout(() => playTone(880, 0.06, "triangle", 0.08), 80);
};

const playShopOpenSound = () => {
  ensureAudio();
  playTone(420, 0.08, "sine", 0.09);
  setTimeout(() => playTone(520, 0.08, "sine", 0.08), 100);
};

const playShopCloseSound = () => {
  ensureAudio();
  playTone(360, 0.08, "sine", 0.09);
  setTimeout(() => playTone(280, 0.1, "sine", 0.08), 100);
};

const playRattleSound = (duration = 900) => {
  ensureAudio();
  const ticks = Math.max(4, Math.floor(duration / 120));
  for (let i = 0; i < ticks; i += 1) {
    setTimeout(() => playTone(1200, 0.03, "square", 0.03), i * 120);
  }
};

const playWinSound = () => {
  ensureAudio();
  playTone(520, 0.12, "sine", 0.14);
  setTimeout(() => playTone(currentLevel === 2 ? 610 : 720, 0.12, "sine", 0.12), 120);
};

const playLevelCompleteSound = () => {
  ensureAudio();
  playTone(440, 0.14, "sine", 0.12);
  setTimeout(() => playTone(660, 0.14, "sine", 0.12), 140);
  setTimeout(() => playTone(880, 0.18, "sine", 0.12), 280);
};

const playGameOverSound = () => {
  ensureAudio();
  playTone(220, 0.2, "sine", 0.12);
  setTimeout(() => playTone(180, 0.22, "sine", 0.12), 180);
  setTimeout(() => playTone(140, 0.24, "sine", 0.12), 380);
};

const updateBalance = () => {
  const formatted = balance > 0 ? `+${balance}` : `${balance}`;
  balanceLabel.textContent = `${formatted} €`;
  const { gameOverLimit, winTarget } = getLevelSettings();
  if (!gameOver && balance <= gameOverLimit) {
    gameOver = true;
    autoSpin = false;
    clearTimeout(spinInterval);
    autoButton.textContent = "Auto-Spin";
    setLostState(true);
    if (!gameOverSoundPlayed) {
      playGameOverSound();
      gameOverSoundPlayed = true;
    }
  }
  if (!levelCompleted && !freePlayMode && balance > winTarget) {
    showLevelComplete();
  }
};

const showToast = (message) => {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
};

const showCoinBonus = (amount, label, icon = "🪙") => {
  if (!amount) return;
  const bonusEl = document.createElement("div");
  bonusEl.className = "coin-bonus-item";
  bonusEl.innerHTML = `<span class="coin-bonus-icon">${icon}</span><span class="coin-bonus-text">+${amount} ${label}</span>`;
  coinBonus.appendChild(bonusEl);
  setTimeout(() => {
    bonusEl.classList.add("hide");
    setTimeout(() => bonusEl.remove(), 600);
  }, 1400);
};

const openConfirm = (text, action) => {
  confirmText.textContent = text;
  pendingAction = action;
  confirmOverlay.classList.add("show");
  confirmOverlay.setAttribute("aria-hidden", "false");
};

const showPayout = (message, highlight = false) => {
  payout.textContent = message;
  payout.style.color = highlight ? "#ffe680" : "#4dd7ff";
};

const consumeActiveCoin = (coinId) => {
  const coinIndex = inventory.findIndex((coin) => coin?.id === coinId && coin.active);
  if (coinIndex !== -1) {
    inventory[coinIndex].remainingSpins = 0;
  }
};

const showCenterMessage = (message) => {
  centerMessage.textContent = message;
  centerMessage.classList.add("show");
  setTimeout(() => centerMessage.classList.remove("show"), 1600);
};

const updateLevelIndicator = () => {
  if (levelIndicator) {
    levelIndicator.textContent = `Level ${currentLevel}`;
  }
  document.body.classList.toggle("level-2", currentLevel === 2);
  syncAmbience();
};

const configureMachineLayout = () => {
  const layout = getLevelLayout();
  reelsContainer.style.gridTemplateColumns = `repeat(${layout.reels}, minmax(0, 1fr))`;
  reelsContainer.innerHTML = "";
  for (let reelIndex = 0; reelIndex < layout.reels; reelIndex += 1) {
    const reel = document.createElement("div");
    reel.className = "reel";
    reel.dataset.reel = String(reelIndex);
    for (let row = 0; row < layout.rows; row += 1) {
      const symbolEl = document.createElement("div");
      symbolEl.className = `symbol row-${row}`;
      symbolEl.textContent = getRandomSymbol().icon;
      reel.appendChild(symbolEl);
    }
    reelsContainer.appendChild(reel);
  }
  reels = Array.from(document.querySelectorAll(".reel"));
};

function applyLevelSettings() {
  const { minStake, gameOverLimit, winTarget } = getLevelSettings();
  Array.from(stakeSelect.options).forEach((option) => {
    option.disabled = Number(option.value) < minStake;
  });
  if (Number(stakeSelect.value) < minStake) {
    stakeSelect.value = String(minStake);
  }
  configureMachineLayout();
  spinCost = Number(stakeSelect.value);
  renderPayoutTable();
  updatePayoutTable();
  if (lostText) {
    lostText.textContent = `Dein Guthaben ist unter ${gameOverLimit} €.`;
  }
  if (levelCompleteText) {
    levelCompleteText.textContent = `Du hast mehr als ${winTarget} € Guthaben erreicht.`;
  }
  updateLevelIndicator();
}

const showLevelComplete = () => {
  levelCompleted = true;
  freePlayMode = false;
  stopSpinLoops();
  shopOverlay.classList.remove("show");
  shopOverlay.setAttribute("aria-hidden", "true");
  levelCompleteOverlay.classList.add("show");
  levelCompleteOverlay.setAttribute("aria-hidden", "false");
  unlockLevel(2);
  playLevelCompleteSound();
};

const unlockLevel = (level) => {
  if (level !== 2) return;
  level2Unlocked = true;
  const button = levelButtons.find((entry) => entry.dataset.level === "2");
  if (!button) return;
  button.classList.remove("locked");
  button.classList.add("unlocked");
  const lockIcon = button.querySelector(".lock-icon");
  if (lockIcon) {
    lockIcon.classList.add("unlock-drop");
  }
};

const stopSpinLoops = () => {
  autoSpin = false;
  clearTimeout(spinInterval);
  autoButton.textContent = "Auto-Spin";
  reelIntervals.forEach((intervalId) => clearInterval(intervalId));
  reelIntervals.clear();
  reels.forEach((reel, index) => {
    reel.classList.remove("spinning");
    const column = Array.from({ length: getLevelLayout().rows }, () => getRandomSymbol());
    applyColumnSymbols(index, column);
  });
  clearPaylineOverlay();
  isSpinning = false;
};

const resetGameState = ({ keepPassives } = { keepPassives: false }) => {
  stopSpinLoops();
  shopOverlay.classList.remove("show");
  shopOverlay.setAttribute("aria-hidden", "true");
  confirmOverlay.classList.remove("show");
  confirmOverlay.setAttribute("aria-hidden", "true");
  currentCoinResults = [];
  coinResults.innerHTML = "";
  balance = -50;
  freeSpins = 0;
  freeSpinQueued = false;
  winBonusMultiplier = 0;
  winBonusTurns = 0;
  doubleWinNext = false;
  doubleWinQueue = 0;
  luckyPunchArmed = false;
  luckyPunchQueue = 0;
  lastSpinWin = false;
  hourglassCounter = 0;
  startTime = Date.now();
  inventory.fill(null);
  if (!keepPassives) {
    passiveInventory.fill(null);
    passives.clear();
  }
  coinPrice = 25;
  currentRollPrice = 25;
  coinPurchased = false;
  coinRolled = false;
  gameOver = false;
  gameOverSoundPlayed = false;
  levelCompleted = false;
  freePlayMode = false;
  setLostState(false);
  updateBalance();
  renderInventory();
  applyLevelSettings();
  rollCoinsButton.textContent = `Coin ziehen (${coinPrice} €)`;
  rerollCoinsButton.textContent = `Reroll (${coinPrice} €)`;
  updateCoinControls();
  showPayout("Bereit!");
  updateLevelIndicator();
};
const levelStates = {};

const saveCurrentLevelState = () => {
  levelStates[currentLevel] = {
    balance,
    freeSpins,
    freeSpinQueued,
    winBonusMultiplier,
    winBonusTurns,
    doubleWinNext,
    doubleWinQueue,
    luckyPunchArmed,
    luckyPunchQueue,
    lastSpinWin,
    hourglassCounter,
    startTime,
    coinPrice,
    currentRollPrice,
    coinPurchased,
    coinRolled,
    gameOver,
    gameOverSoundPlayed,
    levelCompleted,
    freePlayMode,
    inventory: inventory.map((coin) => (coin ? { ...coin } : null)),
    passiveInventory: passiveInventory.map((coin) => (coin ? { ...coin } : null)),
    passives: Array.from(passives),
    stakeValue: stakeSelect.value,
  };
};

const restoreLevelState = (level) => {
  const state = levelStates[level];
  if (!state) return false;
  stopSpinLoops();
  balance = state.balance;
  freeSpins = state.freeSpins;
  freeSpinQueued = state.freeSpinQueued;
  winBonusMultiplier = state.winBonusMultiplier;
  winBonusTurns = state.winBonusTurns;
  doubleWinNext = state.doubleWinNext;
  doubleWinQueue = state.doubleWinQueue;
  luckyPunchArmed = state.luckyPunchArmed;
  luckyPunchQueue = state.luckyPunchQueue;
  lastSpinWin = state.lastSpinWin;
  hourglassCounter = state.hourglassCounter;
  startTime = state.startTime;
  coinPrice = state.coinPrice;
  currentRollPrice = state.currentRollPrice;
  coinPurchased = state.coinPurchased;
  coinRolled = state.coinRolled;
  gameOver = state.gameOver;
  gameOverSoundPlayed = state.gameOverSoundPlayed;
  levelCompleted = state.levelCompleted;
  freePlayMode = state.freePlayMode;
  inventory.splice(0, inventory.length, ...state.inventory.map((coin) => (coin ? { ...coin } : null)));
  passiveInventory.splice(0, passiveInventory.length, ...state.passiveInventory.map((coin) => (coin ? { ...coin } : null)));
  passives.clear();
  state.passives.forEach((entry) => passives.add(entry));
  stakeSelect.value = state.stakeValue;
  setLostState(gameOver);
  renderInventory();
  applyLevelSettings();
  updateBalance();
  rollCoinsButton.textContent = `Coin ziehen (${coinPrice} €)`;
  rerollCoinsButton.textContent = `Reroll (${currentRollPrice} €)`;
  updateCoinControls();
  return true;
};

const setLostState = (show) => {
  lostOverlay.classList.toggle("show", show);
};

const showWin = (amount) => {
  if (amount <= 0) {
    winOverlay.classList.remove("show");
    return;
  }
  winAmount.textContent = `+${amount}`;
  winOverlay.classList.remove("show");
  void winOverlay.offsetWidth;
  winOverlay.classList.add("show");
};

const updateStakeOptions = () => {
  configureMachineLayout();
  spinCost = Number(stakeSelect.value);
  renderPayoutTable();
  updatePayoutTable();
};

const updateCoinControls = () => {
  rollCoinsButton.disabled = coinRolled && !coinPurchased;
  rerollCoinsButton.disabled = !coinRolled;
};

const updatePayoutTable = () => {
  const payoutMultipliers = Array.from(document.querySelectorAll("[data-multiplier]"));
  const payoutRefund = document.querySelector("[data-refund]");
  payoutMultipliers.forEach((entry) => {
    const multiplier = Number(entry.dataset.multiplier);
    const value = Math.round(multiplier * spinCost);
    entry.textContent = value;
  });

  if (payoutRefund) {
    payoutRefund.textContent = spinCost;
  }
};

const updateTimer = () => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  timerLabel.textContent = `${minutes}:${seconds}`;

  if (passives.has("hourglass")) {
    const hourglassTicks = Math.floor(elapsed / 600);
    if (hourglassTicks > hourglassCounter) {
      const gained = (hourglassTicks - hourglassCounter) * 10;
      balance += gained;
      hourglassCounter = hourglassTicks;
      updateBalance();
      showToast(`Hourglass +${gained} €`);
    }
  }
};

const coinCatalog = [
  {
    id: "bonuscoin",
    name: "Bonuscoin",
    type: "active",
    icon: "✨",
    description: "Nächste 5 Spins sind kostenlos.",
    onUse: () => {
      if (freeSpins === 0) {
        freeSpinQueued = true;
      }
      freeSpins += 5;
      showToast("Bonuscoin aktiviert: 5 Freispiele");
    },
  },
  {
    id: "lucky-cat",
    name: "Lucky Cat",
    type: "passive",
    icon: "🐱",
    description: "Jackpot (3x 7) zahlt den Betrag doppelt.",
  },
  {
    id: "lucky-dog",
    name: "Lucky Dog",
    type: "passive",
    icon: "🐶",
    description: "Bei jedem 3er-Gewinn +10% Bonus.",
  },
  {
    id: "hourglass",
    name: "Hourglass",
    type: "passive",
    icon: "⏳",
    description: "Alle 10 Minuten +10 €.",
  },
  {
    id: "fake-coin",
    name: "Fake Coin",
    type: "active",
    icon: "🃏",
    description: "Versuch es selbst.",
    onUse: () => {
      showToast("Fake Coin... nichts passiert.");
    },
  },
  {
    id: "red-pepper",
    name: "Red Pepper",
    type: "active",
    icon: "🌶️",
    description: "+20% Gewinn für 3 Runden.",
    onUse: () => {
      winBonusMultiplier += 0.2;
      winBonusTurns = Math.max(winBonusTurns, 3);
      showToast("Red Pepper aktiv (3 Runden).");
    },
  },
  {
    id: "golden-carrot",
    name: "Golden Carrot",
    type: "active",
    icon: "🥕",
    description: "Nächster Gewinn wird verdoppelt.",
    onUse: () => {
      doubleWinQueue += 1;
      doubleWinNext = true;
      showToast("Golden Carrot aktiviert!");
    },
  },
  {
    id: "lucky-punch",
    name: "Lucky Punch",
    type: "active",
    icon: "🥊",
    description: "Kein Gewinn? +25 €. Gewinn? Kein Bonus.",
    onUse: () => {
      luckyPunchQueue += 1;
      luckyPunchArmed = true;
      showToast("Lucky Punch bereit.");
    },
  },
  {
    id: "green-pepper",
    name: "Green Pepper",
    type: "active",
    icon: "🫑",
    description: "+10% Gewinn für 5 Runden.",
    onUse: () => {
      winBonusMultiplier += 0.1;
      winBonusTurns = Math.max(winBonusTurns, 5);
      showToast("Green Pepper aktiv (5 Runden).");
    },
  },
];

const inventory = new Array(4).fill(null);
const passives = new Set();
const passiveInventory = new Array(2).fill(null);

const renderInventory = () => {
  inventorySlots.forEach((slot, index) => {
    slot.innerHTML = "";
    const coin = inventory[index];
    if (!coin) return;
    const coinEl = document.createElement("div");
    coinEl.className = `coin ${coin.type}${coin.active ? " burning" : ""}`;
    coinEl.textContent = coin.icon;
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = coin.description;
    slot.appendChild(coinEl);
    slot.appendChild(tooltip);
  });

  passiveSlots.forEach((slot, index) => {
    slot.innerHTML = "";
    const coin = passiveInventory[index];
    if (!coin) return;
    const coinEl = document.createElement("div");
    coinEl.className = "coin passive";
    coinEl.textContent = coin.icon;
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = `${coin.description} (Permanent)`;
    slot.appendChild(coinEl);
    slot.appendChild(tooltip);
  });
};

const addToInventory = (coin) => {
  if (coin.type === "passive") {
    if (passives.has(coin.id)) {
      showToast(`${coin.name} ist bereits aktiv.`);
      return;
    }
    const emptyPassiveIndex = passiveInventory.findIndex((slot) => !slot);
    if (emptyPassiveIndex === -1) {
      showToast("Passive Slots voll. Erst verkaufen, um Platz zu schaffen.");
      return;
    }
    passives.add(coin.id);
    coin.onGain?.();
    passiveInventory[emptyPassiveIndex] = coin;
    showToast(`${coin.name} aktiviert.`);
    renderInventory();
    return;
  }
  const emptyIndex = inventory.findIndex((slot) => !slot);
  if (emptyIndex === -1) {
    showToast("Inventar voll.");
    return;
  }
  inventory[emptyIndex] = { ...coin, active: false, remainingSpins: 0 };
  renderInventory();
  showToast(`${coin.name} ins Inventar gelegt.`);
};

const renderCoinResults = (coins) => {
  currentCoinResults = coins;
  coinResults.innerHTML = "";
  coins.forEach((coin) => {
    const card = document.createElement("div");
    card.className = "coin-card";
    const coinEl = document.createElement("div");
    coinEl.className = `coin ${coin.type}`;
    coinEl.textContent = coin.icon;
    const name = document.createElement("h4");
    name.textContent = coin.name;
    const desc = document.createElement("p");
    desc.textContent = `${coin.description} (${coin.type === "passive" ? "Permanent" : "Einmalig"})`;
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = `${coin.description} (${coin.type === "passive" ? "Permanent" : "Einmalig"})`;
    card.appendChild(coinEl);
    card.appendChild(name);
    card.appendChild(desc);
    card.appendChild(tooltip);
    card.addEventListener("click", () => {
      pendingCoin = coin;
      openConfirm(`Möchtest du ${coin.name} kaufen?`, () => {
        if (pendingCoin.type === "passive") {
          const emptyPassiveIndex = passiveInventory.findIndex((slot) => !slot);
          if (emptyPassiveIndex === -1) {
            showToast("Passive Slots voll. Erst verkaufen, um Platz zu schaffen.");
            return;
          }
        } else if (inventory.every((slot) => slot)) {
          showToast("Inventar voll. Erst verkaufen oder nutzen.");
          return;
        }
        if (!ensureBalance()) return;
        balance -= currentRollPrice;
        updateBalance();
        addToInventory(pendingCoin);
        coinPrice *= 2;
        currentRollPrice = coinPrice;
        rollCoinsButton.textContent = `Coin ziehen (${coinPrice} €)`;
        rerollCoinsButton.textContent = `Reroll (${currentRollPrice} €)`;
        coinPurchased = true;
        coinRolled = false;
        updateCoinControls();
        currentCoinResults = [];
        coinResults.innerHTML = "";
      });
    });
    coinResults.appendChild(card);
  });
};

const ensureBalance = () => {
  if (gameOver) {
    showToast("Spiel ist vorbei.");
    return false;
  }
  return true;
};

const rollCoins = (isReroll = false) => {
  if (gameOver) return;
  if (!isReroll) {
    currentRollPrice = coinPrice;
  }
  if (!ensureBalance()) return;
  balance -= currentRollPrice;
  updateBalance();
  coinResults.innerHTML = "";
  coinSpinner.classList.add("show");
  setTimeout(() => {
    const picks = Array.from({ length: 3 }, () => coinCatalog[Math.floor(Math.random() * coinCatalog.length)]);
    renderCoinResults(picks);
    coinSpinner.classList.remove("show");
    coinPurchased = false;
    coinRolled = true;
    rerollCoinsButton.textContent = `Reroll (${currentRollPrice} €)`;
    rollCoinsButton.textContent = `Coin ziehen (${currentRollPrice} €)`;
    updateCoinControls();
  }, 900);
};

const getRandomSymbol = () => {
  const symbols = getCurrentSymbols();
  const choice = symbols[Math.floor(Math.random() * symbols.length)];
  return choice;
};

const applyColumnSymbols = (index, columnSymbols) => {
  const reel = reels[index];
  if (!reel) return;
  const symbolsInReel = reel.querySelectorAll(".symbol");
  if (!symbolsInReel.length) return;
  symbolsInReel.forEach((el, rowIndex) => {
    const symbol = columnSymbols[rowIndex] ?? getRandomSymbol();
    el.textContent = symbol.icon;
  });
};

const startReelSpin = (index) => {
  const reel = reels[index];
  if (!reel) return;
  if (reelIntervals.has(index)) {
    clearInterval(reelIntervals.get(index));
  }
  reel.classList.add("spinning");
  const intervalId = setInterval(() => {
    const column = Array.from({ length: getLevelLayout().rows }, () => getRandomSymbol());
    applyColumnSymbols(index, column);
  }, 80);
  reelIntervals.set(index, intervalId);
};

const stopReelSpin = (index, finalColumn) => {
  const reel = reels[index];
  if (!reel) return;
  const intervalId = reelIntervals.get(index);
  if (intervalId) {
    clearInterval(intervalId);
    reelIntervals.delete(index);
  }
  reel.classList.remove("spinning");
  applyColumnSymbols(index, finalColumn);
};

const getSymbolMultiplier = (symbol, count) => {
  if (count <= 0) return 0;
  if (count === 2) return symbol.twoMult ?? 0;
  if (count === 3) return symbol.threeMult ?? 0;
  if (count === 4) return symbol.fourMult ?? symbol.threeMult ?? 0;
  return symbol.fiveMult ?? symbol.fourMult ?? symbol.threeMult ?? 0;
};

const evaluatePaylines = (grid) => {
  const layout = getLevelLayout();
  const symbols = getCurrentSymbols();
  const wins = [];
  const minCount = currentLevel === 2 ? 3 : 2;

  layout.paylines.forEach((lineRows, lineIndex) => {
    const firstIcon = grid?.[0]?.[lineRows[0]];
    if (!firstIcon) return;
    let count = 1;
    for (let reelIndex = 1; reelIndex < layout.reels; reelIndex += 1) {
      const icon = grid?.[reelIndex]?.[lineRows[reelIndex]];
      if (icon !== firstIcon) break;
      count += 1;
    }
    if (count < minCount) return;
    const symbol = symbols.find((entry) => entry.icon === firstIcon);
    if (!symbol) return;
    const multiplier = getSymbolMultiplier(symbol, count);
    const amount = Math.round(multiplier * spinCost);
    if (amount <= 0) return;
    wins.push({
      lineIndex,
      lineRows,
      icon: firstIcon,
      count,
      amount,
      points: lineRows.map((row, reelIndex) => ({ row, reelIndex })).slice(0, count),
    });
  });

  return wins;
};

const clearPaylineOverlay = () => {
  paylineOverlay.innerHTML = "";
};

const drawPayline = (points) => {
  const screenRect = paylineOverlay.getBoundingClientRect();
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  const coords = points
    .map(({ reelIndex, row }) => {
      const target = reels[reelIndex]?.querySelectorAll(".symbol")?.[row];
      if (!target) return null;
      const rect = target.getBoundingClientRect();
      const x = rect.left - screenRect.left + rect.width / 2;
      const y = rect.top - screenRect.top + rect.height / 2;
      return `${x},${y}`;
    })
    .filter(Boolean)
    .join(" ");
  polyline.setAttribute("points", coords);
  polyline.setAttribute("class", "payline");
  paylineOverlay.appendChild(polyline);
};

const playPaylineAnimation = async (wins) => {
  clearPaylineOverlay();
  if (!wins.length) return;
  paylineAnimationRunning = true;
  skipPaylineAnimation = false;
  for (const win of wins) {
    if (skipPaylineAnimation) break;
    clearPaylineOverlay();
    drawPayline(win.points);
    showPayout(`Linie ${win.lineIndex + 1}: ${win.icon} x${win.count} +${win.amount}`, true);
    await new Promise((resolve) => setTimeout(resolve, 850));
  }
  clearPaylineOverlay();
  paylineAnimationRunning = false;
};

const spinReels = async () => {
  if (isSpinning) return;
  if (gameOver) return;

  setLostState(false);
  isSpinning = true;
  if (freeSpins > 0 || freeSpinQueued) {
    if (freeSpinQueued) {
      freeSpinQueued = false;
    }
    freeSpins = Math.max(0, freeSpins - 1);
  } else {
    balance -= spinCost;
  }
  updateBalance();
  showPayout("Walzen drehen...");
  playSpinSound();

  const layout = getLevelLayout();
  const results = Array.from({ length: layout.reels }, () =>
    Array.from({ length: layout.rows }, () => getRandomSymbol())
  );
  const stopDelays = Array.from({ length: layout.reels }, (_, index) => 500 + index * 260);
  playRattleSound(stopDelays[stopDelays.length - 1]);

  reels.forEach((_, index) => startReelSpin(index));

  await Promise.all(
    stopDelays.map(
      (delay, index) =>
        new Promise((resolve) => {
          setTimeout(() => {
            stopReelSpin(index, results[index]);
            resolve();
          }, delay);
        })
    )
  );

  currentGrid = results.map((column) => column.map((symbol) => symbol.icon));
  const wins = evaluatePaylines(currentGrid);
  let payoutValue = wins.reduce((sum, win) => sum + win.amount, 0);
  let message = wins.length ? `${wins.length} Gewinnlinie(n)! +${payoutValue}` : "Leider kein Gewinn.";
  let bonusTriggered = false;
  const bonusEvents = [];

  if (wins.length) {
    balance += payoutValue;
  }

  if (wins.some((win) => win.count >= 3) && passives.has("lucky-dog")) {
    const bonus = Math.round(payoutValue * 0.1);
    payoutValue += bonus;
    balance += bonus;
    bonusTriggered = true;
    bonusEvents.push({ amount: bonus, label: "Lucky Dog", icon: "🐶" });
  }

  if (wins.some((win) => (win.icon === "🤴" || win.icon === "7️⃣") && win.count >= 3) && passives.has("lucky-cat")) {
    balance += payoutValue;
    payoutValue *= 2;
    bonusTriggered = true;
    bonusEvents.push({ amount: payoutValue / 2, label: "Lucky Cat", icon: "🐱" });
  }

  if (doubleWinQueue > 0 && payoutValue > 0) {
    balance += payoutValue;
    payoutValue *= 2;
    bonusTriggered = true;
    bonusEvents.push({ amount: payoutValue / 2, label: "Golden Carrot", icon: "🥕" });
    doubleWinQueue -= 1;
    consumeActiveCoin("golden-carrot");
  }
  doubleWinNext = doubleWinQueue > 0;

  if (winBonusTurns > 0) {
    if (payoutValue > 0) {
      const bonus = Math.round(payoutValue * winBonusMultiplier);
      balance += bonus;
      payoutValue += bonus;
      bonusTriggered = true;
      bonusEvents.push({ amount: bonus, label: "Bonus", icon: "✨" });
    }
    winBonusTurns -= 1;
    if (winBonusTurns === 0) {
      winBonusMultiplier = 0;
    }
  }

  lastSpinWin = payoutValue > 0;
  if (!lastSpinWin && luckyPunchQueue > 0) {
    balance += luckyPunchReward;
    bonusTriggered = true;
    bonusEvents.push({ amount: luckyPunchReward, label: "Lucky Punch", icon: "🥊" });
    luckyPunchQueue -= 1;
    consumeActiveCoin("lucky-punch");
  } else if (lastSpinWin && luckyPunchQueue > 0) {
    luckyPunchQueue -= 1;
    consumeActiveCoin("lucky-punch");
  }
  luckyPunchArmed = luckyPunchQueue > 0;

  updateBalance();
  showPayout(message, payoutValue > 0);
  winOverlay.classList.toggle("boost", bonusTriggered);
  showWin(payoutValue);
  if (payoutValue > 0) {
    playWinSound();
  }

  if (wins.length) {
    await playPaylineAnimation(wins);
  }

  bonusEvents.forEach((event, index) => {
    setTimeout(() => showCoinBonus(event.amount, event.label, event.icon), index * 150);
  });

  inventory.forEach((coin, index) => {
    if (!coin || !coin.active) return;
    if (Number.isFinite(coin.remainingSpins) && coin.remainingSpins > 0) {
      coin.remainingSpins -= 1;
    }
    if (coin.remainingSpins <= 0) {
      inventory[index] = null;
    }
  });
  renderInventory();

  isSpinning = false;

  if (autoSpin) {
    spinInterval = setTimeout(spinReels, 700);
  }

  if (balance <= getLevelSettings().gameOverLimit) {
    setLostState(true);
    showPayout("Guthabenlimit erreicht!");
    autoSpin = false;
  }
};

const skipLineAnimation = () => {
  if (!paylineAnimationRunning) return;
  skipPaylineAnimation = true;
};

screen.addEventListener("click", skipLineAnimation);
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    skipLineAnimation();
  }
});

leverButton.addEventListener("click", () => {
  autoSpin = false;
  clearTimeout(spinInterval);
  leverButton.classList.add("pulled");
  playLeverSound();
  setTimeout(() => leverButton.classList.remove("pulled"), 250);
  spinReels();
});

autoButton.addEventListener("click", () => {
  playClickSound();
  autoSpin = !autoSpin;
  if (autoSpin) {
    spinReels();
    autoButton.textContent = "Auto-Spin läuft";
  } else {
    autoButton.textContent = "Auto-Spin";
    clearTimeout(spinInterval);
  }
});

stakeSelect.addEventListener("change", () => {
  playClickSound();
  updateStakeOptions();
});

stopButton.addEventListener("click", () => {
  playClickSound();
  stopSpinLoops();
});

shopButton.addEventListener("click", () => {
  playShopOpenSound();
  shopOverlay.classList.add("show");
  shopOverlay.setAttribute("aria-hidden", "false");
});

shopClose.addEventListener("click", () => {
  playShopCloseSound();
  shopOverlay.classList.remove("show");
  shopOverlay.setAttribute("aria-hidden", "true");
});

restartButton.addEventListener("click", () => {
  playClickSound();
  resetGameState({ keepPassives: false });
});

rollCoinsButton.addEventListener("click", () => {
  playClickSound();
  rollCoins();
});
rerollCoinsButton.addEventListener("click", () => {
  playClickSound();
  if (!coinRolled) {
    showToast("Reroll erst nach einem Coin-Zug möglich.");
    return;
  }
  rollCoins(true);
});

inventorySlots.forEach((slot, index) => {
  slot.addEventListener("click", () => {
    playClickSound();
    const coin = inventory[index];
    if (!coin) return;
    const existing = slot.querySelector(".coin-actions");
    if (existing) {
      existing.remove();
      return;
    }

    const actions = document.createElement("div");
    actions.className = "coin-actions show";
    const activate = document.createElement("button");
    activate.className = "btn primary";
    activate.textContent = "Aktivieren";
    const sell = document.createElement("button");
    sell.className = "btn ghost";
    sell.textContent = "Verkaufen (10 €)";

    if (coin.active) {
      sell.disabled = true;
    }

    activate.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!coin.active) {
        coin.active = true;
        coin.onUse?.();
        if (coin.id === "bonuscoin") coin.remainingSpins = 5;
        if (coin.id === "red-pepper") coin.remainingSpins = 3;
        if (coin.id === "green-pepper") coin.remainingSpins = 5;
        if (coin.id === "golden-carrot") coin.remainingSpins = Number.POSITIVE_INFINITY;
        if (coin.id === "lucky-punch") coin.remainingSpins = Number.POSITIVE_INFINITY;
        if (coin.id === "fake-coin") {
          coin.remainingSpins = 1;
        }
        playCoinActivateSound();
        renderInventory();
      }
      actions.remove();
    });

    sell.addEventListener("click", (event) => {
      event.stopPropagation();
      if (coin.active) return;
      openConfirm("Coin für 10 € verkaufen?", () => {
        balance += 10;
        inventory[index] = null;
        updateBalance();
        renderInventory();
      });
      actions.remove();
    });

    actions.appendChild(activate);
    actions.appendChild(sell);
    slot.appendChild(actions);
  });
});

passiveSlots.forEach((slot, index) => {
  slot.addEventListener("click", () => {
    playClickSound();
    const coin = passiveInventory[index];
    if (!coin) return;
    const existing = slot.querySelector(".coin-actions");
    if (existing) {
      existing.remove();
      return;
    }
    const actions = document.createElement("div");
    actions.className = "coin-actions show";
    const sell = document.createElement("button");
    sell.className = "btn ghost";
    sell.textContent = "Verkaufen (10 €)";
    sell.addEventListener("click", (event) => {
      event.stopPropagation();
      openConfirm("Passiven Coin für 10 € verkaufen?", () => {
        balance += 10;
        passives.delete(coin.id);
        passiveInventory[index] = null;
        updateBalance();
        renderInventory();
      });
      actions.remove();
    });
    actions.appendChild(sell);
    slot.appendChild(actions);
  });
});

confirmCancel.addEventListener("click", () => {
  playClickSound();
  confirmOverlay.classList.remove("show");
  confirmOverlay.setAttribute("aria-hidden", "true");
  pendingCoin = null;
  pendingAction = null;
});

confirmBuy.addEventListener("click", () => {
  playClickSound();
  pendingAction?.();
  pendingCoin = null;
  pendingAction = null;
  coinResults.innerHTML = "";
  confirmOverlay.classList.remove("show");
  confirmOverlay.setAttribute("aria-hidden", "true");
});

setInterval(updateTimer, 1000);
updateBalance();
renderInventory();
rollCoinsButton.textContent = `Coin ziehen (${coinPrice} €)`;
rerollCoinsButton.textContent = `Reroll (${coinPrice} €)`;
updateCoinControls();
applyLevelSettings();
unlockLevel(2);
gameShell.classList.add("hidden");
levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    playClickSound();
    const level = Number(button.dataset.level);
    if (level === 3) {
      showCenterMessage("Level 3 ist noch gesperrt.");
      return;
    }

    currentLevel = level;
    const restored = restoreLevelState(level);
    if (!restored) {
      resetGameState({ keepPassives: level === 2 });
    }
    startScreen.classList.add("hidden");
    gameShell.classList.remove("hidden");
  });
});

homeButton.addEventListener("click", () => {
  playClickSound();
  stopSpinLoops();
  clearPaylineOverlay();
  saveCurrentLevelState();
  startScreen.classList.remove("hidden");
  gameShell.classList.add("hidden");
  shopOverlay.classList.remove("show");
  shopOverlay.setAttribute("aria-hidden", "true");
});

backToStartButton.addEventListener("click", () => {
  playClickSound();
  stopSpinLoops();
  clearPaylineOverlay();
  levelCompleteOverlay.classList.remove("show");
  levelCompleteOverlay.setAttribute("aria-hidden", "true");
  startScreen.classList.remove("hidden");
  gameShell.classList.add("hidden");
});

freePlayButton.addEventListener("click", () => {
  playClickSound();
  freePlayMode = true;
  levelCompleteOverlay.classList.remove("show");
  levelCompleteOverlay.setAttribute("aria-hidden", "true");
});
``