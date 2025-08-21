import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import axios from 'axios';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8081;
const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://llm-service:8083';

const IntakeSchema = z.object({
  narrative: z.string(),
  painScore: z.number().int().min(0).max(10),
  vitals: z.object({
    hr: z.number().int().optional(),
    bp: z.string().optional(),
    rr: z.number().int().optional(),
    spo2: z.number().int().optional(),
    tempC: z.number().optional(),
  }).partial(),
  language: z.string().optional(),
  specialNeeds: z.array(z.string()).optional()
});

type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type Explanation = {
  topFactors: { factor: string; weight: number }[];
  [key: string]: unknown;
};

function parseBP(bp?: string): { systolic?: number; diastolic?: number } {
  if (!bp) return {};
  const m = /^(\d{2,3})\/(\d{2,3})$/.exec(bp);
  if (!m) return {};
  return { systolic: Number(m[1]), diastolic: Number(m[2]) };
}

function scoreRisk(intake: z.infer<typeof IntakeSchema>) {
  const { painScore, vitals, narrative } = intake;
  const { hr = 80, rr = 16, spo2 = 98, tempC = 36.8 } = vitals ?? ({} as any);
  const { systolic = 120, diastolic = 80 } = parseBP(vitals?.bp);

  let base = 0;
  // simple heuristic rules
  if (/chest pain|breath|dyspnea|stroke|numb|weak/i.test(narrative)) base += 40;
  base += Math.max(0, (painScore - 5) * 5);
  if (spo2 <= 90) base += 40; else if (spo2 <= 94) base += 20;
  if (hr >= 120 || rr >= 28) base += 20;
  if (systolic >= 180 || diastolic >= 110) base += 20;
  if (tempC >= 39.0) base += 10;

  const score = Math.max(0, Math.min(100, base));
  let band: RiskBand = 'LOW';
  if (score >= 90) band = 'CRITICAL';
  else if (score >= 70) band = 'HIGH';
  else if (score >= 40) band = 'MEDIUM';

  const explanation: Explanation = {
    topFactors: [
      { factor: 'narrative_keywords', weight: /chest pain|breath|dyspnea|stroke|numb|weak/i.test(narrative) ? 40 : 0 },
      { factor: 'pain_score', weight: Math.max(0, (painScore - 5) * 5) },
      { factor: 'spo2', weight: spo2 <= 94 ? (spo2 <= 90 ? 40 : 20) : 0 },
      { factor: 'vitals_hr_rr', weight: (hr >= 120 || rr >= 28) ? 20 : 0 },
      { factor: 'hypertension', weight: (systolic >= 180 || diastolic >= 110) ? 20 : 0 },
      { factor: 'fever', weight: tempC >= 39.0 ? 10 : 0 }
    ]
  };

  return { score, band, modelVersion: 'heuristic-v0.1', explanation };
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/risk/score', (req, res) => {
  const parse = IntakeSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const result = scoreRisk(parse.data);
  // augment with LLM red flags (best-effort)
  axios.post(`${LLM_SERVICE_URL}/extract`, { narrative: parse.data.narrative }).then(r => {
    const redFlags = r.data?.data?.red_flags || [];
    (result.explanation as Explanation).llmRedFlags = redFlags;
    return res.json(result);
  }).catch(() => {
    return res.json(result);
  });
});

app.post('/risk/recalculate', (req, res) => {
  // In Phase 0, just rescore using provided updates if any
  const updates = req.body?.updates ?? {};
  const merged = { narrative: updates.narrative ?? 'update', painScore: updates.painScore ?? 5, vitals: updates.vitals ?? {}, language: 'en' };
  const parse = IntakeSchema.safeParse(merged);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const result = scoreRisk(parse.data);
  return res.json(result);
});

app.listen(PORT, () => {
  console.log(`risk-service listening on ${PORT}`);
});


