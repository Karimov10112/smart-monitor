const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const BloodSugar = require('../models/BloodSugar');
const { getAIResponse } = require('../services/aiService');
const { getNutritionRecommendation } = require('../services/geminiService');
const { runAgentLoop } = require('../agent/agentService'); // refactored agent/

// Rate limit: max 20 agent requests per user per minute
const agentRateLimit = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 20,                   // max 20 requests per window
  keyGenerator: (req) => req.user?._id?.toString() || req.ip, // per-user, not per-IP
  handler: (req, res) => {
    const lang = req.body?.language || 'uz';
    const msgs = {
      uz: 'Siz bir daqiqada juda ko\'p so\'rov yubordingiz (max 20). Bir oz kuting.',
      ru: 'Слишком много запросов в минуту (max 20). Подождите немного.',
      en: 'Too many requests per minute (max 20). Please wait.',
    };
    res.status(429).json({ success: false, message: msgs[lang] || msgs.uz });
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.user, // skip if no user (protect will handle)
});

// Personalized nutrition recommendation (Gemini AI)
router.post('/nutrition', protect, getNutritionRecommendation);

router.post('/chat', protect, async (req, res) => {
  try {
    const { message, language = 'uz', conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Xabar bo\'sh bo\'lmasligi kerak' });
    }

    const aiMessage = await getAIResponse({
      userId: req.user._id,
      role: req.user.role,
      message,
      language,
      conversationHistory
    });

    res.json({ success: true, message: aiMessage });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// Analyze statistics
router.post('/analyze', protect, async (req, res) => {
  try {
    const { language = 'uz' } = req.body;
    const geminiKey = process.env.GEMINI_API_KEY;
    const hasDeepSeek = process.env.DEEPSEEK_API_KEY && !process.env.DEEPSEEK_API_KEY.includes('your_');
    const hasGemini = geminiKey && !geminiKey.includes('your_');

    if (!hasDeepSeek && !hasGemini) {
      const msgs = {
        uz: "AI tahlil xizmati hozircha sozlanmagan (API kaliti yo'q).",
        ru: "AI аналитика пока не настроена (нет API ключа).",
        en: "AI analytics is not configured yet (missing API key)."
      };
      return res.status(400).json({ success: false, message: msgs[language] || msgs.uz });
    }

    const records = await BloodSugar.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(30);

    if (records.length === 0) {
      const msgs = { uz: 'Hali hech qanday yozuv yo\'q', ru: 'Нет записей', en: 'No records yet' };
      return res.json({ success: true, analysis: msgs[language] || msgs.uz });
    }

    const fastingRecords = records.filter(r => r.fastingLevel);
    const avgFasting = fastingRecords.length > 0 
      ? (fastingRecords.reduce((s, r) => s + r.fastingLevel, 0) / fastingRecords.length).toFixed(1)
      : '-';
    const highCount = records.filter(r => (r.fastingLevel >= 7 || r.postMealLevel >= 10)).length;
    const lowCount = records.filter(r => ((r.fastingLevel && r.fastingLevel < 3.9) || (r.postMealLevel && r.postMealLevel < 3.9))).length;

    const latestRec = records[0];
    const latestStrUz = latestRec.postMealLevel 
      ? `Ovqatdan keyin (to'q qoringa): ${latestRec.postMealLevel} mmol/l`
      : `Och qoringa: ${latestRec.fastingLevel || '-'} mmol/l`;
    const latestStrRu = latestRec.postMealLevel 
      ? `После еды: ${latestRec.postMealLevel} ммоль/л`
      : `Натощак: ${latestRec.fastingLevel || '-'} ммоль/л`;
    const latestStrEn = latestRec.postMealLevel 
      ? `Post-meal: ${latestRec.postMealLevel} mmol/l`
      : `Fasting: ${latestRec.fastingLevel || '-'} mmol/l`;

    const prompts = {
      uz: `Quyidagi qon shakari statistikasini tahlil qiling va o'zbek tilida lo'nda maslahat bering (maksimal 3-4 qator):
- So'nggi ${records.length} ta yozuv
- O'rtacha och qoringa: ${avgFasting} mmol/l
- Yuqori ko'rsatkichlar: ${highCount} marta
- Past ko'rsatkichlar: ${lowCount} marta
- Eng so'nggi: ${latestStrUz} (${new Date(records[0].date).toLocaleDateString()})`,
      ru: `Проанализируйте статистику сахара крови и дайте краткий совет (не более 3-4 строк):
- Записей: ${records.length}
- Средний натощак: ${avgFasting} ммоль/л
- Высокие показатели: ${highCount} раз
- Низкие показатели: ${lowCount} раз
- Последний: ${latestStrRu}`,
      en: `Analyze blood sugar statistics and give brief advice (max 3-4 lines):
- Records: ${records.length}
- Average fasting: ${avgFasting} mmol/l
- High readings: ${highCount} times
- Low readings: ${lowCount} times
- Latest: ${latestStrEn}`,
    };

    if (hasGemini) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompts[language] || prompts.uz }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 600,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const analysis = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Tahlil yakunlandi.';
        return res.json({ success: true, analysis });
      }
    }

    if (hasDeepSeek) {
      const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'Siz tibbiy maslahatchi AI siz. Qisqa va aniq javob bering.' },
            { role: 'user', content: prompts[language] || prompts.uz },
          ],
          max_tokens: 500,
          temperature: 0.5,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('DeepSeek analyze error:', data);
        return res.status(500).json({ success: false, message: 'AI xizmatida xato yuz berdi' });
      }

      const analysis = data.choices?.[0]?.message?.content || 'Tahlil qilishda xato';
      return res.json({ success: true, analysis });
    }

    return res.status(500).json({ success: false, message: 'AI tahlil xizmatida xatolik' });
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// ── AI Agent endpoint (tool-calling agentic loop) ──────────────────────────
// protect must run before agentRateLimit so keyGenerator has req.user
router.post('/agent', protect, agentRateLimit, async (req, res) => {
  try {
    const { message, language = 'uz', conversationHistory = [] } = req.body;

    // Input validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Xabar matn bo\'lishi kerak.' });
    }
    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return res.status(400).json({ success: false, message: 'Xabar bo\'sh bo\'lmasligi kerak.' });
    }
    if (trimmed.length > 2000) {
      return res.status(400).json({ success: false, message: 'Xabar 2000 belgidan uzun bo\'lmasligi kerak.' });
    }

    // Validate language
    const validLangs = ['uz', 'ru', 'en'];
    const lang = validLangs.includes(language) ? language : 'uz';

    // conversationHistory sanity check
    const history = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-20).filter(m => m && typeof m.content === 'string')
      : [];

    // userId always from JWT token (req.user._id) — never trust client body
    const result = await runAgentLoop({
      userId: req.user._id,       // ← JWT verified
      message: trimmed,
      language: lang,
      conversationHistory: history,
      io: req.app.get('io'),      // socket.io for alert_doctor
    });

    return res.json({
      success: true,
      message: result.text,
      provider: result.provider,
      toolsUsed: result.toolsUsed,
    });
  } catch (err) {
    console.error('Agent endpoint error:', err.message);

    if (err.message?.includes('429') || err.message?.toLowerCase().includes('quota')) {
      return res.status(429).json({
        success: false,
        message: 'AI so\'rovlar limiti tugadi. Bir oz kuting va qayta urinib ko\'ring.',
      });
    }
    if (err.message?.includes('API_KEY') || err.message?.includes('sozlanmagan')) {
      return res.status(503).json({
        success: false,
        message: 'AI xizmati hozirda mavjud emas. Administrator bilan bog\'laning.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Agent xizmatida xato yuz berdi.',
    });
  }
});

module.exports = router;
