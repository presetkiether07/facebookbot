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

// 📥 Facebook verification
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

// 📩 Handle incoming messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const reply = {
          messaging_type: "RESPONSE",
          recipient: { id: senderId },
          message: { text: "✅ Bot received your message!" }
        };

        try {
          await axios.post(
            `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            reply
          );
        } catch (err) {
          console.error("❌ Failed to send message:", err.response.data);
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Callback server is running on http://localhost:${PORT}/webhook`);
});
