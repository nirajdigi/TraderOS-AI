const $ = (id) => document.getElementById(id);

const API = {
    LOGIN: "/api/login",
    LOGOUT: "/api/logout",
    REGISTER: "/api/register",
    SESSION: "/api/session",
    TRADES: "/api/trades"
};
 

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

function calculateRisk() {
    const capital = Number($("capital").value);
    const risk = Number($("riskPercent").value);
    const result = $("result");

    if (!Number.isFinite(capital) || capital <= 0) {
        result.textContent = "Capital must be greater than ₹0.";
        return;
    }
    if (!Number.isFinite(risk) || risk <= 0 || risk > 100) {
        result.textContent = "Risk percentage must be between 0 and 100.";
        return;
    }
    result.textContent = `Maximum Risk = ₹${(capital * risk / 100).toFixed(2)}`;
}

function calculatePosition() {
    const capital = Number($("capital2").value);
const risk = Number($("risk2").value);
const entry = Number($("entry").value);
const stoploss = Number($("stoploss").value);
const result = $("positionResult");

    if (!Number.isFinite(capital) || capital <= 0 || !Number.isFinite(entry) || entry <= 0 || !Number.isFinite(stoploss) || stoploss < 0) {
        result.textContent = "Capital and entry must be greater than ₹0; stop loss cannot be negative.";
        return;
    }
    if (!Number.isFinite(risk) || risk <= 0 || risk > 100) {
        result.textContent = "Risk percentage must be between 0 and 100.";
        return;
    }
    const perShareRisk = entry - stoploss;
    if (perShareRisk <= 0) {
        result.textContent = "Stop Loss should be lower than Entry Price.";
        return;
    }
    const quantityByRisk = Math.floor((capital * risk / 100) / perShareRisk);
    const quantityByCapital = Math.floor(capital / entry);
    const quantity = Math.min(quantityByRisk, quantityByCapital);
    if (quantity < 1) {
        result.textContent = "Your capital or risk limit is too low to buy one share.";
        return;
    }
    result.textContent = `Recommended Quantity = ${quantity} Shares`;
}

async function saveTrade() {
    const date = $("date").value;
const symbol = $("stock").value.trim().toUpperCase();
   const saveButton = $("saveJournalTradeBtn");
   const entry = Number($("entryPrice").value);
   const exit = Number($("exitPrice").value);
   const quantity = Number($("quantity").value);
   const type = $("tradeType").value;
   const stopLoss = $("stopLoss").value;
   const target = $("target").value;
   const emotion = $("emotion").value.trim();
   const notes = $("notes").value.trim();
   const output = $("tradeOutput");

    if (!date || !symbol || !Number.isFinite(entry) || !Number.isFinite(exit) || !Number.isFinite(quantity) || entry <= 0 || exit <= 0 || quantity <= 0 || !Number.isInteger(quantity)) {
        output.textContent = "Enter a date, symbol, valid prices, and a quantity greater than zero.";
        return;
    }

    const trade = {
        symbol,
        entry,
        exit,
        quantity,
        type,
        date: new Date(`${date}T12:00:00`).toISOString(),
        stopLoss,
        target,
        emotion,
        notes
    };
    try {
        await apiRequest(API.TRADES, { method: "POST", body: JSON.stringify(trade) });
    } catch (error) {
        output.textContent = error.message;
        return;
    }

    const profit = (type === "SELL" ? entry - exit : exit - entry) * quantity;
    output.replaceChildren();
    const heading = document.createElement("h3");
    heading.textContent = "Trade saved to your dashboard";
    const summary = document.createElement("p");
    summary.textContent = `${symbol} · ${type} · Profit: ₹${profit.toFixed(2)}`;
    const dashboardLink = document.createElement("a");
    dashboardLink.href = "dashboard.html";
    dashboardLink.textContent = "Open Dashboard";
    output.append(heading, summary, dashboardLink);

    $("stock").value = "";
    $("entryPrice").value = "";
    $("exitPrice").value = "";
    $("quantity").value = "";
    $("stopLoss").value = "";
    $("target").value = "";
    $("emotion").value = "";
    $("notes").value = "";
    saveButton.disabled = true;
    window.setTimeout(() => { saveButton.disabled = false; }, 500);
}

function openLogin() {
    $("loginModal").style.display = "block";
}
function closeLogin() {
    $("loginModal").style.display = "none";
}
function openRegister() {
    $("registerPopup").style.display = "flex";
}
function closeRegister() {
    $("registerPopup").style.display = "none";
}

async function registerUser() {
    const name = $("registerName").value.trim();
    const email = $("registerEmail").value.trim();
    const password = $("registerPassword").value;
    const confirmPassword =$("confirmPassword").value;

    if (!name || !email || !password || !confirmPassword) {
        alert("Please fill all fields.");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    try {
        const result = await apiRequest(API.REGISTER, {
            method: "POST",
            body: JSON.stringify({ name, email, password })
        });
        alert(result.message);
        closeRegister();
        openLogin();
    } catch (error) {
        alert(error.message);
    }
}

async function loginUser() {
    const email = $("loginEmail").value.trim();
    const password =$("loginPassword").value;

    try {
      
        await apiRequest(API.LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password })
});
        closeLogin();
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
    }
}

async function logoutUser() {
    try {
        await apiRequest(API.LOGOUT, { method: "POST" });
    } catch (error) {
        alert(error.message);
        return;
    }
    $("loginBtn").style.display = "inline-block";
    $("registerBtn").style.display = "inline-block";
    $("welcomeUser").style.display = "none";
    $("logoutBtn").style.display = "none";
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { user } = await apiRequest(API.SESSION, { method: "GET" });
        if (!user) return;
        $("loginBtn").style.display = "none";
        $("registerBtn").style.display = "none";
        $("welcomeUser").style.display = "inline";
        $("logoutBtn").style.display = "inline";
        $("welcomeUser").textContent = `Welcome ${user.name}`;
    } catch {
        // The app must be served through `node server.js` for authentication to work.
    }
});
