const { getAIResponse } = require('./src/ai');

async function run() {
    const response = await getAIResponse(
        'Можете снизить цену?'
    );

    console.log(response);
}

run();