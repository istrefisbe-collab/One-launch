
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, language = "Slovenščina" } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Napiši vprašanje." });
    }

    const text = String(message).trim();

    // Če pozneje dodamo AI ključ, bo ONEVYO uporabljal pravi AI.
    const apiKey = process.env.AI_API_KEY;
    const apiUrl = process.env.AI_API_URL;
    const model = process.env.AI_MODEL;

    if (apiKey && apiUrl && model) {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                `You are ONEVYO, a helpful global all-in-one AI assistant. ` +
                `Answer clearly and practically. User language: ${language}.`,
            },
            {
              role: "user",
              content: text,
            },
          ],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const reply =
          data?.choices?.[0]?.message?.content ||
          data?.output_text ||
          data?.response;

        if (reply) {
          return res.status(
