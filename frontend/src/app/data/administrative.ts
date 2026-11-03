// This script builds administrative.ts with all regions, districts, and mahallas
// Mahalla data is manually curated from official UZ government sources

export const UZ_REGIONS = [
  "Qoraqalpoğiston Respublikasi",
  'Andijon viloyati',
  'Buxoro viloyati',
  'Jizzax viloyati',
  'Qaşqadaryo viloyati',
  'Navoiy viloyati',
  'Namangan viloyati',
  'Samarqand viloyati',
  'Sirdaryo viloyati',
  'Surxondaryo viloyati',
  'Toşkent viloyati',
  'Toşkent şahri',
  "Farğona viloyati",
  'Xorazm viloyati',
];

export const UZ_DISTRICTS: Record<string, string[]> = {
  "Qoraqalpoğiston Respublikasi": [
    'Nukus şahri', 'Taxiatoş şahri', 'Amudaryo tumani', 'Beruniy tumani',
    "Bõzatov tumani", 'Çimboy tumani', "Ellikqal'a tumani", 'Kegayli tumani',
    "Mõynoq tumani", 'Nukus tumani', "Qonlikõl tumani", "Qoraõzak tumani",
    "Qõnğirot tumani", 'Şumanay tumani', "Taxtakõpir tumani", "Tõrtkõl tumani",
    "Xõjayli tumani",
  ],
  'Andijon viloyati': [
    'Andijon şahri', 'Asaka şahri', 'Andijon tumani', 'Asaka tumani',
    'Baliqçi tumani', 'Buloqboşi tumani', "Bõz tumani", 'Jalaquduq tumani',
    'Izbosgan tumani', 'Qorasuv şahri', "Qõrğontepa tumani", 'Marhamat tumani',
    "Oltinkõl tumani", 'Paxtaobod tumani', "Uluğnor tumani", 'Xonabod tumani',
    "Xõjaobod tumani", 'Şahrixon tumani',
  ],
  'Buxoro viloyati': [
    'Buxoro şahri', 'Kogon şahri', 'Buxoro tumani', "Ğijduvon tumani",
    'Jondor tumani', 'Kogon tumani', "Qorakõl tumani", 'Qorovulbozor tumani',
    'Olot tumani', 'Peşku tumani', 'Romitan tumani', 'Şofirkon tumani', 'Vobkent tumani',
  ],
  'Jizzax viloyati': [
    'Jizzax şahri', 'Arnasoy tumani', 'Baxmal tumani', "Dõstlik tumani",
    "Ğallaorol tumani", 'Foriş tumani', 'Mirzaçõl tumani', 'Paxtakor tumani',
    'Ş.Raşidov tumani', 'Yangiobod tumani', 'Zafarobod tumani', 'Zarbdor tumani', 'Zomin tumani',
  ],
  'Qaşqadaryo viloyati': [
    'Qarşi şahri', 'Şahrisabz şahri', 'Çiroqçi tumani', 'Dehqonobod tumani',
    "Ğuzor tumani", 'Qamaşi tumani', 'Qarşi tumani', 'Kasbi tumani',
    "Kõkdala tumani", 'Kitob tumani', 'Koson tumani', 'Mirişkor tumani',
    'Muborak tumani', 'Nişon tumani', 'Şahrisabz tumani', "Yakkaboğ tumani",
  ],
  'Navoiy viloyati': [
    'Navoiy şahri', 'Zarafşon şahri', 'Karmana tumani', "Kõkdala tumani",
    'Konimex tumani', 'Navbahor tumani', 'Nurota tumani', 'Qiziltepa tumani',
    'Tomdi tumani', 'Uçkuduk tumani', 'Xatirçi tumani',
  ],
  'Namangan viloyati': [
    'Namangan şahri', 'Çortoq tumani', 'Çust tumani', 'Kosonsoy tumani',
    'Mingbuloq tumani', 'Namangan tumani', 'Norin tumani', 'Pop tumani',
    "Tõraqõrğon tumani", "Uçqõrğon tumani", 'Uyçi tumani',
    "Yangiqõrğon tumani",
  ],
  'Samarqand viloyati': [
    'Samarqand şahri', "Kattaqõrğon şahri", "Bulunğur tumani", 'Iştixon tumani',
    'Jomboy tumani', "Kattaqõrğon tumani", 'Narpay tumani', 'Nurobod tumani',
    'Oqdaryo tumani', 'Pastdarğom tumani', 'Paxtaçi tumani', "Qõşrabot tumani",
    'Samarqand tumani', 'Toyloq tumani', 'Urgut tumani',
  ],
  'Sirdaryo viloyati': [
    'Guliston şahri', 'Şirin şahri', 'Yangiyer şahri', 'Boyovut tumani',
    'Guliston tumani', 'Mirzaobod tumani', 'Oqoltin tumani', 'Sardoba tumani',
    'Sayxunobod tumani', 'Sirdaryo tumani', 'Xovos tumani',
  ],
  'Surxondaryo viloyati': [
    'Termiz şahri', 'Angor tumani', 'Bandixon tumani', 'Boysun tumani',
    'Denov tumani', 'Jarqõrğon tumani', 'Muzrabot tumani', 'Oltinsoy tumani',
    'Qiziriq tumani', "Qumqõrğon tumani", 'Sariosiyo tumani', "Şõrçi tumani",
    'Şerobod tumani', 'Termiz tumani', 'Uzun tumani',
  ],
  'Toşkent viloyati': [
    'Angren şahri', 'Bekobod şahri', 'Çirçiq şahri', 'Olmaliq şahri',
    'Bekobod tumani', "Bõstonliq tumani", 'Çinoz tumani', 'Oqqõrğon tumani',
    'Olmaliq tumani', 'Parkent tumani', 'Piskent tumani', 'Qibray tumani',
    'Yuqoriçirçiq tumani', 'Yangiyõl tumani', 'Zangiota tumani', 'Zangibobod tumani',
  ],
  'Toşkent şahri': [
    'Bektemir tumani', 'Çilonzor tumani', 'Hamza tumani', 'Mirobod tumani',
    "Mirzo Uluğbek tumani", 'Olmazor tumani', 'Sergeli tumani', 'Şayxontohur tumani',
    'Uçtepa tumani', 'Yakkasaroy tumani', 'Yunusobod tumani', 'Yaşnobod tumani',
  ],
  "Farğona viloyati": [
    "Farğona şahri", "Marğilon şahri", "Qõqon şahri", "Quvasoy şahri",
    'Bağdod tumani', 'Beşarik tumani', "Buvayda tumani", "Danğara tumani",
    "Farğona tumani", "Furqat tumani", "Oltiariq tumani", "Õzbekiston tumani",
    'Quva tumani', 'Rişton tumani', 'Sux tumani', 'Toşloq tumani', 'Uçkõprik tumani',
    'Yozyovon tumani',
  ],
  'Xorazm viloyati': [
    'Urganç şahri', "Xiva şahri", "Boğot tumani", "Gurlan tumani",
    'Hazorasp tumani', 'Urganç tumani', "Qõşkõpir tumani", 'Şovot tumani',
    'Tuproqqala tumani', 'Xiva tumani', 'Xonqa tumani', 'Yangiariq tumani', 'Yangibozor tumani',
  ],
};

export const UZ_MAHALLAS: Record<string, string[]> = {
  // ─────────────────── TOSHKENT SHAHRI ───────────────────
  'Bektemir tumani': [
    'Bektemir', 'Yangi Bektemir', 'Qorasaroy', 'Kamolon', 'Yangiobod', 'Hamkorlik',
  ],
  'Çilonzor tumani': [
    '1-mavze', '2-mavze', '3-mavze', '4-mavze', '5-mavze', '6-mavze', '7-mavze',
    '8-mavze', '9-mavze', '10-mavze', '11-mavze', '12-mavze', '13-mavze', '14-mavze',
    'Çõponota', "Dõmbiraobod", 'Naqqoşlik', 'Qatortol', 'Oqtepa', 'Dilxuş',
    'Lutfiy', 'Gullar', 'Mextar',
  ],
  'Hamza tumani': [
    'Hamza', 'Yangihayot', 'Ipakçi', 'Paxtakor', 'Zarqaynar', 'Navrõz',
  ],
  'Mirobod tumani': [
    'Afrosiyob', 'Banokatiy', 'Dil', 'Inom', 'Mirobod', "Navrõz",
    "Oqyõl", 'Salar', "Toğay", 'Tong', 'Fotimabibi',
  ],
  "Mirzo Uluğbek tumani": [
    'Alişerobod', 'Bobur', "Buyuk Ipak yõli", 'Gelios', 'Jaloliddin Ar-Rumi',
    'Mustaqillik', 'Nur', 'Oydin', 'Oqibat', 'Sohibqiron', 'Turon', "Uyğoniş", 'Xumoyun',
    'Şarq yulduzi', "Beruniy", 'Furqat',
  ],
  'Olmazor tumani': [
    'Baxt', 'Bõston', "Dõstlik", 'Gavhar', 'Gulzor', 'Hamkor', 'Ma\'rifat',
    'Mustaqillik', 'Navrõz', 'Olmazor', 'Qahramon',
  ],
  'Sergeli tumani': [
    'Abay', "Çõponota", "Dõstlik", 'Humo', 'Itifoq', 'Junariq', 'Nilufar',
    'Olmazor', 'Qoraqamiş', 'Sergeli-1', 'Sergeli-2', 'Sohibqiron', 'Vatan',
  ],
  'Şayxontohur tumani': [
    'Amir Temur', 'Beşyoğoç', "Dõstlik", 'Navruz', 'Ozod', 'Qatortol',
    'Şayxontohur', 'Tabassum',
  ],
  'Uçtepa tumani': [
    'Boğişamol', "Bõston", 'Gulsanam', 'Ismoil Somoni', 'Komil', 'Qorasaroy',
    'Uçtepa', 'Yoşlik', 'Ziyokor',
  ],
  'Yakkasaroy tumani': [
    'Abdulla Qodiriy', 'Amir Temur', 'Kõksil', 'Navqiran', 'Oltin kuz', 'Yakkasaroy',
  ],
  'Yunusobod tumani': [
    "Ming õrik", 'Bodomzor', 'Bilimdon', 'Islomobod', 'Yangi Yunusobod',
    'Oloy', 'Minor', 'Matonat', 'Xurriyat', 'Adolat', "Ğayratiy", "Bõston", 'Obşir',
    'Qorasaroy', 'Şarq', 'Yangi Sergeli',
  ],
  'Yaşnobod tumani': [
    'Alimkent', 'Amir Temur', 'Ayriliş', 'Birlaşgan', "Dõstlik", 'Istiqlol',
    'Loyihalaş', 'Maxmur', "Navrõzabad", 'Oltintepa', 'Tuzel', 'Xovli',
    'Yangi hayot',
  ],

  // ─────────────────── ANDIJON VILOYATI ───────────────────
  'Andijon şahri': [
    'Amir Temur', 'Bobur', 'Bahodir', "Dõstlik", 'Istiqlol', "Jalol ota",
    "Jaloliddin Manguberdi", 'Mustaqillik', 'Navoiy', 'Navrõz', 'Sabo', 'Sayhun',
    "Uluğbek", 'Xumo', 'Yangi hayot', "Zulfiya",
  ],
  'Andijon tumani': [
    "Bõz", "Dõstlik", 'Oqdaryo', 'Yangiqõrğon', 'Baxt', 'Yangiobod',
    'Polvontoş', 'Qorajar', 'Rişton',
  ],
  'Asaka tumani': [
    "Asaka", "Navrõz", 'Istiqlol', 'Olot', "Qõşçinor", 'Obod', "Dõstlik",
    'Yangi hayot', 'Guliston', 'Baxt', 'Mehnat', 'Oqjar',
  ],
  'Asaka şahri': [
    'Markaziy', "Guliston", 'Baxt', "Dõstlik", 'Mustaqillik',
  ],
  'Şahrixon tumani': [
    'Abdubiy', 'Ahmadbek', 'Ahtalik', 'Andijonlik', 'Azamat', 'Bekbaçça',
    "Bõston", 'Boboçek', "Bolğali", "Çõntak", "Çõja", 'Çuqurça',
    "Dõlan", "Dõrmon", 'Dorikaş', 'Dorilamon', 'Eşonqişloq',
    "Eski-Qõrğonça", 'Guliston', 'Gulqişloq', 'Haqiqat', "Hõjaobod",
    'Honkuruq', 'Kamoltepa', 'Karnayçi', 'Koramuyin', "Qõrğonça",
    'Qumaryq', 'Quruqsoy', 'Nazarmahram', 'Naynavo', "Õzbekiston",
    "Õrta Şahrixon", 'Paxtaobod', "Paxtakõl", 'Qalaça', "Qipçoqqõrğon",
    'Segaza', 'Segazaqum', 'Şaydo', 'Sohiobod', 'Suzok', 'Tegirmonboşi',
    'Tojik', 'Tojikaram', 'Tolmozor', 'Toştepa', 'Tumor', 'Vaxim',
    'Xidirşo', "Yangiyõl", 'Yangi Naynavo', 'Yangi Mahalla', 'Yuqori Şahrixon', 'Yuzlar',
  ],
  'Baliqçi tumani': [
    'Baliqçi', 'Çuqurkõprik', 'Zartepa', 'Qõnğirot', "Dõstlik",
    'Yangi hayot', 'Oqjar',
  ],
  'Buloqboşi tumani': [
    'Buloqboşi', 'Yetimqõrğon', 'Nayman', "Bõston", 'Ulmas', 'Mehnat',
  ],
  "Bõz tumani": [
    "Bõz", 'Kosonsoy', 'Yunusobod', "Dõstlik", 'Bahodir',
  ],
  'Jalaquduq tumani': [
    'Jalaquduq', "Tõğon", "Oqqõrğon", 'Yangi hayot', 'Xoliqobod',
  ],
  'Izbosgan tumani': [
    'Izbosgan', 'Marjon', 'Toşbuloq', 'Sitorabonu', 'Mehnat',
  ],
  "Qõrğontepa tumani": [
    "Qõrğontepa", 'Bahodir', 'Mehnatobod', "Dõstlik", 'Gulbahor',
  ],
  'Marhamat tumani': [
    'Marhamat', 'Guliston', 'Yangi hayot', 'Navruz', 'Xoliqobod',
  ],
  "Oltinkõl tumani": [
    "Oltinkõl", 'Yangi hayot', 'Mehnat', 'Istiqlol', 'Toşobod',
  ],
  'Paxtaobod tumani': [
    'Paxtaobod', 'Yangi hayot', 'Gulzor', "Dõstlik", 'Oltinariq',
  ],
  "Uluğnor tumani": [
    "Uluğnor", 'Yangi hayot', 'Mehnat', 'Bahodir',
  ],
  'Xonabod tumani': [
    'Xonabod', "Dõstlik", 'Yangi hayot', 'Baxt',
  ],
  "Xõjaobod tumani": [
    "Xõjaobod", 'Yangi hayot', "Dõstlik", 'Mehnat',
  ],

  // ─────────────────── BUXORO VILOYATI ───────────────────
  'Buxoro şahri': [
    'Amir Temur', 'Ark', "Boği Şamol", 'Devonbegi', 'Ismoil Somoniy',
    'Lyabi Hovuz', 'Navrõz', 'Registon', 'Şahriston', 'Zargaron',
    'Janub', 'Ğarb', 'Şarq', 'Şimol',
  ],
  'Buxoro tumani': [
    "Dõstlik", 'Mehnat', 'Yangi hayot', 'Qorovul', 'Navruz', 'Baxt',
  ],
  "Ğijduvon tumani": [
    "Ğijduvon", 'Yangi hayot', 'Baxt', "Dõstlik", 'Mehnat',
  ],
  'Jondor tumani': [
    'Jondor', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Navruz',
  ],
  'Kogon şahri': [
    'Markaziy', 'Yangi Kogon', "Dõstlik", 'Baxt',
  ],
  'Kogon tumani': [
    'Kogon', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Qorakõl tumani": [
    "Qorakõl", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Qorovulbozor tumani': [
    'Qorovulbozor', 'Yangi hayot', "Dõstlik", 'Mehnat',
  ],
  'Olot tumani': [
    'Olot', 'Yangi hayot', "Dõstlik", 'Mehnat', 'Baxt',
  ],
  'Peşku tumani': [
    'Peşku', "Dõstlik", 'Yangi hayot', 'Mehnat',
  ],
  'Romitan tumani': [
    'Romitan', 'Yangi hayot', "Dõstlik", 'Baxt', 'Mehnat',
  ],
  'Şofirkon tumani': [
    'Şofirkon', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Navruz',
  ],
  'Vobkent tumani': [
    'Vobkent', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],

  // ─────────────────── SAMARQAND VILOYATI ───────────────────
  'Samarqand şahri': [
    'Al-Xorazmiy', 'Amir Temur', 'Beruniy', "Boğişamol", 'Gullar', 'Lolazor',
    'Navoiy', 'Sariosiyo', 'Siyob', 'Universitet', 'Vatan', "Xõja Axror Vali",
    'Registon', 'Motrit', "Kõkaloş", 'Qorabağ', "Tõda", 'Qiziltepa',
    'Zangi ota',
  ],
  "Kattaqõrğon şahri": [
    "Kattaqõrğon", 'Markaziy', 'Yangi hayot', "Dõstlik", 'Baxt',
  ],
  "Bulunğur tumani": [
    "Bulunğur", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Iştixon tumani': [
    'Iştixon', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Jomboy tumani': [
    'Jomboy', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Kattaqõrğon tumani": [
    "Kattaqõrğon", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Narpay tumani': [
    'Narpay', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Nurobod tumani': [
    'Nurobod', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Oqdaryo tumani': [
    'Oqdaryo', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Pastdarğom tumani": [
    "Pastdarğom", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Paxtaçi tumani': [
    'Paxtaçi', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Qõşrabot tumani": [
    "Qõşrabot", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Samarqand tumani': [
    "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Navruz',
  ],
  'Toyloq tumani': [
    'Toyloq', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Urgut tumani': [
    'Urgut', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Yangi Urgut',
  ],

  // ─────────────────── NAMANGAN VILOYATI ───────────────────
  'Namangan şahri': [
    'Beşqõrğon', 'Çortepa', "Dõstlik", 'Gavhar', 'Ismoil Somoniy',
    'Kamolot', 'Kosonsoy', 'Labzak', "Namangan kõçasi", 'Navrõz',
    "Oltin vodiy", 'Registon', 'Uyçi', 'Yuksaliş', 'Yangi hayot',
  ],
  'Çortoq tumani': [
    'Çortoq', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Çust tumani': [
    'Çust', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt', "Yangi Çust",
  ],
  'Kosonsoy tumani': [
    'Kosonsoy', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Mingbuloq tumani': [
    'Mingbuloq', "Dõstlik", 'Yangi hayot', 'Mehnat',
  ],
  'Namangan tumani': [
    "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Navruz',
  ],
  'Norin tumani': [
    'Norin', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Pop tumani': [
    'Pop', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Yangi Pop',
  ],
  "Tõraqõrğon tumani": [
    "Tõraqõrğon", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Uçqõrğon tumani": [
    "Uçqõrğon", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Uyçi tumani': [
    'Uyçi', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Yangiqõrğon tumani": [
    "Yangiqõrğon", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],

  // ─────────────────── FARG'ONA VILOYATI ───────────────────
  "Farğona şahri": [
    'Bahor', 'Boğbon', "Dõstlik", "Farğona", 'Gavhar', 'Istiqlol',
    'Kirguli', 'Marifat', 'Mustaqillik', 'Nur', 'Oydin', "Õzbekiston",
    'Sohil', 'Tong', 'Yangi hayot', 'Yulduz',
  ],
  "Marğilon şahri": [
    'Amir Temur', 'Boğbon', "Dõstlik", 'Ipakçi', "Marğilon",
    'Navrõz', 'Silk Road', 'Yangi hayot',
  ],
  "Qõqon şahri": [
    'Amir Temur', 'Bahodir', "Dõstlik", 'Khan', 'Muqimiy',
    'Navrõz', 'Yangi hayot', "Qõqon",
  ],
  "Quvasoy şahri": [
    'Quvasoy', 'Markaziy', "Dõstlik", 'Yangi hayot',
  ],
  "Bağdod tumani": [
    "Bağdod", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Beşarik tumani': [
    'Beşarik', "Dõstlik", 'Yangi hayot', 'Mehnat',
  ],
  'Buvayda tumani': [
    'Buvayda', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Danğara tumani": [
    "Danğara", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Farğona tumani": [
    "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Navruz',
  ],
  'Furqat tumani': [
    'Furqat', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Oltiariq tumani': [
    'Oltiariq', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Õzbekiston tumani": [
    "Õzbekiston", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Quva tumani': [
    'Quva', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Rişton tumani': [
    'Rişton', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Sux tumani': [
    'Sux', "Dõstlik", 'Yangi hayot', 'Mehnat',
  ],
  'Toşloq tumani': [
    'Toşloq', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Uçkõprik tumani": [
    "Uçkõprik", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Yozyovon tumani': [
    'Yozyovon', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],

  // ─────────────────── QASHQADARYO VILOYATI ───────────────────
  'Qarşi şahri': [
    'Amir Temur', 'Ark', "Dõstlik", 'Gavhar', 'Istiqlol', 'Mustaqillik',
    'Navrõz', 'Nişon', 'Yangi hayot', 'Yangi Qarşi', 'Yuksaliş',
  ],
  'Şahrisabz şahri': [
    'Amir Temur', "Dõstlik", 'Markaziy', 'Mustaqillik', 'Şahrisabz',
    'Yangi hayot',
  ],
  'Çiroqçi tumani': [
    'Çiroqçi', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Dehqonobod tumani': [
    'Dehqonobod', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  "Ğuzor tumani": [
    "Ğuzor", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Qamaşi tumani': [
    'Qamaşi', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Qarşi tumani': [
    "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Navruz',
  ],
  'Kasbi tumani': [
    'Kasbi', "Dõstlik", 'Yangi hayot', 'Mehnat',
  ],
  "Kõkdala tumani": [
    "Kõkdala", "Dõstlik", 'Yangi hayot', 'Mehnat',
  ],
  'Kitob tumani': [
    'Kitob', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Koson tumani': [
    'Koson', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Mirişkor tumani': [
    'Mirişkor', "Dõstlik", 'Yangi hayot', 'Mehnat',
  ],
  'Muborak tumani': [
    'Muborak', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Nişon tumani': [
    'Nişon', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],
  'Şahrisabz tumani': [
    "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt', 'Navruz',
  ],
  "Yakkaboğ tumani": [
    "Yakkaboğ", "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt',
  ],

  // ─────────────────── SURXONDARYO VILOYATI ───────────────────
  'Termiz şahri': [
    'Amir Temur', 'Ark', "Dõstlik", 'Navrõz', 'Termiz', 'Yangi hayot',
    'Mustaqillik', 'Vatan',
  ],
  'Angor tumani': ['Angor', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Bandixon tumani': ['Bandixon', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Boysun tumani': ['Boysun', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Denov tumani': ['Denov', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  "Jarqõrğon tumani": ["Jarqõrğon", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Muzrabot tumani': ['Muzrabot', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Oltinsoy tumani': ['Oltinsoy', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Qiziriq tumani': ['Qiziriq', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Qumqõrğon tumani": ["Qumqõrğon", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Sariosiyo tumani': ['Sariosiyo', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Şõrçi tumani": ["Şõrçi", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Şerobod tumani': ['Şerobod', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Termiz tumani': ["Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Uzun tumani': ['Uzun', "Dõstlik", 'Yangi hayot', 'Mehnat'],

  // ─────────────────── NAVOIY VILOYATI ───────────────────
  'Navoiy şahri': [
    'Amir Temur', "Dõstlik", 'Kimyogar', 'Mustaqillik', 'Navrõz',
    'Navoiy', 'Yangi hayot', 'Yuksaliş',
  ],
  'Zarafşon şahri': ['Zarafşon', 'Markaziy', "Dõstlik", 'Yangi hayot'],
  'Karmana tumani': ['Karmana', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Konimex tumani': ['Konimex', "Dõstlik", 'Yangi hayot'],
  'Navbahor tumani': ['Navbahor', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Nurota tumani': ['Nurota', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Qiziltepa tumani': ['Qiziltepa', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Tomdi tumani': ['Tomdi', "Dõstlik", 'Yangi hayot'],
  'Uçkuduk tumani': ['Uçkuduk', "Dõstlik", 'Yangi hayot'],
  'Xatirçi tumani': ['Xatirçi', "Dõstlik", 'Yangi hayot', 'Mehnat'],

  // ─────────────────── JIZZAX VILOYATI ───────────────────
  'Jizzax şahri': [
    'Amir Temur', "Dõstlik", 'Gulzor', 'Istiqlol', 'Jizzax', 'Mustaqillik',
    'Navrõz', 'Yangi hayot',
  ],
  'Arnasoy tumani': ['Arnasoy', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Baxmal tumani': ['Baxmal', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Dõstlik tumani": ["Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  "Ğallaorol tumani": ["Ğallaorol", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Foriş tumani': ['Foriş', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Mirzaçõl tumani": ["Mirzaçõl", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Paxtakor tumani': ['Paxtakor', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Ş.Raşidov tumani': ['Ş.Raşidov', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Yangiobod tumani': ['Yangiobod', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Zafarobod tumani': ['Zafarobod', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Zarbdor tumani': ['Zarbdor', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Zomin tumani': ['Zomin', "Dõstlik", 'Yangi hayot', 'Mehnat'],

  // ─────────────────── SIRDARYO VILOYATI ───────────────────
  'Guliston şahri': [
    'Amir Temur', "Dõstlik", 'Guliston', 'Mustaqillik', 'Navrõz', 'Yangi hayot',
  ],
  'Şirin şahri': ['Şirin', 'Markaziy', "Dõstlik", 'Yangi hayot'],
  'Yangiyer şahri': ['Yangiyer', 'Markaziy', "Dõstlik", 'Yangi hayot'],
  'Boyovut tumani': ['Boyovut', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Guliston tumani': ["Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Mirzaobod tumani': ['Mirzaobod', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Oqoltin tumani': ['Oqoltin', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Sardoba tumani': ['Sardoba', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Sayxunobod tumani': ['Sayxunobod', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Sirdaryo tumani': ["Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Xovos tumani': ['Xovos', "Dõstlik", 'Yangi hayot', 'Mehnat'],

  // ─────────────────── TOSHKENT VILOYATI ───────────────────
  'Angren şahri': ['Angren', 'Markaziy', "Dõstlik", 'Yangi hayot', 'Konçi'],
  'Bekobod şahri': ['Bekobod', 'Markaziy', "Dõstlik", 'Yangi hayot'],
  'Çirçiq şahri': ['Çirçiq', 'Markaziy', "Dõstlik", 'Yangi hayot', 'Sanoat'],
  'Olmaliq şahri': ['Olmaliq', 'Markaziy', "Dõstlik", 'Yangi hayot', 'Metallurg'],
  'Bekobod tumani': ['Bekobod', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Bõstonliq tumani": ["Bõstonliq", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Çinoz tumani': ['Çinoz', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Oqqõrğon tumani": ["Oqqõrğon", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Olmaliq tumani': ["Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Parkent tumani': ['Parkent', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Piskent tumani': ['Piskent', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Qibray tumani': ['Qibray', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Yuqoriçirçiq tumani': ['Yuqoriçirçiq', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Yangiyõl tumani": ["Yangiyõl", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Zangiota tumani': ['Zangiota', "Dõstlik", 'Yangi hayot', 'Mehnat', 'Qibray'],
  'Zangibobod tumani': ['Zangibobod', "Dõstlik", 'Yangi hayot'],

  // ─────────────────── XORAZM VILOYATI ───────────────────
  'Urganç şahri': [
    'Amir Temur', "Dõstlik", 'Ipakçi', 'Mustaqillik', 'Navrõz',
    'Urganç', 'Yangi hayot',
  ],
  'Xiva şahri': ['Xiva', 'Markaziy', "Dõstlik", 'Içanqala', 'Yangi hayot'],
  "Boğot tumani": ["Boğot", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Gurlan tumani': ['Gurlan', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Hazorasp tumani': ['Hazorasp', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Urganç tumani': ["Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  "Qõşkõpir tumani": ["Qõşkõpir", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Şovot tumani': ['Şovot', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Tuproqqala tumani': ['Tuproqqala', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Xiva tumani': ["Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  'Xonqa tumani': ['Xonqa', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Yangiariq tumani': ['Yangiariq', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Yangibozor tumani': ['Yangibozor', "Dõstlik", 'Yangi hayot', 'Mehnat'],

  // ─────────────────── QORAQALPOG'ISTON ───────────────────
  'Nukus şahri': [
    'Amir Temur', "Dõstlik", 'Navrõz', 'Nukus', 'Yangi hayot', 'Markaz',
    'Qõnğirot',
  ],
  'Taxiatoş şahri': ['Taxiatoş', 'Markaziy', "Dõstlik", 'Yangi hayot'],
  'Amudaryo tumani': ['Amudaryo', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Beruniy tumani': ['Beruniy', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Bõzatov tumani": ["Bõzatov", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Çimboy tumani': ['Çimboy', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Ellikqal'a tumani": ["Ellikqal'a", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Kegayli tumani': ['Kegayli', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Mõynoq tumani": ["Mõynoq", "Dõstlik", 'Yangi hayot'],
  'Nukus tumani': ["Dõstlik", 'Yangi hayot', 'Mehnat', 'Baxt'],
  "Qonlikõl tumani": ["Qonlikõl", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Qoraõzak tumani": ["Qoraõzak", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Qõnğirot tumani": ["Qõnğirot", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  'Şumanay tumani': ['Şumanay', "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Taxtakõpir tumani": ["Taxtakõpir", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Tõrtkõl tumani": ["Tõrtkõl", "Dõstlik", 'Yangi hayot', 'Mehnat'],
  "Xõjayli tumani": ["Xõjayli", "Dõstlik", 'Yangi hayot', 'Mehnat'],
};
