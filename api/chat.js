export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const text = String(message).toLowerCase();
    let module = "ONE CORE";

    if (/preved|translate|jezik|nemšč|angle|italij|hrva|srb/.test(text))
      module = "TRANSLATE";
    else if (/potov|hotel|let|flight|travel|izlet|japan/.test(text))
      module = "TRAVEL";
    else if (/posel|business|strank|ponudb|podjet|oglas/.test(text))
      module = "BUSINESS";
    else if (/denar|finance|stroš|prihod|invest|račun/.test(text))
      module = "FINANCE";
    else if (/nujn|emergency|polic|gasil|rešil|112/.test(text))
      module = "EMERGENCY";
    else if (/projekt|project|nalog|datotek/.test(text))
      module = "PROJECTS";

    const token = process.env.AI_GATEWAY_API_KEY;

    if (!token) {
      return res.status(500).json({ error: "AI Gateway key ni nastavljen" });
    }

    const response = await fetch(
      "https://ai-gateway.vercel.sh/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5.6-sol",
          messages: [
            {
              role: "system",
              content:
                `You are ONEVYO, an all-in-one AI assistant. ` +
                `Answer in the user's language unless asked to translate. ` +
                `Selected module: ${module}.`,
            },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "AI Gateway error",
      });
    }

    return res.status(200).json({
      reply: data?.choices?.[0]?.message?.content || "Ni odgovora.",
      module,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
