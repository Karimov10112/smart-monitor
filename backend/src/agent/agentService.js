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
 * Resilient Multi-Provider Strategy:
 *   Primary:   Google Gemini 2.5 Flash (with function-calling)
 *   Fallback:  Groq OpenAI/GPT-120B (with full OpenAI-compatible function-calling)
 *   Result: If Gemini hits free quota (429), Groq takes over seamlessly without user noticing.
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

// ─── Gemini Tool declarations ────────────────────────────────────────────────
const GEMINI_TOOL_DECLARATIONS = [
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
    description: 'Kritik holatlarda shifokorga ogohlantirish. Och qoringa ≥11 yoki to\'q qoringa ≥14, yoxud ≤3.5 mmol/l bo\'lsa chaqiring.',
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

// ─── Groq (OpenAI-compatible) Tool declarations ─────────────────────────────
const GROQ_TOOL_DECLARATIONS = GEMINI_TOOL_DECLARATIONS.map(t => ({
  type: 'function',
  function: {
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  },
}));

// ─── Tool executor ──────────────────────────────────────────────────────────
const executeTool = async (name, args, userId, io, language) => {
  console.log('🔧 Tool:', name, '| User:', userId, '| Args:', args);

  switch (name) {
    case 'get_blood_sugar':      return await getBloodSugar(userId, args);
    case 'get_user_profile':     return await getUserProfile(userId);
    case 'get_nutrition_advice': return await getNutritionAdvice(userId, args);
    case 'alert_doctor':         return await alertDoctor(userId, args, io, language);
    default:                     return { error: 'Noma\'lum tool: ' + name };
  }
};

// ─── 1. Call Gemini ─────────────────────────────────────────────────────────
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
      tools: [{ functionDeclarations: GEMINI_TOOL_DECLARATIONS }],
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

// ─── 2. Call Groq with full tool-calling ────────────────────────────────────
const runGroqAgentLoop = async ({ systemPrompt, history, userMessage, userId, io, language }) => {
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

  const toolsUsed = [];
  const MAX_TOOL_STEPS = 4;

  for (let step = 0; step < MAX_TOOL_STEPS; step++) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        tools: GROQ_TOOL_DECLARATIONS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => '');
      throw new Error(`Groq ${response.status}: ${err.slice(0, 200)}`);
    }

    const data = await response.json();
    const choice = data?.choices?.[0];
    const assistantMsg = choice?.message;

    if (!assistantMsg) break;

    messages.push(assistantMsg);

    // If no tool calls, return final message
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      return {
        text: assistantMsg.content || '',
        toolsUsed,
      };
    }

    // Execute each tool call
    for (const tc of assistantMsg.tool_calls) {
      const toolName = tc.function.name;
      toolsUsed.push(toolName);
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(tc.function.arguments || '{}');
      } catch (_) {}

      const toolResult = await executeTool(toolName, parsedArgs, userId, io, language);

      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(toolResult),
      });
    }
  }

  // Fallback if loop ended with a tool response
  const lastMsg = messages[messages.length - 1];
  return {
    text: lastMsg?.content || 'Javob tayyorlandi.',
    toolsUsed,
  };
};

// ─── Main agent loop ─────────────────────────────────────────────────────────
const runAgentLoop = async ({ userId, message, language, conversationHistory, io }) => {
  language            = language || 'uz';
  conversationHistory = Array.isArray(conversationHistory) ? conversationHistory : [];

  const systemPrompt = getAgentSystemPrompt(language);

  // ── Try Gemini Loop First ──────────────────────────────────────────────────
  try {
    const contents = conversationHistory.slice(-20).map(turn => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }],
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    let finalText = '';
    const toolsUsed = [];
    const MAX_ITERATIONS = 5;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      console.log(`🤖 Gemini iteration ${i + 1}/${MAX_ITERATIONS}`);

      const responseData = await callGemini(systemPrompt, contents);
      const parts = responseData?.candidates?.[0]?.content?.parts || [];
      const functionCalls = parts.filter(p => p.functionCall);

      if (functionCalls.length === 0) {
        finalText = parts.map(p => p.text || '').join('').trim();
        break;
      }

      contents.push({ role: 'model', parts });

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

    if (finalText) {
      return { text: finalText, provider: 'Gemini', toolsUsed };
    }
  } catch (geminiErr) {
    console.warn('⚠️ Gemini error or quota reached, falling back to Groq:', geminiErr.message);
  }

  // ── Seamless Groq Fallback with full Tool-Calling ──────────────────────────
  try {
    console.log('🚀 Running Groq Tool-Calling Agent Fallback...');
    const groqResult = await runGroqAgentLoop({
      systemPrompt,
      history: conversationHistory,
      userMessage: message,
      userId,
      io,
      language,
    });

    return {
      text: groqResult.text,
      provider: 'Groq',
      toolsUsed: groqResult.toolsUsed,
    };
  } catch (groqErr) {
    console.error('❌ Groq fallback also failed:', groqErr.message);
    throw new Error('AI xizmatlarida xatolik yuz berdi. Iltimos, bir ozdan keyin urinib ko\'ring.');
  }
};

module.exports = { runAgentLoop };
