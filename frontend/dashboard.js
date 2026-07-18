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

let editIndex= -1;
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

if (editIndex === -1){
    trade.date = new
    Date().toLocaleString();
} else{
trade.date = trades[editIndex].date;
}

if (editIndex === -1){
trades.push(trade);
} else{
    trades[editIndex] = trade;
    editIndex = -1;
}
localStorage.setItem("trades", JSON.stringify(trades));

    alert("Trade Saved Successfully!");
    tradeModal.style.display = "none";
    location.reload();
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
    <td><button onclick="editTrade(${index})">Edit</button>
    <button onclick="deleteTrade(${index})">Delete</button></td>
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

function editTrade(index) {

    editIndex = index;

    let trades = JSON.parse(localStorage.getItem("trades")) || [];

    let trade = trades[index];

    document.getElementById("tradeSymbol").value = trade.symbol;
    document.getElementById("entryPrice").value = trade.entry;
    document.getElementById("exitPrice").value = trade.exit;
    document.getElementById("quantity").value = trade.quantity;
    document.getElementById("tradeType").value = trade.type;

    document.getElementById("tradeModal").style.display = "flex";
}


const labels = [];
const profits = [];

trades.forEach((trade) => {

    let profit = 0;

    if (trade.type === "BUY") {
        profit = (Number(trade.exit) - Number(trade.entry)) * Number(trade.quantity);
    } else {
        profit = (Number(trade.entry) - Number(trade.exit)) * Number(trade.quantity);
    }

    labels.push(trade.symbol);
    profits.push(profit);

});

const ctx = document.getElementById("profitChart");

new Chart(ctx, {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Profit",
            data: profits,
            tension: 0.3
        }]
    }
});

//search box area

function searchTrade() {

    let input = document.getElementById("searchTrade").value.toLowerCase();

    let rows = document.querySelectorAll("#tradeTable tbody tr");

    rows.forEach(function(row){

        let symbol = row.cells[0].innerText.toLowerCase();

        if(symbol.includes(input)){
            row.style.display = "";
        }else{
            row.style.display = "none";
        }

    });

}

function filterTradeByDate() {

    let selectedDate = document.getElementById("filterDate").value;

    let rows = document.querySelectorAll("#tradeTable tbody tr");

    rows.forEach(function(row){

        let rowDate = row.cells[6].innerText.split(",")[0];

        let tradeDate = new Date(rowDate);

        let formattedDate =
            tradeDate.getFullYear() + "-" +
            String(tradeDate.getMonth()+1).padStart(2,"0") + "-" +
            String(tradeDate.getDate()).padStart(2,"0");

        if(selectedDate==="" || formattedDate===selectedDate){
            row.style.display="";
        }else{
            row.style.display="none";
        }

    });

}