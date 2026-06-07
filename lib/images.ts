import sharp from "sharp";

export async function createPreview(buffer: Buffer) {
  const image = sharp(buffer).rotate();
  const metadata = await image.metadata();
  const preview = await image
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return {
    preview,
    width: metadata.width,
    height: metadata.height
  };
}

export function isSupportedImage(type: string) {
  return ["image/jpeg", "image/png", "image/webp"].includes(type);
}
