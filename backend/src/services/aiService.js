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

const getAIResponse = async ({ userId, role, message, language = 'uz', conversationHistory = [] }) => {
  try {
    const User = require('../models/User');
    const admin = await User.findOne({ role: 'superadmin' }).select('deepseekApiKey');
    const apiKey = admin?.deepseekApiKey || process.env.DEEPSEEK_API_KEY;

    if (!apiKey || apiKey.includes('your_')) {
      return "AI xizmati hozircha sozlanmagan.";
    }

    // Get user's recent records for context
    const recentRecords = await BloodSugar.find({ user: userId })
      .sort({ date: -1 })
      .limit(10);

    const systemPrompt = getSystemPrompt(language, role, recentRecords);

    const messages = [
      ...conversationHistory.slice(-10), 
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
      console.error('DeepSeek service error:', errText);
      return "Kechirasiz, AI xizmatida vaqtinchalik xatolik yuz berdi.";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Javob olishda xato yuz berdi.';
  } catch (err) {
    console.error('AI Service error:', err);
    return "Server xatosi tufayli AI javob bera olmadi.";
  }
};

module.exports = { getAIResponse };
