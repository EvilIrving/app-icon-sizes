import Pica from 'pica';

const pica = new Pica();

/**
 * Resize an image to the specified dimensions using pica (high-quality downscaling).
 * Preserves transparency (alpha) in output.
 * @param imageSource - Source image (HTMLImageElement, HTMLCanvasElement, or Blob)
 * @param width - Target width (0 = use source width)
 * @param height - Target height (0 = use source height)
 * @param options - Optional: alpha (default true), fillBackground (e.g. white for Android)
 * @returns Promise resolving to a Blob containing the resized PNG
 */
export async function resizeImage(
  imageSource: HTMLImageElement | HTMLCanvasElement | Blob,
  width: number,
  height: number,
  options?: { alpha?: boolean; fillBackground?: boolean }
): Promise<Blob> {
  let img: HTMLImageElement;
  let fromCanvas: HTMLCanvasElement | null = null;

  if (imageSource instanceof Blob) {
    img = await createImageFromBlob(imageSource);
    // SVG in <img> has no natural dimensions; createImageBitmap then fails. Rasterize to canvas first.
    if (imageSource.type === 'image/svg+xml') {
      let w: number;
      let h: number;
      const svgDims = await getSvgDimensions(imageSource);
      if (svgDims && svgDims.width > 0 && svgDims.height > 0) {
        w = svgDims.width;
        h = svgDims.height;
      } else {
        const fallback = await getImageDimensions(imageSource);
        w = fallback.width;
        h = fallback.height;
      }
      fromCanvas = document.createElement('canvas');
      fromCanvas.width = w;
      fromCanvas.height = h;
      const ctx = fromCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
      }
    }
  } else if (imageSource instanceof HTMLImageElement) {
    img = imageSource;
  } else {
    img = new Image();
    img.src = imageSource.toDataURL('image/png');
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });
  }

  const srcW = fromCanvas ? fromCanvas.width : (img.naturalWidth || img.width);
  const srcH = fromCanvas ? fromCanvas.height : (img.naturalHeight || img.height);

  let targetW = width;
  let targetH = height;
  if (targetW <= 0 || targetH <= 0) {
    targetW = srcW;
    targetH = srcH;
  }

  const alpha = options?.alpha !== false;
  const fillBackground = options?.fillBackground === true;

  let source: HTMLImageElement | HTMLCanvasElement = fromCanvas ?? img;

  if (fillBackground && !alpha) {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = srcW;
    bgCanvas.height = srcH;
    const ctx = bgCanvas.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, srcW, srcH);
      ctx.drawImage(source, 0, 0);
    }
    source = bgCanvas;
  }

  const toCanvas = document.createElement('canvas');
  toCanvas.width = targetW;
  toCanvas.height = targetH;

  await pica.resize(source, toCanvas, { alpha });

  return new Promise<Blob>((resolve, reject) => {
    pica.toBlob(toCanvas, 'image/png', 1)
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Create an HTMLImageElement from a Blob
 */
function createImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image from blob'));
    };

    img.src = url;
  });
}

/**
 * Parse SVG blob for width/height (viewBox or width/height attributes).
 * viewBox = "minX minY width height" or "minX, minY, width, height".
 */
async function getSvgDimensions(blob: Blob): Promise<{ width: number; height: number } | null> {
  const text = await blob.text();
  // viewBox: last two numbers are width and height
  const viewBox = text.match(/viewBox\s*=\s*["']?\s*[\d.]+\s*[, ]\s*[\d.]+\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i);
  if (viewBox) {
    const w = parseFloat(viewBox[1]);
    const h = parseFloat(viewBox[2]);
    if (w > 0 && h > 0) return { width: Math.round(w), height: Math.round(h) };
  }
  const wMatch = text.match(/\bwidth\s*=\s*["']?\s*([\d.]+)/i);
  const hMatch = text.match(/\bheight\s*=\s*["']?\s*([\d.]+)/i);
  if (wMatch && hMatch) {
    const w = parseFloat(wMatch[1]);
    const h = parseFloat(hMatch[1]);
    if (w > 0 && h > 0) return { width: Math.round(w), height: Math.round(h) };
  }
  return null;
}

/**
 * Get image dimensions from a Blob (supports PNG, JPEG, SVG, etc.)
 * For SVG, parses viewBox/width/height first so we don't depend on Image load (which can fail for SVG blob URLs).
 */
export async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const isSvg = blob.type === 'image/svg+xml';
  let w = 0;
  let h = 0;

  if (isSvg) {
    const svgDims = await getSvgDimensions(blob);
    if (svgDims) {
      w = svgDims.width;
      h = svgDims.height;
    }
  }

  if (w === 0 || h === 0) {
    try {
      const img = await createImageFromBlob(blob);
      w = img.naturalWidth || img.width || 0;
      h = img.naturalHeight || img.height || 0;
      if ((w === 0 || h === 0) && isSvg) {
        const svgDims = await getSvgDimensions(blob);
        if (svgDims) {
          w = svgDims.width;
          h = svgDims.height;
        }
      }
    } catch {
      // e.g. SVG blob fails to load in Image; dimensions already from getSvgDimensions or default below
    }
  }

  if (w === 0 || h === 0) {
    w = w || 512;
    h = h || 512;
  }
  return { width: w, height: h };
}

/**
 * Convert a Blob to ArrayBuffer
 */
export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsArrayBuffer(blob);
  });
}
