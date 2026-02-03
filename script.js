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

const symbols = [
  { icon: "🍒", twoMult: 1.2, threeMult: 4 },
  { icon: "🔔", twoMult: 1.4, threeMult: 4.8 },
  { icon: "⭐", twoMult: 1.6, threeMult: 6 },
  { icon: "💎", twoMult: 2.2, threeMult: 10 },
  { icon: "7️⃣", twoMult: 3, threeMult: 14 },
  { icon: "❌", twoMult: 0, threeMult: "refund" },
];

let spinCost = 5;
let credits = 50;
let isSpinning = false;
let autoSpin = false;
let spinInterval = null;
const reelIntervals = new Map();

const updateCredits = () => {
  creditsLabel.textContent = credits;
  updateStakeOptions();
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
  credits -= spinCost;
  updateCredits();
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

  const hit = Object.entries(counts).find(([, count]) => count >= 2);
  if (hit) {
    const [icon, count] = hit;
    const symbolInfo = symbols.find((symbol) => symbol.icon === icon);
    if (symbolInfo) {
      if (count === 3 && symbolInfo.threeMult === "refund") {
        payoutValue = spinCost;
        credits += payoutValue;
        message = `❌❌❌ Einsatz zurück! +${payoutValue}`;
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

  updateCredits();
  showPayout(message, payoutValue > 0);
  showWin(payoutValue);
  isSpinning = false;

  if (autoSpin) {
    spinInterval = setTimeout(spinReels, 700);
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

updateCredits();
