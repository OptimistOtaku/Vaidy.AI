from fastapi import FastAPI
from pydantic import BaseModel
import os
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from peft import PeftModel

HF_MODEL_ID = os.environ.get("HF_MODEL_ID", "TinyLlama/TinyLlama-1.1B-Chat-v1.0")
PEFT_ADAPTER_PATH = os.environ.get("PEFT_ADAPTER_PATH")

tokenizer = AutoTokenizer.from_pretrained(HF_MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(HF_MODEL_ID)

if PEFT_ADAPTER_PATH and os.path.exists(PEFT_ADAPTER_PATH):
    try:
        model = PeftModel.from_pretrained(model, PEFT_ADAPTER_PATH)
    except Exception:
        pass

pipe = pipeline("text-generation", model=model, tokenizer=tokenizer, device_map=None)

app = FastAPI()

class ExtractIn(BaseModel):
    narrative: str
    language: str | None = "en"

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/extract")
async def extract(inp: ExtractIn):
    prompt = (
        "You are a clinical triage assistant. Extract JSON with keys red_flags (array), "
        "symptoms (array), onset (string), severity (0-10 int if present), possible_conditions (array).\n"
        f"Narrative: {inp.narrative}\nOutput JSON only."
    )
    out = pipe(prompt, max_new_tokens=256, temperature=0.2, do_sample=False)
    text = out[0]["generated_text"][len(prompt):]
    try:
        import json
        data = json.loads(text)
    except Exception:
        data = {"raw": text}
    return {"model": HF_MODEL_ID, "data": data}
