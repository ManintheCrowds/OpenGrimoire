import fs from 'node:fs';
const content = fs.readFileSync('.env.example', 'utf8');
const risky = ['PASSWORD', 'SECRET', 'TOKEN', 'PRIVATE_KEY', 'API_KEY'];
const failures = [];
for (const line of content.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [key] = trimmed.split('=', 1);
  if (!key?.startsWith('NEXT_PUBLIC_')) continue;
  if (risky.some((needle) => key.includes(needle))) failures.push(key);
}
if (failures.length) {
  console.error('Disallowed NEXT_PUBLIC_* secret-like env names found:');
  for (const key of failures) console.error(` - ${key}`);
  process.exit(1);
}
console.log('NEXT_PUBLIC_* secret-name guard passed.');
