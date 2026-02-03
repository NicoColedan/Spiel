const reels = Array.from(document.querySelectorAll(".reel"));
const payout = document.getElementById("payout");
const creditsLabel = document.getElementById("credits");
const autoButton = document.getElementById("auto");
const stopButton = document.getElementById("stop");
const lostOverlay = document.getElementById("lost");
const leverButton = document.getElementById("lever");
const winOverlay = document.getElementById("win");
const winAmount = document.getElementById("win-amount");
const stakeSelect = document.getElementById("stake");
const payoutMultipliers = Array.from(document.querySelectorAll("[data-multiplier]"));
const payoutRefund = document.querySelector("[data-refund]");
const shopButton = document.getElementById("shop");
const shopOverlay = document.getElementById("shop-overlay");
const shopClose = document.getElementById("shop-close");
const creditRange = document.getElementById("credit-range");
const creditNumber = document.getElementById("credit-number");
const buyCreditsButton = document.getElementById("buy-credits");
const rollCoinsButton = document.getElementById("roll-coins");
const rerollCoinsButton = document.getElementById("reroll-coins");
const coinResults = document.getElementById("coin-results");
const coinSpinner = document.getElementById("coin-spinner");
const inventorySlots = Array.from(document.querySelectorAll(".inventory-slot"));
const passiveCoins = document.getElementById("passive-coins");
const balanceLabel = document.getElementById("balance");
const timerLabel = document.getElementById("timer");
const confirmOverlay = document.getElementById("confirm-overlay");
const confirmText = document.getElementById("confirm-text");
const confirmBuy = document.getElementById("confirm-buy");
const confirmCancel = document.getElementById("confirm-cancel");

const symbols = [
  { icon: "🍒", twoMult: 1.2, threeMult: 4 },
  { icon: "🔔", twoMult: 1.4, threeMult: 4.8 },
  { icon: "⭐", twoMult: 1.6, threeMult: 6 },
  { icon: "💎", twoMult: 2.2, threeMult: 10 },
  { icon: "7️⃣", twoMult: 3, threeMult: 14 },
  { icon: "❌", twoMult: 0, threeMult: "refund" },
];

let spinCost = 5;
let credits = 25;
let balance = -50;
let isSpinning = false;
let autoSpin = false;
let spinInterval = null;
const reelIntervals = new Map();
let freeSpins = 0;
let winBonusMultiplier = 0;
let winBonusTurns = 0;
let doubleWinNext = false;
let luckyPunchArmed = false;
let luckyPunchReward = 25;
let lastSpinWin = false;
let hourglassCounter = 0;
let startTime = Date.now();
let pendingCoin = null;

const updateCredits = () => {
  creditsLabel.textContent = credits;
  updateStakeOptions();
};

const updateBalance = () => {
  const formatted = balance > 0 ? `+${balance}` : `${balance}`;
  balanceLabel.textContent = `${formatted} €`;
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

const showPayout = (message, highlight = false) => {
  payout.textContent = message;
  payout.style.color = highlight ? "#ffe680" : "#4dd7ff";
};

const setLostState = (show) => {
  lostOverlay.classList.toggle("show", show);
};

const showWin = (amount) => {
  if (amount <= 0) return;
  winAmount.textContent = `+${amount}`;
  winOverlay.classList.remove("show");
  void winOverlay.offsetWidth;
  winOverlay.classList.add("show");
};

const updateStakeOptions = () => {
  const options = Array.from(stakeSelect.options);
  options.forEach((option) => {
    const value = Number(option.value);
    option.disabled = value > credits;
  });

  if (Number(stakeSelect.value) > credits) {
    const available = options
      .filter((option) => !option.disabled)
      .map((option) => Number(option.value));
    const fallback = available.length ? Math.max(...available) : 1;
    stakeSelect.value = String(fallback);
  }

  spinCost = Number(stakeSelect.value);
  updatePayoutTable();
};

const updatePayoutTable = () => {
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
      credits += gained;
      hourglassCounter = hourglassTicks;
      updateCredits();
      showToast(`Hourglass +${gained} Credits`);
    }
  }
};

const coinCatalog = [
  {
    id: "bonuscoin",
    name: "Bonuscoin",
    type: "passive",
    icon: "✨",
    description: "Schenkt dir 5 freie Runden. (Permanent)",
    onGain: () => {
      freeSpins += 5;
      showToast("Bonuscoin: +5 Freispiele");
    },
  },
  {
    id: "lucky-cat",
    name: "Lucky Cat",
    type: "passive",
    icon: "🐱",
    description: "Jackpot (3x 7) zahlt den Betrag doppelt. (Permanent)",
  },
  {
    id: "lucky-dog",
    name: "Lucky Dog",
    type: "passive",
    icon: "🐶",
    description: "Bei jedem 3er-Gewinn +10% Bonus. (Permanent)",
  },
  {
    id: "hourglass",
    name: "Hourglass",
    type: "passive",
    icon: "⏳",
    description: "Alle 10 Minuten +10 Credits. (Permanent)",
  },
  {
    id: "fake-coin",
    name: "Fake Coin",
    type: "active",
    icon: "🃏",
    description: "Versuch es selbst. (Einmalig)",
    onUse: () => {
      showToast("Fake Coin... nichts passiert.");
    },
  },
  {
    id: "red-pepper",
    name: "Red Pepper",
    type: "active",
    icon: "🌶️",
    description: "+20% Gewinn für 3 Runden. (3 Spins)",
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
    description: "Nächster Gewinn wird verdoppelt. (1 Spin)",
    onUse: () => {
      doubleWinNext = true;
      showToast("Golden Carrot aktiviert!");
    },
  },
  {
    id: "lucky-punch",
    name: "Lucky Punch",
    type: "active",
    icon: "🥊",
    description: "Kein Gewinn? +25 Credits. Gewinn? Kein Bonus. (1 Spin)",
    onUse: () => {
      luckyPunchArmed = true;
      showToast("Lucky Punch bereit.");
    },
  },
  {
    id: "green-pepper",
    name: "Green Pepper",
    type: "active",
    icon: "🫑",
    description: "+10% Gewinn für 5 Runden. (5 Spins)",
    onUse: () => {
      winBonusMultiplier += 0.1;
      winBonusTurns = Math.max(winBonusTurns, 5);
      showToast("Green Pepper aktiv (5 Runden).");
    },
  },
];

const inventory = new Array(4).fill(null);
const passives = new Set();
const passiveInventory = [];

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

  passiveCoins.innerHTML = "";
  passiveInventory.forEach((coin) => {
    const coinEl = document.createElement("div");
    coinEl.className = "coin passive";
    coinEl.textContent = coin.icon;
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = coin.description;
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.appendChild(coinEl);
    wrapper.appendChild(tooltip);
    passiveCoins.appendChild(wrapper);
  });
};

const addToInventory = (coin) => {
  if (coin.type === "passive") {
    if (passives.has(coin.id)) {
      showToast(`${coin.name} ist bereits aktiv.`);
      return;
    }
    passives.add(coin.id);
    coin.onGain?.();
    passiveInventory.push(coin);
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
  coinResults.innerHTML = "";
  coins.forEach((coin) => {
    const card = document.createElement("div");
    card.className = "coin-card";
    const coinEl = document.createElement("div");
    coinEl.className = `coin ${coin.type}`;
    coinEl.textContent = coin.icon;
    const name = document.createElement("h4");
    name.textContent = coin.name;
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = coin.description;
    card.appendChild(coinEl);
    card.appendChild(name);
    card.appendChild(tooltip);
    card.addEventListener("click", () => {
      pendingCoin = coin;
      confirmText.textContent = `Möchtest du ${coin.name} kaufen?`;
      confirmOverlay.classList.add("show");
      confirmOverlay.setAttribute("aria-hidden", "false");
    });
    coinResults.appendChild(card);
  });
};

const rollCoins = () => {
  balance -= 50;
  updateBalance();
  coinResults.innerHTML = "";
  coinSpinner.classList.add("show");
  setTimeout(() => {
    const picks = Array.from({ length: 3 }, () => coinCatalog[Math.floor(Math.random() * coinCatalog.length)]);
    renderCoinResults(picks);
    coinSpinner.classList.remove("show");
  }, 900);
};

const getRandomSymbol = () => {
  const choice = symbols[Math.floor(Math.random() * symbols.length)];
  return choice;
};

const applySymbol = (symbol, index) => {
  reels[index].innerHTML = `<div class="symbol">${symbol.icon}</div>`;
};

const startReelSpin = (index) => {
  if (reelIntervals.has(index)) {
    clearInterval(reelIntervals.get(index));
  }
  reels[index].classList.add("spinning");
  const intervalId = setInterval(() => {
    const randomSymbol = getRandomSymbol();
    applySymbol(randomSymbol, index);
  }, 80);
  reelIntervals.set(index, intervalId);
};

const stopReelSpin = (index, finalSymbol) => {
  const intervalId = reelIntervals.get(index);
  if (intervalId) {
    clearInterval(intervalId);
    reelIntervals.delete(index);
  }
  reels[index].classList.remove("spinning");
  applySymbol(finalSymbol, index);
};

const spinReels = async () => {
  if (isSpinning) return;
  if (credits < spinCost) {
    setLostState(true);
    autoSpin = false;
    autoButton.textContent = "Auto-Spin";
    return;
  }

  setLostState(false);
  isSpinning = true;
  if (freeSpins > 0) {
    freeSpins -= 1;
  } else {
    credits -= spinCost;
  }
  balance -= 10;
  updateCredits();
  updateBalance();
  showPayout("Rattersound läuft...");

  const results = reels.map(() => getRandomSymbol());
  const stopDelays = [600, 950, 1300];

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

  const symbolsOnly = results.map((symbol) => symbol.icon);
  const counts = symbolsOnly.reduce((acc, icon) => {
    acc[icon] = (acc[icon] || 0) + 1;
    return acc;
  }, {});

  let payoutValue = 0;
  let message = "Leider kein Gewinn.";
  let matchCount = 0;

  const hit = Object.entries(counts).find(([, count]) => count >= 2);
  if (hit) {
    const [icon, count] = hit;
    matchCount = count;
    const symbolInfo = symbols.find((symbol) => symbol.icon === icon);
    if (symbolInfo) {
      if (count === 3 && symbolInfo.threeMult === "refund") {
        payoutValue = spinCost;
        credits += payoutValue;
        message = `❌❌❌ +${payoutValue}`;
      } else {
        const multiplier = count === 3 ? symbolInfo.threeMult : symbolInfo.twoMult;
        payoutValue = Math.round(multiplier * spinCost);
        if (payoutValue > 0) {
          credits += payoutValue;
        }
        message =
          payoutValue > 0
            ? count === 3
              ? `Jackpot ${icon} ${icon} ${icon}! +${payoutValue}`
              : `Treffer ${icon} ${icon}! +${payoutValue}`
            : "Leider kein Gewinn.";
      }
    }
  }

  if (matchCount === 3 && passives.has("lucky-dog")) {
    const bonus = Math.round(payoutValue * 0.1);
    payoutValue += bonus;
    credits += bonus;
    showToast(`Lucky Dog +${bonus}`);
  }

  if (matchCount === 3 && symbolsOnly.every((icon) => icon === "7️⃣") && passives.has("lucky-cat")) {
    credits += payoutValue;
    payoutValue *= 2;
    showToast("Lucky Cat: Jackpot verdoppelt!");
  }

  if (doubleWinNext) {
    if (payoutValue > 0) {
      credits += payoutValue;
      payoutValue *= 2;
      showToast("Golden Carrot: Gewinn verdoppelt!");
    }
    doubleWinNext = false;
  }

  if (winBonusTurns > 0) {
    if (payoutValue > 0) {
      const bonus = Math.round(payoutValue * winBonusMultiplier);
      credits += bonus;
      payoutValue += bonus;
    }
    winBonusTurns -= 1;
    if (winBonusTurns === 0) {
      winBonusMultiplier = 0;
    }
  }

  lastSpinWin = payoutValue > 0;
  if (!lastSpinWin && luckyPunchArmed) {
    credits += luckyPunchReward;
    showToast(`Lucky Punch +${luckyPunchReward}`);
    luckyPunchArmed = false;
  } else if (lastSpinWin && luckyPunchArmed) {
    luckyPunchArmed = false;
  }

  updateCredits();
  showPayout(message, payoutValue > 0);
  showWin(payoutValue);

  inventory.forEach((coin, index) => {
    if (!coin || !coin.active) return;
    if (coin.remainingSpins > 0) {
      coin.remainingSpins -= 1;
    }
    if (coin.remainingSpins === 0) {
      inventory[index] = null;
    }
  });
  renderInventory();

  if (payoutValue > 0) {
    balance += payoutValue;
    updateBalance();
  }

  isSpinning = false;

  if (autoSpin) {
    spinInterval = setTimeout(spinReels, 700);
  }

  if (balance >= 0) {
    showPayout("Schulden abbezahlt! Du hast gewonnen!");
    autoSpin = false;
  }

  if (balance <= -1000) {
    setLostState(true);
    showPayout("Schuldenlimit erreicht!");
    autoSpin = false;
  }
};

leverButton.addEventListener("click", () => {
  autoSpin = false;
  clearTimeout(spinInterval);
  leverButton.classList.add("pulled");
  setTimeout(() => leverButton.classList.remove("pulled"), 250);
  spinReels();
});

autoButton.addEventListener("click", () => {
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
  updateStakeOptions();
});

stopButton.addEventListener("click", () => {
  autoSpin = false;
  autoButton.textContent = "Auto-Spin";
  clearTimeout(spinInterval);
  reelIntervals.forEach((intervalId) => clearInterval(intervalId));
  reelIntervals.clear();
  reels.forEach((reel, index) => {
    reel.classList.remove("spinning");
    applySymbol(getRandomSymbol(), index);
  });
  isSpinning = false;
});

shopButton.addEventListener("click", () => {
  shopOverlay.classList.add("show");
  shopOverlay.setAttribute("aria-hidden", "false");
});

shopClose.addEventListener("click", () => {
  shopOverlay.classList.remove("show");
  shopOverlay.setAttribute("aria-hidden", "true");
});

creditRange.addEventListener("input", () => {
  creditNumber.value = creditRange.value;
});

creditNumber.addEventListener("input", () => {
  const value = Math.max(1, Math.min(25, Number(creditNumber.value || 1)));
  creditNumber.value = value;
  creditRange.value = value;
});

buyCreditsButton.addEventListener("click", () => {
  const amount = Number(creditNumber.value);
  const cost = amount * 2;
  balance -= cost;
  credits += amount;
  updateBalance();
  updateCredits();
  showToast(`+${amount} Credits gekauft`);
});

rollCoinsButton.addEventListener("click", rollCoins);
rerollCoinsButton.addEventListener("click", rollCoins);

inventorySlots.forEach((slot, index) => {
  slot.addEventListener("click", () => {
    const coin = inventory[index];
    if (!coin) return;
    if (!coin.active) {
      coin.active = true;
      coin.onUse?.();
      if (coin.id === "red-pepper") coin.remainingSpins = 3;
      if (coin.id === "green-pepper") coin.remainingSpins = 5;
      if (coin.id === "golden-carrot") coin.remainingSpins = 1;
      if (coin.id === "lucky-punch") coin.remainingSpins = 1;
      if (coin.id === "fake-coin") {
        coin.remainingSpins = 0;
        inventory[index] = null;
      }
      renderInventory();
    }
  });
});

confirmCancel.addEventListener("click", () => {
  confirmOverlay.classList.remove("show");
  confirmOverlay.setAttribute("aria-hidden", "true");
  pendingCoin = null;
});

confirmBuy.addEventListener("click", () => {
  if (pendingCoin) {
    addToInventory(pendingCoin);
  }
  pendingCoin = null;
  coinResults.innerHTML = "";
  confirmOverlay.classList.remove("show");
  confirmOverlay.setAttribute("aria-hidden", "true");
});

setInterval(updateTimer, 1000);
updateBalance();
updateCredits();
renderInventory();
