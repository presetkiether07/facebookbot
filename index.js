const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Your verify token (ikaw gumagawa nito)
const VERIFY_TOKEN = "zeta2009";

// 🤖 Your Page Access Token (from Graph API)
const PAGE_ACCESS_TOKEN = "EAAKLFsDdDtIBPCIKeFpMh67NtLlwDbDWUZBrwpJOUVGFYfS5UDlDFkXrjzlMovuueSC4T3WowAWi0UZBDGXnS5ueQW0fhVKII3p4ZAjhfZCKos2khoJ3eT7iBC8iU3ZAXTGvsIviNGBKMhzgHZB9oalZAL2wLKaZCrO2sl2QCGbUTzPsEPNiZAZB6ciZC4ktDYhUnOuhltZBhwZDZD";

app.use(bodyParser.json());

// ✅ Privacy Policy route
app.get("/privacy", (req, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>This Messenger bot does not collect or store any personal data. All messages are processed in real-time and discarded.</p>
  `);
});

// ✅ Terms of Service route
app.get("/terms", (req, res) => {
  res.send(`
    <h1>Terms of Service</h1>
    <p>By using this Messenger bot, you agree that it provides informational and entertainment services only. No guarantees are provided.</p>
  `);
});

// ✅ User Data Deletion route
app.get("/delete", (req, res) => {
  res.send(`
    <h1>Data Deletion Request</h1>
    <p>This bot does not store user data. To delete your interaction history, remove or block the bot in Messenger.</p>
  `);
});

// 📥 Facebook Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 📩 Handle messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const receivedText = webhookEvent.message.text.toLowerCase();

        let replyText = "✅ Bot received your message!";
        if (receivedText.includes("hello")) replyText = "👋 Hi! How can I help you today?";
        if (receivedText.includes("help")) replyText = "🤖 Try typing 'tutorial', 'commands', or 'about'.";

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
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}/webhook`);
});
