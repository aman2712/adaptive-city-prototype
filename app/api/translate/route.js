let lingoInstance = null;

async function getLingo() {
  if (lingoInstance) return lingoInstance;
  const mod = await import("lingo.dev/sdk");
  const { LingoDotDevEngine } = mod;
  lingoInstance = new LingoDotDevEngine({
    apiKey: process.env.LINGODOTDEV_API_KEY,
  });
  return lingoInstance;
}

export async function POST(request) {
  try {
    if (!process.env.LINGODOTDEV_API_KEY) {
      throw new Error("Missing LINGODOTDEV_API_KEY.");
    }

    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";
    const texts = Array.isArray(body?.texts) ? body.texts.filter((item) => typeof item === "string") : null;
    const sourceLocale = body?.sourceLocale || "en";
    const targetLocale = body?.targetLocale || "ar";

    if ((!text.trim() && !texts?.length) || (texts && texts.length === 0)) {
      return Response.json({ ok: false, error: "Text is required." }, { status: 400 });
    }

    const lingo = await getLingo();
    if (texts && texts.length > 0) {
      const translatedList = await Promise.all(
        texts.map((item) =>
          lingo.localizeText(item, {
            sourceLocale,
            targetLocale,
          })
        )
      );
      return Response.json({ ok: true, data: { texts: translatedList } });
    }

    const translated = await lingo.localizeText(text, { sourceLocale, targetLocale });
    return Response.json({ ok: true, data: { text: translated } });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Failed to translate text." },
      { status: 500 }
    );
  }
}
