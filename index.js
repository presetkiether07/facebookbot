// Complete Messenger PageBot with typing, seen, reactions, media and buttons
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = "zeta2009";
const PAGE_ACCESS_TOKEN = "EAAKLFsDdDtIBPCIKeFpMh67NtLlwDbDWUZBrwpJOUVGFYfS5UDlDFkXrjzlMovuueSC4T3WowAWi0UZBDGXnS5ueQW0fhVKII3p4ZAjhfZCKos2khoJ3eT7iBC8iU3ZAXTGvsIviNGBKMhzgHZB9oalZAL2wLKaZCrO2sl2QCGbUTzPsEPNiZAZB6ciZC4ktDYhUnOuhltZBhwZDZD";

app.use(bodyParser.json());

// Verify Webhook
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

// Handle Webhook Events
app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    for (const entry of body.entry) {
      const event = entry.messaging[0];
      const senderId = event.sender.id;

      // Simulate typing
      await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        recipient: { id: senderId },
        sender_action: "typing_on"
      });

      // React to message if available
      if (event.message?.mid) {
        await axios.post(`https://graph.facebook.com/v18.0/${event.message.mid}/reactions?access_token=${PAGE_ACCESS_TOKEN}`, {
          reaction: "LIKE"
        }).catch(() => {});
      }

      if (event.message && event.message.text) {
        const text = event.message.text.toLowerCase();

        // Buttons example
        if (text.includes("menu")) {
          await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: senderId },
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "button",
                  text: "What would you like to do?",
                  buttons: [
                    { type: "postback", title: "📘 Tutorial", payload: "TUTORIAL_PAYLOAD" },
                    { type: "postback", title: "📋 Commands", payload: "COMMANDS_PAYLOAD" },
                    { type: "postback", title: "👤 About", payload: "ABOUT_PAYLOAD" }
                  ]
                }
              }
            }
          });
        } else if (text.includes("image")) {
          await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: senderId },
            message: {
              attachment: {
                type: "image",
                payload: { url: "https://placekitten.com/400/300", is_reusable: true }
              }
            }
          });
        } else {
          await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: senderId },
            message: { text: `👋 You said: ${text}` }
          });
        }

        // Mark as seen
        await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
          recipient: { id: senderId },
          sender_action: "mark_seen"
        });
      } else if (event.postback) {
        const payload = event.postback.payload;
        let response = "🤖 Unknown action.";

        if (payload === "TUTORIAL_PAYLOAD") response = "📘 Here's how to use the bot...";
        else if (payload === "COMMANDS_PAYLOAD") response = "📋 List of commands: help, image, menu, etc.";
        else if (payload === "ABOUT_PAYLOAD") response = "👤 Created by April Dev using Node.js.";

        await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
          recipient: { id: senderId },
          message: { text: response }
        });
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Privacy Policy
app.get("/privacy", (req, res) => {
  res.send(`<h1>Privacy Policy</h1><p>This bot does not collect personal data.</p>`);
});

// Terms of Service
app.get("/terms", (req, res) => {
  res.send(`<h1>Terms of Service</h1><p>Use at your own discretion. No warranties implied.</p>`);
});

// Data Deletion Instructions
app.get("/delete-data", (req, res) => {
  res.send(`<h1>Data Deletion</h1><p>Message: "Delete my data" to remove interactions.</p>`);
});

// Fallback
app.get("*", (req, res) => {
  res.status(403).send("❌ Forbidden or not found.");
});

app.listen(PORT, () => {
  console.log(`🚀 Bot live on http://localhost:${PORT}`);
});
