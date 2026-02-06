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
    { icon: "📕", isScatter: true },
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
let freeSpinActive = false;
let freeSpinTotalWin = 0;
let scatterPending = false;
let refundOnLossTurns = 0;
let stakeModifierTurns = 0;
let stakeModifier = 0;
let winModifierTurns = 0;
let winModifier = 0;
let diagonalBonus = 0;
let doubleTwoCountsTurns = 0;
let slowSpinTurns = 0;
let splitRealityActive = false;
let lossBoostActive = false;
let lossBoostStacks = 0;
let neonFlowActive = false;
let neonFlowBonus = 0;
let warpedLuckActive = false;
let neonArchiveActive = false;
let neonArchiveReady = false;
let reactionChipActive = false;
let stopTriggered = false;
let spinCounter = 0;
let lossStreak = 0;
let heatChipReady = false;
let goldDustActive = false;
let freeSpinWinModifier = 0;
let freeSpinNoWin = false;
let freeSpinGuaranteeTurns = 0;
let freeSpinHeatBonus = 0;
let postFreeSpinBoostTurns = 0;
let postFreeSpinBoost = 0.6;
let freeSpinNormalTurns = 0;
let pendingStoredWin = false;
let storedWinAmount = 0;
let storedWinDelay = 0;
let lastWinAmount = 0;
let safetyNetActive = false;
let safetyNetUsed = false;
let secondChanceArmed = false;
let heatChipActive = false;
let abyssCoreActive = false;
let desertPactActive = false;
let goldenHeatActive = false;
let heartMachineActive = false;
let emptyCoinActive = false;
const symbolWeightBoosts = new Map();
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
  2: { minStake: 25, gameOverLimit: -2000, winTarget: 750 },
};

const getLevelSettings = () => levelSettings[currentLevel] ?? levelSettings[1];

const getSymbolsForLevel = (level) => levelSymbolSets[level] ?? levelSymbolSets[1];
const getCurrentSymbols = () => getSymbolsForLevel(currentLevel);
const getLevelLayout = () => levelLayouts[currentLevel] ?? levelLayouts[1];

const addSymbolBoost = (icon, value) => {
  const current = symbolWeightBoosts.get(icon) ?? 0;
  symbolWeightBoosts.set(icon, current + value);
};

const renderPayoutTable = () => {
  if (!payoutList) return;
  payoutList.innerHTML = "";
  const symbols = getCurrentSymbols().filter((symbol) => !symbol.isScatter);
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

const playMetalClickSound = () => {
  ensureAudio();
  playTone(720, 0.03, "square", 0.08);
  setTimeout(() => playTone(540, 0.04, "square", 0.06), 40);
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

const playFreeSpinSound = () => {
  ensureAudio();
  playTone(190, 0.22, "triangle", 0.12);
  setTimeout(() => playTone(260, 0.25, "sine", 0.14), 180);
  setTimeout(() => playTone(360, 0.3, "sine", 0.12), 420);
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
  if (safetyNetActive && !safetyNetUsed && balance < -50) {
    balance = -50;
    safetyNetUsed = true;
    balanceLabel.textContent = `-50 €`;
    showToast("Sicherheitsmarke schützt dein Guthaben.");
  }
  if (!gameOver && balance <= gameOverLimit) {
    if (secondChanceArmed) {
      secondChanceArmed = false;
      consumeActiveCoin("zweite-chance");
      gameOver = false;
      balance = Math.max(balance, gameOverLimit + 1);
      freeSpinQueued = true;
      freeSpins += 1;
      showToast("Zweite Chance: Gratis-Spin!");
      return;
    }
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

const triggerFreeSpins = (count, isRetrigger = false) => {
  if (currentLevel !== 2) return;
  const added = isRetrigger ? Math.min(count, 3) : count;
  freeSpins = Math.min(25, freeSpins + added);
  if (!isRetrigger) {
    freeSpinActive = true;
    freeSpinTotalWin = 0;
    document.body.classList.add("free-spin-active");
    showPayout("FREISPIELE", true);
    showFreeSpinCelebration();
    playFreeSpinSound();
    if (goldenHeatActive) {
      freeSpinHeatBonus = 1;
    }
    if (emptyCoinActive) {
      freeSpinNoWin = true;
    }
  } else {
    showPayout(`+${added} Freispiele`, true);
  }
  updateFreeSpinIndicator();
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

const showFreeSpinCelebration = () => {
  if (!centerMessage) return;
  centerMessage.textContent = "FREISPIELE GEWONNEN!";
  centerMessage.classList.add("show", "free-spin-celebration");
  setTimeout(() => centerMessage.classList.remove("show", "free-spin-celebration"), 2200);
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
      const symbol = getRandomSymbol();
      symbolEl.textContent = symbol.icon;
      if (currentLevel === 2) {
        symbolEl.dataset.symbol = symbol.icon;
      } else {
        delete symbolEl.dataset.symbol;
      }
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
  if (currentLevel !== 2) {
    freeSpins = 0;
    freeSpinQueued = false;
    freeSpinActive = false;
    freeSpinTotalWin = 0;
    scatterPending = false;
    freeSpinWinModifier = 0;
    freeSpinNoWin = false;
    freeSpinGuaranteeTurns = 0;
    freeSpinHeatBonus = 0;
    freeSpinNormalTurns = 0;
    document.body.classList.remove("free-spin-active");
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
  freeSpinActive = false;
  freeSpinTotalWin = 0;
  scatterPending = false;
  winBonusMultiplier = 0;
  winBonusTurns = 0;
  doubleWinNext = false;
  doubleWinQueue = 0;
  luckyPunchArmed = false;
  luckyPunchQueue = 0;
  lastSpinWin = false;
  hourglassCounter = 0;
  refundOnLossTurns = 0;
  stakeModifierTurns = 0;
  stakeModifier = 0;
  winModifierTurns = 0;
  winModifier = 0;
  diagonalBonus = 0;
  doubleTwoCountsTurns = 0;
  slowSpinTurns = 0;
  splitRealityActive = false;
  lossBoostActive = false;
  lossBoostStacks = 0;
  neonFlowActive = false;
  neonFlowBonus = 0;
  warpedLuckActive = false;
  neonArchiveActive = false;
  neonArchiveReady = false;
  reactionChipActive = false;
  stopTriggered = false;
  spinCounter = 0;
  lossStreak = 0;
  heatChipReady = false;
  goldDustActive = false;
  freeSpinWinModifier = 0;
  freeSpinNoWin = false;
  freeSpinGuaranteeTurns = 0;
  freeSpinHeatBonus = 0;
  postFreeSpinBoostTurns = 0;
  freeSpinNormalTurns = 0;
  pendingStoredWin = false;
  storedWinAmount = 0;
  storedWinDelay = 0;
  lastWinAmount = 0;
  safetyNetActive = false;
  safetyNetUsed = false;
  secondChanceArmed = false;
  heatChipActive = false;
  abyssCoreActive = false;
  desertPactActive = false;
  goldenHeatActive = false;
  heartMachineActive = false;
  emptyCoinActive = false;
  symbolWeightBoosts.clear();
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
    freeSpinActive,
    freeSpinTotalWin,
    scatterPending,
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
    refundOnLossTurns,
    stakeModifierTurns,
    stakeModifier,
    winModifierTurns,
    winModifier,
    diagonalBonus,
    doubleTwoCountsTurns,
    slowSpinTurns,
    splitRealityActive,
    lossBoostActive,
    lossBoostStacks,
    neonFlowActive,
    neonFlowBonus,
    warpedLuckActive,
    neonArchiveActive,
    neonArchiveReady,
    reactionChipActive,
    spinCounter,
    lossStreak,
    heatChipReady,
    goldDustActive,
    freeSpinWinModifier,
    freeSpinNoWin,
    freeSpinGuaranteeTurns,
    freeSpinHeatBonus,
    postFreeSpinBoostTurns,
    postFreeSpinBoost,
    freeSpinNormalTurns,
    pendingStoredWin,
    storedWinAmount,
    storedWinDelay,
    lastWinAmount,
    safetyNetActive,
    safetyNetUsed,
    secondChanceArmed,
    heatChipActive,
    abyssCoreActive,
    desertPactActive,
    goldenHeatActive,
    heartMachineActive,
    emptyCoinActive,
    symbolWeightBoosts: Array.from(symbolWeightBoosts.entries()),
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
  freeSpinActive = state.freeSpinActive ?? false;
  freeSpinTotalWin = state.freeSpinTotalWin ?? 0;
  scatterPending = state.scatterPending ?? false;
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
  refundOnLossTurns = state.refundOnLossTurns ?? 0;
  stakeModifierTurns = state.stakeModifierTurns ?? 0;
  stakeModifier = state.stakeModifier ?? 0;
  winModifierTurns = state.winModifierTurns ?? 0;
  winModifier = state.winModifier ?? 0;
  diagonalBonus = state.diagonalBonus ?? 0;
  doubleTwoCountsTurns = state.doubleTwoCountsTurns ?? 0;
  slowSpinTurns = state.slowSpinTurns ?? 0;
  splitRealityActive = state.splitRealityActive ?? false;
  lossBoostActive = state.lossBoostActive ?? false;
  lossBoostStacks = state.lossBoostStacks ?? 0;
  neonFlowActive = state.neonFlowActive ?? false;
  neonFlowBonus = state.neonFlowBonus ?? 0;
  warpedLuckActive = state.warpedLuckActive ?? false;
  neonArchiveActive = state.neonArchiveActive ?? false;
  neonArchiveReady = state.neonArchiveReady ?? false;
  reactionChipActive = state.reactionChipActive ?? false;
  spinCounter = state.spinCounter ?? 0;
  lossStreak = state.lossStreak ?? 0;
  heatChipReady = state.heatChipReady ?? false;
  goldDustActive = state.goldDustActive ?? false;
  freeSpinWinModifier = state.freeSpinWinModifier ?? 0;
  freeSpinNoWin = state.freeSpinNoWin ?? false;
  freeSpinGuaranteeTurns = state.freeSpinGuaranteeTurns ?? 0;
  freeSpinHeatBonus = state.freeSpinHeatBonus ?? 0;
  postFreeSpinBoostTurns = state.postFreeSpinBoostTurns ?? 0;
  postFreeSpinBoost = state.postFreeSpinBoost ?? postFreeSpinBoost;
  freeSpinNormalTurns = state.freeSpinNormalTurns ?? 0;
  pendingStoredWin = state.pendingStoredWin ?? false;
  storedWinAmount = state.storedWinAmount ?? 0;
  storedWinDelay = state.storedWinDelay ?? 0;
  lastWinAmount = state.lastWinAmount ?? 0;
  safetyNetActive = state.safetyNetActive ?? false;
  safetyNetUsed = state.safetyNetUsed ?? false;
  secondChanceArmed = state.secondChanceArmed ?? false;
  heatChipActive = state.heatChipActive ?? false;
  abyssCoreActive = state.abyssCoreActive ?? false;
  desertPactActive = state.desertPactActive ?? false;
  goldenHeatActive = state.goldenHeatActive ?? false;
  heartMachineActive = state.heartMachineActive ?? false;
  emptyCoinActive = state.emptyCoinActive ?? false;
  symbolWeightBoosts.clear();
  if (state.symbolWeightBoosts) {
    state.symbolWeightBoosts.forEach(([icon, value]) => symbolWeightBoosts.set(icon, value));
  }
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

const updateFreeSpinIndicator = () => {
  const indicator = document.getElementById("free-spin-indicator");
  if (!indicator) return;
  if (freeSpinActive && currentLevel === 2) {
    indicator.textContent = `${freeSpins} Freispiele verbleiben`;
    indicator.classList.add("show");
  } else {
    indicator.classList.remove("show");
  }
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

const rarityWeights = {
  common: 55,
  uncommon: 30,
  rare: 15,
  epic: 8,
  legendary: 4,
  mythic: 1,
};

const coinCatalog = [
  {
    id: "kupferglueck",
    name: "Kupferglück",
    type: "active",
    rarity: "common",
    icon: "🟤",
    levels: [1, 2],
    description: "+5 % Gewinn auf den nächsten Spin.",
    duration: 1,
    onUse: () => {
      winBonusMultiplier += 0.05;
      winBonusTurns = Math.max(winBonusTurns, 1);
      showToast("Kupferglück aktiv.");
    },
  },
  {
    id: "blinkender-jeton",
    name: "Blinkender Jeton",
    type: "active",
    rarity: "common",
    icon: "🔆",
    levels: [1],
    description: "Verlust im nächsten Spin → Einsatz zurück.",
    duration: 1,
    onUse: () => {
      refundOnLossTurns = Math.max(refundOnLossTurns, 1);
      showToast("Blinkender Jeton bereit.");
    },
  },
  {
    id: "staubiger-pfennig",
    name: "Staubiger Pfennig",
    type: "active",
    rarity: "common",
    icon: "🟫",
    levels: [2],
    description: "3 Spins: Einsatz −10 %, Gewinn −10 %.",
    duration: 3,
    onUse: () => {
      stakeModifier = -0.1;
      stakeModifierTurns = Math.max(stakeModifierTurns, 3);
      winModifier = -0.1;
      winModifierTurns = Math.max(winModifierTurns, 3);
      showToast("Staubiger Pfennig aktiv.");
    },
  },
  {
    id: "neon-splitter",
    name: "Neon-Splitter",
    type: "passive",
    rarity: "common",
    icon: "✨",
    levels: [1],
    description: "+1 % Gewinnchance auf ⭐ und 🍒.",
    onGain: () => {
      addSymbolBoost("⭐", 0.08);
      addSymbolBoost("🍒", 0.08);
    },
  },
  {
    id: "abnutzungscoin",
    name: "Abnutzungscoin",
    type: "active",
    rarity: "common",
    icon: "🧱",
    levels: [1, 2],
    description: "Freispiele geben −20 % Gewinn.",
    duration: 1,
    onUse: () => {
      freeSpinWinModifier -= 0.2;
      showToast("Abnutzungscoin aktiv.");
    },
  },
  {
    id: "hitzechip",
    name: "Hitzechip",
    type: "passive",
    rarity: "common",
    icon: "🔥",
    levels: [2],
    description: "Nach 10 Verlusten +5 % Gewinn.",
    onGain: () => {
      heatChipActive = true;
    },
  },
  {
    id: "restwert",
    name: "Restwert",
    type: "active",
    rarity: "common",
    icon: "🪙",
    levels: [1, 2],
    description: "Wenn Guthaben < 0 → +15 €.",
    duration: 1,
    onUse: () => {
      if (balance < 0) {
        balance += 15;
        updateBalance();
        showToast("Restwert +15 €");
      } else {
        showToast("Restwert: Guthaben ist nicht negativ.");
      }
    },
  },
  {
    id: "sicherheitsmarke",
    name: "Sicherheitsmarke",
    type: "passive",
    rarity: "common",
    icon: "🛡️",
    levels: [1, 2],
    description: "Guthaben kann einmal nicht unter −50 fallen.",
    onGain: () => {
      safetyNetActive = true;
    },
  },
  {
    id: "doppelrand",
    name: "Doppelrand",
    type: "active",
    rarity: "uncommon",
    icon: "🪙",
    levels: [1],
    description: "Zwei gleiche Symbole zahlen wie drei.",
    duration: 1,
    onUse: () => {
      doubleTwoCountsTurns = Math.max(doubleTwoCountsTurns, 1);
      showToast("Doppelrand aktiv.");
    },
  },
  {
    id: "sandlauf",
    name: "Sandlauf",
    type: "active",
    rarity: "uncommon",
    icon: "🏜️",
    levels: [2],
    description: "5 Spins langsamer → +10 % Gewinn.",
    duration: 5,
    onUse: () => {
      slowSpinTurns = Math.max(slowSpinTurns, 5);
      winModifier = 0.1;
      winModifierTurns = Math.max(winModifierTurns, 5);
      showToast("Sandlauf aktiv.");
    },
  },
  {
    id: "schraegchance",
    name: "Schrägchance",
    type: "passive",
    rarity: "uncommon",
    icon: "📐",
    levels: [2],
    description: "Diagonale Linien +3 % Gewinn.",
    onGain: () => {
      diagonalBonus = 0.03;
    },
  },
  {
    id: "spannungsaufbau",
    name: "Spannungsaufbau",
    type: "active",
    rarity: "uncommon",
    icon: "📈",
    levels: [1, 2],
    description: "Jeder Verlust +4 % Gewinn (max 20 %).",
    duration: 5,
    onUse: () => {
      lossBoostActive = true;
      lossBoostStacks = 0;
      showToast("Spannungsaufbau aktiv.");
    },
  },
  {
    id: "neonfokus",
    name: "Neonfokus",
    type: "passive",
    rarity: "uncommon",
    icon: "⭐",
    levels: [1],
    description: "⭐ erscheint minimal häufiger.",
    onGain: () => {
      addSymbolBoost("⭐", 0.12);
    },
  },
  {
    id: "risikosteuer",
    name: "Risikosteuer",
    type: "active",
    rarity: "uncommon",
    icon: "⚖️",
    levels: [1, 2],
    description: "3 Spins: Einsatz +25 %, Gewinn +40 %.",
    duration: 3,
    onUse: () => {
      stakeModifier = 0.25;
      stakeModifierTurns = Math.max(stakeModifierTurns, 3);
      winModifier = 0.4;
      winModifierTurns = Math.max(winModifierTurns, 3);
      showToast("Risikosteuer aktiv.");
    },
  },
  {
    id: "zweite-chance",
    name: "Zweite Chance",
    type: "active",
    rarity: "uncommon",
    icon: "🪽",
    levels: [1, 2],
    description: "Nach Totalverlust → ein Gratis-Spin.",
    duration: Number.POSITIVE_INFINITY,
    onUse: () => {
      secondChanceArmed = true;
      showToast("Zweite Chance bereit.");
    },
  },
  {
    id: "goldstaubkern",
    name: "Goldstaubkern",
    type: "passive",
    rarity: "rare",
    icon: "💛",
    levels: [2],
    description: "Jeder 20. Spin garantiert 1× Einsatz.",
    onGain: () => {
      goldDustActive = true;
    },
  },
  {
    id: "neon-ueberladung",
    name: "Neon-Überladung",
    type: "active",
    rarity: "rare",
    icon: "⚡",
    levels: [1],
    description: "3 Spins: Freispiele zählen als normale Spins.",
    duration: 3,
    onUse: () => {
      freeSpinNormalTurns = Math.max(freeSpinNormalTurns, 3);
      showToast("Neon-Überladung aktiv.");
    },
  },
  {
    id: "verzerrtes-glueck",
    name: "Verzerrtes Glück",
    type: "passive",
    rarity: "rare",
    icon: "🌀",
    levels: [1, 2],
    description: "Hohe Gewinne seltener, mittlere häufiger.",
    onGain: () => {
      warpedLuckActive = true;
    },
  },
  {
    id: "staubopfer",
    name: "Staubopfer",
    type: "active",
    rarity: "rare",
    icon: "🩸",
    levels: [2],
    description: "−50 € sofort → Freispiele +100 % Gewinn.",
    duration: 1,
    onUse: () => {
      balance -= 50;
      updateBalance();
      freeSpinWinModifier += 1;
      showToast("Staubopfer aktiv.");
    },
  },
  {
    id: "reaktionschip",
    name: "Reaktionschip",
    type: "passive",
    rarity: "rare",
    icon: "🕹️",
    levels: [1, 2],
    description: "Stoppen der Walzen erhöht Gewinn um +8 %.",
    onGain: () => {
      reactionChipActive = true;
    },
  },
  {
    id: "ruhender-joker",
    name: "Ruhender Joker",
    type: "active",
    rarity: "rare",
    icon: "🎭",
    levels: [1, 2],
    description: "Nächster Gewinn wird gespeichert und später ausgezahlt.",
    duration: Number.POSITIVE_INFINITY,
    onUse: () => {
      pendingStoredWin = true;
      showToast("Ruhender Joker bereit.");
    },
  },
  {
    id: "wuestenpakt",
    name: "Wüstenpakt",
    type: "passive",
    rarity: "epic",
    icon: "🏺",
    levels: [2],
    description: "Freispiele seltener, zahlen +60 %.",
    onGain: () => {
      desertPactActive = true;
      freeSpinWinModifier = Math.max(freeSpinWinModifier, 0.6);
    },
  },
  {
    id: "neonfluss",
    name: "Neonfluss",
    type: "passive",
    rarity: "epic",
    icon: "🌊",
    levels: [1],
    description: "Jeder Gewinn erhöht den nächsten um +5 %.",
    onGain: () => {
      neonFlowActive = true;
    },
  },
  {
    id: "splitrealitaet",
    name: "Splitrealität",
    type: "active",
    rarity: "epic",
    icon: "🪞",
    levels: [1, 2],
    description: "Zwei Gewinnlinien werden zusätzlich ausgewertet.",
    duration: 1,
    onUse: () => {
      splitRealityActive = true;
      showToast("Splitrealität aktiv.");
    },
  },
  {
    id: "abgrundskern",
    name: "Abgrundskern",
    type: "passive",
    rarity: "epic",
    icon: "🕳️",
    levels: [1, 2],
    description: "Je negativer das Guthaben, desto höher die Gewinnchance.",
    onGain: () => {
      abyssCoreActive = true;
    },
  },
  {
    id: "staubkrone",
    name: "Staubkrone",
    type: "active",
    rarity: "epic",
    icon: "👑",
    levels: [2],
    description: "5 Freispiele mit garantierter Auszahlung.",
    duration: 5,
    onUse: () => {
      if (currentLevel !== 2) return;
      freeSpinGuaranteeTurns = Math.max(freeSpinGuaranteeTurns, 5);
      triggerFreeSpins(5, freeSpinActive);
      showToast("Staubkrone aktiv.");
    },
  },
  {
    id: "herz-der-maschine",
    name: "Herz der Maschine",
    type: "passive",
    rarity: "legendary",
    icon: "❤️",
    levels: [1, 2],
    description: "Jede 100. Drehung triggert Freispiele.",
    onGain: () => {
      heartMachineActive = true;
    },
  },
  {
    id: "goldene-hitze",
    name: "Goldene Hitze",
    type: "passive",
    rarity: "legendary",
    icon: "☀️",
    levels: [2],
    description: "Freispiele starten mit +100 % Gewinn, fallen pro Spin ab.",
    onGain: () => {
      goldenHeatActive = true;
    },
  },
  {
    id: "neon-archiv",
    name: "Neon-Archiv",
    type: "passive",
    rarity: "legendary",
    icon: "📀",
    levels: [1],
    description: "Letzter Gewinn wird bei Verlust einmal wiederholt.",
    onGain: () => {
      neonArchiveActive = true;
    },
  },
  {
    id: "leere-coin",
    name: "Der Leere Coin",
    type: "passive",
    rarity: "mythic",
    icon: "⚫",
    levels: [1, 2],
    description: "Freispiele geben keinen Gewinn – danach 10 Spins mit massiv erhöhter Chance.",
    onGain: () => {
      emptyCoinActive = true;
    },
  },
  {
    id: "bonuscoin",
    name: "Bonuscoin",
    type: "active",
    rarity: "common",
    icon: "✨",
    levels: [2],
    description: "Nächste 5 Spins sind kostenlos.",
    duration: 5,
    onUse: () => {
      if (currentLevel !== 2) {
        showToast("Bonuscoin nur in Level 2 verfügbar.");
        return;
      }
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
    rarity: "common",
    icon: "🐱",
    levels: [1, 2],
    description: "Jackpot (3x 7) zahlt den Betrag doppelt.",
  },
  {
    id: "lucky-dog",
    name: "Lucky Dog",
    type: "passive",
    rarity: "common",
    icon: "🐶",
    levels: [1, 2],
    description: "Bei jedem 3er-Gewinn +10% Bonus.",
  },
  {
    id: "hourglass",
    name: "Hourglass",
    type: "passive",
    rarity: "common",
    icon: "⏳",
    levels: [1, 2],
    description: "Alle 10 Minuten +10 €.",
  },
  {
    id: "fake-coin",
    name: "Fake Coin",
    type: "active",
    rarity: "common",
    icon: "🃏",
    levels: [1, 2],
    description: "Versuch es selbst.",
    duration: 1,
    onUse: () => {
      showToast("Fake Coin... nichts passiert.");
    },
  },
  {
    id: "red-pepper",
    name: "Red Pepper",
    type: "active",
    rarity: "common",
    icon: "🌶️",
    levels: [1, 2],
    description: "+20% Gewinn für 3 Runden.",
    duration: 3,
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
    rarity: "common",
    icon: "🥕",
    levels: [1, 2],
    description: "Nächster Gewinn wird verdoppelt.",
    duration: Number.POSITIVE_INFINITY,
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
    rarity: "common",
    icon: "🥊",
    levels: [1, 2],
    description: "Kein Gewinn? +25 €. Gewinn? Kein Bonus.",
    duration: Number.POSITIVE_INFINITY,
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
    rarity: "common",
    icon: "🫑",
    levels: [1, 2],
    description: "+10% Gewinn für 5 Runden.",
    duration: 5,
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
    card.dataset.rarity = coin.rarity ?? "common";
    const coinEl = document.createElement("div");
    coinEl.className = `coin ${coin.type}`;
    coinEl.textContent = coin.icon;
    const rarityDot = document.createElement("span");
    rarityDot.className = "rarity-dot";
    const name = document.createElement("h4");
    name.textContent = coin.name;
    const desc = document.createElement("p");
    desc.textContent = `${coin.description} (${coin.type === "passive" ? "Permanent" : "Einmalig"})`;
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = `${coin.description} (${coin.type === "passive" ? "Permanent" : "Einmalig"})`;
    card.appendChild(rarityDot);
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
    const availableCoins = coinCatalog.filter((coin) => (coin.levels ?? [1, 2]).includes(currentLevel));
    const picks = Array.from({ length: 3 }, () => {
      const totalWeight = availableCoins.reduce(
        (sum, coin) => sum + (rarityWeights[coin.rarity ?? "common"] ?? 1),
        0
      );
      let roll = Math.random() * totalWeight;
      for (const coin of availableCoins) {
        roll -= rarityWeights[coin.rarity ?? "common"] ?? 1;
        if (roll <= 0) return coin;
      }
      return availableCoins[availableCoins.length - 1];
    });
    renderCoinResults(picks);
    coinSpinner.classList.remove("show");
    playMetalClickSound();
    coinPurchased = false;
    coinRolled = true;
    rerollCoinsButton.textContent = `Reroll (${currentRollPrice} €)`;
    rollCoinsButton.textContent = `Coin ziehen (${currentRollPrice} €)`;
    updateCoinControls();
  }, 900);
};

const getRandomSymbol = () => {
  const symbols = getCurrentSymbols();
  const weights = symbols.map((symbol) => {
    const boost = symbolWeightBoosts.get(symbol.icon) ?? 0;
    let weight = 1 + boost;
    if (abyssCoreActive && balance < 0) {
      weight += Math.min(0.25, Math.abs(balance) / 2000);
    }
    if (postFreeSpinBoostTurns > 0) {
      weight += 0.15;
    }
    return Math.max(0.05, weight);
  });
  const total = weights.reduce((sum, value) => sum + value, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < symbols.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return symbols[i];
  }
  return symbols[symbols.length - 1];
};

const applyColumnSymbols = (index, columnSymbols) => {
  const reel = reels[index];
  if (!reel) return;
  const symbolsInReel = reel.querySelectorAll(".symbol");
  if (!symbolsInReel.length) return;
  symbolsInReel.forEach((el, rowIndex) => {
    const symbol = columnSymbols[rowIndex] ?? getRandomSymbol();
    el.textContent = symbol.icon;
    if (currentLevel === 2) {
      el.dataset.symbol = symbol.icon;
    } else {
      delete el.dataset.symbol;
    }
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
  if (symbol.isScatter) return 0;
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
    if (count === 2 && doubleTwoCountsTurns > 0) {
      count = 3;
    }
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
  stopTriggered = false;
  updateFreeSpinIndicator();
  const effectiveSpinCost = Math.max(0, Math.round(spinCost * (1 + stakeModifier)));
  if (freeSpins > 0 || freeSpinQueued) {
    if (freeSpinQueued) {
      freeSpinQueued = false;
    }
    freeSpins = Math.max(0, freeSpins - 1);
    if (freeSpinNormalTurns > 0) {
      freeSpinNormalTurns -= 1;
      balance -= effectiveSpinCost;
    }
  } else {
    balance -= effectiveSpinCost;
  }
  updateBalance();
  showPayout("Walzen drehen...");
  playSpinSound();
  spinCounter += 1;
  if (heartMachineActive && spinCounter > 0 && spinCounter % 100 === 0) {
    triggerFreeSpins(8, freeSpinActive);
  }

  const layout = getLevelLayout();
  const results = Array.from({ length: layout.reels }, () =>
    Array.from({ length: layout.rows }, () => getRandomSymbol())
  );
  const slowFactor = freeSpinActive || slowSpinTurns > 0 ? 1.35 : 1;
  const scatterIcon = getCurrentSymbols().find((symbol) => symbol.isScatter)?.icon;
  const stopDelays = Array.from({ length: layout.reels }, (_, index) => {
    const baseDelay = (500 + index * 260) * slowFactor;
    if (!scatterIcon) return baseDelay;
    const priorScatters = results
      .slice(0, index)
      .reduce((sum, column) => sum + column.filter((symbol) => symbol.icon === scatterIcon).length, 0);
    return priorScatters >= 2 ? baseDelay * 1.35 : baseDelay;
  });
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
  const scatterCount = scatterIcon
    ? currentGrid.reduce((sum, column) => sum + column.filter((icon) => icon === scatterIcon).length, 0)
    : 0;
  let payoutValue = wins.reduce((sum, win) => sum + win.amount, 0);
  if (splitRealityActive && wins.length) {
    const extra = wins
      .slice()
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 2)
      .reduce((sum, win) => sum + win.amount, 0);
    payoutValue += extra;
    splitRealityActive = false;
  }
  if (diagonalBonus > 0 && wins.length) {
    const diagonalBonusValue = wins
      .filter((win) => win.lineIndex === 3 || win.lineIndex === 4)
      .reduce((sum, win) => sum + Math.round(win.amount * diagonalBonus), 0);
    payoutValue += diagonalBonusValue;
  }
  if (reactionChipActive && stopTriggered && payoutValue > 0) {
    payoutValue += Math.round(payoutValue * 0.08);
  }
  if (freeSpinActive && freeSpinNoWin) {
    payoutValue = 0;
  }
  if (freeSpinActive && freeSpinGuaranteeTurns > 0) {
    const minPayout = Math.round(spinCost * 0.5);
    payoutValue = Math.max(payoutValue, minPayout);
  }
  if (goldDustActive && spinCounter > 0 && spinCounter % 20 === 0) {
    payoutValue = Math.max(payoutValue, effectiveSpinCost);
  }
  let payoutMultiplier = 1 + winModifier;
  if (freeSpinActive) {
    payoutMultiplier += freeSpinWinModifier;
    if (goldenHeatActive && freeSpinHeatBonus > 0) {
      payoutMultiplier += freeSpinHeatBonus;
    }
  }
  if (neonFlowActive && neonFlowBonus > 0) {
    payoutMultiplier += neonFlowBonus;
  }
  if (lossBoostActive && lossBoostStacks > 0) {
    payoutMultiplier += Math.min(0.2, lossBoostStacks * 0.04);
  }
  if (abyssCoreActive && balance < 0) {
    payoutMultiplier += Math.min(0.25, Math.abs(balance) / 1000);
  }
  if (postFreeSpinBoostTurns > 0) {
    payoutMultiplier += postFreeSpinBoost;
  }
  if (payoutMultiplier !== 1) {
    payoutValue = Math.round(payoutValue * payoutMultiplier);
  }
  if (warpedLuckActive && payoutValue > 0) {
    const highThreshold = spinCost * 4;
    const midThreshold = spinCost * 2;
    if (payoutValue > highThreshold) {
      payoutValue = Math.round(payoutValue * 0.85);
    } else if (payoutValue >= midThreshold) {
      payoutValue = Math.round(payoutValue * 1.1);
    }
  }
  if (pendingStoredWin && payoutValue > 0) {
    storedWinAmount = payoutValue;
    storedWinDelay = 3;
    payoutValue = 0;
    pendingStoredWin = false;
    consumeActiveCoin("ruhender-joker");
    showToast("Ruhender Joker speichert den Gewinn.");
  }
  if (storedWinDelay > 0) {
    storedWinDelay -= 1;
    if (storedWinDelay === 0 && storedWinAmount > 0) {
      payoutValue += storedWinAmount;
      storedWinAmount = 0;
      showToast("Ruhender Joker zahlt aus.");
    }
  }
  let message = wins.length ? `${wins.length} Gewinnlinie(n)! +${payoutValue}` : "Leider kein Gewinn.";
  let bonusTriggered = false;
  const bonusEvents = [];

  if (!wins.length && refundOnLossTurns > 0) {
    balance += effectiveSpinCost;
    refundOnLossTurns -= 1;
    showToast("Einsatz zurückerstattet.");
  }

  if (heatChipActive && lossStreak >= 10) {
    heatChipReady = true;
  }
  if (payoutValue > 0) {
    if (heatChipReady) {
      payoutValue += Math.round(payoutValue * 0.05);
      heatChipReady = false;
      lossStreak = 0;
    }
  }

  if (payoutValue > 0) {
    balance += payoutValue;
  }

  if (currentLevel === 2 && scatterCount >= (desertPactActive ? 4 : 3)) {
    const baseSpins = scatterCount === 3 ? 8 : scatterCount === 4 ? 11 : 13;
    const retrigger = freeSpinActive;
    triggerFreeSpins(baseSpins, retrigger);
    if (scatterCount >= 5) {
      freeSpinHeatBonus = Math.max(freeSpinHeatBonus, 0.5);
      showToast("Starker Startbonus!");
    }
    scatterPending = true;
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
  if (!lastSpinWin) {
    lossStreak += 1;
  } else {
    lossStreak = 0;
  }
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

  if (!lastSpinWin && lossBoostActive) {
    lossBoostStacks = Math.min(5, lossBoostStacks + 1);
  }
  if (lastSpinWin) {
    if (neonFlowActive) {
      neonFlowBonus = Math.min(0.3, neonFlowBonus + 0.05);
    }
    lastWinAmount = payoutValue;
    if (neonArchiveActive) {
      neonArchiveReady = true;
    }
  } else {
    neonFlowBonus = 0;
    if (neonArchiveActive && neonArchiveReady && lastWinAmount > 0) {
      balance += lastWinAmount;
      bonusTriggered = true;
      bonusEvents.push({ amount: lastWinAmount, label: "Neon-Archiv", icon: "📀" });
      neonArchiveReady = false;
    }
  }

  updateBalance();
  showPayout(message, payoutValue > 0);
  winOverlay.classList.toggle("boost", bonusTriggered);
  showWin(payoutValue);
  if (payoutValue > 0) {
    playWinSound();
  }
  if (freeSpinActive && payoutValue > 0) {
    freeSpinTotalWin += payoutValue;
  }

  if (wins.length) {
    await playPaylineAnimation(wins);
  }

  bonusEvents.forEach((event, index) => {
    setTimeout(() => showCoinBonus(event.amount, event.label, event.icon), index * 150);
  });

  if (stakeModifierTurns > 0) {
    stakeModifierTurns -= 1;
    if (stakeModifierTurns === 0) {
      stakeModifier = 0;
    }
  }
  if (winModifierTurns > 0) {
    winModifierTurns -= 1;
    if (winModifierTurns === 0) {
      winModifier = 0;
    }
  }
  if (doubleTwoCountsTurns > 0) {
    doubleTwoCountsTurns -= 1;
  }
  if (slowSpinTurns > 0) {
    slowSpinTurns -= 1;
  }
  if (freeSpinGuaranteeTurns > 0 && freeSpinActive) {
    freeSpinGuaranteeTurns -= 1;
  }
  if (freeSpinActive && goldenHeatActive && freeSpinHeatBonus > 0) {
    freeSpinHeatBonus = Math.max(0, freeSpinHeatBonus - 0.2);
  }
  if (postFreeSpinBoostTurns > 0) {
    postFreeSpinBoostTurns -= 1;
  }

  inventory.forEach((coin, index) => {
    if (!coin || !coin.active) return;
    if (Number.isFinite(coin.remainingSpins) && coin.remainingSpins > 0) {
      coin.remainingSpins -= 1;
    }
    if (coin.remainingSpins <= 0) {
      if (coin.id === "spannungsaufbau") {
        lossBoostActive = false;
        lossBoostStacks = 0;
      }
      inventory[index] = null;
    }
  });
  renderInventory();

  isSpinning = false;
  updateFreeSpinIndicator();

  if (freeSpinActive && freeSpins === 0 && scatterPending) {
    scatterPending = false;
  }
  if (freeSpinActive && freeSpins === 0 && !isSpinning) {
    freeSpinActive = false;
    document.body.classList.remove("free-spin-active");
    showPayout(`Freispiele beendet: +${freeSpinTotalWin} €`, true);
    if (emptyCoinActive) {
      postFreeSpinBoostTurns = Math.max(postFreeSpinBoostTurns, 10);
      showToast("Leerer Coin: 10 Spins mit erhöhter Chance!");
    }
    updateFreeSpinIndicator();
  }

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
  stopTriggered = true;
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
        if (Number.isFinite(coin.duration)) {
          coin.remainingSpins = coin.duration;
        } else if (coin.duration === Number.POSITIVE_INFINITY) {
          coin.remainingSpins = Number.POSITIVE_INFINITY;
        } else {
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
