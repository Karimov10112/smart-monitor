const pptxgen = require("pptxgenjs");

let pres = new pptxgen();

// Layout and slide properties
pres.layout = "LAYOUT_16x9";

// Define a master slide for common styling
pres.defineSlideMaster({
  title: "MASTER_SLIDE",
  background: { color: "F3F4F6" },
  objects: [
    { rect: { x: 0, y: 0, w: "100%", h: 0.8, fill: { color: "2563EB" } } },
    { text: { text: "Smart Monitor - Qandli Diabet", options: { x: 0.5, y: 0.2, w: 5, h: 0.4, color: "FFFFFF", fontSize: 16, bold: true, fontFace: "Arial" } } },
    { text: { text: "diabetmed.uz", options: { x: "75%", y: 0.2, w: 2.5, h: 0.4, color: "FFFFFF", fontSize: 14, align: "right", fontFace: "Arial" } } },
  ],
});

// SLIDE 1: Asosiy (Title)
let slide1 = pres.addSlide({ masterName: "MASTER_SLIDE" });
slide1.background = { color: "FFFFFF" };
slide1.addText("SMART MONITOR", { x: 1, y: 2, w: "80%", h: 1, fontSize: 44, bold: true, color: "1E3A8A", align: "center", fontFace: "Arial" });
slide1.addText("Qandli diabet nazorati va boshqaruvi tizimi", { x: 1, y: 3, w: "80%", h: 1, fontSize: 24, color: "4B5563", align: "center", fontFace: "Arial" });
slide1.addText("Taqdimotchi: Azamatjon Karimov", { x: 1, y: 4, w: "80%", h: 0.5, fontSize: 18, color: "6B7280", align: "center", fontFace: "Arial", italic: true });

// SLIDE 2: Muammo
let slide2 = pres.addSlide({ masterName: "MASTER_SLIDE" });
slide2.addText("Hozirgi kundagi muammolar", { x: 0.5, y: 1.2, w: "90%", fontSize: 32, bold: true, color: "1E3A8A", fontFace: "Arial" });
slide2.addText([
  { text: "Bemorlar holati: ", options: { bold: true } },
  { text: "Qon shakari va qon bosimi kabi ko'rsatkichlarni qog'ozda yuritishning noqulayligi." },
  { text: "\nAloqa uzilishi: ", options: { bold: true } },
  { text: "Shifokorlar har bir bemorning holatini real vaqtda kuzata olmasligi." },
  { text: "\nMa'lumotlar yo'qolishi: ", options: { bold: true } },
  { text: "Eski tibbiy varaqalarning yo'qolishi, dinamik o'zgarishlarni tahlil qilishning qiyinligi." }
], { x: 0.5, y: 2, w: "90%", h: 3, fontSize: 20, color: "374151", fontFace: "Arial", bullet: true });

// SLIDE 3: Yechim (Bizning platforma)
let slide3 = pres.addSlide({ masterName: "MASTER_SLIDE" });
slide3.addText("Yechim: Smart Monitor (diabetmed.uz)", { x: 0.5, y: 1.2, w: "90%", fontSize: 32, bold: true, color: "1E3A8A", fontFace: "Arial" });
slide3.addText("Zamonaviy, xavfsiz va aqlli platforma", { x: 0.5, y: 1.8, w: "90%", fontSize: 20, color: "10B981", fontFace: "Arial", italic: true });
slide3.addText([
  { text: "Raqamlashtirish: Barcha ma'lumotlar bulutli (cloud) tizimda ishonchli saqlanadi." },
  { text: "Real vaqtda kuzatish: Shifokorlar o'z bemorlarining holatini istalgan vaqtda ko'ra oladi." },
  { text: "Qulay tahlil: Ko'rsatkichlar tushunarli grafiklar shaklida namoyish etiladi." },
  { text: "Superadmin paneli: Barcha foydalanuvchilar, shifokorlar va bemorlarni markazlashgan boshqarish." }
], { x: 0.5, y: 2.5, w: "90%", h: 2.5, fontSize: 20, color: "374151", fontFace: "Arial", bullet: true });

// SLIDE 4: Texnologiyalar (Tech Stack)
let slide4 = pres.addSlide({ masterName: "MASTER_SLIDE" });
slide4.addText("Foydalanilgan Texnologiyalar", { x: 0.5, y: 1.2, w: "90%", fontSize: 32, bold: true, color: "1E3A8A", fontFace: "Arial" });

slide4.addText("Frontend (Foydalanuvchi qismi)", { x: 0.5, y: 2, w: "45%", fontSize: 22, bold: true, color: "2563EB", fontFace: "Arial" });
slide4.addText("• React, Vite, TypeScript\n• TailwindCSS (Zamonaviy dizayn)\n• Vercel (Yuqori tezlikdagi hosting)\n• Google Search Console (SEO ulangan)", { x: 0.5, y: 2.5, w: "45%", fontSize: 18, color: "374151", fontFace: "Arial" });

slide4.addText("Backend (Server qismi)", { x: 5, y: 2, w: "45%", fontSize: 22, bold: true, color: "10B981", fontFace: "Arial" });
slide4.addText("• Node.js, Express.js\n• MongoDB (NoSQL baza)\n• Render (Ishonchli server)\n• Resend (Email yuborish API)\n• JWT tokenlar (Kuchli xavfsizlik)", { x: 5, y: 2.5, w: "45%", fontSize: 18, color: "374151", fontFace: "Arial" });

// SLIDE 5: Asosiy funksiyalar (Key Features)
let slide5 = pres.addSlide({ masterName: "MASTER_SLIDE" });
slide5.addText("Platformaning Asosiy Imkoniyatlari", { x: 0.5, y: 1.2, w: "90%", fontSize: 32, bold: true, color: "1E3A8A", fontFace: "Arial" });
slide5.addText([
  { text: "Xavfsiz avtorizatsiya va Email tasdiqlash (OTP yoki link orqali)." },
  { text: "Bemorlar uchun kundalik qon shakari, bosimi, vazni va dori-darmonlar jadvali." },
  { text: "Shifokorlar o'z bemorlarining hisobotlarini ko'rishi va maslahat yozishi." },
  { text: "Admin panel: Statistikalar, tizimdagi foydalanuvchilarni to'liq boshqarish." },
  { text: "Responsive dizayn: Kompyuter, planshet va mobil telefonda mukammal ishlaydi." }
], { x: 0.5, y: 2, w: "90%", h: 3, fontSize: 20, color: "374151", fontFace: "Arial", bullet: true });

// SLIDE 6: Kelajak rejalari
let slide6 = pres.addSlide({ masterName: "MASTER_SLIDE" });
slide6.addText("Kelajakdagi Rejalar", { x: 0.5, y: 1.2, w: "90%", fontSize: 32, bold: true, color: "1E3A8A", fontFace: "Arial" });
slide6.addText([
  { text: "Mobil Ilova: Expo va React Native yordamida iOS va Android ilovalarini to'liq ishga tushirish (kod bazasi boshlangan)." },
  { text: "Sun'iy Intellekt (AI): Bemorning ma'lumotlariga qarab avtomatik maslahatlar beruvchi AI bot qo'shish." },
  { text: "Smart Soatlar Integratsiyasi: Aqlli soatlardan ko'rsatkichlarni to'g'ridan-to'g'ri tizimga qabul qilish." }
], { x: 0.5, y: 2, w: "90%", h: 2.5, fontSize: 20, color: "374151", fontFace: "Arial", bullet: true });

// SLIDE 7: Xotima
let slide7 = pres.addSlide({ masterName: "MASTER_SLIDE" });
slide7.background = { color: "1E3A8A" };
slide7.addText("E'tiboringiz Uchun Rahmat!", { x: 1, y: 2.5, w: "80%", h: 1, fontSize: 44, bold: true, color: "FFFFFF", align: "center", fontFace: "Arial" });
slide7.addText("diabetmed.uz", { x: 1, y: 3.5, w: "80%", h: 1, fontSize: 24, color: "93C5FD", align: "center", fontFace: "Arial" });

// Save the Presentation
const filename = "Smart_Monitor_Taqdimot.pptx";
pres.writeFile({ fileName: `../${filename}` }).then(fileName => {
  console.log(`created presentation: ${fileName}`);
});
