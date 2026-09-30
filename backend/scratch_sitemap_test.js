const fetch = require('node-fetch') || globalThis.fetch;
fetch('https://diabetmed.uz/sitemap.xml')
  .then(r => r.text())
  .then(text => console.log('Sitemap starts with:', text.substring(0, 100)));
fetch('https://diabetmed.uz/robots.txt')
  .then(r => r.text())
  .then(text => console.log('Robots starts with:', text.substring(0, 50)));
