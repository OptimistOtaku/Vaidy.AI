import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { z } from 'zod';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const RISK_SERVICE_URL = process.env.RISK_SERVICE_URL || 'http://localhost:8081';
const QUEUE_SERVICE_URL = process.env.QUEUE_SERVICE_URL || 'http://localhost:8082';

const IntakeSchema = z.object({
  patient: z.object({
    mrn: z.string().optional(),
    dob: z.string().optional(),
  }).optional(),
  narrative: z.string(),
  painScore: z.number().int().min(0).max(10),
  vitals: z.object({
    hr: z.number().int().optional(),
    bp: z.string().optional(),
    rr: z.number().int().optional(),
    spo2: z.number().int().optional(),
    tempC: z.number().optional(),
  }).partial(),
  language: z.string().default('en'),
  specialNeeds: z.array(z.string()).optional()
});

const app = express();
app.use(cors());
app.use(express.json());
// serve demo form
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Redirect GET /intake/encounters to the form for convenience
app.get('/intake/encounters', (_req, res) => {
  res.redirect(302, '/');
});

app.post('/intake/encounters', async (req, res) => {
  const parse = IntakeSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }
  const intake = parse.data;
  try {
    const riskResp = await axios.post(`${RISK_SERVICE_URL}/risk/score`, intake, { timeout: 5000 });
    const initialRisk = riskResp.data;
    const queueResp = await axios.post(`${QUEUE_SERVICE_URL}/queue/enqueue`, {
      encounter: { patient: intake.patient ?? {}, specialNeeds: intake.specialNeeds ?? [] },
      risk: initialRisk,
    }, { timeout: 5000 });
    const queue = queueResp.data;
    return res.status(201).json({
      encounterId: queue.encounterId,
      initialRisk,
      queue,
    });
  } catch (err: any) {
    const status = err?.response?.status || 500;
    return res.status(status).json({ error: 'Failed to process intake', details: err?.message });
  }
});

app.patch('/intake/encounters/:id', async (req, res) => {
  const encounterId = req.params.id;
  try {
    const riskResp = await axios.post(`${RISK_SERVICE_URL}/risk/recalculate`, { encounterId, updates: req.body }, { timeout: 5000 });
    const updatedRisk = riskResp.data;
    const queueResp = await axios.post(`${QUEUE_SERVICE_URL}/queue/update`, { encounterId, risk: updatedRisk }, { timeout: 5000 });
    return res.json({ encounterId, updatedRisk, queue: queueResp.data });
  } catch (err: any) {
    const status = err?.response?.status || 500;
    return res.status(status).json({ error: 'Failed to update encounter', details: err?.message });
  }
});

app.listen(PORT, () => {
  console.log(`intake-api listening on ${PORT}`);
});


