import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const CHAT_MODEL = process.env.CHAT_MODEL || "tinyllama";
const EMBED_MODEL = process.env.EMBED_MODEL || "nomic-embed-text";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let knowledgeBase = [];
let embeddingsReady = false;

app.use(cors());
app.use(express.json());

async function loadPlantsDatabase() {
  const dataPath = path.resolve(__dirname, "..", "..", "js", "data.js");
  const code = await fs.readFile(dataPath, "utf-8");
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${code}\nthis.PLANTS_DATABASE = PLANTS_DATABASE;`, context);
  return context.PLANTS_DATABASE || {};
}

function buildDocuments(plantsDb) {
  const docs = [];
  for (const [country, info] of Object.entries(plantsDb)) {
    const plants = (info.commonPlants || []).slice(0, 10).map((plant) => {
      return `${plant.name} (${plant.type}): ${plant.care} Water: ${plant.waterFreq}. Light: ${plant.light}.`;
    }).join(" ");

    const problems = (info.commonProblems || []).slice(0, 6).map((problem) => {
      return `${problem.problem} - Causes: ${problem.causes}. Solution: ${problem.solution}.`;
    }).join(" ");

    const guide = (info.careGuide || []).slice(0, 10).join(" ");

    docs.push({
      id: `country-${country}`,
      text: `Country: ${country}. Climate: ${info.climate || "N/A"}. Plants: ${plants} Problems: ${problems} Care Guide: ${guide}`
    });
  }
  return docs;
}

async function embedText(text) {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text })
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.embedding;
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i += 1) {
    const a = vecA[i];
    const b = vecB[i];
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
}

async function buildKnowledgeBase() {
  try {
    const plantsDb = await loadPlantsDatabase();
    const docs = buildDocuments(plantsDb);
    const enriched = [];

    for (const doc of docs) {
      const embedding = await embedText(doc.text);
      enriched.push({ ...doc, embedding });
    }

    knowledgeBase = enriched;
    embeddingsReady = true;
    console.log(`✅ Knowledge base ready (${knowledgeBase.length} docs).`);
  } catch (error) {
    embeddingsReady = false;
    knowledgeBase = [];
    console.warn("⚠️ Embeddings unavailable. Chat will run without project grounding.");
    console.warn(error?.message || error);
  }
}

function buildContext(queryEmbedding, topK = 3) {
  if (!embeddingsReady || !knowledgeBase.length) return "";
  const scored = knowledgeBase.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((doc) => doc.text).join("\n\n");
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  try {
    let context = "";

    if (embeddingsReady) {
      try {
        const queryEmbedding = await embedText(message);
        context = buildContext(queryEmbedding);
      } catch (error) {
        console.warn("Embedding query failed. Falling back to plain prompt.");
      }
    }

    const systemPrompt = `You are Plant Care Assistant. Use the provided project context about plants, climates, problems, and care guides. If the answer is not in the context, say you don't have that info and suggest checking the Plants or Weather pages. Keep responses concise and helpful.`;
    const prompt = `${systemPrompt}\n\nContext:\n${context || "(no context available)"}\n\nUser: ${message}\nAssistant:`;

    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CHAT_MODEL,
        prompt,
        stream: false
      })
    });

    const data = await ollamaResponse.json();
    res.json({ reply: data.response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ollama not responding" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  buildKnowledgeBase();
});
