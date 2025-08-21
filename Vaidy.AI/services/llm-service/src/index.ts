import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { z } from 'zod';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8083;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b-instruct';

const ExtractSchema = z.object({
  narrative: z.string(),
  language: z.string().default('en')
});

async function ollamaGenerate(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false })
  });
  if (!res.ok) throw new Error(`ollama error ${res.status}`);
  const json = await res.json() as any;
  return json.response as string;
}

function buildPrompt(narrative: string): string {
  return `You are a clinical triage assistant. Extract the following from the patient narrative, as compact JSON with keys red_flags (array of strings), symptoms (array of strings), onset (string), severity (0-10 integer if present), possible_conditions (array of strings).
Narrative: ${narrative}
Output JSON only.`;
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/extract', async (req, res) => {
  const parse = ExtractSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { narrative } = parse.data;
  try {
    const text = await ollamaGenerate(buildPrompt(narrative));
    // naive JSON parse; if fails, return raw
    let data: any = null;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    res.json({ model: OLLAMA_MODEL, data });
  } catch (e: any) {
    res.status(502).json({ error: 'llm_unavailable', details: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`llm-service listening on ${PORT}`);
});
