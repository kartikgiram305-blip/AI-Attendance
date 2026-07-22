const fs = require('fs');
let s = fs.readFileSync('public/script.js', 'utf8');
s = s.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('public/script.js', s);
console.log('Fixed script.js');
