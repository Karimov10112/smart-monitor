const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const BloodSugar = require('../models/BloodSugar');
const { getAIResponse } = require('../services/aiService');
const { getNutritionRecommendation } = require('../services/geminiService');

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

module.exports = router;
