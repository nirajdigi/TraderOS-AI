/* =====================================================
   MODULE : AI Engine
   FILE   : ai-engine.js
   VERSION: 2.0
   PURPOSE: AI Insights & Coaching
===================================================== */

// ======================================
// Update AI Insights
// ======================================

function updateAIInsights(
    totalTrades,
    totalProfit,
    totalInvestment,
    wins,
    losses
) {

    const winRate =
        totalTrades
            ? Math.round((wins / totalTrades) * 100)
            : 0;

    // AI Elements
    const aiScore = document.getElementById("aiScore");
    const winRateStatus = document.getElementById("winRateStatus");
    const riskStatus = document.getElementById("riskStatus");
    const warningStatus = document.getElementById("warningStatus");
    const aiRecommendation = document.getElementById("aiRecommendation");

    let score = 50;

    // ===========================
    // Win Rate Analysis
    // ===========================

    if (winRate >= 80) {
        score += 25;
        winRateStatus.textContent = "Excellent";
    }
    else if (winRate >= 60) {
        score += 15;
        winRateStatus.textContent = "Good";
    }
    else {
        winRateStatus.textContent = "Needs Improvement";
    }

    // ===========================
    // Profit Analysis
    // ===========================

    if (totalProfit > 0) {
        score += 15;
    }

    // ===========================
    // Trade Count
    // ===========================

    if (totalTrades >= 10) {
        score += 10;
    }

    // ===========================
    // Final Score
    // ===========================

    score = Math.min(score, 100);

    aiScore.textContent = score;

    // ===========================
    // Risk
    // ===========================

    if (score >= 80) {

        riskStatus.textContent = "Controlled";

        warningStatus.textContent =
            "No major issues detected";

        aiRecommendation.textContent =
            "Excellent performance. Continue following your trading plan.";

    }

    else if (score >= 60) {

        riskStatus.textContent = "Moderate";

        warningStatus.textContent =
            "Review recent trades.";

        aiRecommendation.textContent =
            "Maintain discipline and improve risk management.";

    }

    else {

        riskStatus.textContent = "High";

        warningStatus.textContent =
            "High trading risk detected.";

        aiRecommendation.textContent =
            "Reduce position size and avoid emotional trading.";

    }

}

function updateAICoach() {

    // No Trades Safety Check
    if (!trades.length) {

        document.getElementById("bestStock").textContent = "No Data";
        document.getElementById("bestDay").textContent = "No Data";
        document.getElementById("bestTradeType").textContent = "No Data";
        document.getElementById("aiSuggestion").textContent =
            "Start adding trades...";

        return;
    }

    let stockProfit = {};
    let dayProfit = {};
    let buyProfit = 0;
    let sellProfit = 0;

    trades.forEach(trade => {

        const profit = getProfit(trade);

        // Stock Profit
        stockProfit[trade.symbol] =
            (stockProfit[trade.symbol] || 0) + profit;

        // Day Profit
        const dayName = new Date(trade.date)
            .toLocaleDateString("en-US", { weekday: "long" });

        dayProfit[dayName] =
            (dayProfit[dayName] || 0) + profit;

        // Trade Type
        if (trade.type === "BUY") {
            buyProfit += profit;
        } else {
            sellProfit += profit;
        }

    });

    // Best Stock
    const bestStock = Object.keys(stockProfit)
        .reduce((a, b) =>
            stockProfit[a] > stockProfit[b] ? a : b
        ); 

    // Best Day
    const bestDay = Object.keys(dayProfit)
        .reduce((a, b) =>
            dayProfit[a] > dayProfit[b] ? a : b
        );

    document.getElementById("bestStock").textContent = bestStock;
    document.getElementById("bestDay").textContent = bestDay;

// Best Trade Type
const bestTradeType =
    buyProfit >= sellProfit
        ? "BUY"
        : "SELL";

document.getElementById("bestTradeType").textContent =
    bestTradeType;

    // =====================================
// Consecutive Loss Detection
// =====================================

let lossStreak = 0;
let maxLossStreak = 0;

trades.forEach(trade => {

    if (getProfit(trade) < 0) {

        lossStreak++;

        if (lossStreak > maxLossStreak) {

            maxLossStreak = lossStreak;

        }

    } else {

        lossStreak = 0;

    }

});

let suggestions = [];

// Rule 1
if (buyProfit >= sellProfit) {

    suggestions.push("📈 Focus on BUY setups.");

} else {

    suggestions.push("✓ 📈 Improve BUY entries.");

}

// Rule 2
suggestions.push("✓ ⚖ Keep risk below 2%");

// Rule 3
suggestions.push("✓ 🎯 Maintain RR above 1:2");

// -------------------------------------
// Rule 4 : Consecutive Losses
// -------------------------------------

if (maxLossStreak >= 3) {

    suggestions.push(
        "✓ 🚨 You have " +
        maxLossStreak +
        " consecutive losing trades."
    );

    suggestions.push(
        "✓ 🛑 Take a break and review your journal."
    );

}

// Update Coach
document.getElementById("aiSuggestion").innerHTML =
    suggestions.join("<br>");

}
