
/* =====================================================
   MODULE : Trade Engine
   FILE   : trade-table.js
   VERSION: 2.0
===================================================== */

// Global Pagination
/*✅ Step 1  getPaginatedTrades() */
function getPaginatedTrades() {

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return trades.slice(start, end);

}

/*Step 2  updateTradeCounter()*/
function updateTradeCounter() {

    const totalTrades = trades.length;

    const start =
        totalTrades === 0
            ? 0
            : (currentPage - 1) * rowsPerPage + 1;

    const end = Math.min(
        currentPage * rowsPerPage,
        totalTrades
    );

    document.getElementById("paginationInfo").textContent =
        `Showing ${start}–${end} of ${totalTrades} Trades`;
}
// Render
/*Step 3  renderTradeTable()*/
function renderTradeTable() {

    const paginatedTrades = getPaginatedTrades();

    tradeTableBody.innerHTML = paginatedTrades.map((trade, index) => `
        <tr>
            <td>${escapeHtml(String(trade.symbol || ""))}</td>
            <td>${currency.format(Number(trade.entry) || 0)}</td>
            <td>${currency.format(Number(trade.exit) || 0)}</td>
            <td>${Number(trade.quantity) || 0}</td>

            <td>
                <span class="badge ${trade.type === "BUY" ? "buy" : "sell"}">
                    ${escapeHtml(String(trade.type || "BUY"))}
                </span>
            </td>

            <td>
                ${
                    getProfit(trade) >= 0
                    ? `<span class="profit-badge">
                        +${currency.format(getProfit(trade))}
                       </span>`
                    : `<span class="loss-badge">
                        -${currency.format(Math.abs(getProfit(trade)))}
                       </span>`
                }
            </td>

            <td>${formatTradeDate(trade.date)}</td>

            <td class="action-buttons">
                <button class="edit-btn" onclick="editTrade(${index})">
                    ✏ Edit
                </button>

                <button class="delete-btn" onclick="deleteTrade(${index})">
                    🗑 Delete
                </button>
            </td>

        </tr>
    `).join("");
    
 updateTradeCounter();
}
// CRUD
/*Step 4  editTrade()*/
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

// Search
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
function sortTrades() {

    const sortValue = document.getElementById("sortTrade").value;

    if (sortValue === "newest") {

        trades.sort((a, b) => new Date(b.date) - new Date(a.date));

    } else {

        trades.sort((a, b) => new Date(a.date) - new Date(b.date));

    }

    render();

}