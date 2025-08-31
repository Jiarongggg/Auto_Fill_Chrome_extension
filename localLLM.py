#!/usr/bin/env python3

from __future__ import annotations

from flask import Flask, jsonify, request
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

MODEL_NAME = "meta-llama/Llama-3.2-1B"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
model.eval()

app = Flask(__name__)

@app.post("/api/generate")
def generate():
    data = request.get_json(force=True)
    prompt = data.get("prompt", "")
    max_new_tokens = data.get("max_new_tokens", 128)

    inputs = tokenizer(prompt, return_tensors="pt")
    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=0.7,
        )
    text = tokenizer.decode(output_ids[0], skip_special_tokens=True)

    generated = text[len(prompt):]
    return jsonify({"response": generated})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=11434)
