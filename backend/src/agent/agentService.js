/**
 * Diabetes AI Agent — Main Service
 *
 * Architecture:
 *   agent/
 *   ├── agentService.js   ← this file (loop + LLM calls)
 *   ├── prompts.js        ← system prompts
 *   └── tools/
 *       ├── bloodSugar.js
 *       ├── profile.js
 *       ├── nutrition.js
 *       └── alertDoctor.js
 *
 * LLM: Gemini 2.5 Flash (primary) → Groq Llama 3.3 70B (fallback)
 */

const getAgentSystemPrompt = require('./prompts');
const getBloodSugar        = require('./tools/bloodSugar');
const getUserProfile       = require('./tools/profile');
const getNutritionAdvice   = require('./tools/nutrition');
const alertDoctor          = require('./tools/alertDoctor');

const GEMINI_MODEL       = 'gemini-2.5-flash';
const GEMINI_API_VERSION = 'v1beta';
const GROQ_MODEL         = 'openai/gpt-oss-120b';

const getGeminiKey = () => process.env.GEMINI_API_KEY;
const getGroqKey   = () => process.env.GROQ_API_KEY;

// ─── Tool declarations for Gemini function-calling ──────────────────────────
const TOOL_DECLARATIONS = [
  {
    name: 'get_blood_sugar',
    description: 'Foydalanuvchining qon shakari yozuvlarini DB dan oladi. Qand darajasi, o\'rtacha va trend.',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: 'Nechta yozuv (default 10, max 30)' },
      },
    },
  },
  {
    name: 'get_user_profile',
    description: 'Foydalanuvchi profil: yosh, vazn, bo\'y, diabet turi, BMI, kunlik kaloriya.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'get_nutrition_advice',
    description: 'Qand darajasiga qarab maxsus taom tavsiyasi.',
    parameters: {
      type: 'object',
      properties: {
        sugar_level: { type: 'number', description: 'Qand darajasi (mmol/l)' },
        meal_type: {
          type: 'string',
          enum: ['fasting', 'post_meal'],
          description: 'o\'lchov turi',
        },
      },
    },
  },
  {
    name: 'alert_doctor',
    description: 'Kritik holatlarda shifokorga ogohlantirish. FAQAT qand ≥14 yoki ≤3 mmol/l bo\'lsa chaqiring.',
    parameters: {
      type: 'object',
      properties: {
        sugar_level: { type: 'number', description: 'Kritik qand darajasi' },
        message:     { type: 'string', description: 'Shifokorga qo\'shimcha izoh' },
      },
      required: ['sugar_level', 'message'],
    },
  },
];

// ─── Tool executor — userId always from JWT (req.user._id) ──────────────────
const executeTool = async (name, args, userId, io, language) => {
  console.log('🔧 Tool:', name, '| User:', userId);

  switch (name) {
    case 'get_blood_sugar':    return await getBloodSugar(userId, args);
    case 'get_user_profile':   return await getUserProfile(userId);
    case 'get_nutrition_advice': return await getNutritionAdvice(userId, args);
    case 'alert_doctor':       return await alertDoctor(userId, args, io, language);
    default:                   return { error: 'Noma\'lum tool: ' + name };
  }
};

// ─── Gemini call with function declarations ──────────────────────────────────
const callGemini = async (systemPrompt, contents) => {
  const apiKey = getGeminiKey();
  if (!apiKey || apiKey.includes('your_')) throw new Error('GEMINI_API_KEY sozlanmagan');

  const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Gemini ${response.status}: ${err.slice(0, 200)}`);
  }
  return await response.json();
};

// ─── Groq fallback (no function calling — plain chat) ───────────────────────
const callGroq = async (systemPrompt, history, userMessage) => {
  const apiKey = getGroqKey();
  if (!apiKey || apiKey.includes('your_')) throw new Error('GROQ_API_KEY sozlanmagan');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-16).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content || '',
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7, max_tokens: 1200 }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Groq ${response.status}: ${err.slice(0, 200)}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
};

// ─── Main agent loop ─────────────────────────────────────────────────────────
/**
 * @param {string}   userId            - req.user._id (JWT verified — NEVER trust client)
 * @param {string}   message           - user's message
 * @param {string}   language          - 'uz' | 'ru' | 'en'
 * @param {Array}    conversationHistory - [{role, content}] max last 20
 * @param {object}   io                - socket.io instance (app.get('io'))
 */
const runAgentLoop = async ({ userId, message, language, conversationHistory, io }) => {
  language            = language || 'uz';
  conversationHistory = Array.isArray(conversationHistory) ? conversationHistory : [];

  const systemPrompt = getAgentSystemPrompt(language);

  // Build Gemini-format contents from history
  const contents = conversationHistory.slice(-20).map(turn => ({
    role: turn.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: turn.content }],
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  let finalText = '';
  let usedProvider = 'Gemini';
  let toolsUsed = [];

  const MAX_ITERATIONS = 5;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    console.log(`🤖 Agent iteration ${i + 1}/${MAX_ITERATIONS}`);

    let responseData;
    try {
      responseData = await callGemini(systemPrompt, contents);
    } catch (geminiErr) {
      console.error('⚠️ Gemini failed, trying Groq:', geminiErr.message);
      try {
        finalText = await callGroq(systemPrompt, conversationHistory, message);
        usedProvider = 'Groq';
      } catch (groqErr) {
        throw new Error('Gemini: ' + geminiErr.message + ' | Groq: ' + groqErr.message);
      }
      break;
    }

    const parts = responseData?.candidates?.[0]?.content?.parts || [];
    const functionCalls = parts.filter(p => p.functionCall);

    if (functionCalls.length === 0) {
      finalText = parts.map(p => p.text || '').join('').trim();
      break;
    }

    // Model response with function calls → append to context
    contents.push({ role: 'model', parts });

    // Execute tools and collect results
    const toolResultParts = [];
    for (const part of functionCalls) {
      const { name, args } = part.functionCall;
      toolsUsed.push(name);
      const result = await executeTool(name, args || {}, userId, io, language);
      toolResultParts.push({
        functionResponse: { name, response: { result } },
      });
    }

    contents.push({ role: 'user', parts: toolResultParts });
  }

  if (!finalText) {
    finalText = {
      uz: 'Kechirasiz, javob generatsiyasida muammo yuz berdi. Qayta urinib ko\'ring.',
      ru: 'Извините, проблема при генерации ответа. Попробуйте снова.',
      en: 'Sorry, there was an issue generating a response. Please try again.',
    }[language] || 'Xato yuz berdi.';
  }

  return { text: finalText, provider: usedProvider, toolsUsed };
};

module.exports = { runAgentLoop };
