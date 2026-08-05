// ======================================
// Calendar Engine
// TraderOS AI
// ======================================

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

function updateCalendarTitle(){

    const months = [

        "January","February","March","April",
        "May","June","July","August",
        "September","October","November","December"

    ];

    document.getElementById("calendarTitle").textContent =
        `${months[currentMonth]} ${currentYear}`;

}

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("prevMonth")?.addEventListener("click", () => {

        currentMonth--;

        if(currentMonth < 0){

            currentMonth = 11;

            currentYear--;

        }

        renderMonthlyCalendar();

    });

    document.getElementById("nextMonth")?.addEventListener("click", () => {

        currentMonth++;
        if(currentMonth > 11){

            currentMonth = 0;

            currentYear++;

        }

        renderMonthlyCalendar();

    });

});

function renderMonthlyCalendar() {
    updateCalendarTitle();
    const calendar = document.getElementById("calendarGrid");
    if (!calendar) return;

    calendar.innerHTML = "";

    const dailyProfit = {};

   // Calculate daily P&L (Current Month Only)
trades.forEach(trade => {

    const tradeDate = new Date(trade.date);

    if (
        tradeDate.getMonth() !== currentMonth ||
        tradeDate.getFullYear() !== currentYear
    ){
        return;
    }

    const day = tradeDate.getDate();

    if (!dailyProfit[day]) {
        dailyProfit[day] = 0;
    }

    dailyProfit[day] += getProfit(trade);

});

    const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
).getDate();

for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");

        cell.classList.add("calendar-day");
        if (dailyProfit[day] > 0) {
            cell.classList.add("calendar-profit");
        } else if (dailyProfit[day] < 0) {
            cell.classList.add("calendar-loss");
        } else {

            cell.classList.add("calendar-empty");
        }
        cell.innerHTML = `
<div class="day-number">${day}</div>
<div class="day-profit">
    ${
        dailyProfit[day]
        ? (dailyProfit[day] > 0
            ? "+₹" + Math.round(dailyProfit[day]/1000) + "K"
            : "-₹" + Math.round(Math.abs(dailyProfit[day])/1000) + "K")
        : ""
    }
</div>
`;
       if (dailyProfit[day] !== undefined) {

    cell.title =
        `Day ${day}\nProfit: ₹${dailyProfit[day].toLocaleString()}`;

    // 👇 ADD THIS
    cell.style.cursor = "pointer";

    cell.onclick = () => openCalendarModal(day);
}
calendar.appendChild(cell);
    }

}

// ===============================
// Calendar Trade Modal
// ===============================

function openCalendarModal(day) {

    const modal = document.getElementById("calendarTradeModal");
    const title = document.getElementById("tradeModalDate");
    const body = document.getElementById("tradeModalBody");
    title.innerHTML = `📅 Trades - ${day}`;
   const dayTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.date);
    return (
        tradeDate.getDate() === day &&
        tradeDate.getMonth() === currentMonth &&
        tradeDate.getFullYear() === currentYear
    );
});

    if(dayTrades.length === 0){
        body.innerHTML = "<p>No trades found for this day.</p>";
    }else{

        body.innerHTML = dayTrades.map(trade => `
            <div class="trade-item">
                <h3>${trade.symbol}</h3>
                <p><b>Type:</b> ${trade.type}</p>
                <p><b>Entry:</b> ₹${trade.entry}</p>
                <p><b>Exit:</b> ₹${trade.exit}</p>
                <p><b>Qty:</b> ${trade.quantity}</p>
                <p><b>Profit:</b>
                <span style="color:${getProfit(trade)>=0 ? '#22c55e' : '#ef4444'}">
                ${currency.format(getProfit(trade))}
                </span>
                </p>
            </div>
        `).join("");
    }
    modal.style.display="flex";
}

function closeCalendarModal() {
    document.getElementById("calendarTradeModal").style.display = "none";
}