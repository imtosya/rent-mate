require('dotenv').config();

const Groq = require('groq-sdk');

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function test() {
    const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'user',
                content: 'Привет! Ты работаешь?',
            },
        ],
    });

    console.log(response.choices[0].message.content);
}

test();