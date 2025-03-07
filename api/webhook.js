const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const LINE_ACCESS_TOKEN = "YOUR_LINE_CHANNEL_ACCESS_TOKEN"; // LINEのチャネルアクセストークン

// LINE Webhookエンドポイント
app.post("/api/webhook", async (req, res) => {
    try {
        console.log("📩 受信メッセージ:", JSON.stringify(req.body, null, 2));

        const events = req.body.events;
        if (!events || events.length === 0) {
            return res.status(200).send("No events received.");
        }

        // すべてのイベントを処理
        for (const event of events) {
            if (event.type === "message" && event.message.type === "text") {
                const userMessage = event.message.text;
                const replyToken = event.replyToken;

                // 占い or 相談を判定
                let replyText = "";
                if (userMessage.includes("占い")) {
                    replyText = "🔮 今日の占いをお伝えします！（このあとChatGPT APIと連携）";
                } else if (userMessage.includes("相談")) {
                    replyText = "💬 相談内容を教えてください！（このあとChatGPT APIと連携）";
                } else {
                    replyText = `「${userMessage}」ですね？ もう少し詳しく教えてください！`;
                }

                // LINEに返信
                await replyToLine(replyToken, replyText);
            }
        }

        res.status(200).send("Success");
    } catch (error) {
        console.error("❌ エラー:", error);
        res.status(500).send("Error processing webhook");
    }
});

// LINEにメッセージを送信する関数
async function replyToLine(replyToken, text) {
    await axios.post("https://api.line.me/v2/bot/message/reply", {
        replyToken: replyToken,
        messages: [{ type: "text", text: text }]
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LINE_ACCESS_TOKEN}`
        }
    });
}

module.exports = app;
