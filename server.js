const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const DB_FILE = path.join(__dirname, "db.json");

async function loadDB() {
  try {
    return await fs.readJSON(DB_FILE);
  } catch {
    return { users: [], messages: [] };
  }
}

async function saveDB(data) {
  await fs.writeJSON(DB_FILE, data, { spaces: 2 });
}

// Root
app.get("/", (req, res) => {
  res.send("✅ Backend is running with persistent DB!");
});

// Login
app.post("/login", async (req, res) => {
  let { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  const db = await loadDB();
  let user = db.users.find(u => u.phone === phone);

  if (!user) {
    user = { phone };
    db.users.push(user);
    await saveDB(db);
  }

  return res.json({ success: true, user });
});

// Send message
app.post("/message", async (req, res) => {
  const { from, to, text } = req.body;
  if (!from || !to || !text) return res.status(400).json({ error: "from, to, text required" });

  const db = await loadDB();

  const msg = { from, to, text, time: Date.now() };
  db.messages.push(msg);
  await saveDB(db);

  return res.json({ success: true, message: msg });
});

// Get messages
app.get("/messages/:phone", async (req, res) => {
  const db = await loadDB();
  const phone = req.params.phone;
  const userMessages = db.messages.filter(m => m.from === phone || m.to === phone);
  return res.json({ messages: userMessages });
});

// List users
app.get("/users", async (req, res) => {
  const db = await loadDB();
  res.json({ users: db.users });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
