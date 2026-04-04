export const UZ_REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Samarqand viloyati', 'Buxoro viloyati',
  'Andijon viloyati', 'Farg\'ona viloyati', 'Namangan viloyati', 'Qashqadaryo viloyati',
  'Surxondaryo viloyati', 'Navoiy viloyati', 'Xorazm viloyati', 'Sirdaryo viloyati',
  'Jizzax viloyati', 'Qoraqalpog\'iston Respublikasi',
];

export const UZ_DISTRICTS: Record<string, string[]> = {
  'Toshkent shahri': ['Chilonzor', 'Yunusobod', 'Mirzo Ulug‘bek', 'Yashnobod', 'Mirobod', 'Shayxontohur', 'Uchtepa', 'Jakasaroiy', 'Olmazor', 'Sergeli', 'Yangihayot', 'Bektemir'],
  'Toshkent viloyati': ['Angren sh.', 'Olmaliq sh.', 'Chirchiq sh.', 'Bekobod sh.', 'Oqqo‘rg‘on', 'Olmaliq', 'Piskent', 'Qibray', 'Zangiota', 'Yangiyo‘l', 'Chinoz', 'Bo‘stonliq', 'Parkent'],
  'Samarqand viloyati': ['Samarqand sh.', 'Kattaqo‘rg‘on sh.', 'Samarqand t.', 'Pastdarg‘om', 'Paxtachi', 'Narpay', 'Kattaqo‘rg‘on t.', 'Ishtixon', 'Oqdaryo', 'Bulung‘ur', 'Jomboy', 'Toyloq', 'Urgut', 'Nurobod', 'Qo‘shrabot'],
  'Buxoro viloyati': ['Buxoro sh.', 'Kogon sh.', 'Buxoro t.', 'Kogon t.', 'G‘ijduvon', 'Shofirkon', 'Vobkent', 'Romitan', 'Peshku', 'Jondor', 'Olot', 'Qorako‘l', 'Qorovulbozor'],
  'Andijon viloyati': ['Andijon sh.', 'Xonobod sh.', 'Andijon t.', 'Asaka', 'Shahrixon', 'Oltinko‘l', 'Baliqchi', 'Paxtaobod', 'Izboskan', 'Qo‘rg‘ontepa', 'Jalaquduq', 'Xo‘jaobod', 'Bo‘ston', 'Ulug‘nor', 'Marhamat'],
  'Farg\'ona viloyati': ['Farg‘ona sh.', 'Qo‘qon sh.', 'Marg‘ilon sh.', 'Quvasoy sh.', 'Farg‘ona t.', 'Oltiariq', 'Rishton', 'Bag‘dod', 'Uchko‘prik', 'Buvayda', 'Yozyovon', 'Toshloq', 'Quva', 'O‘zbekiston', 'Furqat', 'Dang‘ara', 'Besharik', 'Sux'],
  'Namangan viloyati': ['Namangan sh.', 'Namangan t.', 'Chust', 'Pop', 'Uychi', 'Uchqo‘rg‘on', 'Norin', 'Yangiqo‘rg‘on', 'Kosonsoy', 'To‘raqo‘rg‘on', 'Mingbuloq'],
  'Qashqadaryo viloyati': ['Qarshi sh.', 'Qarshi t.', 'Shaxrisabz sh.', 'Shaxrisabz t.', 'Kitob', 'Yakkabog‘', 'Qamashi', 'G‘uzor', 'Dehqonobod', 'Nishon', 'Kasbi', 'Ko‘kdala', 'Mirishkor', 'Muborak', 'Chiroqchi'],
  'Surxondaryo viloyati': ['Termiz sh.', 'Termiz t.', 'Denov', 'Sho‘rchi', 'Jarqo‘rg‘on', 'Qumqo‘rg‘on', 'Angor', 'Sherobod', 'Boysun', 'Sariosiyo', 'Uzun', 'Oltinsoy', 'Qiziriq', 'Muzrabot'],
  'Navoiy viloyati': ['Navoiy sh.', 'Zarafshon sh.', 'Karmana', 'Qiziltepa', 'Xatirchi', 'Nurota', 'Navbahor', 'Konimex', 'Tomdi', 'Uchkuduq'],
  'Xorazm viloyati': ['Urganch sh.', 'Xiva sh.', 'Urganch t.', 'Xiva t.', 'Xonqa', 'Gurlan', 'Shovot', 'Qo‘shko‘pir', 'Bog‘ot', 'Hazorasp', 'Yangiariq', 'Yangibozor', 'Tuproqqala'],
  'Sirdaryo viloyati': ['Guliston sh.', 'Shirin sh.', 'Yangiyer sh.', 'Guliston t.', 'Sirdaryo t.', 'Sayxunobod', 'Boyovut', 'Mirzaobod', 'Oqoltin', 'Sardoba', 'Xovos'],
  'Jizzax viloyati': ['Jizzax sh.', 'Jizzax t.', 'Sharof Rashidov', 'Do‘stlik', 'Paxtakor', 'Zafarobod', 'Mirzachul', 'Arnasoy', 'Baxmal', 'G‘allaorol', 'Forish', 'Zomin', 'Yangiobod'],
  'Qoraqalpog\'iston Respublikasi': ['Nukus sh.', 'Nukus t.', 'Amudaryo', 'Beruniy', 'To‘rtko‘l', 'Ellikqala', 'Xo‘jayli', 'Taxiatosh', 'Shumanay', 'Qonliko‘l', 'Qo‘ng‘irot', 'Mo‘ynoq', 'Chimboy', 'Kegeyli', 'Qorao‘zak', 'Taxtako‘pir', 'Bo‘zatov'],
};

export const UZ_MAHALLAS: Record<string, string[]> = {
  // Tashkent City
  'Chilonzor': ['1-mavze', '2-mavze', '3-mavze', '4-mavze', '5-mavze', '6-mavze', '7-mavze', '8-mavze', '9-mavze', '10-mavze', 'Do\'mbiraobod', 'Qatortol', 'Cho\'ponota', 'Oqtepa', 'Dilxush', 'Lutfiy', 'Gullar', 'Mextar', 'Naqqoshlik'],
  'Yunusobod': ['Ming o\'rik', 'Bodomzor', 'Bilimdon', 'Islomobod', 'Yangi Yunusobod', 'Oloy', 'Minor', 'Matonat', 'Xurriyat', 'Adolat', 'G\'ayratiy', 'Bo\'ston', 'Obshir'],
  'Mirzo Ulug‘bek': ['Alisherobod', 'Bobur', 'Buyuk Ipak yo\'li', 'Gelios', 'Jaloliddin Ar-Rumi', 'Mustaqillik', 'Nur', 'Oydin', 'Oqibat', 'Sohibqiron', 'Turon', 'Uyg\'onish', 'Xumoyun'],
  'Yashnobod': ['Alimkent', 'Amir Temur', 'Ayrilish', 'Birlashgan', 'Do\'stlik', 'Istiqlol', 'Loyihalash', 'Maxmur', 'Navro\'zabad', 'Oltintepa', 'Tuzel', 'Xovli'],
  'Mirobod': ['Afrosiyob', 'Banokatiy', 'Inom', 'Lomonosov', 'Mirobod', 'Navro\'z', 'Oqyo\'l', 'Salar', 'Tog\'ay', 'Tong'],
  'Sergeli': ['Abay', 'Cho\'ponota', 'Do\'stlik', 'Humo', 'Itifoq', 'Junariq', 'Nilufar', 'Olmazor', 'Qoraqamish', 'Sergeli-1', 'Sergeli-2', 'Sohibqiron'],
  
  // Samarkand
  'Samarqand sh.': ['Al-Xorazmiy', 'Amir Temur', 'Beruniy', 'Bog\'ishamol', 'Gullar', 'Lolazor', 'Navoiy', 'Sariosiyo', 'Siyob', 'Universitet', 'Vatan'],
  
  // Farg'ona
  'Farg‘ona sh.': ['Istiklol', 'Guzal', 'Bahor', 'Marifat', 'Mustaqillik', 'Nur', 'Oydin', 'Sohil', 'Tong'],
  
  // Andijon
  'Andijon sh.': ['Bobur', 'Jaloliddin Manguberdi', 'Sabo', 'Sayhun', 'Xumo', 'Yangi hayot'],
};
