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

  const { image, context: userContext = "" } = body;
  if (!image || typeof image !== "string") {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing image data.", fallback: true }),
    };
  }

  // For OpenAI: set OPENAI_API_KEY in Netlify environment variables.
  // If you switch providers, update this code to use the provider's server-side request format.
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
    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-4.1";
    const prompt = `You are a cybersecurity assistant. Analyze the image and describe any suspicious content, security warnings, visible alerts, sensitive details, or possible attack indicators. ${userContext ? `User context: ${userContext}` : ""}`;

    const payload = {
      model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: image },
          ],
        },
      ],
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI response ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    const analysis = extractOpenAIAnalysis(result);

    if (!analysis) {
      throw new Error("Empty analysis received from provider.");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ analysis }),
    };
  } catch (error) {
    console.error("analyze-image error:", error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ error: error.message, fallback: true }),
    };
  }
};

function extractOpenAIAnalysis(response) {
  if (!response) return "";
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  if (Array.isArray(response.output)) {
    return response.output
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.content) {
          if (typeof item.content === "string") return item.content;
          if (Array.isArray(item.content)) {
            return item.content
              .map((block) =>
                typeof block === "string" ? block : block?.text || "",
              )
              .join(" ");
          }
        }
        return "";
      })
      .join(" ")
      .trim();
  }

  return "";
}
