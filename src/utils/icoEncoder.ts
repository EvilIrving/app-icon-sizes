/**
 * Browser-compatible ICO file encoder
 * Creates a .ico file from multiple PNG images
 * 
 * ICO file format:
 * - Header (6 bytes): reserved(2) + type(2) + count(2)
 * - Directory entries (16 bytes each): width(1) + height(1) + colors(2) + reserved(2) + plane(2) + bpp(2) + size(4) + offset(4)
 * - Image data (PNG or BMP format)
 */

export interface IcoImage {
  width: number;
  height: number;
  pngData: Uint8Array;
}

/**
 * Create an ICO file from multiple PNG images
 */
export async function createIcoFile(images: IcoImage[]): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error('At least one image is required');
  }

  const headerSize = 6;
  const directoryEntrySize = 16;
  const directorySize = images.length * directoryEntrySize;
  const dataOffset = headerSize + directorySize;

  // Calculate total size and offsets
  let totalSize = dataOffset;
  
  for (const image of images) {
    totalSize += image.pngData.length;
  }

  // Create the ICO buffer
  const icoBuffer = new Uint8Array(totalSize);
  const view = new DataView(icoBuffer.buffer);

  // Write header
  // Reserved (2 bytes) - must be 0
  view.setUint16(0, 0, true);
  // Type (2 bytes) - 1 for icon
  view.setUint16(2, 1, true);
  // Count (2 bytes) - number of images
  view.setUint16(4, images.length, true);

  // Write directory entries
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const entryOffset = headerSize + i * directoryEntrySize;

    // Calculate offset for this image
    let currentOffset = dataOffset;
    for (let j = 0; j < i; j++) {
      currentOffset += images[j].pngData.length;
    }

    // Width (1 byte) - 0 means 256
    view.setUint8(entryOffset, image.width >= 256 ? 0 : image.width);
    // Height (1 byte) - 0 means 256
    view.setUint8(entryOffset + 1, image.height >= 256 ? 0 : image.height);
    // Color count (1 byte) - 0 if more than 256 colors
    view.setUint8(entryOffset + 2, 0);
    // Reserved (1 byte) - must be 0
    view.setUint8(entryOffset + 3, 0);
    // Color planes (2 bytes) - 1
    view.setUint16(entryOffset + 4, 1, true);
    // Bits per pixel (2 bytes) - 32 for PNG
    view.setUint16(entryOffset + 6, 32, true);
    // Image data size (4 bytes)
    view.setUint32(entryOffset + 8, image.pngData.length, true);
    // Image data offset (4 bytes)
    view.setUint32(entryOffset + 12, currentOffset, true);
  }

  // Write image data
  let dataPosition = dataOffset;
  for (const image of images) {
    icoBuffer.set(image.pngData, dataPosition);
    dataPosition += image.pngData.length;
  }

  return icoBuffer;
}

/**
 * Convert a Blob to Uint8Array
 */
export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
