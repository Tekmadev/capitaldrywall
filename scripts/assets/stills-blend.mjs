// stills group: 50/50 blend of two images at a preview width (identity overlay check).
// Usage: node scripts/assets/stills-blend.mjs <a> <b> <out.jpg> [width=900]
import sharp from 'sharp';
const [a, b, out, w = '900'] = process.argv.slice(2);
const width = Number(w);
const A = await sharp(a).removeAlpha().resize({ width }).raw().toBuffer({ resolveWithObject: true });
const B = await sharp(b).removeAlpha().resize({ width: A.info.width, height: A.info.height, fit: 'fill' }).raw().toBuffer();
const o = Buffer.alloc(A.data.length);
for (let i = 0; i < o.length; i++) o[i] = (A.data[i] + B[i]) >> 1;
await sharp(o, { raw: { width: A.info.width, height: A.info.height, channels: 3 } }).jpeg({ quality: 85 }).toFile(out);
console.log(out);
