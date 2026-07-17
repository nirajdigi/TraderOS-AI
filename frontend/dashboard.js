// ===== Add Trade Popup =====

const addTradeBtn = document.getElementById("addTradeBtn");
const tradeModal = document.getElementById("tradeModal");
const closeTradeBtn = document.getElementById("closeTradeBtn");

addTradeBtn.onclick = function () {
    tradeModal.style.display = "flex";
}

closeTradeBtn.onclick = function () {
    tradeModal.style.display = "none";
}

window.onclick = function(event){
    if(event.target == tradeModal){
        tradeModal.style.display = "none";
    }
}

const saveTradeBtn = document.getElementById("saveTradeBtn");

saveTradeBtn.onclick = function () {
    const trade = {
    symbol: document.getElementById("tradeSymbol").value,
    entry: document.getElementById("entryPrice").value,
    exit: document.getElementById("exitPrice").value,
    quantity: document.getElementById("quantity").value,
    type: document.getElementById("tradeType").value
};

localStorage.setItem("lastTrade", JSON.stringify(trade));

let trades = JSON.parse(localStorage.getItem("trades")) || [];

trade.date = new Date().toLocaleDateString();

trades.push(trade);

localStorage.setItem("trades", JSON.stringify(trades));

    alert("Trade Saved Successfully!");
    tradeModal.style.display = "none";
}

const totalTrades = document.getElementById("totalTrades");

const trade = JSON.parse(localStorage.getItem("lastTrade"));

if (trade) {

    let profit = 0;

    if (trade.type === "BUY") {
        profit = (Number(trade.exit) - Number(trade.entry)) * Number(trade.quantity);
    } else {
        profit = (Number(trade.entry) - Number(trade.exit)) * Number(trade.quantity);
    }

    document.getElementById("totalTrades").innerText = "1";
    document.getElementById("totalProfit").innerText = "₹" + profit;
}


const tradeTableBody = document.getElementById("tradeTableBody");

const trades = JSON.parse(localStorage.getItem("trades")) || [];

tradeTableBody.innerHTML = "";

trades.forEach((trade, index) => {

    let profit = 0;

    if (trade.type === "BUY") {
        profit = (Number(trade.exit) - Number(trade.entry)) * Number(trade.quantity);
    } else {
        profit = (Number(trade.entry) - Number(trade.exit)) * Number(trade.quantity);
    }

   tradeTableBody.innerHTML += `
<tr>
    <td>${trade.symbol}</td>
    <td>${trade.entry}</td>
    <td>${trade.exit}</td>
    <td>${trade.quantity}</td>
    <td>${trade.type}</td>
    <td>₹${profit}</td>
    <td>${trade.date}</td>
    <td><button onclick="deleteTrade(${index})">Delete</button></td>
</tr>
`;

});

function deleteTrade(index) {

    let trades = JSON.parse(localStorage.getItem("trades")) || [];

    if (confirm("Are you sure you want to delete this trade?")) {

        trades.splice(index, 1);

        localStorage.setItem("trades", JSON.stringify(trades));

        location.reload();
    }
}


let totalProfit = 0;
let winTrades = 0;

trades.forEach((trade) => {
    let profit = 0;

    if (trade.type === "BUY") {
        profit = (Number(trade.exit) - Number(trade.entry)) * Number(trade.quantity);
    } else {
        profit = (Number(trade.entry) - Number(trade.exit)) * Number(trade.quantity);
    }

    totalProfit += profit;

    if (profit > 0) {
        winTrades++;
    }
});

document.getElementById("totalTrades").innerText = trades.length;
document.getElementById("totalProfit").innerText = "₹" + totalProfit;

const winRate =
    trades.length > 0
        ? Math.round((winTrades / trades.length) * 100)
        : 0;

document.getElementById("winRate").innerText = winRate + "%";