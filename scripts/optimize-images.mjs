import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const sourceDirectory = path.join(projectRoot, "source-assets", "frames");
const outputDirectory = path.join(projectRoot, "public", "images", "frames-optimized");
const widths = [480, 960, 1280, 1672];
const supportedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);

await mkdir(outputDirectory, { recursive: true });

const sourceFiles = (await readdir(sourceDirectory))
  .filter((fileName) => supportedExtensions.has(path.extname(fileName).toLowerCase()))
  .sort();

let generated = 0;
let skipped = 0;

async function optimize(sourceName) {
  const sourcePath = path.join(sourceDirectory, sourceName);
  const sourceStats = await stat(sourcePath);
  const baseName = path.parse(sourceName).name;

  for (const width of widths) {
    const outputPath = path.join(outputDirectory, `${baseName}-${width}.webp`);
    let outputIsCurrent = false;

    try {
      const outputStats = await stat(outputPath);
      outputIsCurrent = outputStats.mtimeMs >= sourceStats.mtimeMs;
    } catch {
      // Missing output files are generated below.
    }

    if (outputIsCurrent) {
      skipped += 1;
      continue;
    }

    await sharp(sourcePath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5, smartSubsample: true })
      .toFile(outputPath);
    generated += 1;
  }
}

const concurrency = 4;
for (let index = 0; index < sourceFiles.length; index += concurrency) {
  await Promise.all(sourceFiles.slice(index, index + concurrency).map(optimize));
}

console.log(`Optimized ${sourceFiles.length} source images at ${widths.join(", ")}px.`);
console.log(`Generated ${generated} files; reused ${skipped} current files.`);
