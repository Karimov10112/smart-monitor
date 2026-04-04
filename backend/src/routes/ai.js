const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const BloodSugar = require('../models/BloodSugar');
const { getAIResponse } = require('../services/aiService');

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

    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY.includes('your_')) {
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

    const avgFasting = (records.reduce((s, r) => s + r.fastingLevel, 0) / records.length).toFixed(1);
    const highCount = records.filter(r => r.fastingLevel >= 7).length;
    const lowCount = records.filter(r => r.fastingLevel < 3.9).length;

    const prompts = {
      uz: `Quyidagi qon shakari statistikasini tahlil qiling va o'zbek tilida qisqa maslahat bering:
- So'nggi ${records.length} ta yozuv
- O'rtacha och qoringa: ${avgFasting} mmol/l
- Yuqori ko'rsatkichlar (≥7): ${highCount} marta
- Past ko'rsatkichlar (<3.9): ${lowCount} marta
Eng so'nggi: ${records[0].fastingLevel} mmol/l (${new Date(records[0].date).toLocaleDateString()})`,
      ru: `Проанализируйте следующую статистику сахара крови и дайте краткий совет:
- Последних ${records.length} записей
- Средний натощак: ${avgFasting} ммоль/л
- Высокие показатели (≥7): ${highCount} раз
- Низкие показатели (<3.9): ${lowCount} раз
Последний: ${records[0].fastingLevel} ммоль/л`,
      en: `Analyze the following blood sugar statistics and give brief advice:
- Last ${records.length} records
- Average fasting: ${avgFasting} mmol/l
- High readings (≥7): ${highCount} times
- Low readings (<3.9): ${lowCount} times
Latest: ${records[0].fastingLevel} mmol/l`,
    };

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

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

module.exports = router;
