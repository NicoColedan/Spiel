const reels = Array.from(document.querySelectorAll(".reel"));
const payout = document.getElementById("payout");
const creditsLabel = document.getElementById("credits");
const spinButton = document.getElementById("spin");
const autoButton = document.getElementById("auto");
const stopButton = document.getElementById("stop");
const lostOverlay = document.getElementById("lost");

const symbols = [
  { icon: "🍒", two: 8, three: 25 },
  { icon: "🔔", two: 10, three: 35 },
  { icon: "⭐", two: 12, three: 45 },
  { icon: "💎", two: 20, three: 80 },
  { icon: "7️⃣", two: 30, three: 120 },
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
      payoutValue = count === 3 ? symbolInfo.three : symbolInfo.two;
      credits += payoutValue;
      message = count === 3 ? `Jackpot ${icon} ${icon} ${icon}! +${payoutValue}` : `Treffer ${icon} ${icon}! +${payoutValue}`;
    }
  }

  updateCredits();
  showPayout(message, payoutValue > 0);
  isSpinning = false;

  if (autoSpin) {
    spinInterval = setTimeout(spinReels, 700);
  }
};

spinButton.addEventListener("click", () => {
  autoSpin = false;
  clearTimeout(spinInterval);
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
