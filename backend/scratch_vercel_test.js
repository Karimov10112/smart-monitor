fetch('https://smart-monitor-1-a037.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json', 'Origin': 'https://smart-monitor-cbfm.vercel.app'},
  body: JSON.stringify({email: 'karimovazamatjon231@gmail.com', password: 'admin123'})
})
.then(r => { console.log('Status:', r.status); return r.json(); })
.then(j => console.log('Response:', JSON.stringify(j, null, 2)))
.catch(e => console.error('Error:', e.message));
