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
const sellCreditsButton = document.getElementById("sell-credits");
const rollCoinsButton = document.getElementById("roll-coins");
const rerollCoinsButton = document.getElementById("reroll-coins");
const coinResults = document.getElementById("coin-results");
const coinSpinner = document.getElementById("coin-spinner");
const sellRange = document.getElementById("sell-range");
const sellNumber = document.getElementById("sell-number");
const inventorySlots = Array.from(document.querySelectorAll(".inventory-slot[data-slot]"));
const passiveSlots = Array.from(document.querySelectorAll(".inventory-slot[data-passive-slot]"));
const passiveCoins = document.getElementById("passive-coins");
const balanceLabel = document.getElementById("balance");
const timerLabel = document.getElementById("timer");
const confirmOverlay = document.getElementById("confirm-overlay");
const confirmText = document.getElementById("confirm-text");
const confirmBuy = document.getElementById("confirm-buy");
const confirmCancel = document.getElementById("confirm-cancel");
const autoBuyCheckbox = document.getElementById("auto-buy");
const restartButton = document.getElementById("restart");
const coinBonus = document.getElementById("coin-bonus");
const leverHand = document.getElementById("lever-hand");
const startScreen = document.getElementById("start-screen");
const gameLayout = document.getElementById("game");
const levelButtons = Array.from(document.querySelectorAll(".level-card"));

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
let pendingAction = null;
let coinPrice = 25;
let currentRollPrice = 25;
let coinPurchased = false;
let coinRolled = false;
let gameOver = false;

const updateCredits = () => {
  creditsLabel.textContent = credits;
  updateStakeOptions();
  updateSellControls();
};

const updateBalance = () => {
  const formatted = balance > 0 ? `+${balance}` : `${balance}`;
  balanceLabel.textContent = `${formatted} €`;
  if (balance <= -1000) {
    gameOver = true;
    autoSpin = false;
    clearTimeout(spinInterval);
    autoButton.textContent = "Auto-Spin";
    setLostState(true);
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
  spinCost = Number(stakeSelect.value);
  updatePayoutTable();
};

const updateCoinControls = () => {
  rollCoinsButton.disabled = coinRolled && !coinPurchased;
  rerollCoinsButton.disabled = !coinRolled;
};

const updateSellControls = () => {
  const maxSell = Math.max(1, credits);
  sellRange.max = maxSell;
  sellNumber.max = maxSell;
  if (credits <= 0) {
    sellRange.value = 1;
    sellNumber.value = 1;
    sellCreditsButton.disabled = true;
  } else {
    if (Number(sellNumber.value) > maxSell) {
      sellNumber.value = maxSell;
      sellRange.value = maxSell;
    }
    sellCreditsButton.disabled = false;
  }
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
    type: "active",
    icon: "✨",
    description: "Nächste 5 Spins sind kostenlos.",
    onUse: () => {
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
    description: "Alle 10 Minuten +10 Credits.",
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
      doubleWinNext = true;
      showToast("Golden Carrot aktiviert!");
    },
  },
  {
    id: "lucky-punch",
    name: "Lucky Punch",
    type: "active",
    icon: "🥊",
    description: "Kein Gewinn? +25 Credits. Gewinn? Kein Bonus.",
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
        if (!ensureCredits(currentRollPrice, "Coin-Kauf")) return;
        credits -= currentRollPrice;
        updateCredits();
        addToInventory(pendingCoin);
        coinPrice *= 2;
        currentRollPrice = coinPrice;
        rollCoinsButton.textContent = `Coin ziehen (${coinPrice} Credits)`;
        rerollCoinsButton.textContent = `Reroll (${currentRollPrice} Credits)`;
        coinPurchased = true;
        coinRolled = false;
        updateCoinControls();
        coinResults.innerHTML = "";
      });
    });
    coinResults.appendChild(card);
  });
};

const ensureCredits = (cost, label = "Kauf") => {
  if (credits >= cost) return true;
  if (!autoBuyCheckbox.checked) {
    showToast("Nicht genug Credits.");
    return false;
  }
  const needed = cost - credits;
  const autoCost = needed * 2;
  balance -= autoCost;
  credits += needed;
  updateBalance();
  updateCredits();
  showToast(`${label}: Auto-Buy +${needed} Credits`);
  return credits >= cost;
};

const rollCoins = (isReroll = false) => {
  if (gameOver) return;
  if (!isReroll) {
    currentRollPrice = coinPrice;
  }
  if (!ensureCredits(currentRollPrice, "Coin ziehen")) return;
  credits -= currentRollPrice;
  updateCredits();
  coinResults.innerHTML = "";
  coinSpinner.classList.add("show");
  setTimeout(() => {
    const picks = Array.from({ length: 3 }, () => coinCatalog[Math.floor(Math.random() * coinCatalog.length)]);
    renderCoinResults(picks);
    coinSpinner.classList.remove("show");
    coinPurchased = false;
    coinRolled = true;
    rerollCoinsButton.textContent = `Reroll (${currentRollPrice} Credits)`;
    rollCoinsButton.textContent = `Coin ziehen (${currentRollPrice} Credits)`;
    updateCoinControls();
  }, 900);
};

const getRandomSymbol = () => {
  const choice = symbols[Math.floor(Math.random() * symbols.length)];
  return choice;
};

const applySymbol = (symbol, index) => {
  const reel = reels[index];
  const symbolsInReel = reel.querySelectorAll(".symbol");
  const randomTop = getRandomSymbol();
  const randomBottom = getRandomSymbol();
  if (symbolsInReel.length >= 3) {
    symbolsInReel[0].textContent = randomTop.icon;
    symbolsInReel[1].textContent = symbol.icon;
    symbolsInReel[2].textContent = randomBottom.icon;
  } else {
    reel.innerHTML = `
      <div class="symbol ghost">${randomTop.icon}</div>
      <div class="symbol main">${symbol.icon}</div>
      <div class="symbol ghost">${randomBottom.icon}</div>
    `;
  }
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
  if (gameOver) return;
  if (autoBuyCheckbox.checked && credits < spinCost) {
    const needed = spinCost - credits;
    const cost = needed * 2;
    balance -= cost;
    credits += needed;
    updateBalance();
    updateCredits();
    showToast(`Auto-Buy: +${needed} Credits`);
  }
  if (credits < spinCost) {
    showToast("Um weiter zu spielen, besorge dir Credits.");
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
  let bonusTriggered = false;
  const bonusEvents = [];

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
    bonusTriggered = true;
    bonusEvents.push({ amount: bonus, label: "Lucky Dog", icon: "🐶" });
  }

  if (matchCount === 3 && symbolsOnly.every((icon) => icon === "7️⃣") && passives.has("lucky-cat")) {
    credits += payoutValue;
    payoutValue *= 2;
    bonusTriggered = true;
    bonusEvents.push({ amount: payoutValue / 2, label: "Lucky Cat", icon: "🐱" });
  }

  if (doubleWinNext) {
    if (payoutValue > 0) {
      credits += payoutValue;
      payoutValue *= 2;
      bonusTriggered = true;
      bonusEvents.push({ amount: payoutValue / 2, label: "Golden Carrot", icon: "🥕" });
    }
    if (payoutValue > 0) {
      doubleWinNext = false;
      const carrotIndex = inventory.findIndex((coin) => coin?.id === "golden-carrot");
      if (carrotIndex !== -1) {
        inventory[carrotIndex].remainingSpins = 0;
      }
    }
  }

  if (winBonusTurns > 0) {
    if (payoutValue > 0) {
      const bonus = Math.round(payoutValue * winBonusMultiplier);
      credits += bonus;
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
  if (!lastSpinWin && luckyPunchArmed) {
    credits += luckyPunchReward;
    bonusTriggered = true;
    bonusEvents.push({ amount: luckyPunchReward, label: "Lucky Punch", icon: "🥊" });
    luckyPunchArmed = false;
  } else if (lastSpinWin && luckyPunchArmed) {
    luckyPunchArmed = false;
  }

  updateCredits();
  showPayout(message, payoutValue > 0);
  winOverlay.classList.toggle("boost", bonusTriggered);
  showWin(payoutValue);
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

  if (balance <= -1000) {
    setLostState(true);
    showPayout("Guthabenlimit erreicht!");
    autoSpin = false;
  }
};

leverButton.addEventListener("click", () => {
  autoSpin = false;
  clearTimeout(spinInterval);
  leverButton.classList.add("pulled");
  leverHand.classList.add("pulling");
  setTimeout(() => leverButton.classList.remove("pulled"), 250);
  setTimeout(() => leverHand.classList.remove("pulling"), 350);
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

restartButton.addEventListener("click", () => {
  autoSpin = false;
  clearTimeout(spinInterval);
  autoButton.textContent = "Auto-Spin";
  credits = 25;
  balance = -50;
  freeSpins = 0;
  winBonusMultiplier = 0;
  winBonusTurns = 0;
  doubleWinNext = false;
  luckyPunchArmed = false;
  lastSpinWin = false;
  hourglassCounter = 0;
  startTime = Date.now();
  inventory.fill(null);
  passiveInventory.fill(null);
  passives.clear();
  coinPrice = 25;
  currentRollPrice = 25;
  coinPurchased = false;
  coinRolled = false;
  gameOver = false;
  setLostState(false);
  updateBalance();
  updateCredits();
  renderInventory();
  rollCoinsButton.textContent = `Coin ziehen (${coinPrice} Credits)`;
  rerollCoinsButton.textContent = `Reroll (${coinPrice} Credits)`;
  updateCoinControls();
  showPayout("Bereit!");
});

creditRange.addEventListener("input", () => {
  creditNumber.value = creditRange.value;
});

creditNumber.addEventListener("input", () => {
  const value = Math.max(1, Math.min(500, Number(creditNumber.value || 1)));
  creditNumber.value = value;
  creditRange.value = value;
});

buyCreditsButton.addEventListener("click", () => {
  const amount = Number(creditNumber.value);
  const cost = amount * 2;
  openConfirm(`Credits kaufen? (${amount} Credits für ${cost} €)`, () => {
    balance -= cost;
    credits += amount;
    updateBalance();
    updateCredits();
    showToast(`+${amount} Credits gekauft`);
  });
});

sellCreditsButton.addEventListener("click", () => {
  const amount = Number(sellNumber.value);
  if (amount > credits) {
    showToast("Nicht genug Credits zum Verkaufen.");
    return;
  }
  const gain = amount * 2;
  openConfirm(`Credits verkaufen? (${amount} Credits für ${gain} €)`, () => {
    credits -= amount;
    balance += gain;
    updateBalance();
    updateCredits();
    showToast(`-${amount} Credits verkauft`);
  });
});

sellRange.addEventListener("input", () => {
  sellNumber.value = sellRange.value;
});

sellNumber.addEventListener("input", () => {
  const value = Math.max(1, Math.min(Number(sellNumber.max), Number(sellNumber.value || 1)));
  sellNumber.value = value;
  sellRange.value = value;
});

rollCoinsButton.addEventListener("click", rollCoins);
rerollCoinsButton.addEventListener("click", () => {
  if (!coinRolled) {
    showToast("Reroll erst nach einem Coin-Zug möglich.");
    return;
  }
  rollCoins(true);
});

inventorySlots.forEach((slot, index) => {
  slot.addEventListener("click", () => {
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
    sell.textContent = "Verkaufen (10 Credits)";

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
        if (coin.id === "lucky-punch") coin.remainingSpins = 1;
        if (coin.id === "fake-coin") {
          coin.remainingSpins = 1;
        }
        renderInventory();
      }
      actions.remove();
    });

    sell.addEventListener("click", (event) => {
      event.stopPropagation();
      if (coin.active) return;
      openConfirm("Coin für 10 Credits verkaufen?", () => {
        credits += 10;
        inventory[index] = null;
        updateCredits();
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
    sell.textContent = "Verkaufen (10 Credits)";
    sell.addEventListener("click", (event) => {
      event.stopPropagation();
      openConfirm("Passiven Coin für 10 Credits verkaufen?", () => {
        credits += 10;
        passives.delete(coin.id);
        passiveInventory[index] = null;
        updateCredits();
        renderInventory();
      });
      actions.remove();
    });
    actions.appendChild(sell);
    slot.appendChild(actions);
  });
});

confirmCancel.addEventListener("click", () => {
  confirmOverlay.classList.remove("show");
  confirmOverlay.setAttribute("aria-hidden", "true");
  pendingCoin = null;
  pendingAction = null;
});

confirmBuy.addEventListener("click", () => {
  pendingAction?.();
  pendingCoin = null;
  pendingAction = null;
  coinResults.innerHTML = "";
  confirmOverlay.classList.remove("show");
  confirmOverlay.setAttribute("aria-hidden", "true");
});

setInterval(updateTimer, 1000);
updateBalance();
updateCredits();
renderInventory();
rollCoinsButton.textContent = `Coin ziehen (${coinPrice} Credits)`;
rerollCoinsButton.textContent = `Reroll (${coinPrice} Credits)`;
updateCoinControls();
gameLayout.classList.add("hidden");
levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const level = button.dataset.level;
    if (level !== "1") {
      showToast("Bitte zuerst Level 1 abschließen.");
      return;
    }
    startScreen.classList.add("hidden");
    gameLayout.classList.remove("hidden");
  });
});
