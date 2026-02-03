const reels = Array.from(document.querySelectorAll(".reel"));
const payout = document.getElementById("payout");
const creditsLabel = document.getElementById("credits");
const autoButton = document.getElementById("auto");
const stopButton = document.getElementById("stop");
const lostOverlay = document.getElementById("lost");
const leverButton = document.getElementById("lever");
const winOverlay = document.getElementById("win");
const winAmount = document.getElementById("win-amount");

const symbols = [
  { icon: "🍒", two: 4, three: 20 },
  { icon: "🔔", two: 5, three: 24 },
  { icon: "⭐", two: 6, three: 30 },
  { icon: "💎", two: 10, three: 50 },
  { icon: "7️⃣", two: 15, three: 70 },
  { icon: "❌", two: 0, three: "refund" },
];

const spinCost = 5;
let credits = 50;
let isSpinning = false;
let autoSpin = false;
let spinInterval = null;
const reelIntervals = new Map();

const updateCredits = () => {
  creditsLabel.textContent = credits;
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
      if (count === 3 && symbolInfo.three === "refund") {
        payoutValue = spinCost;
        credits += payoutValue;
        message = `❌❌❌ Einsatz zurück! +${payoutValue}`;
      } else {
        payoutValue = count === 3 ? symbolInfo.three : symbolInfo.two;
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
