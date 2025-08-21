# Finetuning Red-Flag Extractor (QLoRA)

This folder contains a lightweight pipeline to fine-tune a small chat model to extract red flags, symptoms, onset, severity, and possible conditions from triage narratives.

## Dataset
- Start with a synthetic + public mix:
  - `clinical-narratives-synthetic.jsonl` (included placeholder generator)
  - Public seeds: MIMIC-style deidentified triage notes (ensure license compliance) or symptom datasets like `medalpaca` formatted to our schema.

Schema per record:
```json
{
  "narrative": "patient text",
  "labels": {
    "red_flags": ["chest pain", "dyspnea"],
    "symptoms": ["chest pain", "sweating"],
    "onset": "30 minutes",
    "severity": 9,
    "possible_conditions": ["ACS", "MI"]
  }
}
```

## Training
- Method: QLoRA with PEFT adapters
- Base model: `TinyLlama/TinyLlama-1.1B-Chat-v1.0` (CPU-capable for demo)
- Output: PEFT adapter saved to `output/`

### Commands
```bash
python generate_synthetic.py --n 1000 --out data/clinical-narratives-synthetic.jsonl
python finetune.py \
  --base_model TinyLlama/TinyLlama-1.1B-Chat-v1.0 \
  --train_file data/clinical-narratives-synthetic.jsonl \
  --output_dir output
```

After training, mount `output/` into `hf-llm-service` via docker compose to serve the adapter.
