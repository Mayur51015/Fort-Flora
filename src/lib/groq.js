const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are Fort-Flora AI Adviser — an expert EXCLUSIVELY on Maharashtra's historic forts and the biodiversity (flora & fauna) found around them.

STRICT RULES:
- ONLY answer questions related to Maharashtra — its forts, flora, fauna, heritage, trekking, culture, geography, and history.
- If a question is unrelated to Maharashtra, politely decline and redirect the user to ask about Maharashtra topics.
- Provide short, factual, educational responses (2-4 paragraphs max).
- Use bullet points when listing items.
- Mention specific fort names, districts, and species when relevant.

You can help with:
- Fort history, architecture, significance, and trekking tips
- Plants, trees, and medicinal herbs found near forts
- Best times to visit, nearby attractions, and safety advice
- Maharashtra's cultural and natural heritage
- Western Ghats biodiversity and conservation

Always answer in a friendly, knowledgeable tone. If you don't know, say so honestly.`;

// Accepts full conversation history for context-aware responses
export async function askGroq(userMessage, conversationHistory = []) {
    if (!GROQ_API_KEY) {
        return 'AI Adviser is not configured. Please add your VITE_GROQ_API_KEY to a .env file (not .env.example).';
    }

    try {
        // Build messages array with system prompt + conversation history
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory,
            { role: 'user', content: userMessage },
        ];

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Groq API response:', response.status, errBody);
            throw new Error(`Groq API error: ${response.status} - ${errBody}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'No response received.';
    } catch (error) {
        console.error('Groq API Error:', error);
        return 'Sorry, I encountered an error. Please try again later.';
    }
}
