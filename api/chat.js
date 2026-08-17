export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Uporabi POST." });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY ni nastavljen."
    });
  }

  const message = String(req.body?.message || "").trim();
  const language = String(req.body?.language || "Slovenščina");

  if (!message) {
    return res.status(400).json({ error: "Vprašanje je prazno." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.6",
        store: false,
        instructions:
          `Ti si ONE, prijazen in praktičen AI pomočnik. ` +
          `Odgovarjaj jasno in konkretno. Jezik uporabnika: ${language}.`,
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Napaka OpenAI."
      });
    }

    let reply = "";

    for (const item of data.output || []) {
      for (const part of item.content || []) {
        if (part.type === "output_text") {
          reply += part.text || "";
        }
      }
    }

    return res.status(200).json({
      reply: reply || "ONE ni prejel odgovora."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Povezava z AI ni uspela."
    });
  }
}
