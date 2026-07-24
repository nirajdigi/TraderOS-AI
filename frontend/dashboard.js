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
        alert("Enter a symbol, positive prices, and a whole quantity greater than zero.");
        return;
    }

    try {
        const existingTrade = editIndex >= 0 ? trades[editIndex] : {};
        const trade = { ...existingTrade, symbol, entry, exit, quantity, type, date: existingTrade.date || new Date().toISOString() };
        const result = await apiRequest(editIndex >= 0 ? `/api/trades/${existingTrade.id}` : "/api/trades", {
            method: editIndex >= 0 ? "PUT" : "POST",
            body: JSON.stringify(trade)
        });
        if (editIndex >= 0) trades[editIndex] = result.trade;
        else trades.push(result.trade);
    } catch (error) {
        alert(error.message);
        return;
    }
    closeTradeModal();
    render();
});

function editTrade(index) {
    editIndex = index;
    const trade = trades[index];
    document.getElementById("tradeSymbol").value = trade.symbol;
    document.getElementById("entryPrice").value = trade.entry;
    document.getElementById("exitPrice").value = trade.exit;
    document.getElementById("quantity").value = trade.quantity;
    document.getElementById("tradeType").value = trade.type;
    openTradeModal();
}

async function deleteTrade(index) {
    if (!confirm("Delete this trade?")) return;
    try {
        await apiRequest(`/api/trades/${trades[index].id}`, { method: "DELETE" });
        trades.splice(index, 1);
    } catch (error) {
        alert(error.message);
        return;
    }
    render();
}


function render() {


    const profits = trades.map(getProfit);
    const totalProfit = profits.reduce((sum, profit) => sum + profit, 0);
    const totalInvestment = trades.reduce((sum, trade) => sum + Number(trade.entry) * Number(trade.quantity), 0);
    const wins = profits.filter((profit) => profit > 0).length;

    document.getElementById("totalTrades").textContent = trades.length;
    document.getElementById("totalProfit").textContent = currency.format(totalProfit);
    document.getElementById("totalInvestment").textContent = currency.format(totalInvestment);
    document.getElementById("winRate").textContent = `${trades.length ? Math.round((wins / trades.length) * 100) : 0}%`;
    document.getElementById("avgProfit").textContent = currency.format(trades.length ? totalProfit / trades.length : 0);
    document.getElementById("bestTrade").textContent = currency.format(profits.length ? Math.max(...profits) : 0);
    document.getElementById("worstTrade").textContent = currency.format(profits.length ? Math.min(...profits) : 0);

    tradeTableBody.innerHTML = trades.map((trade, index) => `
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
            <td class="${getProfit(trade) >= 0 ? 'profit' : 'loss'}">
                 ${currency.format(getProfit(trade))}
            </td>
            <td>${formatTradeDate(trade.date)}</td>
            <td class="action-buttons">
                <button class="edit-btn" type="button" onclick="editTrade(${index})"> ✏ Edit</button>
                <button class="delete-btn" type="button" onclick="deleteTrade(${index})"> 🗑 Delete</button>
            </td>
        </tr>`).join("");

    applyFilters();
    renderCharts(profits);
   //rendor ka sara code
}


function applyFilters() {
    const search = document.getElementById("searchTrade").value.trim().toLowerCase();
    const date = document.getElementById("filterDate").value;
    const type = document.getElementById("tradeTypeFilter").value;
    [...tradeTableBody.rows].forEach((row, index) => {
        const trade = trades[index];
        const matches = String(trade.symbol || "").toLowerCase().includes(search) && (!date || String(trade.date || "").slice(0, 10) === date) && (!type || trade.type === type);
        row.style.display = matches ? "" : "none";
    });
}

function searchTrade() { applyFilters(); }
function filterTradeByDate() { applyFilters(); }
function filterTradeType() { applyFilters(); }

function renderCharts(profits) {
    if (typeof Chart === "undefined") return;
    ["profitChart", "barChart", "pieChart"].forEach((id) => {
        const chart = Chart.getChart(id);
        if (chart) chart.destroy();
    });
    const labels = trades.map((trade) => trade.symbol);
    const wins = profits.filter((profit) => profit > 0).length;
    const losses = profits.filter((profit) => profit <= 0).length;
    const options = { responsive: true, maintainAspectRatio: false };
    new Chart(document.getElementById("profitChart"), { type: "line", data: { labels, datasets: [{ label: "Profit", data: profits, tension: 0.3 }] }, options });
    new Chart(document.getElementById("barChart"), { type: "bar", data: { labels, datasets: [{ label: "Profit", data: profits }] }, options });
    new Chart(document.getElementById("pieChart"), { type: "pie", data: { labels: ["Win", "Loss"], datasets: [{ data: [wins, losses] }] }, options });
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
    } catch {
        window.location.href = "index.html";
    }
}

initialiseDashboard();

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