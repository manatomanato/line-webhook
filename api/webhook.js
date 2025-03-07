
import axios from "axios";

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN; // 環境変数を利用

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        console.log("📩 受信メッセージ:", JSON.stringify(req.body, null, 2));

        const events = req.body.events;
        if (!events || events.length === 0) {
            return res.status(200).send("No events received.");
        }

        for (const event of events) {
            if (event.type === "message" && event.message.type === "text") {
                const userMessage = event.message.text;
                const replyToken = event.replyToken;

                let replyText = "";
                if (userMessage.includes("占い")) {
                    replyText = "🔮 今日の占いをお伝えします！（ChatGPT APIと連携予定）";
                } else if (userMessage.includes("相談")) {
                    replyText = "💬 相談内容を教えてください！（ChatGPT APIと連携予定）";
                } else {
                    replyText = `「${userMessage}」ですね？ もう少し詳しく教えてください！`;
                }

                await replyToLine(replyToken, replyText);
            }
        }

        res.status(200).send("Success");
    } catch (error) {
        console.error("❌ エラー:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.toString() });
    }
}

// LINEに返信する関数
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

