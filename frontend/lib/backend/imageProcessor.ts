import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export interface ProcessImageOptions {
  userImage: string; // Base64 data URL, local path, or URL
  hairstyleId: string;
  gender: 'boy' | 'girl';
  hairColor: string;
  hairTop?: number;
  hairScale?: number;
}

export interface ProcessImageResult {
  customizedDataUrl: string;
  processingTimeMs: number;
  hairstyleName: string;
  width: number;
  height: number;
}

interface HairAssetConfig {
  filename: string;
  defaultTop: number;
  defaultScale: number;
}

function resolveHairAsset(styleId: string, gender: 'boy' | 'girl'): HairAssetConfig {
  const sid = (styleId || '').toUpperCase();

  if (gender === 'girl' || sid.startsWith('HS-G')) {
    if (sid.includes('G03') || sid.includes('WOLF') || sid.includes('SHAG')) {
      return { filename: 'hair_wolf_cut.png', defaultTop: -4, defaultScale: 104 };
    }
    if (sid.includes('G01') || sid.includes('BUTTERFLY') || sid.includes('LAYERED')) {
      return { filename: 'hair_butterfly.png', defaultTop: -2, defaultScale: 106 };
    }
    if (sid.includes('G02') || sid.includes('BOB') || sid.includes('LOB') || sid.includes('FRENCH') || sid.includes('PIXIE')) {
      return { filename: 'hair_curtain_bob.png', defaultTop: -3, defaultScale: 102 };
    }
    return { filename: 'hair_wolf_cut.png', defaultTop: -4, defaultScale: 104 };
  }

  // Boy hairstyles
  return { filename: 'hair_crop.png', defaultTop: -5, defaultScale: 98 };
}

/**
 * Loads the user image into a Node Buffer
 */
async function loadUserImageBuffer(userImage: string): Promise<Buffer> {
  if (userImage.startsWith('data:')) {
    const base64Data = userImage.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

  if (userImage.startsWith('http://') || userImage.startsWith('https://')) {
    const res = await fetch(userImage);
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  }

  // Local filesystem path in public/
  const cleanPath = userImage.startsWith('/') ? userImage.slice(1) : userImage;
  const localFile = path.join(process.cwd(), 'public', cleanPath);
  if (fs.existsSync(localFile)) {
    return fs.readFileSync(localFile);
  }

  // Fallback to sample girl portrait if path is invalid
  const fallback = path.join(process.cwd(), 'public/looks/girl_original.jpg');
  return fs.readFileSync(fallback);
}

/**
 * Executes server-side Sharp image compositing
 */
export async function processHairstyleImage(
  options: ProcessImageOptions
): Promise<ProcessImageResult> {
  const startTime = Date.now();

  const {
    userImage,
    hairstyleId,
    gender = 'girl',
    hairColor = 'Natural',
  } = options;

  const hairConfig = resolveHairAsset(hairstyleId, gender);
  const hairTopPercent = options.hairTop !== undefined ? options.hairTop : hairConfig.defaultTop;
  const hairScalePercent = options.hairScale !== undefined ? options.hairScale : hairConfig.defaultScale;

  // 1. Load User Base Image
  const userBuffer = await loadUserImageBuffer(userImage);
  const userSharp = sharp(userBuffer);
  const userMeta = await userSharp.metadata();

  const userWidth = userMeta.width || 800;
  const userHeight = userMeta.height || 1000;

  // 2. Load Hairpiece Asset
  const hairPath = path.join(process.cwd(), 'public/looks', hairConfig.filename);
  let hairSharp = sharp(hairPath);

  // 3. Apply Server-Side Color Tinting
  if (hairColor === 'Jet Black') {
    hairSharp = hairSharp.modulate({ brightness: 0.6, saturation: 0.8 });
  } else if (hairColor === 'Honey Blonde') {
    hairSharp = hairSharp.tint({ r: 210, g: 170, b: 90 }).modulate({ brightness: 1.25 });
  } else if (hairColor === 'Espresso Brown') {
    hairSharp = hairSharp.tint({ r: 90, g: 55, b: 35 });
  } else if (hairColor === 'Platinum Ash') {
    hairSharp = hairSharp.grayscale().modulate({ brightness: 1.35 });
  } else if (hairColor === 'Auburn Red') {
    hairSharp = hairSharp.tint({ r: 170, g: 50, b: 30 });
  }

  // 4. Resize Hairpiece to match user's face scale
  const scaledWidth = Math.max(100, Math.round(userWidth * (hairScalePercent / 100)));
  hairSharp = hairSharp.resize({ width: scaledWidth });

  let hairBuffer = await hairSharp.png().toBuffer();
  const hairMeta = await sharp(hairBuffer).metadata();
  const hairWidth = hairMeta.width || scaledWidth;
  const hairHeight = hairMeta.height || scaledWidth;

  // 5. Calculate Positioning Offsets
  const targetTop = Math.round(userHeight * (hairTopPercent / 100));
  const targetLeft = Math.round((userWidth - hairWidth) / 2);

  let extractLeft = 0;
  let extractTop = 0;
  let extractWidth = hairWidth;
  let extractHeight = hairHeight;
  let compositeTop = targetTop;
  let compositeLeft = targetLeft;

  // Handle negative coordinates by extracting visible portion
  if (targetTop < 0) {
    extractTop = Math.min(Math.abs(targetTop), hairHeight - 10);
    extractHeight = hairHeight - extractTop;
    compositeTop = 0;
  }

  if (targetLeft < 0) {
    extractLeft = Math.min(Math.abs(targetLeft), hairWidth - 10);
    extractWidth = hairWidth - extractLeft;
    compositeLeft = 0;
  }

  // Clamp within user image dimensions
  if (compositeTop + extractHeight > userHeight) {
    extractHeight = userHeight - compositeTop;
  }
  if (compositeLeft + extractWidth > userWidth) {
    extractWidth = userWidth - compositeLeft;
  }

  if (extractWidth > 0 && extractHeight > 0) {
    hairBuffer = await sharp(hairBuffer)
      .extract({
        left: extractLeft,
        top: extractTop,
        width: extractWidth,
        height: extractHeight,
      })
      .toBuffer();
  }

  // 6. Merge Hairpiece onto User Face with Sharp
  const finalBuffer = await sharp(userBuffer)
    .composite([
      {
        input: hairBuffer,
        top: Math.max(0, compositeTop),
        left: Math.max(0, compositeLeft),
        blend: 'over',
      },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  const processingTimeMs = Date.now() - startTime;
  const customizedDataUrl = `data:image/jpeg;base64,${finalBuffer.toString('base64')}`;

  return {
    customizedDataUrl,
    processingTimeMs,
    hairstyleName: hairConfig.filename.replace('hair_', '').replace('.png', ''),
    width: userWidth,
    height: userHeight,
  };
}
