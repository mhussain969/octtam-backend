// Import Express
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Use JSON parser
app.use(bodyParser.json());

// Temporary in-memory "database"
let users = {};
let messages = [];

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// ✅ Login (just with phone number for now)
app.post("/login", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  // Save user
  users[phone] = { phone };
  return res.json({ success: true, phone });
});

// ✅ Send message
app.post("/message", (req, res) => {
  const { from, to, text } = req.body;
  if (!from || !to || !text)
    return res.status(400).json({ error: "from, to, text required" });

  const msg = { from, to, text, time: Date.now() };
  messages.push(msg);
  return res.json({ success: true, message: msg });
});

// ✅ Get messages for a user
app.get("/messages/:phone", (req, res) => {
  const phone = req.params.phone;
  const userMessages = messages.filter(
    (m) => m.to === phone || m.from === phone
  );
  return res.json({ messages: userMessages });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
