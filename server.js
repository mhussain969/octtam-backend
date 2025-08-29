const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Load DB
let db = { users: [], messages: [] };
const DB_FILE = "db.json";

if (fs.existsSync(DB_FILE)) {
  const data = fs.readFileSync(DB_FILE);
  db = JSON.parse(data);
}

// Save DB helper
const saveDB = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};

// Root
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// Login
app.post("/login", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  if (!db.users.includes(phone)) {
    db.users.push(phone);
    saveDB();
  }
  return res.json({ success: true, phone });
});

// Send message
app.post("/message", (req, res) => {
  const { from, to, text } = req.body;
  if (!from || !to || !text)
    return res.status(400).json({ error: "from, to, text required" });

  const msg = { from, to, text, time: Date.now() };
  db.messages.push(msg);
  saveDB();
  return res.json({ success: true, message: msg });
});

// Get messages
app.get("/messages/:phone", (req, res) => {
  const phone = req.params.phone;
  const userMessages = db.messages.filter(
    (m) => m.to === phone || m.from === phone
  );
  return res.json({ messages: userMessages });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
