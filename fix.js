const fs = require('fs');
let s = fs.readFileSync('script.js', 'utf8');
s = s.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('script.js', s);
console.log('Fixed script.js');
