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
    alert("Trade Saved Successfully!");
    tradeModal.style.display = "none";
}