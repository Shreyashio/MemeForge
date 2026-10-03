export interface GemmaConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

export function getGemmaConfig(): GemmaConfig {
  const baseUrl = process.env.GEMMA_BASE_URL;
  const model = process.env.GEMMA_MODEL;
  const apiKey = process.env.GEMMA_API_KEY;

  if (!baseUrl || !model || !apiKey) {
    throw new Error("Missing GEMMA_BASE_URL, GEMMA_MODEL, or GEMMA_API_KEY in environment");
  }

  return { baseUrl, model, apiKey };
}

export async function generateMemeProject(idea: string): Promise<string> {
  const { baseUrl, model, apiKey } = getGemmaConfig();

  const systemPrompt = `You are a deadpan corporate crypto parody generator. Generate a completely fake cryptocurrency project. 
  You MUST return ONLY valid JSON with NO markdown fences, NO explanation, NO preamble. 
  The tone should be extremely serious and corporate about a ridiculous meme coin. 
  Return JSON matching the exact schema:
  {
    "name": string, "ticker": string (3-5 uppercase letters), "tagline": string,
    "theme": {"primary": hex, "secondary": hex, "background": hex, "mood": "dark"|"light"},
    "emoji": string, "hero": {"headline": string, "subtext": string, "cta": string},
    "features": [{"title": string, "description": string}] (3),
    "tokenomics": [{"label": string, "percent": number}] (4-5, sum to 100, funny labels),
    "roadmap": [{"phase": string, "title": string, "items": [string]}] (3),
    "team": [{"name": string, "role": string}] (3 absurd fake members),
    "whitepaper": {"abstract": string, "problem": string, "solution": string, "tokenomics_text": string, "risks": string, "conclusion": string},
    "logo_svg": string (simple SVG under 1500 chars using theme colors)
  }`;

  const userPrompt = `Generate a fake crypto project based on this idea: ${idea}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from LLM");
  }
  return content;
}
