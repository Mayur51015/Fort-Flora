const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are Fort-Flora AI Adviser — an expert on Maharashtra's historic forts and the biodiversity (flora & fauna) found around them.
You provide helpful, concise, and accurate answers about:
- Fort history, architecture, significance, and trekking tips
- Plants, trees, and medicinal herbs found near forts
- Best times to visit, nearby attractions, and safety advice
- Maharashtra's cultural and natural heritage

Always answer in a friendly, knowledgeable tone. If you don't know, say so honestly.`;

export async function askGroq(userMessage) {
    if (!GROQ_API_KEY) {
        return 'AI Adviser is not configured. Please add your VITE_GROQ_API_KEY to a .env file (not .env.example).';
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage },
                ],
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
