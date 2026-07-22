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
    const capital = Number(document.getElementById("capital").value);
    const risk = Number(document.getElementById("riskPercent").value);
    const result = document.getElementById("result");

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
    const capital = Number(document.getElementById("capital2").value);
    const risk = Number(document.getElementById("risk2").value);
    const entry = Number(document.getElementById("entry").value);
    const stoploss = Number(document.getElementById("stoploss").value);
    const result = document.getElementById("positionResult");

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
    const saveButton = document.getElementById("saveJournalTradeBtn");
    const date = document.getElementById("date").value;
    const symbol = document.getElementById("stock").value.trim().toUpperCase();
    const entry = Number(document.getElementById("entryPrice").value);
    const exit = Number(document.getElementById("exitPrice").value);
    const quantity = Number(document.getElementById("quantity").value);
    const type = document.getElementById("tradeType").value;
    const stopLoss = document.getElementById("stopLoss").value;
    const target = document.getElementById("target").value;
    const emotion = document.getElementById("emotion").value.trim();
    const notes = document.getElementById("notes").value.trim();
    const output = document.getElementById("tradeOutput");

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
        await apiRequest("/api/trades", { method: "POST", body: JSON.stringify(trade) });
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

    document.getElementById("stock").value = "";
    document.getElementById("entryPrice").value = "";
    document.getElementById("exitPrice").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("stopLoss").value = "";
    document.getElementById("target").value = "";
    document.getElementById("emotion").value = "";
    document.getElementById("notes").value = "";
    saveButton.disabled = true;
    window.setTimeout(() => { saveButton.disabled = false; }, 500);
}

function openLogin() {
    document.getElementById("loginModal").style.display = "block";
}

function closeLogin() {
    document.getElementById("loginModal").style.display = "none";
}

function openRegister() {
    document.getElementById("registerPopup").style.display = "flex";
}

function closeRegister() {
    document.getElementById("registerPopup").style.display = "none";
}

async function registerUser() {
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !email || !password || !confirmPassword) {
        alert("Please fill all fields.");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    try {
        const result = await apiRequest("/api/register", {
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
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        await apiRequest("/api/login", { method: "POST", body: JSON.stringify({ email, password }) });
        closeLogin();
        window.location.href = "dashboard.html";
    } catch (error) {
        alert(error.message);
    }
}

async function logoutUser() {
    try {
        await apiRequest("/api/logout", { method: "POST" });
    } catch (error) {
        alert(error.message);
        return;
    }
    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("registerBtn").style.display = "inline-block";
    document.getElementById("welcomeUser").style.display = "none";
    document.getElementById("logoutBtn").style.display = "none";
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { user } = await apiRequest("/api/session", { method: "GET" });
        if (!user) return;
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("registerBtn").style.display = "none";
        document.getElementById("welcomeUser").style.display = "inline";
        document.getElementById("logoutBtn").style.display = "inline";
        document.getElementById("welcomeUser").textContent = `Welcome ${user.name}`;
    } catch {
        // The app must be served through `node server.js` for authentication to work.
    }
});
