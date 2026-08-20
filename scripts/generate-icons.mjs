/**
 * Generate all PWA icon sizes from the existing SVG source.
 * Run: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, '..', 'public', 'icons');
const SVG_PATH = join(ICONS_DIR, 'icon-512.svg');

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

async function generate() {
  const svgBuffer = readFileSync(SVG_PATH);

  for (const size of SIZES) {
    // Standard icon
    const outPath = join(ICONS_DIR, `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`✅ Generated ${outPath}`);
  }

  // Maskable icons (192 and 512) with safe zone padding
  for (const size of [192, 512]) {
    const padding = Math.round(size * 0.1); // 10% padding for safe zone
    const innerSize = size - padding * 2;

    const maskablePath = join(ICONS_DIR, `icon-${size}-maskable.png`);

    // Create background circle then overlay the icon
    const bg = Buffer.from(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#090d16"/>
      </svg>`
    );

    const resizedIcon = await sharp(svgBuffer)
      .resize(innerSize, innerSize)
      .toBuffer();

    await sharp(bg)
      .composite([{
        input: resizedIcon,
        left: padding,
        top: padding,
      }])
      .png()
      .toFile(maskablePath);
    console.log(`✅ Generated ${maskablePath} (maskable)`);
  }

  // Apple touch icon (180x180)
  const applePath = join(ICONS_DIR, 'apple-touch-icon.png');
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(applePath);
  console.log(`✅ Generated ${applePath}`);

  console.log('\n🎉 All icons generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
