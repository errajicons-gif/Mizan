import express from 'express';
import dotenv from 'dotenv';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ChatHistoryTurn {
  role: 'user' | 'assistant';
  text: string;
}

interface ChatRequestBody {
  message?: string;
  language?: 'ar' | 'fr';
  history?: ChatHistoryTurn[];
  context?: {
    profileSummary?: string;
    todayTotals?: string;
    matchedFoods?: string;
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const body = req.body as ChatRequestBody;
      const userMessage = body.message?.trim();
      if (!userMessage) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error:
            body.language === 'fr'
              ? 'La clé API Gemini n’est pas configurée sur le serveur.'
              : 'مفتاح خدمة الذكاء الاصطناعي غير مضبوط على الخادم حالياً.',
        });
        return;
      }

      const lang = body.language === 'fr' ? 'French' : 'Arabic';
      const systemInstruction = `You are "MIZAN AI – مستشارك الغذائي الذكي", an empathetic, evidence-based Moroccan nutrition educator inside the MIZAN (ميزان) app.

CORE PRINCIPLES:
1. Language: Respond naturally in ${lang} (or match the user's language if they write in Arabic or French). Understand Moroccan culinary terms (الحريرة، البسارة، البلبولة، التكتوكة، الزعلوك، الطاجين، الكسكس، خبز الشعير، السردين، زيت أركان، الجبن البلدي، الرفيسة).
2. Scientific Integrity: Base nutritional advice on established nutrition science (FAO/WHO, ANSES-CIQUAL, USDA FoodData Central). Never invent exact nutrient numbers if not provided in the verified database snippet below; give general evidence-based ranges or cite the verified MIZAN food values provided.
3. Medical Boundaries: Clearly distinguish nutritional education from medical diagnosis. NEVER diagnose diseases, NEVER recommend stopping medication or changing dosages, NEVER prescribe therapeutic/extreme restrictive diets. Encourage consulting a physician or registered dietitian for clinical conditions, abnormal lab values, or youth/pregnancy needs.
4. Body-Neutral & Age-Aware: Do not assume everyone wants weight loss. Respect the user's age, preferences, allergies, and cultural food habits. Keep answers practical, structured, warm, and concise (around 120-260 words unless the user asks for detail).

VERIFIED MIZAN CONTEXT (use only if relevant):
- User context: ${body.context?.profileSummary || 'Not shared'}
- Today logged intake: ${body.context?.todayTotals || 'No meals logged yet today'}
- Matched foods from MIZAN verified DB (per 100g): ${body.context?.matchedFoods || 'None matched directly'}`;

      const contents = [
        ...(body.history || []).slice(-8).map((turn) => ({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.text }],
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Empty response from AI model.' });
        return;
      }

      res.json({ reply });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected server error';
      console.error('MIZAN AI chat error:', message);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/ai/plan-insight', async (req, res) => {
    try {
      const body = req.body as {
        language?: 'ar' | 'fr';
        mode?: string;
        profileSummary?: string;
        sampleMeals?: string[];
      };

      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({ error: 'Gemini API key not configured.' });
        return;
      }

      const lang = body.language === 'fr' ? 'French' : 'Arabic';
      const prompt = `Provide a brief, encouraging 3-bullet culinary & nutritional summary in ${lang} for this Moroccan weekly meal plan.
Mode: ${body.mode || 'balanced'}
User context: ${body.profileSummary || 'General balanced Moroccan nutrition'}
Selected dishes this week: ${(body.sampleMeals || []).join(', ')}

Keep it concise (under 110 words), warm, practical, and non-restrictive. Highlight Moroccan seasonal balance, fiber, and healthy fats like olive oil.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
      });

      res.json({ insight: response.text?.trim() || '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI insight error';
      res.status(500).json({ error: message });
    }
  });

  const httpServer = createHttpServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: true,
        ws: { server: httpServer },
        watch: disableHmr ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`MIZAN server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
