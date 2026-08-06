const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

const addTradeBtn = document.getElementById("addTradeBtn");
const tradeModal = document.getElementById("tradeModal");
const closeTradeBtn = document.getElementById("closeTradeBtn");
const saveTradeBtn = document.getElementById("saveTradeBtn");
const tradeTableBody = document.getElementById("tradeTableBody");


let editIndex = -1;
let trades = [];

// ======================================
// Trade Table Pagination
// ======================================

let currentPage = 1;
let rowsPerPage = 10;

function getProfit(trade) {
    const entry = Number(trade.entry);
    const exit = Number(trade.exit);
    const quantity = Number(trade.quantity);
    if (![entry, exit, quantity].every(Number.isFinite) || entry < 0 || exit < 0 || quantity <= 0) return 0;
    return (trade.type === "SELL" ? entry - exit : exit - entry) * quantity;
}

function formatTradeDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
}

function clearTradeForm() {
    ["tradeSymbol", "entryPrice", "exitPrice", "quantity"].forEach((id) => {
        document.getElementById(id).value = "";
    });
    document.getElementById("tradeType").value = "BUY";
}

function openTradeModal() {
    tradeModal.style.display = "flex";
}

function closeTradeModal() {
    
    tradeModal.style.display = "none";
    editIndex = -1;
    clearTradeForm();
}

addTradeBtn.addEventListener("click", () => {
    editIndex = -1;
    clearTradeForm();
    openTradeModal();
});
closeTradeBtn.addEventListener("click", closeTradeModal);
window.addEventListener("click", (event) => {
    if (event.target === tradeModal) closeTradeModal();
});

saveTradeBtn.addEventListener("click", async () => {
    const symbol = document.getElementById("tradeSymbol").value.trim().toUpperCase();
    const entry = Number(document.getElementById("entryPrice").value);
    const exit = Number(document.getElementById("exitPrice").value);
    const quantity = Number(document.getElementById("quantity").value);
    const type = document.getElementById("tradeType").value;

    if (!symbol || !Number.isFinite(entry) || !Number.isFinite(exit) || !Number.isFinite(quantity) || entry <= 0 || exit <= 0 || quantity <= 0 || !Number.isInteger(quantity)) {
        showToast("Please fill all trade details correctly.", "error");
        return;
    }

    try {
        const existingTrade = editIndex >= 0 ? trades[editIndex] : {};
        const trade = {
            ...existingTrade,
            symbol,
            entry,
            exit,
            quantity,
            type,
            date: existingTrade.date || new Date().toISOString()
        };

        const result = await apiRequest(
            editIndex >= 0 ? `/api/trades/${existingTrade.id}` : "/api/trades",
            {
                method: editIndex >= 0 ? "PUT" : "POST",
                body: JSON.stringify(trade)
            }
        );

        const isEdit = editIndex >= 0;

        if (isEdit) {
            trades[editIndex] = result.trade;
        } else {
            trades.push(result.trade);
        }

        closeTradeModal();
        render();

        showToast(
            isEdit
                ? "✏ Trade Updated Successfully"
                : "✅ Trade Added Successfully",
            isEdit ? "info" : "success"
        );

    } catch (error) {
        showToast(error.message, "error");
    }
});





function render() {


    const profits = trades.map(getProfit);
    const totalProfit = profits.reduce((sum, profit) => sum + profit, 0);
    const totalInvestment = trades.reduce((sum, trade) => sum + Number(trade.entry) * Number(trade.quantity), 0);
    
    // =======================================================
// FEATURE : PORTFOLIO SUMMARY ENGINE
// VERSION : v1.4
// =======================================================

const portfolioValue = totalInvestment + totalProfit;

const portfolioPercent =
    totalInvestment > 0
        ? ((totalProfit / totalInvestment) * 100).toFixed(2)
        : "0.00";

document.getElementById("portfolioValue").textContent =
    currency.format(portfolioValue);

const portfolioPnLElement =
    document.getElementById("portfolioPnL");

const sign = totalProfit >= 0 ? "+" : "";
const pnlClass = totalProfit >= 0 ? "pnl-positive" : "pnl-negative";

portfolioPnLElement.innerHTML = `
<span class="pnl-label">P&L :</span>
<span class="${pnlClass}">
    ${sign}${currency.format(totalProfit)}
    (${sign}${portfolioPercent}%)
</span>
`;// new update

portfolioPnLElement.style.color =
    totalProfit >= 0 ? "#22c55e" : "#ef4444";

document.getElementById("portfolioStatus").textContent =
    "🟢 Live Portfolio";

// =======================================================
// END
// =======================================================

    const wins = profits.filter((profit) => profit > 0).length;
    const losses = profits.filter((profit) => profit <= 0).length;

   animateValue(
    "totalTrades",
    0,
    trades.length,
    700
);
    animateValue(
    "totalProfit",
    0,
    totalProfit,
    900,
    value => currency.format(value)
);
    const totalProfitElement = document.getElementById("totalProfit");

if (totalProfit >= 0) {
    totalProfitElement.style.color = "#22c55e";   // Green
} else {
    totalProfitElement.style.color = "#ef4444";   // Red
}
    animateValue(
    "totalInvestment",
    0,
    totalInvestment,
    1000,
    value => currency.format(value)
);
    document.getElementById("winRate").textContent = `${trades.length ? Math.round((wins / trades.length) * 100) : 0}%`;
    const winRate = trades.length
    ? Math.round((wins / trades.length) * 100)
    : 0;

const winRateElement = document.getElementById("winRate");

animateValue(
    "winRate",
    0,
    winRate,
    700,
    value => `${value}%`
);

if (winRate >= 70) {
    winRateElement.style.color = "#22c55e";   // Green
} else if (winRate >= 40) {
    winRateElement.style.color = "#f59e0b";   // Orange
} else {
    winRateElement.style.color = "#ef4444";   // Red
}

// ===========================================
// Sprint 1 v1.0
// Update AI Insights after Dashboard Render
// ===========================================

updateAIInsights(
    trades.length,
    totalProfit,
    totalInvestment,
    wins,
    losses
);  

updateAICoach();
//rendor close

    document.getElementById("winStats").innerHTML =
    `🟢 ${wins} Wins • 🔴 ${losses} Loss`;
    document.getElementById("avgProfit").textContent = currency.format(trades.length ? totalProfit / trades.length : 0);
    
    const avgProfit = trades.length ? totalProfit / trades.length : 0;

const avgProfitElement = document.getElementById("avgProfit");

if (avgProfit >= 0) {
    avgProfitElement.style.color = "#22c55e";
} else {
    avgProfitElement.style.color = "#ef4444";
}
    document.getElementById("bestTrade").textContent = currency.format(profits.length ? Math.max(...profits) : 0);
    document.getElementById("worstTrade").textContent = currency.format(profits.length ? Math.min(...profits) : 0);


const worstTradeValue = profits.length ? Math.min(...profits) : 0;

const worstTradeElement = document.getElementById("worstTrade");

if (worstTradeValue < 0) {
    worstTradeElement.style.color = "#ef4444";
} else {
    worstTradeElement.style.color = "#22c55e";
}

// 👇 YAHAN ADD KARNA HAI

let streak = 0;
let maxStreak = 0;

trades.forEach((trade) => {

    if (getProfit(trade) > 0) {

        streak++;
        maxStreak = Math.max(maxStreak, streak);

    } else {
        streak = 0;
    }

});

document.getElementById("winStreak").textContent =
`${maxStreak} Wins`;

// ======================================
// Analytics Summary
// ======================================

// ROI
const roi =
    totalInvestment > 0
        ? ((totalProfit / totalInvestment) * 100).toFixed(2)
        : "0.00";

document.getElementById("roiValue").textContent =
    roi + "%";

// Accuracy
document.getElementById("accuracyValue").textContent =
    `${winRate}%`;

// Avg Risk : Reward
const winningTrades = profits.filter(p => p > 0);
const losingTrades = profits.filter(p => p < 0);

const avgWin =
    winningTrades.length
        ? winningTrades.reduce((a,b)=>a+b,0)/winningTrades.length
        : 0;

const avgLoss =
    losingTrades.length
        ? Math.abs(losingTrades.reduce((a,b)=>a+b,0)/losingTrades.length)
        : 0;

document.getElementById("rrValue").textContent =
avgLoss ? `1 : ${(avgWin/avgLoss).toFixed(1)}` : "1 : 0";

// Current Win Streak
let currentStreak = 0;

for(let i = trades.length - 1; i >= 0; i--){

    if(getProfit(trades[i]) > 0){

        currentStreak++;

    }else{

        break;

    }

}

document.getElementById("currentStreak").textContent =
`${currentStreak} Wins`;

// 👇 Iske baad ye code already hai
   /* tradeTableBody.innerHTML = trades.map((trade, index) => `
        <tr>
            <td>${escapeHtml(String(trade.symbol || ""))}</td>
            <td>${currency.format(Number(trade.entry) || 0)}</td>
            <td>${currency.format(Number(trade.exit) || 0)}</td>
            <td>${Number(trade.quantity) || 0}</td>
            <td>
                <span class="badge ${trade.type === 'BUY' ? 'buy' : 'sell'}">
                ${escapeHtml(String(trade.type || "BUY"))}
                </span>
            </td>
            <td>
    ${
        getProfit(trade) >= 0
        ? `<span class="profit-badge">
                +${currency.format(getProfit(trade))}
           </span>`
        : `<span class="loss-badge">
                -${currency.format(Math.abs(getProfit(trade)))}
           </span>`
    }
</td>
            <td>${formatTradeDate(trade.date)}</td>
            <td class="action-buttons">
                <button class="edit-btn" type="button" onclick="editTrade(${index})"> ✏ Edit</button>
                <button class="delete-btn" type="button" onclick="deleteTrade(${index})"> 🗑 Delete</button>
            </td>
         </tr>`).join(""); */

// ✅ Trade Counter
        document.getElementById("tradeCount").textContent =
    `Showing ${trades.length} Trade${trades.length !== 1 ? "s" : ""}`;

    applyFilters();

    // ===== Top Gainer / Top Loser =====

if (trades.length > 0) {

    const tradeProfits = trades.map(trade => ({
        symbol: trade.symbol,
        profit: getProfit(trade)
    }));

    const topGainer = tradeProfits.reduce((a, b) =>
        a.profit > b.profit ? a : b
    );

    const topLoser = tradeProfits.reduce((a, b) =>
        a.profit < b.profit ? a : b
    );

    document.getElementById("topGainerSymbol").textContent =
        topGainer.symbol;

    document.getElementById("topGainerProfit").textContent =
        `₹${topGainer.profit.toLocaleString()}`;

    document.getElementById("topLoserSymbol").textContent =
        topLoser.symbol;

    document.getElementById("topLoserProfit").textContent =
        `₹${topLoser.profit.toLocaleString()}`;

}

renderCharts(profits);
renderTradeTable();
renderMonthlyCalendar();

}


//NEW ADD

function renderCharts(profits) {
    if (typeof Chart === "undefined") return;
    ["profitChart", "barChart", "pieChart", "equityChart"].forEach((id) => {
        const chart = Chart.getChart(id);
        if (chart) chart.destroy();
    });
    const labels = trades.map((trade) => trade.symbol);
    const wins = profits.filter((profit) => profit > 0).length;
    const losses = profits.filter((profit) => profit <= 0).length;
    const options = { responsive: true, maintainAspectRatio: false };
    new Chart(document.getElementById("profitChart"), { type: "line", data: { labels, datasets: [{ label: "Profit", data: profits, tension: 0.3 }] }, options });
    
  const barColors = profits.map(value =>
    value >= 0 ? "#22c55e" : "#ef4444"
);

new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
        labels,   // ✅ Ye use karo
        datasets: [{
            label: "Profit",
            data: profits,
            backgroundColor: barColors,
            borderRadius: 8,
            borderSkipped: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1200
        },
        plugins: {
            legend: {
                labels: {
                    color: "#ffffff"
                }
            }
        },
        scales: {
            x: {
                ticks: {
                      color: "#cbd5e1",
                      autoSkip: false,
                      maxRotation: 0,
                      minRotation: 0,
               font: {
                    size: 10
                   }
                },
                grid: {
                    color: "rgba(255,255,255,.05)"
                }
            },
            y: {
                ticks: {
                    color: "#cbd5e1"
                },
                grid: {
                    color: "rgba(255,255,255,.05)"
                }
            }
        }
        
    }
});
    
    const buyCount = trades.filter(t => t.type === "BUY").length;
const sellCount = trades.filter(t => t.type === "SELL").length;

new Chart(document.getElementById("pieChart"), {
    type: "doughnut",
    data: {
        labels: ["BUY", "SELL"],
        datasets: [{
            data: [buyCount, sellCount],
            backgroundColor: ["#22c55e", "#ef4444" ],
                borderWidth: 0,
                hoverOffset: 15
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout:"55%",
        plugins: {
            legend: {
                labels: {
                    color: "#fff"
                }
            }
        }
    }
});

// ===== Equity Curve =====

let cumulative = [];
let total = 0;

profits.forEach(p => {
    total += p;
    cumulative.push(total);
});

new Chart(document.getElementById("equityChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Equity",
            data: cumulative,
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,.15)",
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 7
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1500
        },
        plugins: {
            legend: {
                labels: {
                    color: "#ffffff",
                    display: false
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: "#cbd5e1"
                },
                grid: {
                    color: "rgba(255,255,255,.05)"
                }
            },
            y: {
                ticks: {
                    color: "#cbd5e1"
                },
                grid: {
                    color: "rgba(255,255,255,.05)"
                }
            }
        }
    }
});

}

function exportCSV() {
    const rows = [["Symbol", "Entry", "Exit", "Quantity", "Type", "Profit", "Date"], ...trades.map((trade) => [trade.symbol, trade.entry, trade.exit, trade.quantity, trade.type, getProfit(trade), trade.date])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "TraderOS_Trades.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

function exportPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let totalProfit = trades.reduce((sum, trade) => sum + getProfit(trade), 0);
    let totalInvestment = trades.reduce((sum, trade) => {
        return sum + (trade.entry * trade.quantity);
    },0);

    doc.setFontSize(20);
    doc.text("TraderOS AI",20,20);

    doc.setFontSize(14);
    doc.text("Trade Report",20,32);

    doc.setFontSize(12);
    doc.text("Total Trades : " + trades.length,20,50);
    doc.text("Total Profit : ₹" + totalProfit,20,60);
    doc.text("Investment : ₹" + totalInvestment,20,70);
    doc.text("--------------------------------------",20,82);
    let y = 95;
    trades.forEach((trade)=>{
        doc.text(
            `${trade.symbol} | ${trade.type} | ₹${getProfit(trade)}`,
            20,
            y
        );

    
        y += 10;
    });
    doc.save("TraderOS_Report.pdf");
    //PDF code
}

async function apiRequest(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        credentials: "same-origin"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || "Something went wrong.");
    return payload;
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await apiRequest("/api/logout", { method: "POST" });
    } finally {
        window.location.href = "index.html";
    }
});

async function initialiseDashboard() {
    try {
        const [{ user }, { trades: storedTrades }] = await Promise.all([
            apiRequest("/api/session", { method: "GET" }),
            apiRequest("/api/trades", { method: "GET" })
        ]);
        if (!user) throw new Error("Not logged in");
        trades = Array.isArray(storedTrades) ? storedTrades : [];
        document.getElementById("welcomeUser").textContent = `Welcome, ${user.name}`;
        render();
    }
    
    catch (error) {

    console.error(error);
    alert(error.message);

}

}

initialiseDashboard();


/* =======================================================
FEATURE : ANIMATED DASHBOARD NUMBERS
VERSION : v1.5
SPRINT : Dashboard Polish
AUTHOR : Nk 
======================================================= */

function animateValue(elementId, start, end, duration, formatter = value => value){

    const element = document.getElementById(elementId);

    if(!element) return;

    const range = end - start;

    const startTime = performance.now();

    function update(currentTime){

        const progress = Math.min((currentTime - startTime) / duration, 1);

        const value = start + (range * progress);

        element.textContent = formatter(Math.round(value));

        if(progress < 1){

            requestAnimationFrame(update);

        }

    }

    requestAnimationFrame(update);

}

/* END ANIMATION */

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    toast.className = "";

    toast.classList.add(type);

    toast.classList.add("show");

    toast.textContent = message;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

if (menuBtn && sidebar && overlay) {

    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("show");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("show");
    });

    // =======================================================
// FEATURE : DESKTOP COLLAPSE SIDEBAR
// VERSION : v1.3
// =======================================================

menuBtn.addEventListener("dblclick", () => {

    sidebar.classList.toggle("collapsed");

});

}

// =======================================================
// END
// =======================================================

// =======================================================
// FEATURE : PRO UPGRADE MODAL
// VERSION : v1.3
// SPRINT : 2.3
// AUTHOR : Nk
// PURPOSE : Lock Premium Modules
// =======================================================

const upgradeModal = document.getElementById("upgradeModal");
const closeUpgradeModal = document.getElementById("closeUpgradeModal");
const maybeLaterBtn = document.getElementById("maybeLaterBtn");
const upgradeNowBtn = document.getElementById("upgradeNowBtn");

const lockedFeatures = document.querySelectorAll(".locked-feature");

lockedFeatures.forEach((item) => {

    item.addEventListener("click", (e) => {

        e.preventDefault();

        upgradeModal.style.display = "flex";

    });

});

function closeUpgradePopup(){

    upgradeModal.style.display = "none";

}

closeUpgradeModal.addEventListener("click", closeUpgradePopup);

maybeLaterBtn.addEventListener("click", closeUpgradePopup);

upgradeModal.addEventListener("click", (e)=>{

    if(e.target===upgradeModal){

        closeUpgradePopup();

    }

});

upgradeNowBtn.addEventListener("click", ()=>{

    closeUpgradePopup();

    showToast("🚀 TraderOS AI Pro is coming soon!", "info");

});


