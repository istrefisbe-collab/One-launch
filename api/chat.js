
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message = "", language = "Slovenščina" } = req.body || {};
    const text = String(message).trim();

    if (!text) {
      return res.status(400).json({ error: "Napiši vprašanje." });
    }

    return res.status(200).json({
      reply: `ONEVYO deluje. Prejel sem: "${text}" (${language}).`
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "ONEVYO napaka." });
  }
};
