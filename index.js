const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Your custom verify token
const VERIFY_TOKEN = "zeta2009";

// 🤖 Your Page Access Token
const PAGE_ACCESS_TOKEN = "PASTE_YOUR_PAGE_ACCESS_TOKEN_HERE";

app.use(bodyParser.json());

// ✅ Facebook webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 📩 Message handler
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text.toLowerCase();
        let replyText = "✅ I received your message!";

        if (userMessage.includes("hello") || userMessage.includes("hi")) {
          replyText = "👋 Hello there! How can I help you today?";
        } else if (userMessage.includes("delete")) {
          replyText = "🗑️ Your data will be deleted soon (simulated).";
        }

        const reply = {
          messaging_type: "RESPONSE",
          recipient: { id: senderId },
          message: { text: replyText }
        };

        try {
          await axios.post(
            `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            reply
          );
        } catch (err) {
          console.error("❌ Failed to send message:", err?.response?.data || err.message);
        }
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// 📜 Privacy Policy
app.get("/privacy", (req, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>This Messenger bot does not collect any personal data.</p>
    <p>All data is used only for chatbot interaction purposes.</p>
  `);
});

// 📄 Terms of Service
app.get("/terms", (req, res) => {
  res.send(`
    <h1>Terms of Service</h1>
    <p>By using this bot, you agree that it's for demo or personal use only.</p>
  `);
});

// 🗑️ User Data Deletion Instructions
app.get("/delete-data", (req, res) => {
  res.send(`
    <h1>Data Deletion Instructions</h1>
    <p>If you wish to delete your data, please message this bot with: <b>"Delete my data"</b>.</p>
    <p>We do not store any personal information on our servers.</p>
  `);
});

// 404 fallback
app.get("*", (req, res) => {
  res.status(403).send("❌ Forbidden or route not found.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
