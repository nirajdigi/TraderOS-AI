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
