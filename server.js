const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { promisify } = require("node:util");

const PORT = Number(process.env.PORT) || 3000;
const frontendDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const usersFile = path.join(dataDir, "users.json");
const tradesFile = path.join(dataDir, "trades.json");
const sessions = new Map();
const scrypt = promisify(crypto.scrypt);
const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8"
};

async function ensureDatabase() {
    await fs.mkdir(dataDir, { recursive: true });
    await Promise.all([usersFile, tradesFile].map(async (file) => {
        try { await fs.access(file); }
        catch { await fs.writeFile(file, "[]\n", "utf8"); }
    }));
}

async function readUsers() {
    try {
        const users = JSON.parse(await fs.readFile(usersFile, "utf8"));
        return Array.isArray(users) ? users : [];
    } catch {
        return [];
    }
}

async function writeUsers(users) {
    const temporaryFile = `${usersFile}.tmp`;
    await fs.writeFile(temporaryFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
    await fs.rename(temporaryFile, usersFile);
}

async function readTrades() {
    try {
        const trades = JSON.parse(await fs.readFile(tradesFile, "utf8"));
        return Array.isArray(trades) ? trades : [];
    } catch {
        return [];
    }
}

async function writeTrades(trades) {
    const temporaryFile = `${tradesFile}.tmp`;
    await fs.writeFile(temporaryFile, `${JSON.stringify(trades, null, 2)}\n`, "utf8");
    await fs.rename(temporaryFile, tradesFile);
}

function sendJson(response, statusCode, payload, headers = {}) {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8", ...headers });
    response.end(JSON.stringify(payload));
}

function parseCookies(request) {
    return Object.fromEntries((request.headers.cookie || "").split(";").map((part) => {
        const index = part.indexOf("=");
        return index === -1 ? [] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
    }).filter((entry) => entry.length));
}

function getSessionUser(request) {
    const sessionId = parseCookies(request).session;
    return sessionId ? sessions.get(sessionId) : null;
}

function createSession(response, user) {
    const sessionId = crypto.randomBytes(32).toString("hex");
    sessions.set(sessionId, { id: user.id, name: user.name, email: user.email });
    return `session=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`;
}

function clearSession(request) {
    const sessionId = parseCookies(request).session;
    if (sessionId) sessions.delete(sessionId);
}

function readJsonBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";
        request.on("data", (chunk) => {
            body += chunk;
            if (body.length > 1_000_000) request.destroy();
        });
        request.on("end", () => {
            try {
                resolve(JSON.parse(body || "{}"));
            } catch {
                reject(new Error("Invalid JSON"));
            }
        });
        request.on("error", reject);
    });
}

function normaliseEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
}

async function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const hash = await scrypt(password, salt, 64);
    return { salt, hash: hash.toString("hex") };
}

function getTradeData(input) {
    const symbol = typeof input.symbol === "string" ? input.symbol.trim().toUpperCase() : "";
    const entry = Number(input.entry);
    const exit = Number(input.exit);
    const quantity = Number(input.quantity);
    const type = input.type === "SELL" ? "SELL" : input.type === "BUY" ? "BUY" : "";
    const date = new Date(input.date);
    const optionalPrice = (value) => value === "" || value === null || value === undefined ? null : Number(value);
    const stopLoss = optionalPrice(input.stopLoss);
    const target = optionalPrice(input.target);

    if (!symbol || symbol.length > 20 || !Number.isFinite(entry) || !Number.isFinite(exit) || entry <= 0 || exit <= 0 || !Number.isInteger(quantity) || quantity <= 0 || !type || Number.isNaN(date.getTime())) {
        throw new Error("Enter a valid symbol, prices, whole quantity, type, and date.");
    }
    if ((stopLoss !== null && (!Number.isFinite(stopLoss) || stopLoss < 0)) || (target !== null && (!Number.isFinite(target) || target < 0))) {
        throw new Error("Stop loss and target cannot be negative.");
    }
    return {
        symbol,
        entry,
        exit,
        quantity,
        type,
        date: date.toISOString(),
        stopLoss,
        target,
        emotion: typeof input.emotion === "string" ? input.emotion.trim().slice(0, 50) : "",
        notes: typeof input.notes === "string" ? input.notes.trim().slice(0, 1000) : ""
    };
}

function publicTrade(trade) {
    const { userId, ...tradeData } = trade;
    return tradeData;
}

async function handleTrades(request, response, tradeId) {
    const user = getSessionUser(request);
    if (!user) return sendJson(response, 401, { message: "Please log in to manage trades." });

    const trades = await readTrades();
    if (request.method === "GET" && !tradeId) {
        return sendJson(response, 200, { trades: trades.filter((trade) => trade.userId === user.id).map(publicTrade) });
    }
    if (request.method === "POST" && !tradeId) {
        try {
            const trade = { id: crypto.randomUUID(), userId: user.id, ...getTradeData(await readJsonBody(request)) };
            trades.push(trade);
            await writeTrades(trades);
            return sendJson(response, 201, { trade: publicTrade(trade) });
        } catch (error) {
            return sendJson(response, 400, { message: error.message || "Invalid trade data." });
        }
    }

    const tradeIndex = trades.findIndex((trade) => trade.id === tradeId && trade.userId === user.id);
    if (tradeIndex === -1) return sendJson(response, 404, { message: "Trade not found." });
    if (request.method === "PUT") {
        try {
            const trade = { id: tradeId, userId: user.id, ...getTradeData(await readJsonBody(request)) };
            trades[tradeIndex] = trade;
            await writeTrades(trades);
            return sendJson(response, 200, { trade: publicTrade(trade) });
        } catch (error) {
            return sendJson(response, 400, { message: error.message || "Invalid trade data." });
        }
    }
    if (request.method === "DELETE") {
        trades.splice(tradeIndex, 1);
        await writeTrades(trades);
        return sendJson(response, 200, { message: "Trade deleted." });
    }
    return sendJson(response, 405, { message: "Method not allowed" });
}

async function handleApi(request, response, pathname) {
    if (pathname === "/api/session" && request.method === "GET") {
        const user = getSessionUser(request);
        return sendJson(response, 200, { user });
    }

    if (pathname === "/api/logout" && request.method === "POST") {
        clearSession(request);
        return sendJson(response, 200, { message: "Logged out" }, { "Set-Cookie": "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" });
    }

    const tradeRoute = pathname.match(/^\/api\/trades(?:\/([0-9a-f-]+))?$/i);
    if (tradeRoute) return handleTrades(request, response, tradeRoute[1]);

    if (pathname !== "/api/register" && pathname !== "/api/login") {
        return sendJson(response, 404, { message: "Not found" });
    }
    if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed" });

    let body;
    try {
        body = await readJsonBody(request);
    } catch {
        return sendJson(response, 400, { message: "Invalid request body" });
    }

    const email = normaliseEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    if (!validEmail(email) || password.length < 8) {
        return sendJson(response, 400, { message: "Enter a valid email and a password of at least 8 characters." });
    }

    const users = await readUsers();
    const existingUser = users.find((user) => user.email === email);

    if (pathname === "/api/register") {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name) return sendJson(response, 400, { message: "Enter your name." });
        if (existingUser) return sendJson(response, 409, { message: "Email already registered." });

        const passwordData = await hashPassword(password);
        const user = {
            id: crypto.randomUUID(),
            name,
            email,
            passwordHash: passwordData.hash,
            passwordSalt: passwordData.salt,
            createdAt: new Date().toISOString()
        };
        users.push(user);
        await writeUsers(users);
        return sendJson(response, 201, { message: "Registration successful. Please log in." });
    }

    if (!existingUser) return sendJson(response, 401, { message: "Invalid email or password." });
    const passwordData = await hashPassword(password, existingUser.passwordSalt);
    const storedHash = Buffer.from(existingUser.passwordHash, "hex");
    const suppliedHash = Buffer.from(passwordData.hash, "hex");
    if (storedHash.length !== suppliedHash.length || !crypto.timingSafeEqual(storedHash, suppliedHash)) {
        return sendJson(response, 401, { message: "Invalid email or password." });
    }
    return sendJson(response, 200, { user: { name: existingUser.name, email: existingUser.email } }, { "Set-Cookie": createSession(response, existingUser) });
}

async function serveStatic(request, response, pathname) {
    const requestedPath = pathname === "/" ? "/index.html" : pathname;
    const filePath = path.resolve(frontendDir, `.${requestedPath}`);
    if (!filePath.startsWith(`${frontendDir}${path.sep}`)) {
        response.writeHead(403);
        return response.end("Forbidden");
    }
    if (requestedPath === "/dashboard.html" && !getSessionUser(request)) {
        response.writeHead(302, { Location: "/index.html" });
        return response.end();
    }

    try {
        const file = await fs.readFile(filePath);
        response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
        response.end(file);
    } catch {
        response.writeHead(404);
        response.end("Not found");
    }
}

async function start() {
    await ensureDatabase();
    const server = http.createServer(async (request, response) => {
        const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
        try {
            if (pathname.startsWith("/api/")) await handleApi(request, response, pathname);
            else await serveStatic(request, response, pathname);
        } catch (error) {
            console.error(error);
            if (!response.headersSent) sendJson(response, 500, { message: "Server error" });
            else response.end();
        }
    });
    server.listen(PORT, () => console.log(`TraderOS AI is running at http://localhost:${PORT}`));
}

start().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
