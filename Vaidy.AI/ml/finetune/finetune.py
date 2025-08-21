import argparse, json
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer, DataCollatorForLanguageModeling
import torch
from peft import LoraConfig, get_peft_model


def build_prompt(rec):
    lab = rec["labels"]
    return (
        "You are a clinical triage assistant. Extract JSON with keys red_flags (array), "
        "symptoms (array), onset (string), severity (0-10 int), possible_conditions (array).\n"
        f"Narrative: {rec['narrative']}\n"
        f"Output JSON only.\n"
        f"Expected: {json.dumps(lab)}\n"
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base_model', type=str, required=True)
    ap.add_argument('--train_file', type=str, required=True)
    ap.add_argument('--output_dir', type=str, default='output')
    args = ap.parse_args()

    print("Loading tokenizer and model...")
    tokenizer = AutoTokenizer.from_pretrained(args.base_model)
    model = AutoModelForCausalLM.from_pretrained(args.base_model, torch_dtype=torch.float32)

    print("Setting up LoRA...")
    peft_config = LoraConfig(r=4, lora_alpha=8, lora_dropout=0.1, target_modules=['q_proj','v_proj'])
    model = get_peft_model(model, peft_config)

    print("Loading dataset...")
    ds = load_dataset('json', data_files={'train': args.train_file})

    def tokenize_fn(batch):
        texts = []
        for i in range(len(batch['narrative'])):
            rec = {
                'narrative': batch['narrative'][i],
                'labels': batch['labels'][i]
            }
            texts.append(build_prompt(rec))
        return tokenizer(texts, truncation=True, padding='max_length', max_length=256)

    print("Tokenizing dataset...")
    tokenized = ds.map(tokenize_fn, batched=True, remove_columns=ds['train'].column_names)
    collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

    print("Setting up training...")
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=8,
        learning_rate=1e-4,
        num_train_epochs=1,
        logging_steps=5,
        save_steps=50,
        save_total_limit=1,
        report_to=[],
        dataloader_pin_memory=False,
        remove_unused_columns=False
    )

    print("Starting training...")
    trainer = Trainer(model=model, args=training_args, train_dataset=tokenized['train'], data_collator=collator)
    trainer.train()
    
    print("Saving model...")
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print("Training complete!")

if __name__ == '__main__':
    main()
