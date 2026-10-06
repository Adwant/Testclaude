import sharp from 'sharp';
import fs from 'node:fs';
const [,, prefix, out] = process.argv;
for (const line of fs.readFileSync(process.argv[4] ?? new URL('./map.txt', import.meta.url), 'utf8').trim().split('\n')) {
  const [name, id] = line.split(' ');
  const src = prefix + id + '.png';
  const img = sharp(src);
  const m = await img.metadata();
  await img.webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(`${out}/${name}.webp`);
  console.log(name, m.width + 'x' + m.height, fs.statSync(`${out}/${name}.webp`).size);
}
