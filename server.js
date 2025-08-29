const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Path to db.json
const dbPath = path.join(__dirname, "db.json");

// Middleware
app.use(bodyParser.json());

// Load DB on start
let db = { users: {}, messages: [] };
try {
  const data = fs.readFileSync(dbPath, "utf-8");
  db = JSON.parse(data);
} catch (err) {
  console.log("No db.json found, creating a new one.");
  fs.writeFileSync(dbPath, JSON.stringify(db));
}

// Save DB function
function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// ✅ Get all registered users
app.get("/users", (req, res) => {
  return res.json({ users: Object.values(db.users) });
});

// ✅ Login (register user)
app.post("/login", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  db.users[phone] = { phone };
  saveDB();
  return res.json({ success: true, phone });
});

// ✅ Send message
app.post("/message", (req, res) => {
  const { from, to, text } = req.body;
  if (!from || !to || !text)
    return res.status(400).json({ error: "from, to, text required" });

  const msg = { from, to, text, time: Date.now() };
  db.messages.push(msg);
  saveDB();
  return res.json({ success: true, message: msg });
});

// ✅ Get messages for a user
app.get("/messages/:phone", (req, res) => {
  const phone = req.params.phone;
  const userMessages = db.messages.filter(
    (m) => m.to === phone || m.from === phone
  );
  return res.json({ messages: userMessages });
});

// ✅ Delete a user (optional)
app.delete("/users/:phone", (req, res) => {
  const phone = req.params.phone;
  if (!db.users[phone])
    return res.status(404).json({ error: "User not found" });

  delete db.users[phone];
  saveDB();
  return res.json({ success: true, phone });
});

// ✅ Delete a message by index (optional)
app.delete("/messages/:index", (req, res) => {
  const index = parseInt(req.params.index);
  if (index < 0 || index >= db.messages.length)
    return res.status(404).json({ error: "Message not found" });

  const removed = db.messages.splice(index, 1);
  saveDB();
  return res.json({ success: true, removed });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
