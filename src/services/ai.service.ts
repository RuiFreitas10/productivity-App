export const aiService = {
    async extractReceiptData(base64Image: string): Promise<any> {
        // Support both common variable names for OpenAI
        const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY;

        if (!apiKey) {
            console.warn('Missing EXPO_PUBLIC_OPENAI_KEY');
            throw new Error('API Key missing');
        }

        const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

        try {
            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "You are a receipt extraction assistant. Analyze the image and extract: merchant (string), amount (number), date (ISO string YYYY-MM-DD), and currency (string). Return ONLY valid JSON."
                        },
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Extract data from this receipt." },
                                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                            ]
                        }
                    ],
                    max_tokens: 300,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("OpenAI Error:", data.error);
                throw new Error(data.error.message);
            }

            const content = data.choices[0].message.content;
            console.log("OpenAI Raw Response:", content); // Debug log

            return JSON.parse(content);

        } catch (error) {
            console.error('AI Extraction Error:', error);
            throw error;
        }
    }
};
