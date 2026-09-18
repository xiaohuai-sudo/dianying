const frameSourcePattern = /^\/images\/frames\/([^/]+)\.(?:png|jpe?g|webp)$/i;
const frameWidths = [480, 960, 1280, 1672] as const;

function nearestFrameWidth(requestedWidth: number) {
  return frameWidths.find((width) => width >= requestedWidth) ?? frameWidths.at(-1)!;
}

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const frame = src.match(frameSourcePattern);

  if (frame) {
    const optimizedWidth = nearestFrameWidth(width);
    return `${basePath}/images/frames-optimized/${frame[1]}-${optimizedWidth}.webp`;
  }

  return `${basePath}${src}`;
}
