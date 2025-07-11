const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ Replace these with your own:
const VERIFY_TOKEN = "zeta2009"; // Create your own verify token
const PAGE_ACCESS_TOKEN = "EAAKLFsDdDtIBPCIKeFpMh67NtLlwDbDWUZBrwpJOUVGFYfS5UDlDFkXrjzlMovuueSC4T3WowAWi0UZBDGXnS5ueQW0fhVKII3p4ZAjhfZCKos2khoJ3eT7iBC8iU3ZAXTGvsIviNGBKMhzgHZB9oalZAL2wLKaZCrO2sl2QCGbUTzPsEPNiZAZB6ciZC4ktDYhUnOuhltZBhwZDZD";

// 🧠 Middleware
app.use(bodyParser.json());

// 🌐 Default landing (optional)
app.get("/", (req, res) => {
  res.send("🤖 Facebook Page Bot is up and running.");
});

// 🔐 Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// 📩 Handle incoming messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userText = webhookEvent.message.text.toLowerCase();

        // ✨ Sample bot logic
        let replyText = "✅ Bot received your message!";
        if (userText.includes("hello") || userText.includes("hi")) {
          replyText = "👋 Hello there! Welcome to my bot!";
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
          console.error("❌ Failed to send message:", err.response?.data || err.message);
        }
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  } else {
    return res.sendStatus(404);
  }
});

// 🔒 Privacy Policy
app.get("/privacy", (req, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>This Messenger bot does not collect or store any personal data.</p>
    <p>Messages sent to the bot are only used to generate automated responses.</p>
    <p>For questions, contact us at <a href="mailto:zeta82298@gmail.com">zeta82298@gmail.com</a>.</p>
  `);
});

// 📄 Terms of Service
app.get("/terms", (req, res) => {
  res.send(`
    <h1>Terms of Service</h1>
    <p>By using this bot, you agree to interact respectfully and not misuse the chatbot features.</p>
    <p>This bot is provided "as-is" without any guarantees of uptime or availability.</p>
  `);
});

// 🗑️ User Data Deletion
app.get("/data-deletion", (req, res) => {
  res.send(`
    <h1>Data Deletion Request</h1>
    <p>If you'd like to request deletion of your data from this bot, contact us at:</p>
    <p><b>Email:</b> zeta82298@gmail.com</p>
    <p>Include your Facebook ID and reason for deletion. We will respond within 7 days.</p>
  `);
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
