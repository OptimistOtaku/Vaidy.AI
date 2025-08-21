import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { z } from 'zod';
import { Pool } from 'pg';
import path from 'path';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8082;
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || 'app',
  password: process.env.PGPASSWORD || 'localdev',
  database: process.env.PGDATABASE || 'vaidyai',
});

type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface QueueEntry {
  queueId: string;
  encounterId: string;
  band: RiskBand;
  priorityScore: number;
  waitMinutes: number;
  ageFactor: number;
  specialNeeds: boolean;
  providerMatchScore: number;
  status: 'waiting' | 'assigned' | 'in_room' | 'complete';
  assignedProviderId?: string | null;
  createdAt: number;
  updatedAt: number;
}

const EnqueueSchema = z.object({
  encounter: z.object({
    patient: z.record(z.any()).optional(),
    specialNeeds: z.array(z.string()).default([]),
  }),
  risk: z.object({ score: z.number(), band: z.enum(['LOW','MEDIUM','HIGH','CRITICAL']) })
});

function computePriority(riskScore: number, band: RiskBand, waitMinutes: number, ageFactor: number, specialNeeds: boolean, providerMatchScore: number): number {
  if (band === 'CRITICAL') {
    return 100000 + waitMinutes; // emergency override
  }
  const Risk_Level = riskScore; // 0..100
  const Special_Needs_Flag = specialNeeds ? 1 : 0;
  return Math.floor((Risk_Level * 1000) + (waitMinutes * 2) + (ageFactor * 100) + (Special_Needs_Flag * 50) + (providerMatchScore * 25));
}

function bandFromScore(score: number): RiskBand {
  if (score >= 90) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

const app = express();
app.use(cors());
app.use(express.json());
// serve static dashboard
app.use(express.static(path.join(process.cwd(), 'public')));

const server = app.listen(PORT, async () => {
  await ensureSchema();
  console.log(`queue-service listening on ${PORT}`);
});

const wss = new WebSocketServer({ server, path: '/queue/stream' });

function broadcast(data: any) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client: any) => {
    try { client.send(msg); } catch {}
  });
}

async function ensureSchema() {
  await pool.query(`
    create table if not exists providers (
      provider_id text primary key,
      name text not null,
      specialty text,
      status text default 'available'
    );
    create table if not exists queue_entries (
      queue_id text primary key,
      encounter_id text unique not null,
      band text not null,
      priority_score int not null,
      wait_minutes int not null,
      age_factor int not null,
      special_needs boolean not null,
      provider_match_score int not null,
      status text not null,
      assigned_provider_id text references providers(provider_id),
      created_at timestamptz not null,
      updated_at timestamptz not null
    );
  `);
  const { rows } = await pool.query('select count(*)::int as c from providers');
  if (rows[0].c === 0) {
    await pool.query(
      `insert into providers(provider_id, name, specialty, status) values
        ('p1','Dr. Rao','Cardiology','available'),
        ('p2','Dr. Patel','Emergency','available'),
        ('p3','Dr. Singh','Neurology','available')`
    );
  }
}

function rowToEntry(r: any): QueueEntry {
  const createdAt = new Date(r.created_at).getTime();
  const updatedAt = new Date(r.updated_at).getTime();
  const waitMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));
  return {
    queueId: r.queue_id,
    encounterId: r.encounter_id,
    band: r.band,
    priorityScore: Number(r.priority_score),
    waitMinutes,
    ageFactor: Number(r.age_factor),
    specialNeeds: r.special_needs,
    providerMatchScore: Number(r.provider_match_score),
    status: r.status,
    assignedProviderId: r.assigned_provider_id,
    createdAt,
    updatedAt,
  };
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.get('/queue', async (_req, res) => {
  const { rows } = await pool.query('select * from queue_entries');
  const entries = rows.map(rowToEntry).sort((a: QueueEntry, b: QueueEntry) => b.priorityScore - a.priorityScore || a.createdAt - b.createdAt);
  res.json(entries);
});

app.post('/queue/enqueue', async (req, res) => {
  const parse = EnqueueSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { encounter, risk } = parse.data;
  const encounterId = `enc_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const createdAt = Date.now();
  const waitMinutes = 0;
  const ageFactor = 0; // Phase 0: no age data
  const providerMatchScore = 0;
  const specialNeeds = (encounter.specialNeeds?.length ?? 0) > 0;
  const priorityScore = computePriority(risk.score, risk.band, waitMinutes, ageFactor, specialNeeds, providerMatchScore);
  const queueId = `q_${createdAt}`;
  await pool.query(
    `insert into queue_entries(queue_id, encounter_id, band, priority_score, wait_minutes, age_factor, special_needs, provider_match_score, status, created_at, updated_at)
     values($1,$2,$3,$4,$5,$6,$7,$8,$9, to_timestamp($10/1000.0), to_timestamp($11/1000.0))`,
    [queueId, encounterId, risk.band, priorityScore, waitMinutes, ageFactor, specialNeeds, providerMatchScore, 'waiting', createdAt, createdAt]
  );
  const entry = rowToEntry({
    queue_id: queueId,
    encounter_id: encounterId,
    band: risk.band,
    priority_score: priorityScore,
    wait_minutes: waitMinutes,
    age_factor: ageFactor,
    special_needs: specialNeeds,
    provider_match_score: providerMatchScore,
    status: 'waiting',
    created_at: new Date(createdAt),
    updated_at: new Date(createdAt),
    assigned_provider_id: null,
  });
  broadcast({ type: 'queue.entry.created', entry });
  res.status(201).json({ encounterId, queueId, priorityScore });
});

app.post('/queue/update', async (req, res) => {
  const { encounterId, risk } = req.body ?? {};
  if (!encounterId || !risk) return res.status(400).json({ error: 'encounterId and risk required' });
  const { rows } = await pool.query('select * from queue_entries where encounter_id=$1', [encounterId]);
  if (rows.length === 0) return res.status(404).json({ error: 'not found' });
  const existing = rowToEntry(rows[0]);
  const now = Date.now();
  const waitMinutes = Math.floor((now - existing.createdAt) / 60000);
  const band = bandFromScore(risk.score);
  const priorityScore = computePriority(risk.score, band, waitMinutes, existing.ageFactor, existing.specialNeeds, existing.providerMatchScore);
  await pool.query(
    `update queue_entries set band=$2, priority_score=$3, wait_minutes=$4, updated_at=to_timestamp($5/1000.0) where encounter_id=$1`,
    [encounterId, band, priorityScore, waitMinutes, now]
  );
  const updated = { ...existing, band, priorityScore, waitMinutes, updatedAt: now };
  broadcast({ type: 'queue.entry.updated', entry: updated });
  res.json(updated);
});

app.get('/providers', async (_req, res) => {
  const { rows } = await pool.query('select * from providers order by name');
  res.json(rows);
});

app.post('/queue/assign', async (req, res) => {
  const { encounterId, providerId } = req.body ?? {};
  if (!encounterId || !providerId) return res.status(400).json({ error: 'encounterId and providerId required' });
  await pool.query('update queue_entries set status=$2, assigned_provider_id=$3, updated_at=now() where encounter_id=$1', [encounterId, 'assigned', providerId]);
  const { rows } = await pool.query('select * from queue_entries where encounter_id=$1', [encounterId]);
  if (rows.length === 0) return res.status(404).json({ error: 'not found' });
  const entry = rowToEntry(rows[0]);
  broadcast({ type: 'queue.entry.updated', entry });
  res.json(entry);
});


