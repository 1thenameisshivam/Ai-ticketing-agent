import { GEMINI_API_KEY } from "../config/constant.js";

export const analyzeTicket = async (ticket) => {
  const prompt = `You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.

Analyze the following support ticket and provide a JSON object with:

- summary: A short 1-2 sentence summary of the issue.
- priority: One of "low", "medium", or "high".
- helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
- relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).

Respond ONLY in this JSON format and do not include any other text or markdown in the answer:

{
  "summary": "Short summary of the ticket",
  "priority": "high",
  "helpfulNotes": "Here are useful tips...",
  "relatedSkills": ["React", "Node.js"]
}

---

Ticket information:

- Title: ${ticket.title}
- Description: ${ticket.description}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      console.error("❌ No content returned from Gemini:", data);
      return null;
    }

    // Attempt to extract JSON
    try {
      const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
      const jsonString = match ? match[1] : raw.trim();
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("❌ Failed to parse JSON from Gemini response:", e.message);
      return null;
    }
  } catch (err) {
    console.error("🔥 Error calling Gemini API:", err.message);
    return null;
  }
};

export default analyzeTicket;
