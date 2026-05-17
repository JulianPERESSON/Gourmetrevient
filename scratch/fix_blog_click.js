const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldCode = "const trigger = target.closest('.nav-dropdown-trigger');";
const newCode = "const trigger = target.closest('.nav-dropdown .nav-dropdown-trigger');";

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync('index.html', content, 'utf8');
  console.log('Successfully fixed Blog link click interception!');
} else {
  console.error('Could not find oldCode in index.html!');
}
