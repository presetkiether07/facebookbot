const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Replace this with your own verify token
const VERIFY_TOKEN = "zeta2009";

// 🤖 Replace this with your Page Access Token
const PAGE_ACCESS_TOKEN = "EAAKLFsDdDtIBPCIKeFpMh67NtLlwDbDWUZBrwpJOUVGFYfS5UDlDFkXrjzlMovuueSC4T3WowAWi0UZBDGXnS5ueQW0fhVKII3p4ZAjhfZCKos2khoJ3eT7iBC8iU3ZAXTGvsIviNGBKMhzgHZB9oalZAL2wLKaZCrO2sl2QCGbUTzPsEPNiZAZB6ciZC4ktDYhUnOuhltZBhwZDZD";

app.use(bodyParser.json());

// ✅ Verification webhook for Facebook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 📩 Handle messages from users
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const messageText = webhookEvent.message.text.toLowerCase();
        let reply;

        if (messageText.includes("hello") || messageText.includes("hi")) {
          reply = {
            text: "👋 Hello! How can I help you today?"
          };
        } else if (messageText.includes("delete my data")) {
          reply = {
            text: "🗑️ Your data deletion request has been received. We will delete any stored information related to you."
          };
        } else {
          reply = {
            text: "✅ Message received! Send 'hello' to start or 'delete my data' for removal."
          };
        }

        try {
          await axios.post(
            `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            {
              messaging_type: "RESPONSE",
              recipient: { id: senderId },
              message: reply
            }
          );
        } catch (err) {
          console.error("❌ Failed to send message:", err.response?.data || err.message);
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// 📃 Privacy Policy page
app.get("/privacy", (req, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>This Messenger bot does not collect or store any personal data. All data is used only during your active chat session.</p>
  `);
});

// 📃 Terms of Service page
app.get("/terms", (req, res) => {
  res.send(`
    <h1>Terms of Service</h1>
    <p>By using this Messenger bot, you agree to use it for personal, non-commercial purposes only.</p>
  `);
});

// 📃 Data deletion instructions page
app.get("/delete-data", (req, res) => {
  res.send(`
    <h1>Data Deletion Instructions</h1>
    <p>If you want your data deleted from this bot, simply send a message saying <strong>"Delete my data"</strong>.</p>
  `);
});

// 🌐 Default homepage (optional)
app.get("/", (req, res) => {
  res.send("🤖 This is the homepage of your Facebook Messenger Page Bot.");
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
