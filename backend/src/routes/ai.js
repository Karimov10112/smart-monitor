const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const BloodSugar = require('../models/BloodSugar');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const getSystemPrompt = (language, role, recentRecords) => {
  const recordsSummary = recentRecords.length > 0
    ? recentRecords.slice(0, 10).map(r =>
        `${new Date(r.date).toLocaleDateString()}: och qoringa=${r.fastingLevel} mmol/l${r.postMealLevel ? `, ovqatdan keyin=${r.postMealLevel} mmol/l` : ''}`
      ).join('\n')
    : "Ma'lumotlar yo'q";

  const prompts = {
    uz: `Siz "Qand Nazorati" ilovasining AI yordamchisisiz. Siz qandli diabet va qon shakari bilan bog'liq savollarga javob berasiz.
Foydalanuvchi roli: ${role}
So'nggi qon shakari ko'rsatkichlari:
${recordsSummary}

Qoidalar:
- Faqat sog'liq, diabet, ovqatlanish, sport bilan bog'liq savollarga javob bering
- Har doim shifokorga murojaat qilishni maslahat bering
- Statistikalarni tahlil qiling va foydali maslahatlar bering
- O'zbek tilida javob bering (agar boshqa til so'ralsa, o'sha tilda)
- Qisqa va aniq javob bering`,
    ru: `Вы AI-ассистент приложения "Контроль Сахара". Отвечаете на вопросы о диабете и уровне сахара в крови.
Роль пользователя: ${role}
Последние показатели сахара крови:
${recordsSummary}

Правила:
- Отвечайте только на вопросы о здоровье, диабете, питании, спорте
- Всегда советуйте обращаться к врачу
- Анализируйте статистику и давайте полезные советы
- Отвечайте на русском языке
- Отвечайте кратко и по делу`,
    en: `You are the AI assistant of the "Sugar Control" app. You answer questions about diabetes and blood sugar.
User role: ${role}
Recent blood sugar readings:
${recordsSummary}

Rules:
- Only answer questions about health, diabetes, nutrition, exercise
- Always recommend consulting a doctor
- Analyze statistics and provide helpful advice
- Answer in English
- Keep answers concise and clear`,
  };
  return prompts[language] || prompts.uz;
};

router.post('/chat', protect, async (req, res) => {
  try {
    const { message, language = 'uz', conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Xabar bo\'sh bo\'lmasligi kerak' });
    }

    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY.includes('your_')) {
      const msgs = {
        uz: "AI xizmati hozircha sozlanmagan (API kaliti yo'q). Iltimos, admin bilan bog'laning.",
        ru: "AI сервис пока не настроен (нет API ключа). Пожалуйста, свяжитесь с админом.",
        en: "AI service is not configured yet (missing API key). Please contact admin."
      };
      return res.status(400).json({ success: false, message: msgs[language] || msgs.uz });
    }

    // Get user's recent records for context
    const recentRecords = await BloodSugar.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(10);

    const systemPrompt = getSystemPrompt(language, req.user.role, recentRecords);

    const messages = [
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepSeek error:', errText);
      return res.status(500).json({ success: false, message: 'AI xizmatida xato yuz berdi' });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'Javob olishda xato';

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
