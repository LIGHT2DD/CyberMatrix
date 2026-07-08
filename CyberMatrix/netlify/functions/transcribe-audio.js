exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: "Method not allowed. Use POST.",
        fallback: true,
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON body.", fallback: true }),
    };
  }

  const { audio, fileName = "audio.webm" } = body;
  if (!audio || typeof audio !== "string") {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing audio data.", fallback: true }),
    };
  }

  // For OpenAI: set OPENAI_API_KEY in Netlify environment variables.
  // If you switch providers, update this code to use the provider's POST body and headers.
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    console.error("Missing OPENAI_API_KEY in environment.");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Server misconfiguration: missing API key.",
        fallback: true,
      }),
    };
  }

  try {
    const match = audio.match(/^data:(.+?);base64,(.+)$/);
    if (!match) {
      throw new Error("Audio must be a base64 data URL.");
    }

    const mimeType = match[1] || "audio/webm";
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    const formData = new FormData();
    formData.append("file", new Blob([buffer], { type: mimeType }), fileName);
    formData.append(
      "model",
      process.env.OPENAI_SPEECH_MODEL || "gpt-4o-transcribe",
    );

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI speech response ${response.status}: ${errorText}`,
      );
    }

    const result = await response.json();
    const transcription = result?.text || result?.transcription || "";

    if (!transcription) {
      throw new Error("Empty transcription received from provider.");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ transcription }),
    };
  } catch (error) {
    console.error("transcribe-audio error:", error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ error: error.message, fallback: true }),
    };
  }
};
