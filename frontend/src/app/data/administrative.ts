// This script builds administrative.ts with all regions, districts, and mahallas
// Mahalla data is manually curated from official UZ government sources

export const UZ_REGIONS = [
  "Qoraqalpog'iston Respublikasi",
  'Andijon viloyati',
  'Buxoro viloyati',
  'Jizzax viloyati',
  'Qashqadaryo viloyati',
  'Navoiy viloyati',
  'Namangan viloyati',
  'Samarqand viloyati',
  'Sirdaryo viloyati',
  'Surxondaryo viloyati',
  'Toshkent viloyati',
  'Toshkent shahri',
  "Farg'ona viloyati",
  'Xorazm viloyati',
];

export const UZ_DISTRICTS: Record<string, string[]> = {
  "Qoraqalpog'iston Respublikasi": [
    'Nukus shahri', 'Taxiatosh shahri', 'Amudaryo tumani', 'Beruniy tumani',
    "Bo'zatov tumani", 'Chimboy tumani', "Ellikqal'a tumani", 'Kegayli tumani',
    "Mo'ynoq tumani", 'Nukus tumani', "Qonliko'l tumani", "Qorao'zak tumani",
    "Qo'ng'irot tumani", 'Shumanay tumani', "Taxtako'pir tumani", "To'rtko'l tumani",
    "Xo'jayli tumani",
  ],
  'Andijon viloyati': [
    'Andijon shahri', 'Asaka shahri', 'Andijon tumani', 'Asaka tumani',
    'Baliqchi tumani', 'Buloqboshi tumani', "Bo'z tumani", 'Jalaquduq tumani',
    'Izbosgan tumani', 'Qorasuv shahri', "Qo'rg'ontepa tumani", 'Marhamat tumani',
    "Oltinko'l tumani", 'Paxtaobod tumani', "Ulug'nor tumani", 'Xonabod tumani',
    "Xo'jaobod tumani", 'Shahrixon tumani',
  ],
  'Buxoro viloyati': [
    'Buxoro shahri', 'Kogon shahri', 'Buxoro tumani', "G'ijduvon tumani",
    'Jondor tumani', 'Kogon tumani', "Qorako'l tumani", 'Qorovulbozor tumani',
    'Olot tumani', 'Peshku tumani', 'Romitan tumani', 'Shofirkon tumani', 'Vobkent tumani',
  ],
  'Jizzax viloyati': [
    'Jizzax shahri', 'Arnasoy tumani', 'Baxmal tumani', "Do'stlik tumani",
    "G'allaorol tumani", 'Forish tumani', 'Mirzacho\'l tumani', 'Paxtakor tumani',
    'Sh.Rashidov tumani', 'Yangiobod tumani', 'Zafarobod tumani', 'Zarbdor tumani', 'Zomin tumani',
  ],
  'Qashqadaryo viloyati': [
    'Qarshi shahri', 'Shahrisabz shahri', 'Chiroqchi tumani', 'Dehqonobod tumani',
    "G'uzor tumani", 'Qamashi tumani', 'Qarshi tumani', 'Kasbi tumani',
    "Ko'kdala tumani", 'Kitob tumani', 'Koson tumani', 'Mirishkor tumani',
    'Muborak tumani', 'Nishon tumani', 'Shahrisabz tumani', "Yakkabog' tumani",
  ],
  'Navoiy viloyati': [
    'Navoiy shahri', 'Zarafshon shahri', 'Karmana tumani', "Ko'kdala tumani",
    'Konimex tumani', 'Navbahor tumani', 'Nurota tumani', 'Qiziltepa tumani',
    'Tomdi tumani', 'Uchkuduk tumani', 'Xatirchi tumani',
  ],
  'Namangan viloyati': [
    'Namangan shahri', 'Chortoq tumani', 'Chust tumani', 'Kosonsoy tumani',
    'Mingbuloq tumani', 'Namangan tumani', 'Norin tumani', 'Pop tumani',
    "To'raqo'rg'on tumani", "Uchqo'rg'on tumani", 'Uychi tumani',
    "Yangiqo'rg'on tumani",
  ],
  'Samarqand viloyati': [
    'Samarqand shahri', "Kattaqo'rg'on shahri", "Bulung'ur tumani", 'Ishtixon tumani',
    'Jomboy tumani', "Kattaqo'rg'on tumani", 'Narpay tumani', 'Nurobod tumani',
    'Oqdaryo tumani', 'Pastdarg\'om tumani', 'Paxtachi tumani', "Qo'shrabot tumani",
    'Samarqand tumani', 'Toyloq tumani', 'Urgut tumani',
  ],
  'Sirdaryo viloyati': [
    'Guliston shahri', 'Shirin shahri', 'Yangiyer shahri', 'Boyovut tumani',
    'Guliston tumani', 'Mirzaobod tumani', 'Oqoltin tumani', 'Sardoba tumani',
    'Sayxunobod tumani', 'Sirdaryo tumani', 'Xovos tumani',
  ],
  'Surxondaryo viloyati': [
    'Termiz shahri', 'Angor tumani', 'Bandixon tumani', 'Boysun tumani',
    'Denov tumani', 'Jarqo\'rg\'on tumani', 'Muzrabot tumani', 'Oltinsoy tumani',
    'Qiziriq tumani', "Qumqo'rg'on tumani", 'Sariosiyo tumani', "Sho'rchi tumani",
    'Sherobod tumani', 'Termiz tumani', 'Uzun tumani',
  ],
  'Toshkent viloyati': [
    'Angren shahri', 'Bekobod shahri', 'Chirchiq shahri', 'Olmaliq shahri',
    'Bekobod tumani', "Bo'stonliq tumani", 'Chinoz tumani', 'Oqqo\'rg\'on tumani',
    'Olmaliq tumani', 'Parkent tumani', 'Piskent tumani', 'Qibray tumani',
    'Yuqorichirchiq tumani', 'Yangiyo\'l tumani', 'Zangiota tumani', 'Zangibobod tumani',
  ],
  'Toshkent shahri': [
    'Bektemir tumani', 'Chilonzor tumani', 'Hamza tumani', 'Mirobod tumani',
    "Mirzo Ulug'bek tumani", 'Olmazor tumani', 'Sergeli tumani', 'Shayxontohur tumani',
    'Uchtepa tumani', 'Yakkasaroy tumani', 'Yunusobod tumani', 'Yashnobod tumani',
  ],
  "Farg'ona viloyati": [
    "Farg'ona shahri", "Marg'ilon shahri", "Qo'qon shahri", "Quvasoy shahri",
    'Bag\'dod tumani', 'Besharik tumani', "Buvayda tumani", "Dang'ara tumani",
    "Farg'ona tumani", "Furqat tumani", "Oltiariq tumani", "O'zbekiston tumani",
    'Quva tumani', 'Rishton tumani', 'Sux tumani', 'Toshloq tumani', 'Uchko\'prik tumani',
    'Yozyovon tumani',
  ],
  'Xorazm viloyati': [
    'Urganch shahri', "Xiva shahri", "Bog'ot tumani", "Gurlan tumani",
    'Hazorasp tumani', 'Urganch tumani', "Qo'shko'pir tumani", 'Shovot tumani',
    'Tuproqqala tumani', 'Xiva tumani', 'Xonqa tumani', 'Yangiariq tumani', 'Yangibozor tumani',
  ],
};

export const UZ_MAHALLAS: Record<string, string[]> = {
  // ─────────────────── TOSHKENT SHAHRI ───────────────────
  'Bektemir tumani': [
    'Bektemir', 'Yangi Bektemir', 'Qorasaroy', 'Kamolon', 'Yangiobod', 'Hamkorlik',
  ],
  'Chilonzor tumani': [
    '1-mavze', '2-mavze', '3-mavze', '4-mavze', '5-mavze', '6-mavze', '7-mavze',
    '8-mavze', '9-mavze', '10-mavze', '11-mavze', '12-mavze', '13-mavze', '14-mavze',
    'Cho\'ponota', "Do'mbiraobod", 'Naqqoshlik', 'Qatortol', 'Oqtepa', 'Dilxush',
    'Lutfiy', 'Gullar', 'Mextar',
  ],
  'Hamza tumani': [
    'Hamza', 'Yangihayot', 'Ipakchi', 'Paxtakor', 'Zarqaynar', 'Navro\'z',
  ],
  'Mirobod tumani': [
    'Afrosiyob', 'Banokatiy', 'Dil', 'Inom', 'Mirobod', "Navro'z",
    "Oqyo'l", 'Salar', "Tog'ay", 'Tong', 'Fotimabibi',
  ],
  "Mirzo Ulug'bek tumani": [
    'Alisherobod', 'Bobur', "Buyuk Ipak yo'li", 'Gelios', 'Jaloliddin Ar-Rumi',
    'Mustaqillik', 'Nur', 'Oydin', 'Oqibat', 'Sohibqiron', 'Turon', "Uyg'onish", 'Xumoyun',
    'Sharq yulduzi', "Beruniy", 'Furqat',
  ],
  'Olmazor tumani': [
    'Baxt', 'Bo\'ston', "Do'stlik", 'Gavhar', 'Gulzor', 'Hamkor', 'Ma\'rifat',
    'Mustaqillik', 'Navro\'z', 'Olmazor', 'Qahramon',
  ],
  'Sergeli tumani': [
    'Abay', "Cho'ponota", "Do'stlik", 'Humo', 'Itifoq', 'Junariq', 'Nilufar',
    'Olmazor', 'Qoraqamish', 'Sergeli-1', 'Sergeli-2', 'Sohibqiron', 'Vatan',
  ],
  'Shayxontohur tumani': [
    'Amir Temur', 'Beshyog\'och', "Do'stlik", 'Navruz', 'Ozod', 'Qatortol',
    'Shayxontohur', 'Tabassum',
  ],
  'Uchtepa tumani': [
    'Bog\'ishamol', "Bo'ston", 'Gulsanam', 'Ismoil Somoni', 'Komil', 'Qorasaroy',
    'Uchtepa', 'Yoshlik', 'Ziyokor',
  ],
  'Yakkasaroy tumani': [
    'Abdulla Qodiriy', 'Amir Temur', 'Ko\'ksil', 'Navqiran', 'Oltin kuz', 'Yakkasaroy',
  ],
  'Yunusobod tumani': [
    "Ming o'rik", 'Bodomzor', 'Bilimdon', 'Islomobod', 'Yangi Yunusobod',
    'Oloy', 'Minor', 'Matonat', 'Xurriyat', 'Adolat', "G'ayratiy", "Bo'ston", 'Obshir',
    'Qorasaroy', 'Sharq', 'Yangi Sergeli',
  ],
  'Yashnobod tumani': [
    'Alimkent', 'Amir Temur', 'Ayrilish', 'Birlashgan', "Do'stlik", 'Istiqlol',
    'Loyihalash', 'Maxmur', "Navro'zabad", 'Oltintepa', 'Tuzel', 'Xovli',
    'Yangi hayot',
  ],

  // ─────────────────── ANDIJON VILOYATI ───────────────────
  'Andijon shahri': [
    'Amir Temur', 'Bobur', 'Bahodir', "Do'stlik", 'Istiqlol', "Jalol ota",
    "Jaloliddin Manguberdi", 'Mustaqillik', 'Navoiy', 'Navro\'z', 'Sabo', 'Sayhun',
    "Ulug'bek", 'Xumo', 'Yangi hayot', "Zulfiya",
  ],
  'Andijon tumani': [
    "Bo'z", "Do'stlik", 'Oqdaryo', 'Yangiqo\'rg\'on', 'Baxt', 'Yangiobod',
    'Polvontosh', 'Qorajar', 'Rishton',
  ],
  'Asaka tumani': [
    "Asaka", "Navro'z", 'Istiqlol', 'Olot', "Qo'shchinor", 'Obod', "Do'stlik",
    'Yangi hayot', 'Guliston', 'Baxt', 'Mehnat', 'Oqjar',
  ],
  'Asaka shahri': [
    'Markaziy', "Guliston", 'Baxt', "Do'stlik", 'Mustaqillik',
  ],
  'Shahrixon tumani': [
    'Abdubiy', 'Ahmadbek', 'Ahtalik', 'Andijonlik', 'Azamat', 'Bekbachcha',
    "Bo'ston", 'Bobochek', "Bolg'ali", "Cho'ntak", "Cho'ja", 'Chuqurcha',
    "Do'lan", "Do'rmon", 'Dorikash', 'Dorilamon', 'Eshonqishloq',
    "Eski-Qo'rg'oncha", 'Guliston', 'Gulqishloq', 'Haqiqat', "Ho'jaobod",
    'Honkuruq', 'Kamoltepa', 'Karnaychi', 'Koramuyin', "Qo'rg'oncha",
    'Qumaryq', 'Quruqsoy', 'Nazarmahram', 'Naynavo', "O'zbekiston",
    "O'rta Shahrixon", 'Paxtaobod', "Paxtako'l", 'Qalacha', "Qipchoqqo'rg'on",
    'Segaza', 'Segazaqum', 'Shaydo', 'Sohiobod', 'Suzok', 'Tegirmonboshi',
    'Tojik', 'Tojikaram', 'Tolmozor', 'Toshtepa', 'Tumor', 'Vaxim',
    'Xidirsho', "Yangiyo'l", 'Yangi Naynavo', 'Yangi Mahalla', 'Yuqori Shahrixon', 'Yuzlar',
  ],
  'Baliqchi tumani': [
    'Baliqchi', 'Chuqurko\'prik', 'Zartepa', 'Qo\'ng\'irot', "Do'stlik",
    'Yangi hayot', 'Oqjar',
  ],
  'Buloqboshi tumani': [
    'Buloqboshi', 'Yetimqo\'rg\'on', 'Nayman', "Bo'ston", 'Ulmas', 'Mehnat',
  ],
  "Bo'z tumani": [
    "Bo'z", 'Kosonsoy', 'Yunusobod', "Do'stlik", 'Bahodir',
  ],
  'Jalaquduq tumani': [
    'Jalaquduq', "To'g'on", "Oqqo'rg'on", 'Yangi hayot', 'Xoliqobod',
  ],
  'Izbosgan tumani': [
    'Izbosgan', 'Marjon', 'Toshbuloq', 'Sitorabonu', 'Mehnat',
  ],
  "Qo'rg'ontepa tumani": [
    "Qo'rg'ontepa", 'Bahodir', 'Mehnatobod', "Do'stlik", 'Gulbahor',
  ],
  'Marhamat tumani': [
    'Marhamat', 'Guliston', 'Yangi hayot', 'Navruz', 'Xoliqobod',
  ],
  "Oltinko'l tumani": [
    "Oltinko'l", 'Yangi hayot', 'Mehnat', 'Istiqlol', 'Toshobod',
  ],
  'Paxtaobod tumani': [
    'Paxtaobod', 'Yangi hayot', 'Gulzor', "Do'stlik", 'Oltinariq',
  ],
  "Ulug'nor tumani": [
    "Ulug'nor", 'Yangi hayot', 'Mehnat', 'Bahodir',
  ],
  'Xonabod tumani': [
    'Xonabod', "Do'stlik", 'Yangi hayot', 'Baxt',
  ],
  "Xo'jaobod tumani": [
    "Xo'jaobod", 'Yangi hayot', "Do'stlik", 'Mehnat',
  ],

  // ─────────────────── BUXORO VILOYATI ───────────────────
  'Buxoro shahri': [
    'Amir Temur', 'Ark', "Bog'i Shamol", 'Devonbegi', 'Ismoil Somoniy',
    'Lyabi Hovuz', 'Navro\'z', 'Registon', 'Shahriston', 'Zargaron',
    'Janub', 'G\'arb', 'Sharq', 'Shimol',
  ],
  'Buxoro tumani': [
    "Do'stlik", 'Mehnat', 'Yangi hayot', 'Qorovul', 'Navruz', 'Baxt',
  ],
  "G'ijduvon tumani": [
    "G'ijduvon", 'Yangi hayot', 'Baxt', "Do'stlik", 'Mehnat',
  ],
  'Jondor tumani': [
    'Jondor', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Navruz',
  ],
  'Kogon shahri': [
    'Markaziy', 'Yangi Kogon', "Do'stlik", 'Baxt',
  ],
  'Kogon tumani': [
    'Kogon', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Qorako'l tumani": [
    "Qorako'l", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Qorovulbozor tumani': [
    'Qorovulbozor', 'Yangi hayot', "Do'stlik", 'Mehnat',
  ],
  'Olot tumani': [
    'Olot', 'Yangi hayot', "Do'stlik", 'Mehnat', 'Baxt',
  ],
  'Peshku tumani': [
    'Peshku', "Do'stlik", 'Yangi hayot', 'Mehnat',
  ],
  'Romitan tumani': [
    'Romitan', 'Yangi hayot', "Do'stlik", 'Baxt', 'Mehnat',
  ],
  'Shofirkon tumani': [
    'Shofirkon', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Navruz',
  ],
  'Vobkent tumani': [
    'Vobkent', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],

  // ─────────────────── SAMARQAND VILOYATI ───────────────────
  'Samarqand shahri': [
    'Al-Xorazmiy', 'Amir Temur', 'Beruniy', "Bog'ishamol", 'Gullar', 'Lolazor',
    'Navoiy', 'Sariosiyo', 'Siyob', 'Universitet', 'Vatan', "Xo'ja Axror Vali",
    'Registon', 'Motrit', "Ko'kalosh", 'Qorabag\'', "To'da", 'Qiziltepa',
    'Zangi ota',
  ],
  "Kattaqo'rg'on shahri": [
    "Kattaqo'rg'on", 'Markaziy', 'Yangi hayot', "Do'stlik", 'Baxt',
  ],
  "Bulung'ur tumani": [
    "Bulung'ur", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Ishtixon tumani': [
    'Ishtixon', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Jomboy tumani': [
    'Jomboy', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Kattaqo'rg'on tumani": [
    "Kattaqo'rg'on", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Narpay tumani': [
    'Narpay', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Nurobod tumani': [
    'Nurobod', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Oqdaryo tumani': [
    'Oqdaryo', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Pastdarg'om tumani": [
    "Pastdarg'om", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Paxtachi tumani': [
    'Paxtachi', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Qo'shrabot tumani": [
    "Qo'shrabot", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Samarqand tumani': [
    "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Navruz',
  ],
  'Toyloq tumani': [
    'Toyloq', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Urgut tumani': [
    'Urgut', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Yangi Urgut',
  ],

  // ─────────────────── NAMANGAN VILOYATI ───────────────────
  'Namangan shahri': [
    'Beshqo\'rg\'on', 'Chortepa', "Do'stlik", 'Gavhar', 'Ismoil Somoniy',
    'Kamolot', 'Kosonsoy', 'Labzak', "Namangan ko'chasi", 'Navro\'z',
    "Oltin vodiy", 'Registon', 'Uychi', 'Yuksalish', 'Yangi hayot',
  ],
  'Chortoq tumani': [
    'Chortoq', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Chust tumani': [
    'Chust', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt', "Yangi Chust",
  ],
  'Kosonsoy tumani': [
    'Kosonsoy', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Mingbuloq tumani': [
    'Mingbuloq', "Do'stlik", 'Yangi hayot', 'Mehnat',
  ],
  'Namangan tumani': [
    "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Navruz',
  ],
  'Norin tumani': [
    'Norin', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Pop tumani': [
    'Pop', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Yangi Pop',
  ],
  "To'raqo'rg'on tumani": [
    "To'raqo'rg'on", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Uchqo'rg'on tumani": [
    "Uchqo'rg'on", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Uychi tumani': [
    'Uychi', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Yangiqo'rg'on tumani": [
    "Yangiqo'rg'on", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],

  // ─────────────────── FARG'ONA VILOYATI ───────────────────
  "Farg'ona shahri": [
    'Bahor', 'Bog\'bon', "Do'stlik", "Farg'ona", 'Gavhar', 'Istiqlol',
    'Kirguli', 'Marifat', 'Mustaqillik', 'Nur', 'Oydin', "O'zbekiston",
    'Sohil', 'Tong', 'Yangi hayot', 'Yulduz',
  ],
  "Marg'ilon shahri": [
    'Amir Temur', 'Bog\'bon', "Do'stlik", 'Ipakchi', "Marg'ilon",
    'Navro\'z', 'Silk Road', 'Yangi hayot',
  ],
  "Qo'qon shahri": [
    'Amir Temur', 'Bahodir', "Do'stlik", 'Khan', 'Muqimiy',
    'Navro\'z', 'Yangi hayot', "Qo'qon",
  ],
  "Quvasoy shahri": [
    'Quvasoy', 'Markaziy', "Do'stlik", 'Yangi hayot',
  ],
  "Bag'dod tumani": [
    "Bag'dod", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Besharik tumani': [
    'Besharik', "Do'stlik", 'Yangi hayot', 'Mehnat',
  ],
  'Buvayda tumani': [
    'Buvayda', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Dang'ara tumani": [
    "Dang'ara", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Farg'ona tumani": [
    "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Navruz',
  ],
  'Furqat tumani': [
    'Furqat', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Oltiariq tumani': [
    'Oltiariq', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "O'zbekiston tumani": [
    "O'zbekiston", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Quva tumani': [
    'Quva', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Rishton tumani': [
    'Rishton', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Sux tumani': [
    'Sux', "Do'stlik", 'Yangi hayot', 'Mehnat',
  ],
  'Toshloq tumani': [
    'Toshloq', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Uchko'prik tumani": [
    "Uchko'prik", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Yozyovon tumani': [
    'Yozyovon', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],

  // ─────────────────── QASHQADARYO VILOYATI ───────────────────
  'Qarshi shahri': [
    'Amir Temur', 'Ark', "Do'stlik", 'Gavhar', 'Istiqlol', 'Mustaqillik',
    'Navro\'z', 'Nishon', 'Yangi hayot', 'Yangi Qarshi', 'Yuksalish',
  ],
  'Shahrisabz shahri': [
    'Amir Temur', "Do'stlik", 'Markaziy', 'Mustaqillik', 'Shahrisabz',
    'Yangi hayot',
  ],
  'Chiroqchi tumani': [
    'Chiroqchi', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Dehqonobod tumani': [
    'Dehqonobod', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "G'uzor tumani": [
    "G'uzor", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Qamashi tumani': [
    'Qamashi', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Qarshi tumani': [
    "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Navruz',
  ],
  'Kasbi tumani': [
    'Kasbi', "Do'stlik", 'Yangi hayot', 'Mehnat',
  ],
  "Ko'kdala tumani": [
    "Ko'kdala", "Do'stlik", 'Yangi hayot', 'Mehnat',
  ],
  'Kitob tumani': [
    'Kitob', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Koson tumani': [
    'Koson', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Mirishkor tumani': [
    'Mirishkor', "Do'stlik", 'Yangi hayot', 'Mehnat',
  ],
  'Muborak tumani': [
    'Muborak', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Nishon tumani': [
    'Nishon', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Shahrisabz tumani': [
    "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Navruz',
  ],
  "Yakkabog' tumani": [
    "Yakkabog'", "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],

  // ─────────────────── SURXONDARYO VILOYATI ───────────────────
  'Termiz shahri': [
    'Amir Temur', 'Ark', "Do'stlik", 'Navro\'z', 'Termiz', 'Yangi hayot',
    'Mustaqillik', 'Vatan',
  ],
  'Angor tumani': ['Angor', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Bandixon tumani': ['Bandixon', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Boysun tumani': ['Boysun', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Denov tumani': ['Denov', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  "Jarqo'rg'on tumani": ["Jarqo'rg'on", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Muzrabot tumani': ['Muzrabot', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Oltinsoy tumani': ['Oltinsoy', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Qiziriq tumani': ['Qiziriq', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Qumqo'rg'on tumani": ["Qumqo'rg'on", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Sariosiyo tumani': ['Sariosiyo', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Sho'rchi tumani": ["Sho'rchi", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Sherobod tumani': ['Sherobod', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Termiz tumani': ["Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Uzun tumani': ['Uzun', "Do'stlik", 'Yangi hayot', 'Mehnat'],

  // ─────────────────── NAVOIY VILOYATI ───────────────────
  'Navoiy shahri': [
    'Amir Temur', "Do'stlik", 'Kimyogar', 'Mustaqillik', 'Navro\'z',
    'Navoiy', 'Yangi hayot', 'Yuksalish',
  ],
  'Zarafshon shahri': ['Zarafshon', 'Markaziy', "Do'stlik", 'Yangi hayot'],
  'Karmana tumani': ['Karmana', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Konimex tumani': ['Konimex', "Do'stlik", 'Yangi hayot'],
  'Navbahor tumani': ['Navbahor', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Nurota tumani': ['Nurota', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Qiziltepa tumani': ['Qiziltepa', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Tomdi tumani': ['Tomdi', "Do'stlik", 'Yangi hayot'],
  'Uchkuduk tumani': ['Uchkuduk', "Do'stlik", 'Yangi hayot'],
  'Xatirchi tumani': ['Xatirchi', "Do'stlik", 'Yangi hayot', 'Mehnat'],

  // ─────────────────── JIZZAX VILOYATI ───────────────────
  'Jizzax shahri': [
    'Amir Temur', "Do'stlik", 'Gulzor', 'Istiqlol', 'Jizzax', 'Mustaqillik',
    'Navro\'z', 'Yangi hayot',
  ],
  'Arnasoy tumani': ['Arnasoy', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Baxmal tumani': ['Baxmal', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Do'stlik tumani": ["Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  "G'allaorol tumani": ["G'allaorol", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Forish tumani': ['Forish', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Mirzacho'l tumani": ["Mirzacho'l", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Paxtakor tumani': ['Paxtakor', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Sh.Rashidov tumani': ['Sh.Rashidov', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Yangiobod tumani': ['Yangiobod', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Zafarobod tumani': ['Zafarobod', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Zarbdor tumani': ['Zarbdor', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Zomin tumani': ['Zomin', "Do'stlik", 'Yangi hayot', 'Mehnat'],

  // ─────────────────── SIRDARYO VILOYATI ───────────────────
  'Guliston shahri': [
    'Amir Temur', "Do'stlik", 'Guliston', 'Mustaqillik', 'Navro\'z', 'Yangi hayot',
  ],
  'Shirin shahri': ['Shirin', 'Markaziy', "Do'stlik", 'Yangi hayot'],
  'Yangiyer shahri': ['Yangiyer', 'Markaziy', "Do'stlik", 'Yangi hayot'],
  'Boyovut tumani': ['Boyovut', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Guliston tumani': ["Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Mirzaobod tumani': ['Mirzaobod', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Oqoltin tumani': ['Oqoltin', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Sardoba tumani': ['Sardoba', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Sayxunobod tumani': ['Sayxunobod', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Sirdaryo tumani': ["Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Xovos tumani': ['Xovos', "Do'stlik", 'Yangi hayot', 'Mehnat'],

  // ─────────────────── TOSHKENT VILOYATI ───────────────────
  'Angren shahri': ['Angren', 'Markaziy', "Do'stlik", 'Yangi hayot', 'Konchi'],
  'Bekobod shahri': ['Bekobod', 'Markaziy', "Do'stlik", 'Yangi hayot'],
  'Chirchiq shahri': ['Chirchiq', 'Markaziy', "Do'stlik", 'Yangi hayot', 'Sanoat'],
  'Olmaliq shahri': ['Olmaliq', 'Markaziy', "Do'stlik", 'Yangi hayot', 'Metallurg'],
  'Bekobod tumani': ['Bekobod', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Bo'stonliq tumani": ["Bo'stonliq", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Chinoz tumani': ['Chinoz', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Oqqo'rg'on tumani": ["Oqqo'rg'on", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Olmaliq tumani': ["Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Parkent tumani': ['Parkent', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Piskent tumani': ['Piskent', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Qibray tumani': ['Qibray', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Yuqorichirchiq tumani': ['Yuqorichirchiq', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Yangiyo'l tumani": ["Yangiyo'l", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Zangiota tumani': ['Zangiota', "Do'stlik", 'Yangi hayot', 'Mehnat', 'Qibray'],
  'Zangibobod tumani': ['Zangibobod', "Do'stlik", 'Yangi hayot'],

  // ─────────────────── XORAZM VILOYATI ───────────────────
  'Urganch shahri': [
    'Amir Temur', "Do'stlik", 'Ipakchi', 'Mustaqillik', 'Navro\'z',
    'Urganch', 'Yangi hayot',
  ],
  'Xiva shahri': ['Xiva', 'Markaziy', "Do'stlik", 'Ichanqala', 'Yangi hayot'],
  "Bog'ot tumani": ["Bog'ot", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Gurlan tumani': ['Gurlan', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Hazorasp tumani': ['Hazorasp', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Urganch tumani': ["Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  "Qo'shko'pir tumani": ["Qo'shko'pir", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Shovot tumani': ['Shovot', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Tuproqqala tumani': ['Tuproqqala', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Xiva tumani': ["Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Xonqa tumani': ['Xonqa', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Yangiariq tumani': ['Yangiariq', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Yangibozor tumani': ['Yangibozor', "Do'stlik", 'Yangi hayot', 'Mehnat'],

  // ─────────────────── QORAQALPOG'ISTON ───────────────────
  'Nukus shahri': [
    'Amir Temur', "Do'stlik", 'Navro\'z', 'Nukus', 'Yangi hayot', 'Markaz',
    'Qo\'ng\'irot',
  ],
  'Taxiatosh shahri': ['Taxiatosh', 'Markaziy', "Do'stlik", 'Yangi hayot'],
  'Amudaryo tumani': ['Amudaryo', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Beruniy tumani': ['Beruniy', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Bo'zatov tumani": ["Bo'zatov", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Chimboy tumani': ['Chimboy', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Ellikqal'a tumani": ["Ellikqal'a", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Kegayli tumani': ['Kegayli', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Mo'ynoq tumani": ["Mo'ynoq", "Do'stlik", 'Yangi hayot'],
  'Nukus tumani': ["Do'stlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  "Qonliko'l tumani": ["Qonliko'l", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Qorao'zak tumani": ["Qorao'zak", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Qo'ng'irot tumani": ["Qo'ng'irot", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  'Shumanay tumani': ['Shumanay', "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Taxtako'pir tumani": ["Taxtako'pir", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "To'rtko'l tumani": ["To'rtko'l", "Do'stlik", 'Yangi hayot', 'Mehnat'],
  "Xo'jayli tumani": ["Xo'jayli", "Do'stlik", 'Yangi hayot', 'Mehnat'],
};
