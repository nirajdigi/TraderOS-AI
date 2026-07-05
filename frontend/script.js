function welcome(){
    alert("Welcome to TraderOS AI!");
}
function calculateRisk() {

    let capital = Number(document.getElementById("capital").value);

    let risk = Number(document.getElementById("riskPercent").value);

    let riskAmount = capital * risk / 100;

    document.getElementById("result").innerHTML =
    "Maximum Risk = ₹" + riskAmount;

}
function calculatePosition() {

    let capital = Number(document.getElementById("capital2").value);
    let risk = Number(document.getElementById("risk2").value);
    let entry = Number(document.getElementById("entry").value);
    let stoploss = Number(document.getElementById("stoploss").value);

    let riskAmount = capital * risk / 100;
    let perShareRisk = entry - stoploss;

    if (perShareRisk <= 0) {
        document.getElementById("positionResult").innerHTML =
        "Stop Loss should be lower than Entry Price.";
        return;
    }

    let quantity = Math.floor(riskAmount / perShareRisk);

    document.getElementById("positionResult").innerHTML =
    "Recommended Quantity = " + quantity + " Shares";
}

function saveTrade() {

    let date = document.getElementById("date").value;
    let stock = document.getElementById("stock").value;
    let entry = document.getElementById("entryPrice").value;
    let stop = document.getElementById("stopLoss").value;
    let target = document.getElementById("target").value;
    let emotion = document.getElementById("emotion").value;
    let notes = document.getElementById("notes").value;

    document.getElementById("tradeOutput").innerHTML = `
        <h3>Trade Saved ✅</h3>
        <p><b>Date:</b> ${date}</p>
        <p><b>Stock:</b> ${stock}</p>
        <p><b>Entry:</b> ₹${entry}</p>
        <p><b>Stop Loss:</b> ₹${stop}</p>
        <p><b>Target:</b> ₹${target}</p>
        <p><b>Emotion:</b> ${emotion}</p>
        <p><b>Notes:</b> ${notes}</p>
    `;
}