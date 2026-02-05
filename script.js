let balance = 100;
let currentLevel = 1;
const spinCost = 5;

const reelsEl = document.querySelector(".reels");
const payoutEl = document.getElementById("payout");
const balanceEl = document.getElementById("balance");
const payoutList = document.getElementById("payout-list");

const levelSymbolSets = {
  1: [
    { icon: "🍒", twoMult: 1.2, threeMult: 4 },
    { icon: "🔔", twoMult: 1.4, threeMult: 4.8 },
    { icon: "⭐", twoMult: 1.6, threeMult: 6 },
    { icon: "💎", twoMult: 2.2, threeMult: 10 },
    { icon: "7️⃣", twoMult: 3, threeMult: 14 },
  ],
  2: [
    { icon: "10", threeMult: 3.5, fourMult: 7, fiveMult: 12 },
    { icon: "J", threeMult: 3.8, fourMult: 7.5, fiveMult: 13 },
    { icon: "Q", threeMult: 4.2, fourMult: 8.5, fiveMult: 14 },
    { icon: "K", threeMult: 4.6, fourMult: 9.5, fiveMult: 15 },
    { icon: "🧔", threeMult: 6.4, fourMult: 12, fiveMult: 22 },
  ],
};

const paylines = {
  1: [[0, 1, 2]],
  2: [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
  ],
};

function getCurrentSymbols() {
  return levelSymbolSets[currentLevel];
}

function renderPayoutTable() {
  payoutList.innerHTML = "";
  const symbols = getCurrentSymbols();

  symbols.forEach(s => {
    const li = document.createElement("li");
    if (currentLevel === 1) {
      li.textContent = `${s.icon}${s.icon} = x${s.twoMult}, ${s.icon}${s.icon}${s.icon} = x${s.threeMult}`;
    } else {
      li.textContent = `${s.icon}×3 = x${s.threeMult}, ×4 = x${s.fourMult}, ×5 = x${s.fiveMult}`;
    }
    payoutList.appendChild(li);
  });
}

function spin() {
  if (balance < spinCost) return;
  balance -= spinCost;

  const symbols = getCurrentSymbols();
  const result = [];

  reelsEl.querySelectorAll(".reel").forEach(reel => {
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    reel.textContent = sym.icon;
    result.push(sym.icon);
  });

  let win = evaluate(result);
  balance += win;

  payoutEl.textContent = win > 0 ? `Gewinn: +${win} €` : "Niete!";
  balanceEl.textContent = `${balance} €`;
}

function evaluate(result) {
  let payout = 0;
  const symbols = getCurrentSymbols();

  paylines[currentLevel].forEach(line => {
    const icons = line.map(i => result[i]);
    const first = icons[0];
    let count = icons.filter(i => i === first).length;

    const sym = symbols.find(s => s.icon === first);
    if (!sym) return;

    if (currentLevel === 1 && count >= 2) {
      payout += spinCost * (count === 2 ? sym.twoMult : sym.threeMult);
    }

    if (currentLevel === 2 && count >= 3) {
      if (count === 3) payout += spinCost * sym.threeMult;
      if (count === 4) payout += spinCost * sym.fourMult;
      if (count === 5) payout += spinCost * sym.fiveMult;
    }
  });

  return Math.floor(payout);
}

/* UI */
document.getElementById("spin").onclick = spin;

document.querySelectorAll(".level-card").forEach(btn => {
  btn.onclick = () => {
    currentLevel = Number(btn.dataset.level);
    document.getElementById("level-indicator").textContent = `Level ${currentLevel}`;
    document.getElementById("start-screen").hidden = true;
    document.getElementById("game-shell").hidden = false;
    renderPayoutTable();
  };
});

document.getElementById("home-button").onclick = () => {
  document.getElementById("game-shell").hidden = true;
  document.getElementById("start-screen").hidden = false;
};

renderPayoutTable();
