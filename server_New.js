const express = require("express");
const path = require("path");

console.log("🔥 NEW EXPRESS SERVER STARTED");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TraderOS AI Backend Running 🚀"
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});