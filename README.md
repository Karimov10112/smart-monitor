# 💙 Qand Nazorati — To'liq Loyiha

Qandli diabet nazorat tizimi. **Backend + Frontend + Database** to'liq loyiha.

---

## 📁 Loyiha tuzilmasi

```
diabetes_project/
├── backend/          # Node.js + Express + MongoDB
└── frontend/         # React + TypeScript + Tailwind
```

---

## 🚀 Ishga tushirish

### 1. MongoDB o'rnatish
MongoDB'ni o'rnating yoki [MongoDB Atlas](https://www.mongodb.com/atlas) dan foydalaning.

### 2. Backend sozlash

```bash
cd backend
npm install

# .env fayl yarating
cp .env.example .env
# .env faylini tahrirlang (pastda tushuntirish bor)

npm run dev
```

### 3. Frontend sozlash

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:5000

---

## ⚙️ .env Sozlamalari (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/diabetes_db

# JWT (o'zgartiring!)
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Email (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sizning_email@gmail.com
EMAIL_PASS=gmail_app_password   # Gmail > Sozlamalar > 2FA > App passwords
EMAIL_FROM=noreply@diabetesapp.uz

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Facebook OAuth (developers.facebook.com)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

FRONTEND_URL=http://localhost:5173

# Gemini AI (aistudio.google.com) - Asosiy Agent LLM
GEMINI_API_KEY=your_gemini_api_key

# Groq Cloud (console.groq.com) - Zaxira Agent LLM (Llama 3.3 70B)
GROQ_API_KEY=your_groq_api_key

# Super Admin (birinchi ishga tushganda avtomatik yaratiladi)
SUPER_ADMIN_EMAIL=admin@diabetesapp.uz
SUPER_ADMIN_PASSWORD=SuperAdmin123!
```

---

## 🔑 Funksiyalar

### Autentifikatsiya
- ✅ Email + parol bilan ro'yxatdan o'tish
- ✅ Email OTP tasdiqlash (6 xonali kod)
- ✅ Parol bilan kirish
- ✅ Email OTP bilan kirish (parolsiz)
- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ Parolni unutdim / tiklash
- ✅ JWT Access + Refresh token
- ✅ Auto token yangilash

### Foydalanuvchi profili
- ✅ Ism, familiya, telefon
- ✅ Tug'ilgan sana, jins
- ✅ **Viloyat** (14 ta O'zbekiston viloyati)
- ✅ **Tuman/Shahar**
- ✅ Diabet turi (1-tip, 2-tip, prediabet, homiladorlik, yo'q)
- ✅ Shifokor ismi

### Super Admin Panel
- ✅ Dashboard: foydalanuvchilar soni, aktiv, bloklangan
- ✅ Viloyatlar bo'yicha statistika
- ✅ Diabet turlari bo'yicha statistika
- ✅ Barcha foydalanuvchilarni ko'rish (qidirish, filtrlash)
- ✅ Foydalanuvchi qon shakari yozuvlarini ko'rish
- ✅ Foydalanuvchini bloklash / blokdan chiqarish
- ✅ Rolni o'zgartirish (user / doctor / superadmin)
- ✅ Admin eslatmasi qo'shish
- ✅ Foydalanuvchini o'chirish

### Qon shakari
- ✅ Yozuv qo'shish (och qoringa, ovqatdan keyin)
- ✅ Tarix ko'rish
- ✅ Statistika
- ✅ Maslahatlar

### 🤖 AI Agent (Gemini 2.5 Flash + Groq Llama 3.3 70B)
- ✅ Barcha sahifalarda suzuvchi (floating) AI maslahatchi
- ✅ Agentic Loop & Tool Calling (avtomatik asboblar chaqirish)
- ✅ `get_recent_blood_sugar` — oxirgi qand ko'rsatkichlarini DB'dan olish
- ✅ `get_user_profile` — xavfsiz profil ma'lumotlarini o'qish (parol/tokenlar chiqarilmaydi)
- ✅ `get_nutrition_advice` — uglevod, non birligi (XE), glikemik indeks maslahatlari
- ✅ `alert_doctor` — server tomonida tekshiriluvchi kritik qand holatida shifokorga real-time ogohlantirish (Socket.io) va AuditLog
- ✅ Gemini birlamchi + Groq zaxira (har doim bepul va yuqori tezlikda)
- ✅ Ko'p muloqotli xotira (Multi-turn conversation history)
- ✅ 3 tilda javob (uz/ru/en) va tezkor takliflar (Quick prompts)
- ✅ Rate limiting (har bir autentifikatsiyalangan foydalanuvchiga 20 so'rov/daqiqa)

### UI/UX
- ✅ Dark / Light mode
- ✅ 3 til: O'zbek, Rus, Ingliz
- ✅ To'liq responsive (mobil + desktop)
- ✅ Smooth animatsiyalar

---

## 🔒 API Endpointlar

### Auth
```
POST /api/auth/register          - Ro'yxatdan o'tish
POST /api/auth/verify-otp        - Email OTP tasdiqlash
POST /api/auth/login             - Kirish (parol)
POST /api/auth/email-login       - Kirish (email OTP)
POST /api/auth/forgot-password   - Parolni tiklash so'rovi
POST /api/auth/reset-password    - Yangi parol o'rnatish
POST /api/auth/refresh-token     - Token yangilash
GET  /api/auth/me                - Mening ma'lumotlarim
POST /api/auth/logout            - Chiqish
POST /api/auth/complete-profile  - Profilni to'ldirish
GET  /api/auth/google            - Google bilan kirish
GET  /api/auth/facebook          - Facebook bilan kirish
```

### Qon shakari
```
GET    /api/blood-sugar          - Yozuvlar ro'yxati
POST   /api/blood-sugar          - Yangi yozuv
GET    /api/blood-sugar/stats    - Statistika
PUT    /api/blood-sugar/:id      - Yozuvni yangilash
DELETE /api/blood-sugar/:id      - Yozuvni o'chirish
```

### Admin (faqat superadmin)
```
GET    /api/admin/stats              - Dashboard statistika
GET    /api/admin/users              - Barcha foydalanuvchilar
GET    /api/admin/users/:id          - Bitta foydalanuvchi
GET    /api/admin/users/:id/records  - Foydalanuvchi yozuvlari
PATCH  /api/admin/users/:id/role     - Rolni o'zgartirish
PATCH  /api/admin/users/:id/ban      - Ban / unban
PATCH  /api/admin/users/:id/notes    - Admin eslatmasi
DELETE /api/admin/users/:id          - O'chirish
```

### AI Agent
```
POST /api/ai/agent      - AI Agent bilan suhbat (Tool-calling, Gemini + Groq)
POST /api/ai/chat       - Oddiy AI chat
POST /api/ai/analyze    - Statistikani tahlil qilish
```

---

## 📦 Texnologiyalar

### Backend
- **Node.js** + **Express** — server
- **MongoDB** + **Mongoose** — database
- **JWT** — autentifikatsiya (Access + Refresh tokens)
- **Socket.io** — real-time shifokor ogohlantirishlari va chat
- **Passport.js** — Google/Facebook OAuth
- **Nodemailer / Resend** — email xizmatlari
- **bcryptjs** — parol shifrlash
- **express-rate-limit** — xavfsizlik va DDoS himoyasi

### Frontend
- **React 18** + **TypeScript**
- **React Router v6** — routing
- **Axios** — API so'rovlar
- **Material-UI (MUI)** & **Tailwind CSS** — dizayn tizimi
- **Framer Motion** — premium animatsiyalar
- **Recharts** — interaktiv tibbiy grafiklar
- **Sonner** — bildirishnomalar

### AI Texnologiyalari
- **Google Gemini 2.5 Flash** (`@google/generative-ai`) — Tool-calling qobiliyatiga ega asosiy aqlli agent
- **Groq Cloud API** (`llama-3.3-70b-versatile`) — yuqori tezlikdagi zaxira LLM provider
