import imageCompression from "browser-image-compression";

/** 🪶 Compress a picked image into a light data URL. */
export async function compressToDataUrl(
  file: File,
  opts?: { maxSizeMB?: number; maxWidthOrHeight?: number },
): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: opts?.maxSizeMB ?? 0.8,
    maxWidthOrHeight: opts?.maxWidthOrHeight ?? 1280,
    useWebWorker: true,
    fileType: "image/webp",
  });
  return imageCompression.getDataUrlFromFile(compressed);
}
