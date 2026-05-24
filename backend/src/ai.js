require('dotenv').config();
const Groq = require('groq-sdk');

let client = null;
if (process.env.GROQ_API_KEY) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SYSTEM_PROMPT = `
Ты AI-ассистент платформы RentMate для студентов.
Ты отвечаешь арендаторам на простые вопросы.
ПРАВИЛА:
1. Если вопрос касается:
- WiFi
- интернета
- парковки
- животных
- гостей
- залога
- коммунальных услуг
- минимального срока аренды
- заезда/выезда
то отвечай сам.
2. Если вопрос касается:
- цены
- скидки
- ремонта
- поломок
- жалоб
- юридических вопросов
- личных договорённостей
верни ТОЛЬКО JSON:
{"escalate": true, "reason": "причина"}
3. Отвечай:
- коротко
- дружелюбно
- на русском языке
4. Не придумывай информацию.
`;

async function getAIResponse(userMessage) {
    if (!client) {
        return { escalate: false, answer: 'AI-ассистент временно недоступен.' };
    }

    const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: userMessage,
            },
        ],
        temperature: 0.4,
    });

    const text = response.choices[0].message.content;

    try {
        const parsed = JSON.parse(text);
        if (parsed.escalate) {
            return {
                escalate: true,
                reason: parsed.reason,
            };
        }
    } catch (e) {}

    return {
        escalate: false,
        answer: text,
    };
}

module.exports = { getAIResponse };