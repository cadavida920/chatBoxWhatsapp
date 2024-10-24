const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const chat = async (prompt, text) => {
    try {
        console.log("chatGPT", process.env.OPENAI_API_KEY);
        console.log("prompt", prompt);
        console.log("text", text);
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: text },
            ],
        });
        const completionData = completion.data;
        const message = completionData.choices[0].message;
        console.log("completion", completionData.choices[0].message);
        return message;
    } catch (err) {
        console.error("Error al conectar con OpenAI:", err);
        return "ERROR";
    }
};

module.exports = chat;