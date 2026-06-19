const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const root = process.cwd();
const brandDir = path.join(root, "public", "textures", "brand-logos");
const outDir = path.join(root, "public", "textures", "projects");

const thumbnails = [
  { key: "shopos", output: "project_thumb_order_0.jpg", background: "#d9d2c7", fit: 505 },
  { key: "reality", output: "project_thumb_order_1.jpg", background: "#344047", fit: 440 },
  { key: "flipkart", output: "project_thumb_order_2.jpg", background: "#2d73d9", fit: 335 },
  { key: "scapic", output: "project_thumb_order_3.jpg", background: "#2f9d91", fit: 310 },
  { key: "cope", output: "project_thumb_order_4.jpg", background: "#353a48", fit: 255 },
  { key: "seeit", output: "project_thumb_order_5.jpg", background: "#e7645f", fit: 330 },
  { key: "stanford", output: "project_thumb_order_6.jpg", background: "#d9d2c7", fit: 405, keyWhite: true },
];

async function keyWhiteToTransparent(input) {
  const source = sharp(input).ensureAlpha();
  const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    if (red > 244 && green > 244 && blue > 244) {
      data[index + 3] = 0;
    }
  }
  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  }).png().toBuffer();
}

async function buildThumbnail(item) {
  const input = path.join(brandDir, `${item.key}-exact.png`);
  const sourceInput = item.keyWhite ? await keyWhiteToTransparent(input) : input;
  const metadata = await sharp(sourceInput).metadata();
  const isWide = metadata.width >= metadata.height;
  const logo = await sharp(sourceInput)
    .resize({
      width: isWide ? item.fit : undefined,
      height: isWide ? undefined : item.fit,
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer({ resolveWithObject: true });

  const left = Math.round((800 - logo.info.width) / 2);
  const top = Math.round((600 - logo.info.height) / 2);

  await sharp({
    create: {
      width: 800,
      height: 600,
      channels: 3,
      background: item.background,
    },
  })
    .composite([{ input: logo.data, left, top }])
    .jpeg({ quality: 95, progressive: true, chromaSubsampling: "4:4:4" })
    .toFile(path.join(outDir, item.output));
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const requestedKeys = new Set(process.argv.slice(2));
  const selectedThumbnails = requestedKeys.size
    ? thumbnails.filter((item) => requestedKeys.has(item.key))
    : thumbnails;

  if (requestedKeys.size && selectedThumbnails.length !== requestedKeys.size) {
    throw new Error(`Unknown thumbnail key. Use one of: ${thumbnails.map((item) => item.key).join(", ")}`);
  }

  for (const item of selectedThumbnails) {
    await buildThumbnail(item);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
