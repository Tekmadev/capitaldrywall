// Download a Higgsfield result into assets-src/rooms/raw and write a 1100px review JPEG.
// usage: node scripts/assets/rooms-fetch.mjs <name> <url> [<name> <url> ...]
import sharp from "sharp";
import fs from "node:fs/promises";

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) {
  const [name, url] = [args[i], args[i + 1]];
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const ext = url.split(".").pop().split("?")[0];
  await fs.writeFile(`assets-src/rooms/raw/${name}.${ext}`, buf);
  if (ext === "png" || ext === "jpg" || ext === "webp") {
    const meta = await sharp(buf).metadata();
    await sharp(buf).resize(meta.width > meta.height ? 1100 : 620).jpeg({ quality: 80 }).toFile(`assets-src/rooms/review/${name}.jpg`);
    console.log(name, meta.width, meta.height);
  } else console.log(name, buf.length);
}
