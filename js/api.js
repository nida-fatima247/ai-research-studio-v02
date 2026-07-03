
const WEBHOOK_URL = "https://nidafatima819.app.n8n.cloud/webhook/research";

async function generateResearch(payload) {
    try {

        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                topic: payload.topic
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        return data;

    } catch (error) {

        console.error("Research API Error:", error);

        throw error;
    }
}